from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import Pet, WeightRecord, Vaccination, VetVisit, PetShare
from .serializers import (
      PetSerializer, PetListSerializer, WeightRecordSerializer,
      VaccinationSerializer, VetVisitSerializer, RegisterSerializer,
      LoginSerializer, UserSerializer, PetShareSerializer
  )
from .permissions import PetAccessPermission, IsShareOwner
import logging

logger = logging.getLogger(__name__)

# Authentication Views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user and return auth token.

    POST /api/auth/register/
    Body: {username, email, password, password_confirm, first_name?, last_name?}
    Returns: {token, user: {id, username, email, first_name, last_name}}
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        return Response({
            'token': token.key,
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return auth token.

    POST /api/auth/login/
    Body: {username, password}
    Returns: {token, user: {id, username, email, first_name, last_name}}
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        return Response({
            'token': token.key,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by deleting auth token.

    POST /api/auth/logout/
    Headers: Authorization: Token <token>
    Returns: {message: "Logged out successfully"}
    """
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        return Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.exception("Error while logging out user %s", request.user)
        return Response(
            {'error': 'An internal error occurred while logging out.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get current user profile.

    GET /api/auth/profile/
    Headers: Authorization: Token <token>
    Returns: {id, username, email, first_name, last_name}
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Pet Management ViewSets

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return PetListSerializer
        if self.action in ('share', 'shared_with'):
            return PetShareSerializer
        return PetSerializer

    def get_queryset(self):
        user = self.request.user
        return Pet.objects.filter(
            Q(owner=user) | Q(shares__shared_with=user)
        ).distinct().prefetch_related('shares__shared_with')

    def get_permissions(self):
        if self.action in ('share', 'unshare', 'shared_with'):
            return [IsAuthenticated(), IsShareOwner()]
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAuthenticated(), PetAccessPermission()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        """Share a pet with another user. POST /api/pets/{id}/share/"""
        pet = self.get_object()
        serializer = PetShareSerializer(
            data=request.data,
            context={'request': request, 'pet': pet}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(pet=pet)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'share/(?P<share_id>[^/.]+)')
    def unshare(self, request, pk=None, share_id=None):
        """Remove sharing. DELETE /api/pets/{id}/share/{share_id}/"""
        pet = self.get_object()
        try:
            share = PetShare.objects.get(id=share_id, pet=pet)
            share.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PetShare.DoesNotExist:
            return Response(
                {'detail': 'Share not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'], url_path='shared-with')
    def shared_with(self, request, pk=None):
        """List users this pet is shared with. GET /api/pets/{id}/shared-with/"""
        pet = self.get_object()
        shares = PetShare.objects.filter(pet=pet)
        serializer = PetShareSerializer(shares, many=True)
        return Response(serializer.data)


class WeightRecordViewSet(viewsets.ModelViewSet):
    queryset = WeightRecord.objects.all()
    serializer_class = WeightRecordSerializer
    permission_classes = [IsAuthenticated, PetAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = WeightRecord.objects.filter(
            Q(pet__owner=user) | Q(pet__shares__shared_with=user)
        ).distinct()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VaccinationViewSet(viewsets.ModelViewSet):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    permission_classes = [IsAuthenticated, PetAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = Vaccination.objects.filter(
            Q(pet__owner=user) | Q(pet__shares__shared_with=user)
        ).distinct()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VetVisitViewSet(viewsets.ModelViewSet):
    queryset = VetVisit.objects.all()
    serializer_class = VetVisitSerializer
    permission_classes = [IsAuthenticated, PetAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = VetVisit.objects.filter(
            Q(pet__owner=user) | Q(pet__shares__shared_with=user)
        ).distinct()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
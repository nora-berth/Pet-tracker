from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Pet, WeightRecord, Vaccination, VetVisit
from .serializers import (
    PetSerializer, PetListSerializer, WeightRecordSerializer,
    VaccinationSerializer, VetVisitSerializer, RegisterSerializer,
    LoginSerializer, UserSerializer
)
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
        return PetSerializer

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WeightRecordViewSet(viewsets.ModelViewSet):
    queryset = WeightRecord.objects.all()
    serializer_class = WeightRecordSerializer

    def get_queryset(self):
        queryset = WeightRecord.objects.filter(pet__owner=self.request.user)
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VaccinationViewSet(viewsets.ModelViewSet):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer

    def get_queryset(self):
        queryset = Vaccination.objects.filter(pet__owner=self.request.user)
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VetVisitViewSet(viewsets.ModelViewSet):
    queryset = VetVisit.objects.all()
    serializer_class = VetVisitSerializer

    def get_queryset(self):
        queryset = VetVisit.objects.filter(pet__owner=self.request.user)
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
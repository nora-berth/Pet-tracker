from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pet, WeightRecord, Vaccination, VetVisit
from .serializers import (
    PetSerializer, PetListSerializer, WeightRecordSerializer,
    VaccinationSerializer, VetVisitSerializer
)


class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PetListSerializer
        return PetSerializer


class WeightRecordViewSet(viewsets.ModelViewSet):
    queryset = WeightRecord.objects.all()
    serializer_class = WeightRecordSerializer
    
    def get_queryset(self):
        queryset = WeightRecord.objects.all()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VaccinationViewSet(viewsets.ModelViewSet):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    
    def get_queryset(self):
        queryset = Vaccination.objects.all()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset


class VetVisitViewSet(viewsets.ModelViewSet):
    queryset = VetVisit.objects.all()
    serializer_class = VetVisitSerializer
    
    def get_queryset(self):
        queryset = VetVisit.objects.all()
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset
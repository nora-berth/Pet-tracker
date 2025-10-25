from rest_framework import serializers
from .models import Pet, WeightRecord, Vaccination, VetVisit


class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ['id', 'pet', 'date', 'weight', 'unit', 'notes', 'created_at']
        read_only_fields = ['created_at']


class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = ['id', 'pet', 'vaccine_name', 'date_administered', 'due_date', 
                  'veterinarian', 'notes', 'created_at']
        read_only_fields = ['created_at']


class VetVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = VetVisit
        fields = ['id', 'pet', 'date', 'reason', 'veterinarian', 'notes', 
                  'cost', 'created_at']
        read_only_fields = ['created_at']


class PetSerializer(serializers.ModelSerializer):
    weight_records = WeightRecordSerializer(many=True, read_only=True)
    vaccinations = VaccinationSerializer(many=True, read_only=True)
    vet_visits = VetVisitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo', 
                  'notes', 'created_at', 'updated_at', 'weight_records', 
                  'vaccinations', 'vet_visits']
        read_only_fields = ['created_at', 'updated_at']


class PetListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo', 'created_at']
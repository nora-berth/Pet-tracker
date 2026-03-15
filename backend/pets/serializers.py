from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Pet, WeightRecord, Vaccination, VetVisit


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include username and password.")

        return data


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
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo',
                  'notes', 'owner_username', 'created_at', 'updated_at',
                  'weight_records', 'vaccinations', 'vet_visits']
        read_only_fields = ['created_at', 'updated_at', 'owner_username']


class PetListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo', 'owner_username', 'created_at']
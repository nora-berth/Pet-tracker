from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Pet, WeightRecord, Vaccination, VetVisit, PetShare


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

class PetShareSerializer(serializers.ModelSerializer):
    shared_with_username = serializers.CharField(source='shared_with.username', read_only=True)
    shared_with_email = serializers.CharField(source='shared_with.email', read_only=True)
    user_identifier = serializers.CharField(write_only=True)

    class Meta:
        model = PetShare
        fields = ['id', 'shared_with_username', 'shared_with_email', 'role', 'user_identifier', 'created_at']
        read_only_fields = ['id', 'created_at', 'shared_with_username', 'shared_with_email']

    def validate_user_identifier(self, value):
        from django.contrib.auth.models import User
        try:
            if '@' in value:
                  user = User.objects.get(email=value)
            else:
                  user = User.objects.get(username=value)
        except User.DoesNotExist:
              raise serializers.ValidationError("No user found with this username or email.")
        return user

    def validate(self, data):
        user = data['user_identifier']
        pet = self.context['pet']
        request_user = self.context['request'].user

        if user == request_user:
            raise serializers.ValidationError({"user_identifier": "You cannot share a pet with yourself."})
        if user == pet.owner:
            raise serializers.ValidationError({"user_identifier": "This user already owns this pet."})
        if PetShare.objects.filter(pet=pet, shared_with=user).exists():
            raise serializers.ValidationError({"user_identifier": "This pet is already shared with this user."})

        data['shared_with'] = user
        return data

    def create(self, validated_data):
        validated_data.pop('user_identifier')
        return PetShare.objects.create(**validated_data)


class PetSerializer(serializers.ModelSerializer):
    weight_records = WeightRecordSerializer(many=True, read_only=True)
    vaccinations = VaccinationSerializer(many=True, read_only=True)
    vet_visits = VetVisitSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    is_shared = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    shared_with = PetShareSerializer(source='shares', many=True, read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo', 'notes', 'owner_username', 'created_at', 'updated_at', 'weight_records', 'vaccinations', 'vet_visits', 'is_shared', 'user_role', 'shared_with']
        read_only_fields = ['created_at', 'updated_at', 'owner_username']

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.owner != request.user
        return False

    def get_user_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return None
        if obj.owner == request.user:
            return 'owner'
        share = obj.shares.filter(shared_with=request.user).first()
        return share.role if share else None


class PetListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    is_shared = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'breed', 'birth_date', 'photo', 'owner_username', 'created_at', 'is_shared', 'user_role']

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.owner != request.user
        return False

    def get_user_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return None
        if obj.owner == request.user:
            return 'owner'
        share = obj.shares.filter(shared_with=request.user).first()
        return share.role if share else None
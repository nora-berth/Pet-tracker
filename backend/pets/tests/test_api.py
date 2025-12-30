import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from datetime import date
from decimal import Decimal
from pets.models import Pet, WeightRecord, Vaccination, VetVisit

@pytest.mark.django_db
class TestPetListAPI:
    """Test GET /api/pets/ endpoint"""
    
    def test_get_empty_pet_list(self):
        # Arrange
        client = APIClient()
        
        # Act
        url = reverse('pet-list')
        response = client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
        assert response.data['results'] == []

    def test_get_pet_list_with_data(self):
        # Arrange
        client = APIClient()
        Pet.objects.create(name="Buddy", species="dog")
        Pet.objects.create(name="Whiskers", species="cat")
        
        # Act
        url = reverse('pet-list')
        response = client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2
        assert len(response.data['results']) == 2

@pytest.mark.django_db
class TestPetDetailAPI:
    """Test GET /api/pets/{id}/ endpoint"""
    
    def test_get_pet_detail_success(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(
            name="Chickpea",
            species="other",
            breed="Hamster",
            birth_date=date(2023, 1, 15)
        )
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == pet.id
        assert response.data['name'] == pet.name
        assert response.data['species'] == pet.species
        assert response.data['breed'] == pet.breed
        assert response.data['birth_date'] == str(pet.birth_date)

    def test_get_pet_detail_not_found(self):
        # Arrange
        client = APIClient()
        non_existent_id = 99999
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': non_existent_id})
        response = client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_pet_detail_includes_nested_records(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(name="Buddy", species="dog")
        
        WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("25.5"),
            unit="kg"
        )
        Vaccination.objects.create(
            pet=pet,
            vaccine_name="Rabies",
            date_administered=date.today()
        )
        VetVisit.objects.create(
            pet=pet,
            date=date.today(),
            reason="Checkup"
        )
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.get(url)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert 'weight_records' in response.data
        assert 'vaccinations' in response.data
        assert 'vet_visits' in response.data
        assert len(response.data['weight_records']) == 1
        assert len(response.data['vaccinations']) == 1
        assert len(response.data['vet_visits']) == 1       

@pytest.mark.django_db
class TestPetCreateAPI:
    """Test POST /api/pets/ endpoint"""
    
    def test_create_pet_success(self):
        # Arrange
        client = APIClient()
        data = {
            'name': 'Fluffy',
            'species': 'cat',
            'breed': 'Persian'
        }
        
        # Act
        url = reverse('pet-list')
        response = client.post(url, data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Fluffy'
        assert response.data['species'] == 'cat'
        assert response.data['breed'] == 'Persian'
        assert 'id' in response.data
        assert Pet.objects.filter(name='Fluffy').exists()

    def test_create_pet_minimal_data(self):
        # Arrange
        client = APIClient()
        data = {
            'name': 'Buddy',
            'species': 'dog'
        }
        
        # Act
        url = reverse('pet-list')
        response = client.post(url, data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Buddy'
        assert response.data['species'] == 'dog'
        assert response.data['breed'] == '' or response.data['breed'] is None
        
        # Verify in database
        pet = Pet.objects.get(name='Buddy')
        assert pet.species == 'dog'

    def test_create_pet_missing_required_field(self):
        # Arrange
        client = APIClient()
        data = {
            'breed': 'Labrador'
        }
        
        # Act
        url = reverse('pet-list')
        response = client.post(url, data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Pet.objects.count() == 0

    def test_create_pet_invalid_data_type(self):
        # Arrange
        client = APIClient()
        data = {
            'name': 'Rex',
            'species': 12345 # Invalid data type
        }
        
        # Act
        url = reverse('pet-list')
        response = client.post(url, data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Pet.objects.count() == 0

    def test_create_pet_validation_error_messages(self):
        # Arrange
        client = APIClient()
        data = {}
        
        # Act
        url = reverse('pet-list')
        response = client.post(url, data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        assert 'name' in response.data
        assert 'species' in response.data
        
        assert 'required' in str(response.data['name'][0]).lower()
        assert 'required' in str(response.data['species'][0]).lower()
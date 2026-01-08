import pytest
import allure
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from datetime import date
from decimal import Decimal
from pets.models import Pet, WeightRecord, Vaccination, VetVisit

@pytest.mark.django_db
@allure.epic('Pet Tracker')
@allure.feature('Pet API')
@allure.story('List Pets')
class TestPetListAPI:
    """Test GET /api/pets/ endpoint"""

    @allure.title('Get empty pet list')
    @allure.severity(allure.severity_level.CRITICAL)
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

    @allure.title('Get pet list with data')
    @allure.severity(allure.severity_level.CRITICAL)
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
@allure.epic('Pet Tracker')
@allure.feature('Pet API')
@allure.story('Get Pet Details')
class TestPetDetailAPI:
    """Test GET /api/pets/{id}/ endpoint"""

    @allure.title('Get pet detail successfully')
    @allure.severity(allure.severity_level.CRITICAL)
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

    @allure.title('Get pet detail returns 404 for non-existent pet')
    @allure.severity(allure.severity_level.NORMAL)
    def test_get_pet_detail_not_found(self):
        # Arrange
        client = APIClient()
        non_existent_id = 99999

        # Act
        url = reverse('pet-detail', kwargs={'pk': non_existent_id})
        response = client.get(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @allure.title('Get pet detail includes nested records')
    @allure.severity(allure.severity_level.CRITICAL)
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
@allure.epic('Pet Tracker')
@allure.feature('Pet API')
@allure.story('Create Pet')
class TestPetCreateAPI:
    """Test POST /api/pets/ endpoint"""

    @allure.title('Create pet successfully')
    @allure.severity(allure.severity_level.CRITICAL)
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

    @allure.title('Create pet with minimal data')
    @allure.severity(allure.severity_level.CRITICAL)
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

    @allure.title('Create pet fails with missing required field')
    @allure.severity(allure.severity_level.CRITICAL)
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

    @allure.title('Create pet fails with invalid data type')
    @allure.severity(allure.severity_level.NORMAL)
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

    @allure.title('Create pet returns validation error messages')
    @allure.severity(allure.severity_level.NORMAL)
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

@pytest.mark.django_db
@allure.epic('Pet Tracker')
@allure.feature('Pet API')
@allure.story('Update Pet')
class TestPetUpdateAPI:
    """Test PUT /api/pets/{id}/ endpoint"""

    @allure.title('Update pet successfully')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_update_pet_success(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(
            name="Original Name",
            species="dog",
            breed="Labrador"
        )
        
        updated_data = {
            'name': 'Updated Name',
            'species': 'dog',
            'breed': 'Golden Retriever'
        }
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.put(url, updated_data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Name'
        assert response.data['breed'] == 'Golden Retriever'
        
        pet.refresh_from_db()
        assert pet.name == 'Updated Name'
        assert pet.breed == 'Golden Retriever'

    @allure.title('Update pet returns 404 for non-existent pet')
    @allure.severity(allure.severity_level.NORMAL)
    def test_update_pet_not_found(self):
        # Arrange
        client = APIClient()
        non_existent_id = 99999

        updated_data = {
            'name': 'Does Not Matter',
            'species': 'dog'
        }

        # Act
        url = reverse('pet-detail', kwargs={'pk': non_existent_id})
        response = client.put(url, updated_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @allure.title('Update pet fails with invalid data')
    @allure.severity(allure.severity_level.NORMAL)
    def test_update_pet_invalid_data(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(name="Buddy", species="dog")
        
        invalid_data = {
            'name': '',  # Empty name - invalid
            'species': 'dog'
        }
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.put(url, invalid_data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        pet.refresh_from_db()
        assert pet.name == 'Buddy'  # Still original name

    @allure.title('Update pet fails with missing required fields')
    @allure.severity(allure.severity_level.NORMAL)
    def test_update_pet_missing_fields(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(
            name="Buddy",
            species="dog",
            breed="Labrador"
        )

        incomplete_data = {
            'name': 'Updated Name'
            # Missing required field 'species'
        }

        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.put(url, incomplete_data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @allure.title('Partial update pet with PATCH')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_partial_update_pet_with_patch(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(
            name="Buddy",
            species="dog",
            breed="Labrador"
        )
        
        partial_data = {
            'name': 'Max'
        }
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        response = client.patch(url, partial_data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Max'
        
        pet.refresh_from_db()
        assert pet.name == 'Max'  # Changed
        assert pet.species == 'dog'  # Unchanged
        assert pet.breed == 'Labrador'  # Unchanged

@pytest.mark.django_db
@allure.epic('Pet Tracker')
@allure.feature('Pet API')
@allure.story('Delete Pet')
class TestPetDeleteAPI:
    """Test DELETE /api/pets/{id}/ endpoint"""

    @allure.title('Delete pet successfully')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_delete_pet_success(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(
            name="ToDelete",
            species="dog"
        )
        pet_id = pet.id
        
        assert Pet.objects.filter(id=pet_id).exists()
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet_id})
        response = client.delete(url)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        assert not Pet.objects.filter(id=pet_id).exists()

    @allure.title('Delete pet returns 404 for non-existent pet')
    @allure.severity(allure.severity_level.NORMAL)
    def test_delete_pet_not_found(self):
        # Arrange
        client = APIClient()
        non_existent_id = 99999

        # Act
        url = reverse('pet-detail', kwargs={'pk': non_existent_id})
        response = client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @allure.title('Delete pet cascades to related records')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_delete_pet_cascades_to_related_records(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(name="TestPet", species="dog")
        
        # Create related records
        weight = WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("20.0"),
            unit="kg"
        )
        vaccination = Vaccination.objects.create(
            pet=pet,
            vaccine_name="Rabies",
            date_administered=date.today()
        )
        vet_visit = VetVisit.objects.create(
            pet=pet,
            date=date.today(),
            reason="Checkup"
        )
        
        pet_id = pet.id
        weight_id = weight.id
        vaccination_id = vaccination.id
        vet_visit_id = vet_visit.id
        
        assert Pet.objects.filter(id=pet_id).exists()
        assert WeightRecord.objects.filter(id=weight_id).exists()
        assert Vaccination.objects.filter(id=vaccination_id).exists()
        assert VetVisit.objects.filter(id=vet_visit_id).exists()
        
        # Act
        url = reverse('pet-detail', kwargs={'pk': pet_id})
        response = client.delete(url)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        assert not Pet.objects.filter(id=pet_id).exists()
        assert not WeightRecord.objects.filter(id=weight_id).exists()
        assert not Vaccination.objects.filter(id=vaccination_id).exists()
        assert not VetVisit.objects.filter(id=vet_visit_id).exists()

    @allure.title('Delete pet is idempotent')
    @allure.severity(allure.severity_level.NORMAL)
    def test_delete_pet_idempotent(self):
        # Arrange
        client = APIClient()
        pet = Pet.objects.create(name="TestPet", species="dog")
        url = reverse('pet-detail', kwargs={'pk': pet.id})
        
        # Act
        response1 = client.delete(url) # First deletion
        assert response1.status_code == status.HTTP_204_NO_CONTENT
        assert not Pet.objects.filter(id=pet.id).exists()

        response2 = client.delete(url) # Second deletion attempt
        
        # Assert
        assert response2.status_code == status.HTTP_404_NOT_FOUND
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.urls import reverse
from datetime import date
from decimal import Decimal
from pets.models import Pet, WeightRecord, Vaccination, VetVisit, PetShare

pytestmark = [pytest.mark.django_db]


# Fixtures for authentication testing


@pytest.fixture
def test_user():
    """Create a test user"""
    return User.objects.create_user(
        username="testuser_api", password="testpass123", email="testuser@example.com"
    )


@pytest.fixture
def authenticated_client(test_user):
    """Create an authenticated API client"""
    client = APIClient()
    token = Token.objects.create(user=test_user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    client.user = test_user  # Store user reference for easy access in tests
    return client


@pytest.fixture
def second_user():
    """Create a second test user for multi-tenancy testing"""
    return User.objects.create_user(
        username="seconduser_api",
        password="secondpass123",
        email="seconduser@example.com",
    )


@pytest.fixture
def second_client(second_user):
    """Create an authenticated API client for second user"""
    client = APIClient()
    token = Token.objects.create(user=second_user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    client.user = second_user
    return client


class TestPetListAPI:
    """Test GET /api/pets/ endpoint"""

    def test_get_empty_pet_list(self, authenticated_client):
        # Arrange

        # Act
        url = reverse("pet-list")
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        assert response.data["results"] == []

    def test_get_pet_list_with_data(self, authenticated_client):
        # Arrange
        Pet.objects.create(name="Buddy", species="dog", owner=authenticated_client.user)
        Pet.objects.create(
            name="Whiskers", species="cat", owner=authenticated_client.user
        )

        # Act
        url = reverse("pet-list")
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2
        assert len(response.data["results"]) == 2


class TestPetDetailAPI:
    """Test GET /api/pets/{id}/ endpoint"""

    def test_get_pet_detail_success(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Chickpea",
            species="other",
            breed="Hamster",
            birth_date=date(2023, 1, 15),
            owner=authenticated_client.user,
        )

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == pet.id
        assert response.data["name"] == pet.name
        assert response.data["species"] == pet.species
        assert response.data["breed"] == pet.breed
        assert response.data["birth_date"] == str(pet.birth_date)

    def test_get_pet_detail_not_found(self, authenticated_client):
        # Arrange
        non_existent_id = 99999

        # Act
        url = reverse("pet-detail", kwargs={"pk": non_existent_id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_pet_detail_includes_nested_records(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("25.5"), unit="kg"
        )
        Vaccination.objects.create(
            pet=pet, vaccine_name="Rabies", date_administered=date.today()
        )
        VetVisit.objects.create(pet=pet, date=date.today(), reason="Checkup")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "weight_records" in response.data
        assert "vaccinations" in response.data
        assert "vet_visits" in response.data
        assert len(response.data["weight_records"]) == 1
        assert len(response.data["vaccinations"]) == 1
        assert len(response.data["vet_visits"]) == 1


class TestPetCreateAPI:
    """Test POST /api/pets/ endpoint"""

    def test_create_pet_success(self, authenticated_client):
        # Arrange
        data = {"name": "Fluffy", "species": "cat", "breed": "Persian"}

        # Act
        url = reverse("pet-list")
        response = authenticated_client.post(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Fluffy"
        assert response.data["species"] == "cat"
        assert response.data["breed"] == "Persian"
        assert "id" in response.data
        assert Pet.objects.filter(name="Fluffy").exists()

    def test_create_pet_minimal_data(self, authenticated_client):
        # Arrange
        data = {"name": "Buddy", "species": "dog"}

        # Act
        url = reverse("pet-list")
        response = authenticated_client.post(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Buddy"
        assert response.data["species"] == "dog"
        assert response.data["breed"] == "" or response.data["breed"] is None

        pet = Pet.objects.get(name="Buddy")
        assert pet.species == "dog"

    def test_create_pet_missing_required_field(self, authenticated_client):
        # Arrange
        data = {"breed": "Labrador"}

        # Act
        url = reverse("pet-list")
        response = authenticated_client.post(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Pet.objects.filter(owner=authenticated_client.user).count() == 0

    def test_create_pet_invalid_data_type(self, authenticated_client):
        # Arrange
        data = {"name": "Rex", "species": 12345}  # Invalid data type

        # Act
        url = reverse("pet-list")
        response = authenticated_client.post(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Pet.objects.filter(owner=authenticated_client.user).count() == 0

    def test_create_pet_validation_error_messages(self, authenticated_client):
        # Arrange
        data = {}

        # Act
        url = reverse("pet-list")
        response = authenticated_client.post(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        assert "name" in response.data
        assert "species" in response.data

        assert "required" in str(response.data["name"][0]).lower()
        assert "required" in str(response.data["species"][0]).lower()


class TestPetUpdateAPI:
    """Test PUT /api/pets/{id}/ endpoint"""

    def test_update_pet_success(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Original Name",
            species="dog",
            breed="Labrador",
            owner=authenticated_client.user,
        )

        updated_data = {
            "name": "Updated Name",
            "species": "dog",
            "breed": "Golden Retriever",
        }

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.put(url, updated_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Name"
        assert response.data["breed"] == "Golden Retriever"

        pet.refresh_from_db()
        assert pet.name == "Updated Name"
        assert pet.breed == "Golden Retriever"

    def test_update_pet_not_found(self, authenticated_client):
        # Arrange
        non_existent_id = 99999

        updated_data = {"name": "Does Not Matter", "species": "dog"}

        # Act
        url = reverse("pet-detail", kwargs={"pk": non_existent_id})
        response = authenticated_client.put(url, updated_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_pet_invalid_data(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        invalid_data = {"name": "", "species": "dog"}  # Empty name - invalid

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.put(url, invalid_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        pet.refresh_from_db()
        assert pet.name == "Buddy"  # Still original name

    def test_update_pet_missing_fields(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy",
            species="dog",
            breed="Labrador",
            owner=authenticated_client.user,
        )

        incomplete_data = {
            "name": "Updated Name"
            # Missing required field 'species'
        }

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.put(url, incomplete_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_partial_update_pet_with_patch(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy",
            species="dog",
            breed="Labrador",
            owner=authenticated_client.user,
        )

        partial_data = {"name": "Max"}

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.patch(url, partial_data, format="json")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Max"

        pet.refresh_from_db()
        assert pet.name == "Max"  # Changed
        assert pet.species == "dog"  # Unchanged
        assert pet.breed == "Labrador"  # Unchanged


class TestPetDeleteAPI:
    """Test DELETE /api/pets/{id}/ endpoint"""

    def test_delete_pet_success(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="ToDelete", species="dog", owner=authenticated_client.user
        )
        pet_id = pet.id

        assert Pet.objects.filter(id=pet_id).exists()

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet_id})
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not Pet.objects.filter(id=pet_id).exists()

    def test_delete_pet_not_found(self, authenticated_client):
        # Arrange
        non_existent_id = 99999

        # Act
        url = reverse("pet-detail", kwargs={"pk": non_existent_id})
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_pet_cascades_to_related_records(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="TestPet", species="dog", owner=authenticated_client.user
        )

        weight = WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("20.0"), unit="kg"
        )
        vaccination = Vaccination.objects.create(
            pet=pet, vaccine_name="Rabies", date_administered=date.today()
        )
        vet_visit = VetVisit.objects.create(
            pet=pet, date=date.today(), reason="Checkup"
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
        url = reverse("pet-detail", kwargs={"pk": pet_id})
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not Pet.objects.filter(id=pet_id).exists()
        assert not WeightRecord.objects.filter(id=weight_id).exists()
        assert not Vaccination.objects.filter(id=vaccination_id).exists()
        assert not VetVisit.objects.filter(id=vet_visit_id).exists()

    def test_delete_pet_idempotent(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="TestPet", species="dog", owner=authenticated_client.user
        )
        url = reverse("pet-detail", kwargs={"pk": pet.id})

        # Act
        response1 = authenticated_client.delete(url)  # First deletion
        assert response1.status_code == status.HTTP_204_NO_CONTENT
        assert not Pet.objects.filter(id=pet.id).exists()

        response2 = authenticated_client.delete(url)  # Second deletion attempt

        # Assert
        assert response2.status_code == status.HTTP_404_NOT_FOUND


class TestAuthenticationAndAuthorization:
    """Test authentication and authorization for pet endpoints"""

    def test_unauthenticated_request_returns_401(self):
        # Arrange
        client = APIClient()

        # Act
        response = client.get(reverse("pet-list"))

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_create_pet(self, authenticated_client):
        # Arrange
        data = {"name": "AuthPet", "species": "dog"}

        # Act
        response = authenticated_client.post(reverse("pet-list"), data, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "AuthPet"
        assert response.data["owner_username"] == authenticated_client.user.username

        # Verify owner was set in database
        pet = Pet.objects.get(id=response.data["id"])
        assert pet.owner == authenticated_client.user

    def test_authenticated_user_can_list_own_pets(self, authenticated_client):
        # Arrange
        Pet.objects.create(
            name="MyPet1", species="dog", owner=authenticated_client.user
        )
        Pet.objects.create(
            name="MyPet2", species="cat", owner=authenticated_client.user
        )

        # Act
        response = authenticated_client.get(reverse("pet-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2

    def test_user_cannot_see_other_users_pets(self, authenticated_client, second_user):
        # Arrange
        Pet.objects.create(name="MyPet", species="dog", owner=authenticated_client.user)
        Pet.objects.create(name="TheirPet", species="cat", owner=second_user)

        # Act
        response = authenticated_client.get(reverse("pet-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["name"] == "MyPet"

    def test_user_cannot_access_other_users_pet_detail(
        self, authenticated_client, second_user
    ):
        # Arrange
        other_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )

        # Act
        url = reverse("pet-detail", kwargs={"pk": other_pet.id})
        response = authenticated_client.get(url)

        # Assert - should return 404 (not 403) to avoid leaking info about other users' pets
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_user_cannot_update_other_users_pet(
        self, authenticated_client, second_user
    ):
        # Arrange
        other_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )
        data = {"name": "HackedName", "species": "cat"}

        # Act
        url = reverse("pet-detail", kwargs={"pk": other_pet.id})
        response = authenticated_client.put(url, data, format="json")

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify pet was not modified
        other_pet.refresh_from_db()
        assert other_pet.name == "TheirPet"

    def test_user_cannot_delete_other_users_pet(
        self, authenticated_client, second_user
    ):
        # Arrange
        other_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )

        # Act
        url = reverse("pet-detail", kwargs={"pk": other_pet.id})
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify pet still exists
        assert Pet.objects.filter(id=other_pet.id).exists()


class TestMultiTenancyWeightRecords:
    """Test multi-tenancy for weight records"""

    def test_user_can_only_see_weight_records_for_own_pets(
        self, authenticated_client, second_user
    ):
        # Arrange
        my_pet = Pet.objects.create(
            name="MyPet", species="dog", owner=authenticated_client.user
        )
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )

        WeightRecord.objects.create(
            pet=my_pet, date=date.today(), weight=Decimal("20.0"), unit="kg"
        )
        WeightRecord.objects.create(
            pet=their_pet, date=date.today(), weight=Decimal("5.0"), unit="kg"
        )

        # Act
        response = authenticated_client.get(reverse("weightrecord-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["pet"] == my_pet.id

    def test_user_cannot_access_weight_record_for_other_users_pet(
        self, authenticated_client, second_user
    ):
        # Arrange
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )
        their_weight = WeightRecord.objects.create(
            pet=their_pet, date=date.today(), weight=Decimal("5.0"), unit="kg"
        )

        # Act
        url = reverse("weightrecord-detail", kwargs={"pk": their_weight.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestMultiTenancyVaccinations:
    """Test multi-tenancy for vaccinations"""

    def test_user_can_only_see_vaccinations_for_own_pets(
        self, authenticated_client, second_user
    ):
        # Arrange
        my_pet = Pet.objects.create(
            name="MyPet", species="dog", owner=authenticated_client.user
        )
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )

        Vaccination.objects.create(
            pet=my_pet, vaccine_name="Rabies", date_administered=date.today()
        )
        Vaccination.objects.create(
            pet=their_pet,
            vaccine_name="Feline Leukemia",
            date_administered=date.today(),
        )

        # Act
        response = authenticated_client.get(reverse("vaccination-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["pet"] == my_pet.id

    def test_user_cannot_access_vaccination_for_other_users_pet(
        self, authenticated_client, second_user
    ):
        # Arrange
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )
        their_vaccination = Vaccination.objects.create(
            pet=their_pet,
            vaccine_name="Feline Leukemia",
            date_administered=date.today(),
        )

        # Act
        url = reverse("vaccination-detail", kwargs={"pk": their_vaccination.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestMultiTenancyVetVisits:
    """Test multi-tenancy for vet visits"""

    def test_user_can_only_see_vet_visits_for_own_pets(
        self, authenticated_client, second_user
    ):
        # Arrange
        my_pet = Pet.objects.create(
            name="MyPet", species="dog", owner=authenticated_client.user
        )
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )

        VetVisit.objects.create(pet=my_pet, date=date.today(), reason="Checkup")
        VetVisit.objects.create(pet=their_pet, date=date.today(), reason="Emergency")

        # Act
        response = authenticated_client.get(reverse("vetvisit-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["pet"] == my_pet.id

    def test_user_cannot_access_vet_visit_for_other_users_pet(
        self, authenticated_client, second_user
    ):
        # Arrange
        their_pet = Pet.objects.create(
            name="TheirPet", species="cat", owner=second_user
        )
        their_visit = VetVisit.objects.create(
            pet=their_pet, date=date.today(), reason="Emergency"
        )

        # Act
        url = reverse("vetvisit-detail", kwargs={"pk": their_visit.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestPetShareAPI:
    """Test sharing endpoints: POST/GET/DELETE on /api/pets/{id}/share/"""

    def test_owner_can_share_pet_as_viewer(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url,
            {"user_identifier": second_user.username, "role": "viewer"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["shared_with_username"] == second_user.username
        assert response.data["role"] == "viewer"
        assert PetShare.objects.filter(pet=pet, shared_with=second_user).exists()

    def test_owner_can_share_pet_as_editor(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url,
            {"user_identifier": second_user.username, "role": "editor"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "editor"

    def test_owner_can_share_pet_by_email(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url, {"user_identifier": second_user.email, "role": "viewer"}, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["shared_with_username"] == second_user.username

    def test_share_with_nonexistent_user_fails(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url,
            {"user_identifier": "nobody@nowhere.com", "role": "viewer"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_share_with_self_fails(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url,
            {"user_identifier": authenticated_client.user.username, "role": "viewer"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_duplicate_share_fails(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_user, role="viewer")

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = authenticated_client.post(
            url,
            {"user_identifier": second_user.username, "role": "editor"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_non_owner_cannot_share_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = second_client.post(
            url, {"user_identifier": "someone", "role": "viewer"}, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_can_list_shared_users(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_user, role="viewer")

        # Act
        url = f"/api/pets/{pet.id}/shared-with/"
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["shared_with_username"] == second_user.username

    def test_owner_can_unshare_pet(self, authenticated_client, second_user):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        share = PetShare.objects.create(pet=pet, shared_with=second_user, role="viewer")

        # Act
        url = f"/api/pets/{pet.id}/share/{share.id}/"
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not PetShare.objects.filter(id=share.id).exists()

    def test_unshare_nonexistent_returns_404(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )

        # Act
        url = f"/api/pets/{pet.id}/share/99999/"
        response = authenticated_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestSharedPetVisibility:
    """Test that shared pets appear in the list and are accessible"""

    def test_shared_pet_appears_in_list(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="SharedDog", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        response = second_client.get(reverse("pet-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["name"] == "SharedDog"
        assert response.data["results"][0]["is_shared"] is True
        assert response.data["results"][0]["user_role"] == "viewer"

    def test_shared_pet_detail_accessible(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="SharedDog", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_shared"] is True
        assert response.data["user_role"] == "viewer"

    def test_own_pet_shows_owner_role(self, authenticated_client):
        # Arrange
        pet = Pet.objects.create(
            name="MyDog", species="dog", owner=authenticated_client.user
        )

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = authenticated_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_shared"] is False
        assert response.data["user_role"] == "owner"

    def test_unshared_pet_not_visible(self, authenticated_client, second_client):
        # Arrange
        Pet.objects.create(
            name="PrivateDog", species="dog", owner=authenticated_client.user
        )

        # Act
        response = second_client.get(reverse("pet-list"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0


class TestViewerPermissions:
    """Test that viewers can only read, not modify"""

    def test_viewer_can_read_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK

    def test_viewer_cannot_update_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.put(
            url, {"name": "Hacked", "species": "dog"}, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN
        pet.refresh_from_db()
        assert pet.name == "Buddy"

    def test_viewer_cannot_delete_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Pet.objects.filter(id=pet.id).exists()

    def test_viewer_can_read_weight_records(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("20.0"), unit="kg"
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        response = second_client.get(f"{reverse('weightrecord-list')}?pet={pet.id}")

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_viewer_cannot_create_weight_record(
        self, authenticated_client, second_client
    ):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="viewer")

        # Act
        response = second_client.post(
            reverse("weightrecord-list"),
            {"pet": pet.id, "date": "2025-01-01", "weight": "20.0", "unit": "kg"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestEditorPermissions:
    """Test that editors can CRUD records but cannot edit/delete pet or manage sharing"""

    def test_editor_can_read_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.get(url)

        # Assert
        assert response.status_code == status.HTTP_200_OK

    def test_editor_cannot_update_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.put(
            url, {"name": "Changed", "species": "dog"}, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_editor_cannot_delete_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        url = reverse("pet-detail", kwargs={"pk": pet.id})
        response = second_client.delete(url)

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_editor_can_create_weight_record(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        response = second_client.post(
            reverse("weightrecord-list"),
            {"pet": pet.id, "date": "2025-01-01", "weight": "20.0", "unit": "kg"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert WeightRecord.objects.filter(pet=pet).count() == 1

    def test_editor_can_create_vaccination(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        response = second_client.post(
            reverse("vaccination-list"),
            {
                "pet": pet.id,
                "vaccine_name": "Rabies",
                "date_administered": "2025-01-01",
            },
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

    def test_editor_can_create_vet_visit(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")

        # Act
        response = second_client.post(
            reverse("vetvisit-list"),
            {"pet": pet.id, "date": "2025-01-01", "reason": "Checkup"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

    def test_editor_cannot_share_pet(self, authenticated_client, second_client):
        # Arrange
        pet = Pet.objects.create(
            name="Buddy", species="dog", owner=authenticated_client.user
        )
        PetShare.objects.create(pet=pet, shared_with=second_client.user, role="editor")
        third_user = User.objects.create_user(username="thirduser", password="pass123")

        # Act
        url = f"/api/pets/{pet.id}/share/"
        response = second_client.post(
            url,
            {"user_identifier": third_user.username, "role": "viewer"},
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_403_FORBIDDEN

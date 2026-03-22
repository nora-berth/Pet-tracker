import pytest
from datetime import date
from decimal import Decimal
from django.contrib.auth.models import User
from pets.models import Pet, WeightRecord, Vaccination, VetVisit, PetShare


@pytest.mark.django_db
class TestPetModel:

    def test_create_pet(self):
        pet = Pet.objects.create(name="Doggy the dog", species="dog")
        assert pet.name == "Doggy the dog"
        assert pet.species == "dog"
        assert pet.id is not None
        assert pet.created_at is not None

    def test_create_pet_with_all_fields(self):
        pet = Pet.objects.create(
            name="Lord Whiskersbotom",
            species="cat",
            breed="Siamese",
            birth_date=date(2020, 5, 15),
            notes="Very friendly cat",
        )
        assert pet.name == "Lord Whiskersbotom"
        assert pet.species == "cat"
        assert pet.breed == "Siamese"
        assert pet.birth_date == date(2020, 5, 15)
        assert pet.notes == "Very friendly cat"

    def test_pet_string_representation(self):
        pet = Pet.objects.create(name="John Cena", species="dog")
        assert str(pet) == "John Cena"

    def test_pet_ordering(self):
        pet1 = Pet.objects.create(name="First", species="dog")
        pet2 = Pet.objects.create(name="Second", species="cat")

        pets = Pet.objects.all()
        assert pets[0].name == "Second"
        assert pets[1].name == "First"


@pytest.mark.django_db
class TestWeightRecordModel:

    def test_create_weight_record(self):
        pet = Pet.objects.create(name="Maxwell", species="snake")
        weight = WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("2.5"), unit="kg"
        )
        assert weight.pet == pet
        assert weight.weight == Decimal("2.5")
        assert weight.unit == "kg"

    def test_weight_record_with_notes(self):
        pet = Pet.objects.create(name="Princess Carolyn", species="cat")
        weight = WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("4.2"),
            unit="kg",
            notes="After diet program",
        )
        assert weight.notes == "After diet program"

    def test_weight_record_relationship(self):
        pet = Pet.objects.create(name="Bella Swan", species="hamster")
        WeightRecord.objects.create(
            pet=pet, date=date(2025, 1, 1), weight=Decimal("0.085"), unit="kg"
        )
        WeightRecord.objects.create(
            pet=pet, date=date(2025, 2, 1), weight=Decimal("0.090"), unit="kg"
        )

        assert pet.weight_records.count() == 2

    def test_weight_record_unique_constraint(self):
        pet = Pet.objects.create(name="Jean-Jacques", species="dog")
        WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("15.0"), unit="kg"
        )

        with pytest.raises(Exception):  # Should raise IntegrityError
            WeightRecord.objects.create(
                pet=pet, date=date.today(), weight=Decimal("16.0"), unit="kg"
            )


@pytest.mark.django_db
class TestVaccinationModel:

    def test_create_vaccination(self):
        pet = Pet.objects.create(name="Molly", species="dog")
        vaccination = Vaccination.objects.create(
            pet=pet, vaccine_name="Rabies", date_administered=date.today()
        )
        assert vaccination.pet == pet
        assert vaccination.vaccine_name == "Rabies"

    def test_vaccination_with_all_fields(self):
        pet = Pet.objects.create(name="Bob", species="cat")
        vaccination = Vaccination.objects.create(
            pet=pet,
            vaccine_name="FVRCP",
            date_administered=date(2025, 1, 15),
            due_date=date(2026, 1, 15),
            veterinarian="Dr. Doolittle",
            notes="Annual vaccination",
        )
        assert vaccination.due_date == date(2026, 1, 15)
        assert vaccination.veterinarian == "Dr. Doolittle"
        assert vaccination.notes == "Annual vaccination"

    def test_vaccination_relationship(self):
        pet = Pet.objects.create(name="Doggy McDoggo", species="dog")
        Vaccination.objects.create(
            pet=pet, vaccine_name="Rabies", date_administered=date.today()
        )
        Vaccination.objects.create(
            pet=pet, vaccine_name="DHPP", date_administered=date.today()
        )

        assert pet.vaccinations.count() == 2


@pytest.mark.django_db
class TestVetVisitModel:

    def test_create_vet_visit(self):
        pet = Pet.objects.create(name="Pimpinella", species="dog")
        visit = VetVisit.objects.create(
            pet=pet, date=date.today(), reason="Annual checkup"
        )
        assert visit.pet == pet
        assert visit.reason == "Annual checkup"

    def test_vet_visit_with_cost(self):
        pet = Pet.objects.create(name="Oscar Oscarson", species="cat")
        visit = VetVisit.objects.create(
            pet=pet, date=date.today(), reason="Vaccination", cost=Decimal("75.50")
        )
        assert visit.cost == Decimal("75.50")

    def test_vet_visit_with_all_fields(self):
        pet = Pet.objects.create(name="Shadowcat", species="cat")
        visit = VetVisit.objects.create(
            pet=pet,
            date=date(2025, 3, 10),
            reason="Sick visit",
            veterinarian="Dr. Zoolander",
            notes="Diagnosed with being too cute",
            cost=Decimal("125.00"),
        )
        assert visit.veterinarian == "Dr. Zoolander"
        assert visit.notes == "Diagnosed with being too cute"

    def test_vet_visit_relationship(self):
        pet = Pet.objects.create(name="Gerald of Rivia", species="cat")
        VetVisit.objects.create(pet=pet, date=date(2025, 1, 1), reason="Checkup")
        VetVisit.objects.create(pet=pet, date=date(2025, 2, 1), reason="Vaccination")

        assert pet.vet_visits.count() == 2

    def test_cascade_delete(self):
        pet = Pet.objects.create(name="Anya", species="rabbit")
        WeightRecord.objects.create(
            pet=pet, date=date.today(), weight=Decimal("2.5"), unit="kg"
        )
        Vaccination.objects.create(
            pet=pet, vaccine_name="Test Vaccine", date_administered=date.today()
        )
        VetVisit.objects.create(pet=pet, date=date.today(), reason="Checkup")

        pet_id = pet.id
        pet.delete()

        assert WeightRecord.objects.filter(pet_id=pet_id).count() == 0
        assert Vaccination.objects.filter(pet_id=pet_id).count() == 0
        assert VetVisit.objects.filter(pet_id=pet_id).count() == 0


@pytest.mark.django_db
class TestPetShareModel:

    def test_create_pet_share_viewer(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        viewer = User.objects.create_user(username="viewer", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)

        # Act
        share = PetShare.objects.create(pet=pet, shared_with=viewer, role="viewer")

        # Assert
        assert share.pet == pet
        assert share.shared_with == viewer
        assert share.role == "viewer"
        assert share.created_at is not None

    def test_create_pet_share_editor(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        editor = User.objects.create_user(username="editor", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)

        # Act
        share = PetShare.objects.create(pet=pet, shared_with=editor, role="editor")

        # Assert
        assert share.role == "editor"

    def test_pet_share_default_role_is_viewer(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        other = User.objects.create_user(username="other", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)

        # Act
        share = PetShare.objects.create(pet=pet, shared_with=other)

        # Assert
        assert share.role == "viewer"

    def test_pet_share_string_representation(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        viewer = User.objects.create_user(username="viewer", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)

        # Act
        share = PetShare.objects.create(pet=pet, shared_with=viewer, role="viewer")

        # Assert
        assert str(share) == "Buddy shared with viewer (viewer)"

    def test_pet_share_unique_constraint(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        viewer = User.objects.create_user(username="viewer", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)
        PetShare.objects.create(pet=pet, shared_with=viewer, role="viewer")

        # Act & Assert
        with pytest.raises(Exception):
            PetShare.objects.create(pet=pet, shared_with=viewer, role="editor")

    def test_pet_share_cascade_delete_pet(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        viewer = User.objects.create_user(username="viewer", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)
        PetShare.objects.create(pet=pet, shared_with=viewer, role="viewer")
        pet_id = pet.id

        # Act
        pet.delete()

        # Assert
        assert PetShare.objects.filter(pet_id=pet_id).count() == 0

    def test_pet_share_cascade_delete_user(self):
        # Arrange
        owner = User.objects.create_user(username="owner", password="pass123")
        viewer = User.objects.create_user(username="viewer", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)
        PetShare.objects.create(pet=pet, shared_with=viewer, role="viewer")

        # Act
        viewer.delete()

        # Assert
        assert PetShare.objects.filter(pet=pet).count() == 0

    def test_pet_share_clean_prevents_sharing_with_owner(self):
        # Arrange
        from django.core.exceptions import ValidationError

        owner = User.objects.create_user(username="owner", password="pass123")
        pet = Pet.objects.create(name="Buddy", species="dog", owner=owner)

        # Act & Assert
        share = PetShare(pet=pet, shared_with=owner, role="viewer")
        with pytest.raises(ValidationError):
            share.clean()

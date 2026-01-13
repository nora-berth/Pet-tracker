import pytest
import allure
from django.utils import timezone
from datetime import date
from decimal import Decimal
from pets.models import Pet, WeightRecord, Vaccination, VetVisit


@pytest.mark.django_db
@allure.suite('Model Tests')
@allure.epic('Pet Tracker')
@allure.feature('Pet Management')
@allure.story('CRUD Operations')
class TestPetModel:
    

    @allure.title('Create pet with required fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_pet(self):
        pet = Pet.objects.create(
            name="Doggy the dog",
            species="dog"
        )
        assert pet.name == "Doggy the dog"
        assert pet.species == "dog"
        assert pet.id is not None
        assert pet.created_at is not None

    @allure.title('Create pet with all fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_pet_with_all_fields(self):
        pet = Pet.objects.create(
            name="Lord Whiskersbotom",
            species="cat",
            breed="Siamese",
            birth_date=date(2020, 5, 15),
            notes="Very friendly cat"
        )
        assert pet.name == "Lord Whiskersbotom"
        assert pet.species == "cat"
        assert pet.breed == "Siamese"
        assert pet.birth_date == date(2020, 5, 15)
        assert pet.notes == "Very friendly cat"
    
    @allure.title('Pet name string is returned correctly')
    @allure.severity(allure.severity_level.TRIVIAL)
    def test_pet_string_representation(self):
        pet = Pet.objects.create(name="John Cena", species="dog")
        assert str(pet) == "John Cena"
    
    @allure.title('Pets are ordered by descending creation date')
    @allure.severity(allure.severity_level.TRIVIAL)
    def test_pet_ordering(self):
        pet1 = Pet.objects.create(name="First", species="dog")
        pet2 = Pet.objects.create(name="Second", species="cat")
        
        pets = Pet.objects.all()
        assert pets[0].name == "Second"
        assert pets[1].name == "First"


@pytest.mark.django_db
@allure.suite('Model Tests')
@allure.epic('Pet Tracker')
@allure.feature('Health Records')
@allure.story('Weight Tracking')
class TestWeightRecordModel:
    
    @allure.title('Create weight record with required fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_weight_record(self):
        pet = Pet.objects.create(name="Maxwell", species="snake")
        weight = WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("2.5"),
            unit="kg"
        )
        assert weight.pet == pet
        assert weight.weight == Decimal("2.5")
        assert weight.unit == "kg"
    
    @allure.title('Create weight record with notes')
    @allure.severity(allure.severity_level.NORMAL)
    def test_weight_record_with_notes(self):
        pet = Pet.objects.create(name="Princess Carolyn", species="cat")
        weight = WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("4.2"),
            unit="kg",
            notes="After diet program"
        )
        assert weight.notes == "After diet program"
    
    @allure.title('Pet has multiple weight records')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_weight_record_relationship(self):
        pet = Pet.objects.create(name="Bella Swan", species="hamster")
        WeightRecord.objects.create(
            pet=pet,
            date=date(2025, 1, 1),
            weight=Decimal("0.085"),
            unit="kg"
        )
        WeightRecord.objects.create(
            pet=pet,
            date=date(2025, 2, 1),
            weight=Decimal("0.090"),
            unit="kg"
        )
        
        assert pet.weight_records.count() == 2
    
    @allure.title('Weight record unique constraint per pet per date')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_weight_record_unique_constraint(self):
        pet = Pet.objects.create(name="Jean-Jacques", species="dog")
        WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("15.0"),
            unit="kg"
        )
        
        with pytest.raises(Exception):  # Should raise IntegrityError
            WeightRecord.objects.create(
                pet=pet,
                date=date.today(),
                weight=Decimal("16.0"),
                unit="kg"
            )


@pytest.mark.django_db
@allure.suite('Model Tests')
@allure.epic('Pet Tracker')
@allure.feature('Health Records')
@allure.story('Vaccination Tracking')
class TestVaccinationModel:
    
    @allure.title('Create vaccination with required fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_vaccination(self):
        pet = Pet.objects.create(name="Molly", species="dog")
        vaccination = Vaccination.objects.create(
            pet=pet,
            vaccine_name="Rabies",
            date_administered=date.today()
        )
        assert vaccination.pet == pet
        assert vaccination.vaccine_name == "Rabies"
    
    @allure.title('Create vaccination with all fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_vaccination_with_all_fields(self):
        pet = Pet.objects.create(name="Bob", species="cat")
        vaccination = Vaccination.objects.create(
            pet=pet,
            vaccine_name="FVRCP",
            date_administered=date(2025, 1, 15),
            due_date=date(2026, 1, 15),
            veterinarian="Dr. Doolittle",
            notes="Annual vaccination"
        )
        assert vaccination.due_date == date(2026, 1, 15)
        assert vaccination.veterinarian == "Dr. Doolittle"
        assert vaccination.notes == "Annual vaccination"
    
    @allure.title('Pet has multiple vaccinations')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_vaccination_relationship(self):
        pet = Pet.objects.create(name="Doggy McDoggo", species="dog")
        Vaccination.objects.create(
            pet=pet,
            vaccine_name="Rabies",
            date_administered=date.today()
        )
        Vaccination.objects.create(
            pet=pet,
            vaccine_name="DHPP",
            date_administered=date.today()
        )
        
        assert pet.vaccinations.count() == 2


@pytest.mark.django_db
@allure.suite('Model Tests')
@allure.epic('Pet Tracker')
@allure.feature('Health Records')
@allure.story('Vet Visit Tracking')
class TestVetVisitModel:
    
    @allure.title('Create vet visit with required fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_create_vet_visit(self):
        pet = Pet.objects.create(name="Pimpinella", species="dog")
        visit = VetVisit.objects.create(
            pet=pet,
            date=date.today(),
            reason="Annual checkup"
        )
        assert visit.pet == pet
        assert visit.reason == "Annual checkup"
    
    @allure.title('Create vet visit with cost')
    @allure.severity(allure.severity_level.NORMAL)
    def test_vet_visit_with_cost(self):
        pet = Pet.objects.create(name="Oscar Oscarson", species="cat")
        visit = VetVisit.objects.create(
            pet=pet,
            date=date.today(),
            reason="Vaccination",
            cost=Decimal("75.50")
        )
        assert visit.cost == Decimal("75.50")
    
    @allure.title('Create vet visit with all fields')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_vet_visit_with_all_fields(self):
        pet = Pet.objects.create(name="Shadowcat", species="cat")
        visit = VetVisit.objects.create(
            pet=pet,
            date=date(2025, 3, 10),
            reason="Sick visit",
            veterinarian="Dr. Zoolander",
            notes="Diagnosed with being too cute",
            cost=Decimal("125.00")
        )
        assert visit.veterinarian == "Dr. Zoolander"
        assert visit.notes == "Diagnosed with being too cute"
    
    @allure.title('Pet has multiple vet visits')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_vet_visit_relationship(self):
        pet = Pet.objects.create(name="Gerald of Rivia", species="cat")
        VetVisit.objects.create(
            pet=pet,
            date=date(2025, 1, 1),
            reason="Checkup"
        )
        VetVisit.objects.create(
            pet=pet,
            date=date(2025, 2, 1),
            reason="Vaccination"
        )
        
        assert pet.vet_visits.count() == 2
    
    @allure.title('Deleting pet cascades to related records')
    @allure.severity(allure.severity_level.CRITICAL)
    def test_cascade_delete(self):
        pet = Pet.objects.create(name="Anya", species="rabbit")
        WeightRecord.objects.create(
            pet=pet,
            date=date.today(),
            weight=Decimal("2.5"),
            unit="kg"
        )
        Vaccination.objects.create(
            pet=pet,
            vaccine_name="Test Vaccine",
            date_administered=date.today()
        )
        VetVisit.objects.create(
            pet=pet,
            date=date.today(),
            reason="Checkup"
        )
        
        pet_id = pet.id
        pet.delete()
        
        assert WeightRecord.objects.filter(pet_id=pet_id).count() == 0
        assert Vaccination.objects.filter(pet_id=pet_id).count() == 0
        assert VetVisit.objects.filter(pet_id=pet_id).count() == 0
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Pet(models.Model):
    SPECIES_CHOICES = [
        ('dog', 'Dog'),
        ('cat', 'Cat'),
        ('ferret', 'Ferret'),
        ('tortoise', 'Tortoise'),
        ('rabbit', 'Rabbit'),
         ('bird', 'Bird'),
        ('hamster', 'Hamster'),
        ('guinea_pig', 'Guinea Pig'),
        ('snake', 'Snake'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=20, choices=SPECIES_CHOICES)
    breed = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='pet_photos/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class WeightRecord(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='weight_records')
    date = models.DateField()
    weight = models.DecimalField(
        max_digits=6, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    unit = models.CharField(
        max_length=5,
        choices=[('kg', 'Kilograms'), ('lb', 'Pounds')],
        default='kg'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['pet', 'date']
    
    def __str__(self):
        return f"{self.pet.name} - {self.weight}{self.unit} on {self.date}"


class Vaccination(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=200)
    date_administered = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    veterinarian = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_administered']
    
    def __str__(self):
        return f"{self.pet.name} - {self.vaccine_name} on {self.date_administered}"


class VetVisit(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='vet_visits')
    date = models.DateField()
    reason = models.CharField(max_length=200)
    veterinarian = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.pet.name} - {self.reason} on {self.date}"
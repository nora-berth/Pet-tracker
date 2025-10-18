from django.contrib import admin
from django.contrib import admin
from .models import Pet, WeightRecord, Vaccination, VetVisit


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'species', 'breed', 'birth_date', 'created_at']
    list_filter = ['species', 'created_at']
    search_fields = ['name', 'breed']


@admin.register(WeightRecord)
class WeightRecordAdmin(admin.ModelAdmin):
    list_display = ['pet', 'date', 'weight', 'unit']
    list_filter = ['pet', 'date', 'unit']
    date_hierarchy = 'date'


@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ['pet', 'vaccine_name', 'date_administered', 'due_date', 'veterinarian']
    list_filter = ['pet', 'date_administered']
    date_hierarchy = 'date_administered'


@admin.register(VetVisit)
class VetVisitAdmin(admin.ModelAdmin):
    list_display = ['pet', 'reason', 'date', 'veterinarian', 'cost']
    list_filter = ['pet', 'date']
    date_hierarchy = 'date'

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetViewSet, WeightRecordViewSet, VaccinationViewSet, VetVisitViewSet

router = DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'weight-records', WeightRecordViewSet)
router.register(r'vaccinations', VaccinationViewSet)
router.register(r'vet-visits', VetVisitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
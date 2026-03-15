from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PetViewSet, WeightRecordViewSet, VaccinationViewSet, VetVisitViewSet,
    register, login, logout, profile
)

router = DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'weight-records', WeightRecordViewSet)
router.register(r'vaccinations', VaccinationViewSet)
router.register(r'vet-visits', VetVisitViewSet)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', login, name='auth-login'),
    path('auth/logout/', logout, name='auth-logout'),
    path('auth/profile/', profile, name='auth-profile'),
    # Pet management endpoints
    path('', include(router.urls)),
]
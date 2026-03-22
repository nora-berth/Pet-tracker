from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Pet, PetShare

class PetAccessPermission(BasePermission):
    """
    Role-based permission for pet-related views.
    - owner: full CRUD
    - editor: read pet + CRUD on records, but cannot edit/delete the pet itself
    - viewer: read-only on everything
    """

    def has_object_permission(self, request, view, obj):
        pet = obj if isinstance(obj, Pet) else obj.pet
        user = request.user

        # Owner has full access
        if pet.owner == user:
            return True

        # Get share role
        share = PetShare.objects.filter(pet=pet, shared_with=user).first()
        if not share:
            return False

        # Viewer: read-only
        if share.role == 'viewer':
            return request.method in SAFE_METHODS

        # Editor
        if share.role == 'editor':
            if isinstance(obj, Pet):
                # Editors can read the pet, but cannot edit or delete it
                return request.method in SAFE_METHODS
            else:
                # For records: editors can create, read, update, and delete
                return True

        return False


class IsShareOwner(BasePermission):
    """Only the pet's owner can manage sharing (add/remove shared users)."""

    def has_object_permission(self, request, view, obj):
        pet = obj if isinstance(obj, Pet) else obj.pet
        return pet.owner == request.user
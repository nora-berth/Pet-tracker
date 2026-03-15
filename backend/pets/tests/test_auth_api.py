"""
Tests for authentication API endpoints.

Tests registration, login, logout, and profile endpoints.
"""

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token


@pytest.mark.django_db
class TestRegistrationAPI:
    """Test user registration endpoint: POST /api/auth/register/"""

    def test_register_with_valid_data(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
            'first_name': 'New',
            'last_name': 'User',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data
        assert 'user' in response.data
        assert response.data['user']['username'] == 'newuser'
        assert response.data['user']['email'] == 'newuser@example.com'
        assert response.data['user']['first_name'] == 'New'
        assert response.data['user']['last_name'] == 'User'
        assert 'password' not in response.data['user']

        # Verify user was created in database
        user = User.objects.get(username='newuser')
        assert user.email == 'newuser@example.com'
        assert user.check_password('securepass123')

        # Verify token was created
        assert Token.objects.filter(user=user).exists()

    def test_register_with_minimal_data(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'minimaluser',
            'email': 'minimal@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user']['username'] == 'minimaluser'
        assert User.objects.filter(username='minimaluser').exists()

    def test_register_with_duplicate_username(self):
        # Arrange
        client = APIClient()
        User.objects.create_user(username='existinguser', password='pass123')
        data = {
            'username': 'existinguser',
            'email': 'different@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data
        assert 'already exists' in str(response.data['username'][0]).lower()

    def test_register_with_duplicate_email(self):
        # Arrange
        client = APIClient()
        User.objects.create_user(
            username='user1',
            email='duplicate@example.com',
            password='pass123'
        )
        data = {
            'username': 'user2',
            'email': 'duplicate@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
        assert 'already exists' in str(response.data['email'][0]).lower()

    def test_register_with_mismatched_passwords(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'mismatch_user',
            'email': 'mismatch@example.com',
            'password': 'securepass123',
            'password_confirm': 'differentpass456',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password_confirm' in response.data or 'non_field_errors' in response.data

    def test_register_with_short_password(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'shortpass_user',
            'email': 'shortpass@example.com',
            'password': 'short',
            'password_confirm': 'short',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data

    def test_register_with_missing_username(self):
        # Arrange
        client = APIClient()
        data = {
            'email': 'missing@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data

    def test_register_with_missing_password(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'nopass_user',
            'email': 'nopass@example.com',
        }

        # Act
        response = client.post('/api/auth/register/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data


@pytest.mark.django_db
class TestLoginAPI:
    """Test user login endpoint: POST /api/auth/login/"""

    def test_login_with_valid_credentials(self):
        # Arrange
        client = APIClient()
        user = User.objects.create_user(
            username='loginuser',
            password='loginpass123',
            email='login@example.com',
            first_name='Login',
            last_name='User'
        )

        data = {
            'username': 'loginuser',
            'password': 'loginpass123',
        }

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data
        assert 'user' in response.data
        assert response.data['user']['username'] == 'loginuser'
        assert response.data['user']['email'] == 'login@example.com'
        assert response.data['user']['first_name'] == 'Login'
        assert response.data['user']['last_name'] == 'User'
        assert 'password' not in response.data['user']

        # Verify token exists in database
        token = Token.objects.get(key=response.data['token'])
        assert token.user == user

    def test_login_with_invalid_password(self):
        # Arrange
        client = APIClient()
        User.objects.create_user(username='wrongpass_user', password='correctpass123')
        data = {
            'username': 'wrongpass_user',
            'password': 'wrongpassword',
        }

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data
        assert 'invalid' in str(response.data['non_field_errors'][0]).lower()

    def test_login_with_invalid_username(self):
        # Arrange
        client = APIClient()
        data = {
            'username': 'nonexistentuser',
            'password': 'somepassword',
        }

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data
        assert 'invalid' in str(response.data['non_field_errors'][0]).lower()

    def test_login_with_missing_username(self):
        # Arrange
        client = APIClient()
        data = {'password': 'somepass123'}

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data or 'non_field_errors' in response.data

    def test_login_with_missing_password(self):
        # Arrange
        client = APIClient()
        data = {'username': 'someuser'}

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data or 'non_field_errors' in response.data

    def test_login_with_inactive_user(self):
        # Arrange
        client = APIClient()
        user = User.objects.create_user(username='inactiveuser', password='inactive123')
        user.is_active = False
        user.save()

        data = {
            'username': 'inactiveuser',
            'password': 'inactive123',
        }

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data
        # Note: authenticate() returns None for inactive users, so error is "invalid"
        assert 'invalid' in str(response.data['non_field_errors'][0]).lower()

    def test_login_returns_existing_token(self):
        # Arrange
        client = APIClient()
        user = User.objects.create_user(username='tokenuser', password='tokenpass123')
        existing_token = Token.objects.create(user=user)

        data = {
            'username': 'tokenuser',
            'password': 'tokenpass123',
        }

        # Act
        response = client.post('/api/auth/login/', data, format='json')

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['token'] == existing_token.key
        # Verify no duplicate tokens were created
        assert Token.objects.filter(user=user).count() == 1


@pytest.mark.django_db
class TestLogoutAPI:
    """Test user logout endpoint: POST /api/auth/logout/"""

    def test_logout_with_valid_token(self):
        # Arrange
        client = APIClient()
        user = User.objects.create_user(username='logoutuser', password='logout123')
        token = Token.objects.create(user=user)
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Act
        response = client.post('/api/auth/logout/')

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
        assert 'logged out' in response.data['message'].lower()

        # Verify token was deleted from database
        assert not Token.objects.filter(user=user).exists()

    def test_logout_without_authentication(self):
        # Arrange
        client = APIClient()

        # Act
        response = client.post('/api/auth/logout/')

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_with_invalid_token(self):
        # Arrange
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token invalidtoken123')

        # Act
        response = client.post('/api/auth/logout/')

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProfileAPI:
    """Test user profile endpoint: GET /api/auth/profile/"""

    def test_get_profile_with_valid_token(self):
        # Arrange
        client = APIClient()
        user = User.objects.create_user(
            username='profileuser',
            password='profile123',
            email='profile@example.com',
            first_name='Profile',
            last_name='User'
        )
        token = Token.objects.create(user=user)
        client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Act
        response = client.get('/api/auth/profile/')

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'profileuser'
        assert response.data['email'] == 'profile@example.com'
        assert response.data['first_name'] == 'Profile'
        assert response.data['last_name'] == 'User'
        assert 'password' not in response.data

    def test_get_profile_without_authentication(self):
        # Arrange
        client = APIClient()

        # Act
        response = client.get('/api/auth/profile/')

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_with_invalid_token(self):
        # Arrange
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token invalidtoken123')

        # Act
        response = client.get('/api/auth/profile/')

        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

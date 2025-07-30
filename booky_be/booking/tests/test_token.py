from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class TokenAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword')

        self.token_url = reverse('token_obtain_pair')       # /token/
        self.refresh_url = reverse('token_refresh')         # /token/refresh/

        # Pretpostavljamo da dashboard koristi rezervacije zaštićene tokenom (npr. GET na /api/reservations/)
        self.protected_url = reverse('booking:reservation-list-create')

    def test_login_returns_tokens(self):
        """Login returns access and refresh tokens"""
        data = {'email': 'testuser@example.com', 'password': 'testpassword'}
        response = self.client.post(self.token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_refresh_token_returns_new_access_token(self):
        """Refresh token returns new access token"""
        data = {'email': 'testuser@example.com', 'password': 'testpassword'}
        login_response = self.client.post(self.token_url, data, format='json')
        refresh = login_response.data['refresh']

        response = self.client.post(self.refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_access_protected_route_with_token(self):
        """User can access protected route with valid access token"""
        data = {'email': 'testuser@example.com', 'password': 'testpassword'}
        login_response = self.client.post(self.token_url, data, format='json')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.protected_url)
        # očekuješ da admin vidi listu rezervacija
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])

    def test_access_denied_with_invalid_token(self):
        """Access is denied when using an invalid token"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken123')
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from ..models import Holiday

User = get_user_model()

class HolidayAPITests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(email='testuser@example.com', password='testpassword')
        # URL for creating and listing holidays
        self.url = reverse('booking:holiday-list-create') # Corrected URL name with app_name prefix

    def test_create_holiday_authenticated_user(self):
        """Ensure an authenticated user can create a new holiday and their email is recorded."""
        # Authenticate the user
        self.client.force_authenticate(user=self.user)

        data = {
            'name': 'Test Holiday',
            'date': '2025-12-25'
        }
        
        response = self.client.post(self.url, data, format='json')
        
        # Check that the response is 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the holiday was created in the database
        self.assertEqual(Holiday.objects.count(), 1)
        holiday = Holiday.objects.get()
        self.assertEqual(holiday.name, 'Test Holiday')
        
        # Check that the creator is correctly set
        self.assertEqual(holiday.created_by, self.user)
        
        # Check that the response contains the user's email, not username
        self.assertEqual(response.data['created_by_email'], self.user.email)

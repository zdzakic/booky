from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAdminCreationTest(TestCase):
    def setUp(self):
        # Create a superuser to log into the admin panel
        self.superuser_email = 'super@example.com'
        self.superuser_password = 'superpassword123'
        self.superuser = User.objects.create_superuser(
            email=self.superuser_email,
            password=self.superuser_password
        )
        # Log the superuser in
        self.client.login(email=self.superuser_email, password=self.superuser_password)

    def test_superuser_can_create_user_in_admin(self):
        """
        Ensure a logged-in superuser can successfully create a new user
        through the Django admin panel.
        """
        # The data for the new user to be created
        new_user_email = 'newuser@example.com'
        new_user_password = 'newpassword123'
        user_data = {
            'email': new_user_email,
            'first_name': '',  # Add empty first_name
            'last_name': '',   # Add empty last_name
            'password1': new_user_password, # Correct field name
            'password2': new_user_password, # Our form requires password confirmation
            'is_staff': 'on', # Checkboxes are sent as 'on' in forms
            'is_active': 'on',
            'groups': [],  # Add empty groups
            'user_permissions': [], # Add empty user_permissions
        }

        # The URL for the user creation page in the admin
        # Note: The app label is 'booking' and the model name is 'user'
        add_user_url = reverse('admin:booking_user_add')

        # Post the data to create the user
        response = self.client.post(add_user_url, user_data)

        # Check for a successful redirect (status code 302) after creation
        self.assertEqual(response.status_code, 302, "Form submission should redirect after success.")

        # Verify that the new user was actually created in the database
        self.assertTrue(User.objects.filter(email=new_user_email).exists(), "New user should exist in the database.")

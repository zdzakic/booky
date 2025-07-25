# booking/tests/test_emailing.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from booking.models import Reservation, ServiceType, Resource, BusinessHours
from django.utils import timezone
from datetime import time, timedelta
from django.core import mail

User = get_user_model()

class EmailingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test.client@email.com', password='pass')
        self.staff_user = User.objects.create_user(email='staff@email.com', password='pass', is_staff=True)
        self.service = ServiceType.objects.create(name='Test Email Service', duration_minutes=30)
        self.resource = Resource.objects.create(name='Lift X')
        self.service.resources.add(self.resource)

        test_date = timezone.localdate() + timedelta(days=1)
        BusinessHours.objects.create(day_of_week=test_date.weekday(), open_time=time(9, 0), close_time=time(17, 0))
        self.test_datetime = timezone.make_aware(timezone.datetime.combine(test_date, time(10, 0)))

    def test_reservation_triggers_emails(self):
        self.client.force_authenticate(user=self.user)

        reservation_data = {
            "full_name": "Email Test Client",
            "phone": "000-1111",
            "email": "test.client@email.com",
            "license_plate": "EMAIL-001",
            "service": self.service.id,
            "start_time": self.test_datetime.isoformat()
        }

        create_response = self.client.post(reverse('booking:reservation-list-create'), reservation_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        self.assertGreaterEqual(len(mail.outbox), 2)

        # -- Email korisniku o pending statusu --
        client_email = next((m for m in mail.outbox if "test.client@email.com" in m.to), None)
        self.assertIsNotNone(client_email)
        self.assertIn("pending", client_email.subject.lower())

        # -- Email vlasniku o novoj rezervaciji --
        owner_email = next((m for m in mail.outbox if "zdzdigital.ch" in "".join(m.to)), None)
        self.assertIsNotNone(owner_email)
        self.assertIn("new reservation", owner_email.subject.lower())

        # -- Resetujemo outbox za novi set poruka --
        mail.outbox = []

        # -- AUTH kao staff i odobravamo rezervaciju --
        self.client.force_authenticate(user=self.staff_user)
        reservation = Reservation.objects.get(email="test.client@email.com")
        detail_url = reverse('booking:reservation-detail', kwargs={'pk': reservation.pk})
        approve_response = self.client.patch(detail_url, {'is_approved': True}, format='json')
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)

        # -- Provjera da je poslan email o odobravanju --
        self.assertEqual(len(mail.outbox), 1)
        approval_email = mail.outbox[0]
        self.assertIn("approved", approval_email.subject.lower())
        self.assertIn("test.client@email.com", approval_email.to[0])

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from ..models import Holiday, ServiceType, Resource, BusinessHours, Reservation
from datetime import datetime, time, timedelta
from django.utils import timezone

User = get_user_model()

class HolidayPermissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='user@example.com', password='pass1234')
        self.list_url = reverse('booking:holiday-list-create')
        Holiday.objects.create(name='Existing', date='2025-01-01', created_by=self.user)

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_unauthenticated_cannot_create(self):
        data = {'name': 'New Holiday', 'date': '2025-12-25'}
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_create(self):
        self.client.force_authenticate(self.user)
        data = {'name': 'New Holiday', 'date': '2025-12-25'}
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Holiday.objects.count(), 2)
        created = Holiday.objects.get(name='New Holiday')
        self.assertEqual(created.created_by, self.user)

    def test_unauthenticated_cannot_delete(self):
        holiday = Holiday.objects.first()
        url = reverse('booking:holiday-detail', args=[holiday.pk])
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_delete(self):
        self.client.force_authenticate(self.user)
        holiday = Holiday.objects.first()
        url = reverse('booking:holiday-detail', args=[holiday.pk])
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Holiday.objects.count(), 0)


class ReservationPermissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='res@example.com', password='pass1234')

        # Postavljamo ServiceType, Resource i BusinessHours
        self.service = ServiceType.objects.create(name='Test Service', duration_minutes=60)
        self.resource = Resource.objects.create(name='R1')
        self.resource.services.add(self.service)
        BusinessHours.objects.create(
            day_of_week=timezone.now().weekday(),
            open_time=time(8,0), close_time=time(18,0)
        )

        self.list_url = reverse('booking:reservation-list-create')

        # Podaci za validnu rezervaciju sutra u 10:00 + is_stored
        tomorrow = timezone.localdate() + timedelta(days=1)
        start = datetime.combine(tomorrow, time(10,0), tzinfo=timezone.get_current_timezone())
        self.valid_payload = {
            'full_name': 'Test User',
            'email': 'cust@example.com',
            'phone': '123456',
            'license_plate': 'ABC-123',
            'service': self.service.pk,
            'start_time': start.isoformat(),
            'is_stored': False
        }

        # Kreiramo postojeću rezervaciju za detalje, ali u drugom terminu da ne blokira novi
        existing_start = datetime.combine(tomorrow, time(12,0), tzinfo=timezone.get_current_timezone())
        existing_end = existing_start + timedelta(minutes=self.service.duration_minutes)
        self.existing = Reservation.objects.create(
            full_name='Existing',
            email='e@example.com',
            phone='000',
            license_plate='XXX-999',
            service=self.service,
            resource=self.resource,
            start_time=existing_start,
            end_time=existing_end
        )
        self.detail_url = reverse('booking:reservation-detail', args=[self.existing.pk])

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_unauthenticated_cannot_create(self):
        resp = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_create(self):
        self.client.force_authenticate(self.user)
        resp = self.client.post(self.list_url, self.valid_payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Reservation.objects.filter(full_name='Test User').exists())

    def test_unauthenticated_cannot_retrieve_detail(self):
        resp = self.client.get(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_retrieve_detail(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['full_name'], 'Existing')

    def test_unauthenticated_cannot_delete_detail(self):
        resp = self.client.delete(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_delete_detail(self):
        self.client.force_authenticate(self.user)
        resp = self.client.delete(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Reservation.objects.filter(pk=self.existing.pk).exists())

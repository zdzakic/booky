from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from booking.models import ServiceType, Reservation, Resource, BusinessHours, Holiday
from datetime import date, time, datetime, timedelta
from django.utils import timezone


class BookingLogicTests(APITestCase):
    """Potpuno novi test suite koji testira postojeću logiku bookinga."""
    
    def setUp(self):
        """Set up a clean environment for each test."""
        self.service = ServiceType.objects.create(name='Test Service', duration_minutes=30)
        self.resource1 = Resource.objects.create(name='Lift 1')
        self.resource2 = Resource.objects.create(name='Lift 2')
        self.service.resources.add(self.resource1, self.resource2)
        self.test_date = timezone.localdate() + timedelta(days=1) # UVIJEK KORISTI SUTRA
        BusinessHours.objects.create(day_of_week=self.test_date.weekday(), open_time='09:00', close_time='17:00') 
        self.availability_url = reverse('booking:availability')
        self.reservations_url = reverse('booking:reservation-list-create')

    def test_availability_with_no_reservations(self):
        """Testira da su svi termini slobodni kada nema rezervacija."""
        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        # Sa 2 resursa, svaki termin bi trebao imati 'available_count': 2
        self.assertEqual(response.data[0]['available_count'], 2)

    def test_reservation_immediately_blocks_slot(self):
        """Testira da nova, neodobrena rezervacija ODMAH zauzima termin."""
        # Kreiramo novu rezervaciju, koja je po defaultu is_approved=False
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(10, 0), tzinfo=tz)
        reservation_data = {
            "full_name": "Test User", "phone": "555-1234", "email": "test.user@test.com",
            "service": self.service.id, "plates": "ZG-TEST-123", "start_time": start_time_aware.isoformat()
        }
        response_create = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_201_CREATED)

        # Provjeravamo dostupnost za isti dan
        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Pronalazimo termin u 10:00
        slot_info = next((slot for slot in response.data if slot['time'] == '10:00'), None)
        self.assertIsNotNone(slot_info)
        # Sada bi samo jedan resurs trebao biti slobodan
        self.assertEqual(slot_info['available_count'], 1)

    def test_approved_reservation_also_blocks_slot(self):
        """Testira da i odobrena rezervacija ispravno zauzima termin."""
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(11, 0), tzinfo=tz)
        reservation_data = {
            "full_name": "Test User Approved", "phone": "555-1234", "email": "test.user.approved@test.com",
            "service": self.service.id, "plates": "ZG-TEST-456", "start_time": start_time_aware.isoformat()
        }
        response_create = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_201_CREATED)
        Reservation.objects.filter(full_name="Test User Approved").update(is_approved=True)

        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slot_info = next((slot for slot in response.data if slot['time'] == '11:00'), None)
        self.assertIsNotNone(slot_info)
        self.assertEqual(slot_info['available_count'], 1)

    def test_holidays_have_no_availability(self):
        """Testira da praznici nemaju dostupnih termina."""
        Holiday.objects.create(date=self.test_date, name='Test Holiday')
        response = self.client.get(self.availability_url, {'service': self.service.id, 'date': self.test_date.isoformat()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0) # Ne bi trebalo biti slotova
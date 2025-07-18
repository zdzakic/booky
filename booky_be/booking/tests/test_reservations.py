from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from booking.models import Reservation, ServiceType, Resource, BusinessHours, Holiday
from datetime import date, time, datetime, timedelta
from django.utils import timezone
from django.core import mail

User = get_user_model()


class BookingLogicTests(APITestCase):
    
    def setUp(self):
        """Set up a clean environment for each test."""
        self.user = User.objects.create_user(email='testuser@example.com', password='password123')
        self.staff_user = User.objects.create_user(email='staffuser@example.com', password='password123', is_staff=True)
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

    def test_approve_reservation_and_sends_email(self):
        """
        Testira da PATCH zahtjev na /reservations/<id>/ ispravno odobrava
        rezervaciju i šalje email korisniku.
        """
        self.client.force_authenticate(user=self.staff_user)
        # 1. Kreiraj rezervaciju koju ćemo odobriti
        tz = timezone.get_current_timezone()
        start_time_aware = datetime.combine(self.test_date, time(11, 0), tzinfo=tz)
        reservation_data = {
            "full_name": "Approve Test User",
            "phone": "555-approve",
            "email": "approve.user@test.com",
            "service": self.service.id,
            "plates": "ZG-APPROVE",
            "start_time": start_time_aware.isoformat()
        }
        create_response = self.client.post(self.reservations_url, reservation_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        
        # Očisti mail.outbox od emailova poslanih prilikom kreiranja rezervacije
        mail.outbox = []

        # 2. Dohvati rezervaciju direktno iz baze (jer response ne vraća ID)
        try:
            reservation = Reservation.objects.get(email="approve.user@test.com")
        except Reservation.DoesNotExist:
            self.fail("Reservation was not created in the database.")
        self.assertFalse(reservation.is_approved)

        # 3. Pošalji PATCH zahtjev za odobravanje
        detail_url = reverse('booking:reservation-detail', kwargs={'pk': reservation.pk})
        approve_response = self.client.patch(detail_url, {'is_approved': True}, format='json')

        # 4. Provjeri odgovore i stanje u bazi
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        reservation.refresh_from_db()
        self.assertTrue(reservation.is_approved)

        # 5. Provjeri da je poslan samo jedan email (onaj za odobrenje)
        self.assertEqual(len(mail.outbox), 1)
        approval_email = mail.outbox[0]
        self.assertEqual(approval_email.to, ["approve.user@test.com"])
        self.assertIn("Your reservation has been approved", approval_email.subject)

    def test_end_time_calculation(self):
        """Provjerava da li se end_time ispravno izračunava prilikom kreiranja rezervacije."""
        start_time = timezone.now() + timedelta(days=10)
        reservation_data = {
            'full_name': 'End Time Test User',
            'email': 'endtime@test.com',
            'phone': '123456789',
            'license_plate': 'TEST-ET',
            'service': self.service.pk,
            'start_time': start_time.isoformat(),
            'is_approved': False
        }
        response = self.client.post(reverse('booking:reservation-list-create'), reservation_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Provjeri izračunato end_time
        created_reservation = Reservation.objects.get(pk=response.data['id'])
        expected_end_time = start_time + timedelta(minutes=self.service.duration_minutes)
        self.assertEqual(created_reservation.end_time, expected_end_time)


class AvailabilityTests(APITestCase):
    def setUp(self):
        """Set up a service and a holiday for testing availability."""
        self.user = User.objects.create_user(email='testuser@example.com', password='password123')
        self.service = ServiceType.objects.create(name='Test Service', duration_minutes=60)
        self.holiday_date = timezone.now().date() + timedelta(days=10)
        Holiday.objects.create(name='Test Holiday', date=self.holiday_date)
        # Ensure business hours exist for the day of the holiday to make the test valid
        BusinessHours.objects.create(
            day_of_week=self.holiday_date.weekday(),
            open_time=time(9, 0),
            close_time=time(17, 0)
        )
        self.availability_url = reverse('booking:availability')

    def test_no_slots_on_holiday(self):
        """Verify that no available slots are returned for a date marked as a holiday."""
        url = self.availability_url
        response = self.client.get(url, {'service': self.service.id, 'date': self.holiday_date.strftime('%Y-%m-%d')})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, []) # Expect an empty list of slots


class ReservationFilteringTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', password='password123')
        self.staff_user = User.objects.create_user(email='staffuser@example.com', password='password123', is_staff=True)
        self.service = ServiceType.objects.create(name='Test Service', duration_minutes=60)
        self.resource = Resource.objects.create(name='Test Resource')
        self.resource.services.add(self.service)
        
        # Kreiranje rezervacija u različitim periodima
        start_time_past = timezone.now() - timedelta(days=5)
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Past User', start_time=start_time_past, end_time=start_time_past + timedelta(minutes=self.service.duration_minutes), is_approved=True)
        
        start_time_today = timezone.now()
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Today User', start_time=start_time_today, end_time=start_time_today + timedelta(minutes=self.service.duration_minutes), is_approved=True)
        
        start_time_future = timezone.now() + timedelta(days=5)
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Future User', start_time=start_time_future, end_time=start_time_future + timedelta(minutes=self.service.duration_minutes), is_approved=True)
        
        start_time_pending = timezone.now() + timedelta(days=1)
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Pending User', start_time=start_time_pending, end_time=start_time_pending + timedelta(minutes=self.service.duration_minutes), is_approved=False)

    def test_filter_period_3w(self):
        """Testira da `period=3w` vraća rezervacije od danas do 3 tjedna u budućnost."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse('booking:reservation-list-create'), {'period': '3w'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3) # Today, Future, Pending
        self.assertNotIn('Past User', [r['full_name'] for r in response.data])

    def test_filter_period_pending(self):
        """Testira da `period=pending` vraća samo neodobrene rezervacije."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse('booking:reservation-list-create'), {'period': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], 'Pending User')

    def test_filter_period_all(self):
        """Testira da `period=all` vraća sve buduće i današnje rezervacije."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse('booking:reservation-list-create'), {'period': 'all'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3) # Today, Future, Pending
        self.assertNotIn('Past User', [r['full_name'] for r in response.data])

    def test_filter_period_past_shows_past(self):
        """Testira da `period=past` vraća samo prošle rezervacije."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse('booking:reservation-list-create'), {'period': 'past'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], 'Past User')

    def test_search_query(self):
        """Testira da `search` parametar ispravno filtrira rezultate."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse('booking:reservation-list-create'), {'search': 'Future'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], 'Future User')
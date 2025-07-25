from django.urls import reverse
from rest_framework.test import APITestCase
from django.utils import timezone
from datetime import timedelta, datetime
from booking.models import Reservation, ServiceType, Resource
from django.contrib.auth import get_user_model

User = get_user_model()

def extract_results(data):
    if isinstance(data, dict) and 'results' in data:
        return data['results']
    return data

class CoreFilteringLogicTests(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            email='staffuser@example.com', password='password123', is_staff=True
        )
        self.client.force_authenticate(user=self.staff_user)

        self.service = ServiceType.objects.create(name='Test Service', duration_minutes=30)
        self.resource = Resource.objects.create(name='Test Resource')
        self.resource.services.add(self.service)

        self.today = timezone.localdate()

        past_start = timezone.make_aware(datetime.combine(self.today - timedelta(days=10), datetime.min.time()))
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Past User', start_time=past_start, end_time=past_start + timedelta(minutes=30), is_approved=True)

        today_start = timezone.make_aware(datetime.combine(self.today, datetime.min.time()))
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Today User', start_time=today_start, end_time=today_start + timedelta(minutes=30), is_approved=True)

        future_start = timezone.make_aware(datetime.combine(self.today + timedelta(days=10), datetime.min.time()))
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Future User', start_time=future_start, end_time=future_start + timedelta(minutes=30), is_approved=True)

        far_future_start = timezone.make_aware(datetime.combine(self.today + timedelta(days=40), datetime.min.time()))
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Far Future User', start_time=far_future_start, end_time=far_future_start + timedelta(minutes=30), is_approved=True)

    def test_filter_3w_period(self):
        url = reverse('booking:reservation-list-create')
        response = self.client.get(url, {'period': '3w'})
        self.assertEqual(response.status_code, 200)

        results = extract_results(response.data)
        names = {r['full_name'] for r in results}
        self.assertIn('Today User', names)
        self.assertIn('Future User', names)
        self.assertNotIn('Past User', names)
        self.assertNotIn('Far Future User', names)

    def test_filter_past_period(self):
        url = reverse('booking:reservation-list-create')
        response = self.client.get(url, {'period': 'past'})
        self.assertEqual(response.status_code, 200)

        results = extract_results(response.data)
        names = {r['full_name'] for r in results}
        self.assertIn('Past User', names)
        self.assertNotIn('Today User', names)
        self.assertNotIn('Future User', names)

    def test_filter_pending(self):
        pending_start = timezone.make_aware(datetime.combine(self.today + timedelta(days=1), datetime.min.time()))
        Reservation.objects.create(service=self.service, resource=self.resource, full_name='Pending User', start_time=pending_start, end_time=pending_start + timedelta(minutes=30), is_approved=False)

        url = reverse('booking:reservation-list-create')
        response = self.client.get(url, {'period': 'pending'})
        self.assertEqual(response.status_code, 200)

        results = extract_results(response.data)
        names = {r['full_name'] for r in results}
        self.assertIn('Pending User', names)
        self.assertNotIn('Past User', names)
        self.assertNotIn('Today User', names)

    def test_filter_today(self):
        url = reverse('booking:reservation-list-create')
        response = self.client.get(url, {'period': 'today'})
        self.assertEqual(response.status_code, 200)

        results = extract_results(response.data)
        names = {r['full_name'] for r in results}
        self.assertIn('Today User', names)
        self.assertNotIn('Past User', names)
        self.assertNotIn('Future User', names)

    # def test_filter_6w_period(self):
    #     url = reverse('booking:reservation-list-create')
    #     response = self.client.get(url, {'period': '6w'})
    #     self.assertEqual(response.status_code, 200)

    #     results = extract_results(response.data)
    #     names = {r['full_name'] for r in results}
    #     self.assertIn('Today User', names)
    #     self.assertIn('Future User', names)
    #     self.assertNotIn('Far Future User', names)  # jer je 40+ dana dalje od danas
    #     self.assertNotIn('Past User', names)


    # def test_filter_all(self):
    #     url = reverse('booking:reservation-list-create')
    #     response = self.client.get(url, {'period': 'all'})
    #     self.assertEqual(response.status_code, 200)

    #     results = extract_results(response.data)
    #     names = {r['full_name'] for r in results}
    #     self.assertTrue({'Past User', 'Today User', 'Future User', 'Far Future User'}.issubset(names))

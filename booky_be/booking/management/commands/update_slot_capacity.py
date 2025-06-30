from django.core.management.base import BaseCommand
from booking.models import TimeSlot
from datetime import date, timedelta

class Command(BaseCommand):
    help = "Batch update capacity for slots in a future window (from today)."

    def add_arguments(self, parser):
        parser.add_argument("capacity", type=int, help="New capacity (number of lines per slot)")
        parser.add_argument("days_ahead", type=int, help="How many days ahead to apply the change (including today)")

    def handle(self, *args, **options):
        capacity = options["capacity"]
        days_ahead = options["days_ahead"]

        start_date = date.today()
        end_date = start_date + timedelta(days=days_ahead - 1)  # uključi i danas

        updated = TimeSlot.objects.filter(date__gte=start_date, date__lte=end_date).update(capacity=capacity)
        self.stdout.write(self.style.SUCCESS(
            f"Updated capacity to {capacity} for {updated} slots from {start_date} to {end_date}."
        ))

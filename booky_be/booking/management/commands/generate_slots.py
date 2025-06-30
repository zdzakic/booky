from django.core.management.base import BaseCommand
from booking.models import TimeSlot
from datetime import datetime, timedelta, time, date
import calendar

SLOT_DURATION_MINUTES = 30
WORKING_HOURS = (8, 17)  # From 08:00 to 17:00 (not including 17:00)
DAYS_AHEAD = 30

class Command(BaseCommand):
    help = "Generate time slots for the next 30 working days"

    def handle(self, *args, **kwargs):
        today = date.today()
        end_date = today + timedelta(days=DAYS_AHEAD)
        created = 0

        # Iterate through each date in range
        for single_date in (today + timedelta(n) for n in range((end_date - today).days)):
            # Skip weekends
            if calendar.weekday(single_date.year, single_date.month, single_date.day) >= 5:
                continue

            start_hour, end_hour = WORKING_HOURS
            current_time = time(start_hour, 0)

            # Create slots in 30-minute increments
            while datetime.combine(single_date, current_time) < datetime.combine(single_date, time(end_hour, 0)):
                # Only create if not exists
                if not TimeSlot.objects.filter(date=single_date, start_time=current_time).exists():
                    TimeSlot.objects.create(
                        date=single_date,
                        start_time=current_time,
                        is_available=True,
                        capacity=2
                    )
                    created += 1

                # Increment by slot duration
                current_dt = datetime.combine(single_date, current_time) + timedelta(minutes=SLOT_DURATION_MINUTES)
                current_time = current_dt.time()

        self.stdout.write(self.style.SUCCESS(f"{created} time slots created for the next {DAYS_AHEAD} days."))

# To use:
# 1. Save this file as booking/management/commands/generate_timeslots.py
# 2. Run: python manage.py generate_timeslots

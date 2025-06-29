from django.db import models

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    duration_minutes = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"

class TimeSlot(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.date} – {self.start_time}"

class Reservation(models.Model):
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    license_plate = models.CharField(max_length=20)
    service = models.ForeignKey(ServiceType, on_delete=models.CASCADE)
    timeslot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    is_stored = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} – {self.service.name} on {self.timeslot.date} at {self.timeslot.start_time}"

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
    capacity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.date} – {self.start_time}"

class Reservation(models.Model):
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    license_plate = models.CharField(max_length=20)
    service = models.ForeignKey(ServiceType, on_delete=models.CASCADE)
    # timeslot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    timeslot = models.ManyToManyField('TimeSlot')
    is_stored = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        slot_list = list(self.timeslot.all())
        if slot_list:
            slots_str = ", ".join(
                f"{ts.date} {ts.start_time.strftime('%H:%M')}" for ts in slot_list
            )
        else:
            slots_str = "no slots"
        return f"{self.full_name} – {self.service.name} on [{slots_str}]"

from django.db import models

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    duration_minutes = models.PositiveIntegerField()
    resources = models.ManyToManyField('Resource', related_name='services')

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"

class Resource(models.Model):
    """Represents a bookable resource, e.g., a garage bay, a dental chair, a stylist."""
    name = models.CharField(max_length=100, unique=True)
    # You can add more fields here, like 'is_active' or 'location'.

    def __str__(self):
        return self.name

class BusinessHours(models.Model):
    """Defines the operating hours for each day of the week."""
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES, unique=True)
    open_time = models.TimeField()
    close_time = models.TimeField()

    class Meta:
        ordering = ['day_of_week']

    def __str__(self):
        return f"{self.get_day_of_week_display()}: {self.open_time.strftime('%H:%M')} - {self.close_time.strftime('%H:%M')}"

class Reservation(models.Model):
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    license_plate = models.CharField(max_length=20, blank=True)
    service = models.ForeignKey(ServiceType, on_delete=models.CASCADE)
    
    # New, precise time fields
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    # Link to a specific resource
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)

    is_stored = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.service.name} on {self.start_time.strftime('%Y-%m-%d %H:%M')}"

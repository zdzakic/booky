from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.conf import settings

# --- CUSTOM USER MANAGER --- #

class CustomUserManager(BaseUserManager):
    """Custom manager for the User model where email is the unique identifier."""
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# --- CUSTOM USER MODEL (inherits from AbstractBaseUser) --- #

class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that uses email as the username field."""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    # Use the custom manager
    objects = CustomUserManager()

    # Set the email field as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No other fields are required besides email and password

    def __str__(self):
        return self.email

# --- BOOKING MODELS --- #
class Location(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    google_maps_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    duration_minutes = models.PositiveIntegerField()
    resources = models.ManyToManyField('Resource', related_name='services')
    location = models.ForeignKey("Location", on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"

class Resource(models.Model):
    """Represents a bookable resource, e.g., a garage bay."""
    name = models.CharField(max_length=100, unique=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)  # ✅ Dodano

    def __str__(self):
        return self.name

class BusinessHours(models.Model):
    """Defines the operating hours for each day of the week."""
    DAY_CHOICES = (
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    )
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
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
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    is_stored = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.service.name} on {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class Holiday(models.Model):
    name = models.CharField(max_length=100, help_text="e.g., New Year's Day")
    date = models.DateField(unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='holidays'
    )

    def __str__(self):
        return f"{self.name} on {self.date.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['date']




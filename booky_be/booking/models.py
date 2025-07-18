from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings

class CustomUserManager(BaseUserManager):
    """Custom user model manager where email is the unique identifiers for authentication instead of usernames."""
    def create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # We don't need a username
    username = None
    email = models.EmailField(unique=True)

    # Add unique related_name to resolve clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="booking_user_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="booking_user_permissions_set",
        related_query_name="user",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()


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

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Reservation, Resource, ServiceType, BusinessHours, Holiday, Location
from .forms import CustomUserCreationForm

# This is the new, clean, from-scratch configuration.
# It does NOT use a separate forms.py file.
class CustomUserAdmin(UserAdmin):
    # --- Configuration for the list view ---
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    add_form = CustomUserCreationForm

    # --- Configuration for the EDIT form ---
    # These are the fields visible when editing an existing user.
    # 'password' is correctly excluded as it's handled separately by Django.
    fieldsets = (
        (None, {'fields': ('email',)}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # --- Configuration for the ADD form ---
    # These are the fields for creating a NEW user.
    # This is the most critical part.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

# --- Registration ---
# Unregister the default User admin if it exists, then register our custom one.
# This is a safety measure.
admin.site.register(User, CustomUserAdmin)

# Register other models simply
admin.site.register(Reservation)
admin.site.register(Resource)
admin.site.register(ServiceType)
admin.site.register(BusinessHours)
admin.site.register(Holiday)
admin.site.register(Location)
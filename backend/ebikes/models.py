from django.db import models
from django.conf import settings
# from django.contrib.auth.models import User
from users.models import User
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import random
import string
from decimal import Decimal, ROUND_HALF_UP
from django.core.validators import MinValueValidator


class Location(models.Model):
    location_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def save(self, *args, **kwargs):
        if not self.name:
            # Use OpenStreetMap Nominatim API to get the location details
            geolocator = Nominatim(user_agent="glasgow_ebike")  # Replace with your app's name
            try:
                location = geolocator.reverse(f"{self.latitude}, {self.longitude}", exactly_one=True)
                if location and 'address' in location.raw:
                    address = location.raw['address']
                    # Extract street name (may be 'road', 'street', or other fields depending on the location)
                    self.name = address.get('road') or address.get('street') or address.get('pedestrian') or "Glasgow"
            except GeocoderTimedOut:
                # Handle timeout exception if the API call fails
                self.name = "Glasgow"

        super().save(*args, **kwargs)


class Vehicle(models.Model):
    VEHICLE_TYPES = (
        (1, 'Electric Scooter'),
        (2, 'Electric Bike'),
    )
    STATUS_CHOICES = (
        (0, 'Unavailable'),
        (1, 'Available'),
        (2, 'Rented'),
    )
    
    vehicle_id = models.CharField(max_length=6, primary_key=True, editable=False)
    vehicle_type = models.IntegerField(choices=VEHICLE_TYPES)
    status = models.IntegerField(choices=STATUS_CHOICES)
    is_locked = models.BooleanField(default=True)
    battery_level = models.DecimalField(max_digits=5, decimal_places=2)
    current_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='vehicles')
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.vehicle_id:
            self.vehicle_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super().save(*args, **kwargs)


class ChargingPoint(models.Model):
    charging_point_id = models.AutoField(primary_key=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    status = models.IntegerField(choices=[(1, 'Working'), (0, 'Under Repair')], default=1)

    def __str__(self):
        return f"Charging Point {self.charging_point_id} - {self.charging_location.name}"


class Rental(models.Model):
    rental_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='rental_user')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE,related_name='rental')
    rental_start_time = models.DateTimeField(auto_now_add=True)
    rental_end_time = models.DateTimeField(null=True, blank=True)
    start_location = models.ForeignKey(Location, related_name='rental_starts', on_delete=models.CASCADE)
    end_location = models.ForeignKey(Location, related_name='rental_ends', on_delete=models.CASCADE, null=True, blank=True)
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    def save(self, *args, **kwargs):
        if self.cost:
            self.cost = Decimal(str(self.cost)).quantize(
                Decimal('0.01'),
                rounding=ROUND_HALF_UP
            )
        super().save(*args, **kwargs)


class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='payment_record')
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment {self.payment_id}"


class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reports')
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    generated_on = models.DateTimeField(auto_now_add=True)
    issue_reported = models.TextField()
    
    def __str__(self):
        return f"Report {self.report_id} - Vehicle {self.vehicle.vehicle_id}"


class Profile(models.Model):
    # ... 其他字段 ...
    due_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )



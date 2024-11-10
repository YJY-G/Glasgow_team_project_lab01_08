from django.db import models
from users.models import User
from ebikes.models import Vehicle
# Create your models here.


class DefectReport(models.Model):
    vehicle_id = models.IntegerField()  # Vehicle identifier
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User model
    report_description = models.TextField()
    status = models.CharField(max_length=10, choices=[('open', 'Open'), ('resolved', 'Resolved')], default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report by {self.user.email} on vehicle {self.vehicle_id} - {self.status}"

class Booking(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User model
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE,null=True,blank=True)
    booking_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.customer.email} - Vehicle {self.vehicle.vehicle_id}"


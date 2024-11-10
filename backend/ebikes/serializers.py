from rest_framework import serializers
from .models import Location, Vehicle, Rental, Payment, Report, ChargingPoint
from users.models import User
from decimal import Decimal, ROUND_HALF_UP

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['location_id', 'name', 'latitude', 'longitude']
 
class VehicleSerializer(serializers.ModelSerializer):
    location = LocationSerializer(source='current_location')

    class Meta:
        model = Vehicle
        fields = ['vehicle_id', 'vehicle_type', 'status', 'battery_level', 'location', 'is_locked']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'last_name', 'email']


class RentalSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer()
    start_location = LocationSerializer()
    end_location = LocationSerializer()
    cost = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=True,
        rounding=ROUND_HALF_UP
    )
    class Meta:
        model = Rental
        fields = ['rental_id', 'customer', 'vehicle', 'start_location', 'end_location', 
                  'rental_start_time', 'rental_end_time', 'cost']
        extra_kwargs = {
            'cost': {'decimal_places': 2, 'max_digits': 10, 'coerce_to_string': True}
        }

    def validate_cost(self, value):
        if value:
            return Decimal(str(value)).quantize(
                Decimal('0.01'),
                rounding=ROUND_HALF_UP
            )
        return value

class PaymentSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = ['payment_id', 'customer', 'amount', 'payment_date']


class VehicleChargeSerializer(serializers.Serializer):
    vehicle_id = serializers.CharField(max_length=6)

class VehicleMaintenanceSerializer(serializers.Serializer):
    vehicle_id = serializers.CharField(max_length=6)
    status = serializers.ChoiceField(choices=[(0, 'unavailable'), (1, 'available'), (2, 'rented')])

class VehicleMoveSerializer(serializers.Serializer):
    vehicle_id = serializers.CharField(max_length=6)
    location_id = serializers.IntegerField()

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['report_id', 'vehicle', 'rental', 'generated_on', 'issue_reported']
        read_only_fields = ['report_id', 'generated_on']


class RentalHistorySerializer(serializers.ModelSerializer):
    start_location = LocationSerializer(read_only=True)
    end_location = LocationSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    cost = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Rental
        fields = [
            'rental_id', 
            'rental_start_time', 
            'rental_end_time', 
            'start_location', 
            'end_location', 
            'vehicle',
            'cost'
        ]

class ChargingPointSerializer(serializers.ModelSerializer):
    location = LocationSerializer()

    class Meta:
        model = ChargingPoint
        fields = ['charging_point_id', 'location', 'status']

class VehicleMoveSerializer(serializers.Serializer):
    vehicle_id = serializers.CharField(max_length=6)
    location_id = serializers.CharField(max_length=6)
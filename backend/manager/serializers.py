from rest_framework import serializers
from ebikes.models import Vehicle,Payment,Location
from users.models import User


class VehicleRentalCountSerializer(serializers.ModelSerializer):
    rental_count = serializers.IntegerField(read_only=True)  # Number of times the vehicle was rented

    class Meta:
        model = Vehicle
        fields = ['vehicle_id', 'vehicle_type', 'rental_count']


class CustomerPaymentSumSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=6,decimal_places=2,read_only = True)
    class Meta:
        model = User
        fields = ['user_id','first_name','last_name','total']


class RoleCountSerializer(serializers.Serializer):
    customer_count = serializers.IntegerField(read_only=True)
    operator_count = serializers.IntegerField(read_only=True)


class LocationVehicleCountSerializer(serializers.ModelSerializer):
    vehicle_count = serializers.IntegerField()

    class Meta:
        model = Location
        fields = ['name', 'vehicle_count']

class VehicleReportCountSerializer(serializers.ModelSerializer):
    report_count = serializers.IntegerField()

    class Meta:
        model = Vehicle
        fields = ['vehicle_id','report_count']
    
    
class VehicleInUsedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['vehicle_id','vehicle_type']

class LocationCostSumSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Location
        fields = ['location_id', 'name', 'total_cost']

class VehicleRentalAverageSerializer(serializers.ModelSerializer):
    average_duration_minutes = serializers.FloatField()

    class Meta:
        model = Vehicle
        fields = ['vehicle_id', 'vehicle_type', 'average_duration_minutes']
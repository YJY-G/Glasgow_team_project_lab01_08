from rest_framework import serializers
from .models import DefectReport

# Serializer for booking a vehicle
class BookVehicleSerializer(serializers.Serializer):
    vehicle_id = serializers.CharField()

# Serializer for reporting a defective vehicle
class DefectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefectReport
        fields = ['vehicle_id', 'report_description']

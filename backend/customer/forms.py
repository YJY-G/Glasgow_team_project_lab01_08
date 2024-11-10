from django import forms
from .models import DefectReport

# Form for booking a vehicle
class BookVehicleForm(forms.Form):
    vehicle_id = forms.IntegerField()

# Form for reporting a defective vehicle
class DefectReportForm(forms.ModelForm):
    class Meta:
        model = DefectReport
        fields = ['vehicle_id', 'report_description']

from django.urls import path
from .views import (VehicleDataView,RentalDataView,LocationDataView,
                    VehicleRentalCountView,RoleCountView,LocationVehicleCountView,
                    VehicleReportCountView,VehicleInUsedView,CustomerPaymentSumView,
                    LocationCostSumView,VehicleRentalAverageView)

urlpatterns = [
    path('vehicle/',VehicleDataView.as_view(),name='vehicleData'),
    path('location/',LocationDataView.as_view(),name='locationData'),
    path('rental/',RentalDataView.as_view(),name='rentalData'),
    path('rentalCount/',VehicleRentalCountView.as_view(),name='rentalCount'),
    path('roleCount/',RoleCountView.as_view(),name='roleCount'),
    path('locationVehicleCount/',LocationVehicleCountView.as_view(),name='vehicleLocation'),
    path('vehicleReportCount/',VehicleReportCountView.as_view(),name='vehiclereportcount'),
    path('vehicleInUsed/',VehicleInUsedView.as_view(),name='vehicleinused'),
    path('PaymentSum/',CustomerPaymentSumView.as_view(),name='paymentSum'),
    path('locationCostSum/',LocationCostSumView.as_view(),name='locationCostSum'),
    path('vehicleRentalAverage/',VehicleRentalAverageView.as_view(),name='vehicleRentalAverage')
]

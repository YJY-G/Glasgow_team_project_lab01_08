"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from ebikes.views import (
    VehicleList,
    rent_vehicle,
    VehicleListPage,
    VehicleChargeAPIView,
    VehicleMaintenanceAPIView,
    ReportListView,
    UserList,
    VehicleLockUnlock,
    ReportCreate,
    ReportList,
    end_rental,
    get_rental_history,
    make_payment,
    get_due_amount,
    VehicleMoveAPIView,
    ChargepointList,
    calculate_rental_end,
)


urlpatterns = [
    path('api/users/', include('users.urls')),
    path('api/vehicles/', VehicleList.as_view(), name='vehicle-list'),
    path('api/vehiclesListPage/', VehicleListPage.as_view(), name='vehicle-list-page'),
    path('api/vehicle/charge/', VehicleChargeAPIView.as_view(), name='vehicle-charge'),
    path('api/vehicle/move/', VehicleMoveAPIView.as_view(), name='vehicle-move'),
    path('api/vehicle/maintain/', VehicleMaintenanceAPIView.as_view(), name='vehicle-maintain'),
    path('api/vehicle/chargepointList/', ChargepointList.as_view(), name='ChargepointList'),
    path('api/reportsListPage/', ReportListView.as_view(), name='report-list'),
    path('api/rent/', rent_vehicle, name='rent_vehicle'),
    path('api/userList/',UserList.as_view()),
    path('api/manager/',include('manager.urls')),
    path('api/customer/',include('customer.urls')),
    path('api/vehicles/<str:vehicle_id>/', VehicleLockUnlock.as_view(), name='vehicle-lock-unlock'),
    path('api/rent/<int:rental_id>/end/', end_rental, name='end-rental'),
    path('api/reports/', ReportCreate.as_view(), name='report-create'),
    path('api/reports/list/', ReportList.as_view(), name='report-list'),
    path('api/rentals/history/', get_rental_history, name='rental-history'),
    path('api/payments/make_payment/', make_payment, name='make_payment'),
    path('api/users/<int:user_id>/due_amount/', get_due_amount, name='get_due_amount'),
    path('api/rentals/<int:rental_id>/calculate-end/', calculate_rental_end, name='calculate_rental_end'),
]

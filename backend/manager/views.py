from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import User,Profile
from ebikes.models import Vehicle,Location,Rental,Payment
from ebikes.serializers import VehicleSerializer,LocationSerializer,RentalSerializer
from .serializers import (VehicleRentalCountSerializer,CustomerPaymentSumSerializer,
                          RoleCountSerializer,LocationVehicleCountSerializer,VehicleReportCountSerializer,
                          VehicleInUsedSerializer,LocationCostSumSerializer,VehicleRentalAverageSerializer)
from django.db.models.functions import Coalesce,Round,Cast
from django.db.models import Count,Sum,DecimalField,Avg,DurationField,F,FloatField
from decimal import Decimal
from datetime import datetime,timedelta
# Create your views here.

class VehicleDataView(APIView):
    """
    getting vehicles data
    """
    def get(self, request):
        vehicles = Vehicle.objects.all()
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
    
class RentalDataView(APIView):
    """
    getting rental data
    """
    def get(self, request):
        rentals = Rental.objects.exclude(cost=None)
        serializer = RentalSerializer(rentals, many=True)
        return Response(serializer.data) 
    
class LocationDataView(APIView):
    """
    getting location data
    """
    def get(self, request):
        locations = Location.objects.all() 
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)
    

class VehicleRentalCountView(APIView):
    def get(self, request):
        vehicles = Vehicle.objects.annotate(rental_count=Coalesce(Count('rental'), 0))
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            start_date = datetime.fromisoformat(start_date).date()
            end_date = datetime.fromisoformat(end_date).date()
            vehicles = vehicles.filter(rental__rental_end_time__date__range=(start_date, end_date))
        serializer = VehicleRentalCountSerializer(vehicles, many=True)
        return Response(serializer.data)

class CustomerPaymentSumView(APIView):
    def get(self, request):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            customers = User.objects.filter(profile__role=Profile.ROLE_CHOICES[0][0])

            if start_date and end_date:
                start_date = datetime.fromisoformat(start_date).date()
                end_date = datetime.fromisoformat(end_date).date()
                customers = customers.filter(rental_user__rental_end_time__date__range=(start_date, end_date))
            
            customers = customers.annotate(
                total=Coalesce(Sum('rental_user__cost', output_field=DecimalField()), Decimal(0.00))
            )
            
            customers = customers.filter(total__gt=0)
            
            # 序列化数据并返回
            serializer = CustomerPaymentSumSerializer(customers, many=True)
            return Response(serializer.data)
    

class RoleCountView(APIView):
    def get(self,request):
        customer_count = User.objects.filter(profile__role=Profile.ROLE_CHOICES[0][0]).count()
        operator_count = User.objects.filter(profile__role=Profile.ROLE_CHOICES[0][0]).count()
        print(customer_count,operator_count)
        data = {
            'customer_count': customer_count,
            'operator_count': operator_count
        }
        serializer = RoleCountSerializer(data)
        return Response(serializer.data)
    

class LocationVehicleCountView(APIView):
    def get(self, request):
        locations = Location.objects.annotate(vehicle_count=Count('vehicles')).filter(vehicle_count__gt=0)
        serializer = LocationVehicleCountSerializer(locations, many=True)
        return Response(serializer.data)
    

class VehicleReportCountView(APIView):

    def get(self, request):
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        vehicles = Vehicle.objects.all() 

        if start_date and end_date:
            start_date = datetime.fromisoformat(start_date).date()
            end_date = datetime.fromisoformat(end_date).date()
            vehicles = vehicles.filter(reports__generated_on__date__range=(start_date, end_date))
        
        vehicles = vehicles.annotate(report_count=Count('reports')).filter(report_count__gt=0)

        serializer = VehicleReportCountSerializer(vehicles, many=True)
        return Response(serializer.data)
    

class VehicleInUsedView(APIView):
    def get(self,request):
        vehicles = Vehicle.objects.filter(status=2)
        serilaizer = VehicleInUsedSerializer(vehicles,many=True)
        return Response(serilaizer.data)


class LocationCostSumView(APIView):
    def get(self,request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        locations = Location.objects.annotate(total_cost=Coalesce(Sum('rental_starts__cost', output_field=DecimalField()), Decimal(0.00)))
        if start_date and end_date:
            start_date = datetime.fromisoformat(start_date).date()
            end_date = datetime.fromisoformat(end_date).date()
            locations = locations.filter(rental_starts__rental_end_time__date__range=(start_date, end_date))
        serializer = LocationCostSumSerializer(locations,many=True)
        return Response(serializer.data)
    

class VehicleRentalAverageView(APIView):
    def get(self, request):
        # 计算每辆车的租赁平均持续时间
        vehicles = Vehicle.objects.annotate(
            average_duration=Coalesce(
                Avg(
                    (F('rental__rental_end_time') - F('rental__rental_start_time')),
                    output_field=DurationField()
                ),
                timedelta(0)
            )
        ).annotate(
            average_duration_minutes=Cast(
                Round(F('average_duration') / timedelta(minutes=1),2),
                output_field=FloatField()
            )
        )
        
      
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
     
        if start_date and end_date:
            start_date = datetime.fromisoformat(start_date).date()
            end_date = datetime.fromisoformat(end_date).date()
            vehicles = vehicles.filter(rental__rental_end_time__date__range=(start_date, end_date))
        
  
        serializer = VehicleRentalAverageSerializer(vehicles, many=True)
        
      
        return Response(serializer.data)

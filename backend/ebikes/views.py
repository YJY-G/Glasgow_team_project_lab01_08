from rest_framework import generics, status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Vehicle, Location, Rental, Report, Payment, ChargingPoint
from users.models import User,Profile
from .serializers import (VehicleSerializer, RentalSerializer, 
                          UserSerializer, ReportSerializer,
                          RentalHistorySerializer, ChargingPointSerializer,
                          VehicleMoveSerializer, LocationSerializer)
from django.utils import timezone
import random
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializers import VehicleChargeSerializer, VehicleMaintenanceSerializer, VehicleMoveSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.permissions import IsAuthenticated,AllowAny
import decimal
from decimal import Decimal, ROUND_HALF_UP

class VehicleList(generics.ListAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class UserList(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ChargepointList(APIView):
    def get(self, request):
        chargepoints = ChargingPoint.objects.select_related('location').all()
        serializer = ChargingPointSerializer(chargepoints, many=True)
        return Response(serializer.data)

class VehiclePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ReportPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class VehicleListPage(generics.ListAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    pagination_class = VehiclePagination

class VehicleChargeAPIView(APIView):
    def put(self, request):
        serializer = VehicleChargeSerializer(data=request.data)
        if serializer.is_valid():
            vehicle_id = serializer.validated_data['vehicle_id']
            vehicle = get_object_or_404(Vehicle, vehicle_id=vehicle_id)
            with transaction.atomic():
                vehicle.battery_level = 100
                vehicle.save()
            return Response({'message': 'battery updates success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VehicleMaintenanceAPIView(APIView):
    def put(self, request):
        serializer = VehicleMaintenanceSerializer(data=request.data)
        if serializer.is_valid():
            vehicle_id = serializer.validated_data['vehicle_id']
            vehicle = get_object_or_404(Vehicle, vehicle_id=vehicle_id)
            with transaction.atomic():
                vehicle.status = 1
                vehicle.save()
            return Response({'message': 'status updates success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VehicleMoveAPIView(APIView):
    def put(self, request):
        serializer = VehicleMoveSerializer(data=request.data)
        if serializer.is_valid():
            vehicle_id = serializer.validated_data['vehicle_id']
            location_id = serializer.validated_data['location_id']
            vehicle = get_object_or_404(Vehicle, vehicle_id=vehicle_id)
            location = get_object_or_404(Location, location_id=location_id)
            with transaction.atomic():
                vehicle.current_location = location
                vehicle.save()
            return Response({'message': 'status updates success'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportListView(generics.ListAPIView):
    queryset = Report.objects.all().order_by('report_id')
    serializer_class = ReportSerializer
    pagination_class = ReportPagination


class VehicleLockUnlock(generics.UpdateAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    lookup_field = 'vehicle_id'
    
    def patch(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            new_lock_status = request.data.get('is_locked')
            
            if new_lock_status is None:
                return Response(
                    {'error': 'Missing is_locked parameter'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            instance.is_locked = new_lock_status
            instance.save()
            
            instance.refresh_from_db()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Update failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class ReportCreate(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def create(self, request, *args, **kwargs):
        try:
            report_data = {
                'vehicle': request.data.get('vehicle'),
                'rental': request.data.get('rental'),
                'issue_reported': request.data.get('issue_reported')
            }

            serializer = self.get_serializer(data=report_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
class ReportList(generics.ListAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
    def get_queryset(self):
        queryset = Report.objects.all()
        vehicle_id = self.request.query_params.get('vehicle_id', None)
        if vehicle_id is not None:
            queryset = queryset.filter(vehicle__vehicle_id=vehicle_id)
        return queryset
    
@api_view(['POST'])
def end_rental(request, rental_id):
    try:
        rental = Rental.objects.get(rental_id=rental_id)
        
        rental.save()
        
        vehicle = rental.vehicle
        vehicle.status = 1
        vehicle.is_locked = 1
        vehicle.save()
        
        return Response({
            'message': 'Rental ended successfully! Have a nice day in Glasgow!',
            'rental': RentalSerializer(rental).data
        }, status=status.HTTP_200_OK)
        
    except Rental.DoesNotExist:
        return Response({'error': 'Rental could not found!'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
def get_rental_history(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'User ID is required'}, status=400)
    
    rentals = Rental.objects.filter(customer_id=user_id).order_by('-rental_start_time')
    serializer = RentalHistorySerializer(rentals, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def make_payment(request):
    user_id = request.data.get('user_id')
    amount = request.data.get('amount')
    
    try:
        amount = decimal.Decimal(amount)
        user = User.objects.get(user_id=user_id)
        profile = Profile.objects.get(user=user)
        
        if amount <= 0:
            return Response({'error': 'Payment amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
            
        if amount > user.balance:
            return Response({'error': 'Payment amount must be less or equal to the due amount'}, status=status.HTTP_400_BAD_REQUEST)
            
        payment = Payment.objects.create(customer=user, amount=amount)
        user.balance -= amount
        profile.due_amount -= amount
        user.save()
        profile.save()
        
        return Response({
            'message': 'Payment successful',
            'payment_id': payment.payment_id,
            'new_balance': user.balance,
            'new_due_amount': profile.due_amount
        }, status=status.HTTP_201_CREATED)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except decimal.InvalidOperation:
        return Response({'error': 'Invalid payment amount'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_due_amount(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        profile = Profile.objects.get(user=user)
        return Response({'due_amount': profile.due_amount, 'balance': user.balance}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Profile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=404)


@api_view(['POST'])
def rent_vehicle(request):
    try:
        vehicle_id = request.data.get('vehicle_id')
        user_id = request.data.get('user_id')
        vehicle = Vehicle.objects.get(vehicle_id=vehicle_id)
        user = User.objects.get(user_id=user_id)
        user_profile = Profile.objects.get(user=user)

        if vehicle.status != 1:
            return Response({'error': 'Vehicle is not available'}, status=status.HTTP_400_BAD_REQUEST)

        start_location = vehicle.current_location
        
        with transaction.atomic():
            rental = Rental(
                customer=user,
                vehicle=vehicle,
                start_location=start_location,
                rental_start_time=timezone.now(),
            )
            rental.save()
            
            vehicle.status = 2
            vehicle.save()

            

        return Response({
            'message': 'Rental started successfully',
            'rental': RentalSerializer(rental).data,
            'start_location': LocationSerializer(start_location).data,
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def calculate_rental_end(request, rental_id):
    try:
        rental = Rental.objects.get(rental_id=rental_id)
        vehicle = rental.vehicle
        start_location = rental.start_location
        user = rental.customer
        user_profile = Profile.objects.get(user=user)
        
        start_lat = float(start_location.latitude)
        start_lon = float(start_location.longitude)
        end_lat = start_lat + random.uniform(-0.02, 0.02)
        end_lon = start_lon + random.uniform(-0.02, 0.02)
        
        end_location = Location.objects.create(
            latitude=end_lat,
            longitude=end_lon,
        )
        duration = random.randint(5, 30)
        vehicle.current_location = end_location
        vehicle.status = 1
        vehicle.battery_level -= decimal.Decimal(duration*0.5)
        vehicle.save()
   
       
        
        cost = Decimal(str(duration * 0.15)).quantize(Decimal('0.01'))
        

        # 更新租赁记录
        rental.rental_end_time = timezone.now() + timezone.timedelta(minutes=duration)
        rental.end_location = end_location
        rental.cost = cost
        rental.save()


        
        user_profile.due_amount = (user_profile.due_amount + cost).quantize(
                Decimal('0.01'),
                rounding=ROUND_HALF_UP
            )
        user_profile.save()

        return Response({
            'end_location': {
                'latitude': end_lat,
                'longitude': end_lon,
                'name': end_location.name
            },
            'duration': f"{duration} minutes",
            'cost': str(cost)
        })
        
    except Rental.DoesNotExist:
        return Response({'error': 'Rental not found'}, status=404)
    except Exception as e:
        print(f"Error in calculate_rental_end: {str(e)}")
        return Response({'error': str(e)}, status=400)
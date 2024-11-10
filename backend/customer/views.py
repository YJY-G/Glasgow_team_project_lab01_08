from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from users.models import User
import paypalrestsdk
from django.conf import settings
from decimal import Decimal 


paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET,
})

class AddBalanceView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be greater than 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid amount'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_data = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Account Balance Top-up",
                        "sku": "balance_add",
                        "price": str(amount),
                        "currency": "GBP",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": str(amount),
                    "currency": "GBP"
                },
                "description": "Add balance to account"
            }],
            "redirect_urls": {
                "return_url": f"http://localhost:5173/cus?success=true&amount={amount}",
                "cancel_url": "http://localhost:5173/cus?success=false"
            }
        }

        payment = paypalrestsdk.Payment(payment_data)
        
        if payment.create():
            approval_url = next(link['href'] for link in payment['links'] if link['rel'] == 'approval_url')
            
            return Response({
                'status': 'success',
                'approval_url': approval_url,
                'payment_id': payment.id,
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'error': payment.error
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentSuccessView(APIView):
    def patch(self, request):
        try:
            user_id = request.data.get('user_id')
            amount = request.data.get('amount')

            # Validate data
            if not user_id or not amount:
                return Response({
                    'status': 'error',
                    'message': 'Missing required parameters'
                }, status=400)
            
            # Get user
            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                print(f"User not found ID: {user_id}")  # Debug log
                return Response({
                    'status': 'error',
                    'message': 'User does not exist'
                }, status=404)
            
            # Update balance
            try:
                decimal_amount = Decimal(str(amount))
                user.balance += decimal_amount
                user.save()
                user.refresh_from_db()
                
                return Response({
                    'status': 'success',
                    'message': 'Payment successful',
                    'new_balance': user.balance
                })
            except Exception as e:
                print(f"Error updating balance: {str(e)}")  # Debug log
                return Response({
                    'status': 'error',
                    'message': 'Failed to update balance'
                }, status=500)
                
        except Exception as e:
            print(f"Error processing payment: {str(e)}")  # Debug log
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=500)


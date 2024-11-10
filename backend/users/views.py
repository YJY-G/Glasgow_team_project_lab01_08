from django.shortcuts import get_object_or_404
import qrcode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import User,VerificationCode,Verification2fa,Profile
from django.contrib.auth import authenticate,login
from django.utils.crypto import get_random_string
from datetime import timedelta
from django.utils import timezone
from .tools import send_verification_email
import io,base64
# Create your views here.


class RegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        try:

            firstName = request.data.get("firstName")
            lastName = request.data.get("lastName")
            email = request.data.get("email")
            phoneNum = request.data.get("phoneNumber")
            pwd = request.data.get("password")
            confirmPassword = request.data.get("confirmPassword")
            print(type(pwd))
            print(f"Attempting to register user with email: {email}")
         
            if not all([firstName, lastName, email, phoneNum, pwd, confirmPassword]):
                return Response(
                    {'error': 'All fields are required.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if pwd != confirmPassword:
                return Response(
                    {'error': 'Passwords do not match.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Email is already registered.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if Profile.objects.filter(phone_number=phoneNum).exists():
                return Response(
                    {'error': 'Phone number is already registered.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                
                user = User.objects.create_user(
                    email=email,
                    first_name=firstName,
                    last_name=lastName,
                    password=pwd,
                    phone_number=phoneNum 
                )

                verification = Verification2fa.objects.create(
                    user=user,
                    is_2fa_enable=True,
                )
                verification.generate_otp_secret_key()
                verification.save()

            return Response(
                {
                    'message': 'User registered successfully',
                    'user_id': user.user_id,
                    'email': user.email
                }, 
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print(f"Registration failed with error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')  
        password = request.data.get('password')
        
        try:
            user_obj = User.objects.get(email=username)
            print(f"User found in database: {user_obj.email}")
            print(f"Password hash in database: {user_obj.password}")
        except User.DoesNotExist:
            print("User not found in database")
            
        user = authenticate(request, username=username, password=password)
        
        verification = get_object_or_404(Verification2fa,user = user)
        if user is not None:
            if verification.is_2fa_enable:
                return Response({
                "message": "turn to verification",
                "username":user.first_name + " " + user.last_name,
                "user_id": user.user_id,
                "role":user.profile.role,
                "is_2fa_enable": verification.is_2fa_enable
            }, status=status.HTTP_200_OK)
            else:
                login(request, user, backend='users.backends.EmailOrPhoneBackend')
                return Response({
                    "message":"Login Successfully",
                    "user_id": user.user_id,
                    "username":user.first_name + " " + user.last_name,
                    "email":user.email,
                    "phone":user.profile.phone_number,
                    "amount":user.balance,
                    "role":user.profile.role,
                    "is_2fa_enable": verification.is_2fa_enable
                },status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

class LoginVerification(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, user_id=user_id)
        verification = get_object_or_404(Verification2fa, user=user)
        totp_uri = verification.get_totp_uri()
        qr = qrcode.make(totp_uri)
        buf = io.BytesIO()
        qr.save(buf)
        buf.seek(0)
        qr_code = base64.b64encode(buf.getvalue()).decode()
        return Response({'qr_code': qr_code}, status=status.HTTP_200_OK)

    def post(self, request, user_id):
        user = get_object_or_404(User, user_id=user_id)
        verification = get_object_or_404(Verification2fa, user=user)
        otp_code = request.data.get('otp_code')

        if verification.verify_otp(otp_code):
            verification.is_2fa_enable = False
            verification.save()
            
            login(request, user, backend='users.backends.EmailOrPhoneBackend')
            
            return Response({
                'message': 'OTP verified successfully',
                "username":user.first_name + " " + user.last_name,
                "user_id": user.user_id,
                "email":user.email,
                "phone":user.profile.phone_number,
                "amount":user.balance,
                "role":user.profile.role,
                "is_2fa_enable": verification.is_2fa_enable
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP code'}, status=status.HTTP_400_BAD_REQUEST)

class Enable2FA(APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, user_id=user_id)
        verification = get_object_or_404(Verification2fa, user=user)

        verification.is_2fa_enable = True
        verification.save()

        return Response({"message": "2FA has been enabled for the user."}, status=status.HTTP_200_OK)
    

class RequestPasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    
        verification_code = get_random_string(6, allowed_chars='0123456789')
        expires_at = timezone.now() + timedelta(minutes=5)


        VerificationCode.objects.create(user=user, code=verification_code, expires_at=expires_at)

        send_verification_email(email=email,code=verification_code)

        return Response({'message': 'Verification code sent to your email. It is valid for 5 minute.'}, status=status.HTTP_200_OK)
    




class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        verification_code = request.data.get('verificationCode')
        new_password = request.data.get('newpassword')
        print(new_password)
        print(type(new_password))
        try:
            user = User.objects.get(email=email)
            print(f"Current password hash: {user.password}")
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            code_obj = VerificationCode.objects.filter(user=user).latest('created_at')
        except VerificationCode.DoesNotExist:
            return Response(
                {'error': 'No verification code found for this user.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not code_obj.is_valid() or code_obj.code != verification_code:
            code_obj.delete()
            return Response(
                {'error': 'Invalid or expired verification code.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user.set_password(new_password)
            user.save()
            
            code_obj.delete()

            
            return Response(
                {'message': 'Password reset successful.'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Password reset error: {str(e)}")
            return Response(
                {'error': f'Password reset failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



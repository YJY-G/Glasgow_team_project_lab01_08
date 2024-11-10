from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail

def send_verification_email(email, code):
    try:
        send_mail(
            'Password Reset Verification Code',
            f'Your verification code is: {code}. It is valid for 5 minute.',
            'yuanjiayong0226@gmail.com',
            [email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
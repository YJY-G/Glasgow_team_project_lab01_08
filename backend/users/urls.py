from django.urls import path
from .views import RegisterView, LoginView,RequestPasswordResetView,ResetPasswordView,LoginVerification,Enable2FA

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('otp-verification/<int:user_id>/', LoginVerification.as_view(), name='login_verification'),
    path('enable-2fa/<int:user_id>/',Enable2FA.as_view(),name='enable_2fa'),
]

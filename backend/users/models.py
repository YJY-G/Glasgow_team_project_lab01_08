from curses.ascii import US
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from .managers import UserManager
from django.utils import timezone
import pyotp
from django.db import models
from django.conf import settings

class User(AbstractBaseUser):
    last_login = None
    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    password = models.CharField('password', max_length=128)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._password = None

    

class Profile(models.Model):
    ROLE_CHOICES = (
        (1, 'Customer'),
        (2, 'Operator'),
        (3, 'Manager'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20)
    due_amount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    role = models.IntegerField(choices=ROLE_CHOICES, default=1)
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email
    

class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=6)  # verification code
    expires_at = models.DateTimeField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.expires_at


class Verification2fa(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="verification_2fa")
    is_2fa_enable = models.BooleanField(default=False)
    otp_secret_key = models.CharField(max_length=16,blank=True)

    def generate_otp_secret_key(self):
        if not self.otp_secret_key:
            self.otp_secret_key = pyotp.random_base32()
            self.save()

    def get_totp_uri(self):
        return pyotp.totp.TOTP(self.otp_secret_key).provisioning_uri(self.user.email, issuer_name="e-vehicle-login")

    def verify_otp(self, otp_code):
        totp = pyotp.TOTP(self.otp_secret_key)
        return totp.verify(otp_code)

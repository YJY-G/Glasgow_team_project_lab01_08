from django.contrib.auth.models import BaseUserManager
from django.db import transaction

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        # 提取Profile相关的字段
        profile_fields = {
            'phone_number': extra_fields.pop('phone_number', ''),
            'role': extra_fields.pop('role', 1),  # 默认为Customer
        }
        
        email = self.normalize_email(email)
        
        # 使用事务确保用户和Profile的创建是原子操作
        with transaction.atomic():
            # 先创建用户
            user = self.model(
                email=email,
                first_name=first_name,
                last_name=last_name,
                **extra_fields
            )
            
            user.set_password(password)
            user.save(using=self._db)
            
            # 确保没有遗留的Profile
            from .models import Profile
            Profile.objects.filter(user_id=user.user_id).delete()
            
            # 创建新的Profile
            Profile.objects.create(
                user=user,
                **profile_fields
            )
        
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('role', 3)  # Manager role
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            **extra_fields
        )
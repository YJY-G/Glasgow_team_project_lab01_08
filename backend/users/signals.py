from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    当User被创建时，创建对应的Profile
    """
    # 只在新用户创建时触发，且确保Profile不存在
    if created and not hasattr(instance, '_profile_created'):
        try:
            # 如果已存在Profile，不要创建新的
            if not Profile.objects.filter(user=instance).exists():
                Profile.objects.create(
                    user=instance,
                    role=1  # 默认为Customer
                )
            instance._profile_created = True
        except Exception as e:
            print(f"Error in signal: {str(e)}")
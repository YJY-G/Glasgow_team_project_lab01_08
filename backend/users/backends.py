from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrPhoneBackend(BaseBackend):
    """
    自定义认证后端，允许用户通过邮箱或电话加密码进行登录。
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # 根据邮箱或电话号码查找用户
            user = User.objects.get(email=username)  # 尝试通过邮箱查找
        except User.DoesNotExist:
            try:
                # 如果邮箱查找失败，尝试通过电话查找
                user = User.objects.get(phone_number=username)
            except User.DoesNotExist:
                return None
        
        # 检查密码是否匹配
        if user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
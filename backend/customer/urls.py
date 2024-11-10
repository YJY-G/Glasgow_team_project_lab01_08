from django.urls import path
from customer import views
from .views import AddBalanceView,PaymentSuccessView

urlpatterns = [
    path('add-balance/', AddBalanceView.as_view(), name='add_balance'),
    path('payment/success/', PaymentSuccessView.as_view(), name='payment-success'),
]

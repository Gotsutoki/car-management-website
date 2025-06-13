from django.urls import path
from .views import (
    CarListCreateView, CarDetailView, CarStatisticsView, AveragePriceView,
    RegisterView, LoginView, LogoutView,
    SaleListCreateView, SaleDetailView,
    CustomerListCreateView, CustomerDetailView,
    ExpensiveCarsView, LowStockCarsView,
    assign_role
)

urlpatterns = [
    # 🚗 Car APIs
    path('cars/', CarListCreateView.as_view(), name='car-list-create'),
    path('cars/<int:pk>/', CarDetailView.as_view(), name='car-detail'),
    path('cars/statistics/', CarStatisticsView.as_view(), name='car-statistics'),
    path('cars/average-price/', AveragePriceView.as_view(), name='average-price'),
    path('cars/expensive/', ExpensiveCarsView.as_view(), name='expensive-cars'),
    path('cars/low-stock/', LowStockCarsView.as_view(), name='low-stock-cars'),

    # 🔐 Auth APIs
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # 💸 Sales APIs
    path('sales/', SaleListCreateView.as_view(), name='sale-list-create'),
    path('sales/<int:pk>/', SaleDetailView.as_view(), name='sale-detail'),

    # 👥 Customer APIs
    path('customers/', CustomerListCreateView.as_view(), name='customer-list-create'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),

    # 🔧 Role Management
    path('assign-role/', assign_role, name='assign-role'),
]

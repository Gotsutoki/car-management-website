from django.contrib import admin
from .models import Car, Customer, Sale
from .models import UserProfile
admin.site.register(UserProfile)

# ✅ Register all models
admin.site.register(Car)
admin.site.register(Customer)
admin.site.register(Sale)


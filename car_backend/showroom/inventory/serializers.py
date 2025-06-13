from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Sum
from django.db import transaction

from .models import Car, Customer, Sale, UserProfile

# 🔹 Car Serializer
class CarSerializer(serializers.ModelSerializer):
    sold_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Car
        fields = ['id', 'brand', 'model', 'year', 'price', 'stock', 'sold_count']

    def get_sold_count(self, obj):
        result = Sale.objects.filter(car=obj).aggregate(total=Sum('quantity'))
        return result['total'] or 0


# 🔹 User Serializer
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        required=False,
        default='viewer'
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'viewer')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=password
        )

        UserProfile.objects.update_or_create(user=user, defaults={'role': role})
        return user


# 🔹 Customer Serializer
class CustomerSerializer(serializers.ModelSerializer):
    sales_count = serializers.SerializerMethodField(read_only=True)
    total_cars_bought = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'cust_id', 'name', 'phone', 'address', 'created_at',
            'sales_count', 'total_cars_bought'
        ]
        read_only_fields = ['created_at']

    def get_sales_count(self, obj):
        return Sale.objects.filter(customer=obj).count()

    def get_total_cars_bought(self, obj):
        result = Sale.objects.filter(customer=obj).aggregate(total=Sum('quantity'))
        return result['total'] or 0


# In serializers.py - modify the SaleSerializer
class SaleSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())
    car = serializers.PrimaryKeyRelatedField(queryset=Car.objects.all())

    customer_name = serializers.CharField(source='customer.name', read_only=True)
    car_model = serializers.CharField(source='car.model', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'car', 'car_model',
            'customer', 'customer_name',
            'quantity', 'total_price', 'sale_date'
        ]
        read_only_fields = ['total_price', 'sale_date']

    def create(self, validated_data):
        car = validated_data['car']
        quantity = validated_data['quantity']

        if car.stock < quantity:
            raise serializers.ValidationError(f"Not enough stock available! Only {car.stock} cars left.")

        with transaction.atomic():
            car.stock -= quantity
            car.save()

            validated_data['total_price'] = quantity * car.price
            return super().create(validated_data)

    def update(self, instance, validated_data):
        old_car = instance.car
        old_quantity = instance.quantity

        new_car = validated_data.get('car', old_car)
        new_quantity = validated_data.get('quantity', old_quantity)

        # If absolutely nothing changes, skip stock adjustment
        if old_car == new_car and old_quantity == new_quantity:
            return super().update(instance, validated_data)

        with transaction.atomic():
            if old_car == new_car:
                diff = new_quantity - old_quantity
                if diff > 0:
                    if new_car.stock < diff:
                        raise serializers.ValidationError(f"Not enough stock available! Only {new_car.stock} cars left.")
                    new_car.stock -= diff
                elif diff < 0:
                    new_car.stock += abs(diff)
                new_car.save()
            else:
                old_car.stock += old_quantity
                old_car.save()

                if new_car.stock < new_quantity:
                    raise serializers.ValidationError(f"Not enough stock available! Only {new_car.stock} cars left.")
                new_car.stock -= new_quantity
                new_car.save()

            validated_data['total_price'] = new_quantity * new_car.price
            return super().update(instance, validated_data)

# 🔹 UserProfile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'role']

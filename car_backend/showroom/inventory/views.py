from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db import transaction, connection
from django.db.models import Avg, Sum
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import Car, Sale, Customer, UserProfile
from .serializers import CarSerializer, UserSerializer, SaleSerializer, CustomerSerializer

# ✅ Temporary Role Assignment (for testing only)
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def assign_role(request):
    role = request.data.get("role")
    if role not in ["admin", "staff"]:
        return Response({"error": "Role must be 'admin' or 'staff'"}, status=400)
    try:
        profile = request.user.userprofile
        profile.role = role
        profile.save()
        return Response({"message": f"Role set to '{role}'"}, status=200)
    except UserProfile.DoesNotExist:
        return Response({"error": "UserProfile not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ✅ Custom Role-Based Permissions
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.userprofile.role == 'admin'

class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.userprofile.role in ['admin', 'staff']

# ✅ Pagination
class CarPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 100

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        role = request.data.get("role", "customer").lower()

        if role not in ["admin", "staff", "customer"]:
            return Response({"error": "Role must be admin, staff, or customer"}, status=400)
        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        try:
            with transaction.atomic():
                # Step 1: Create user
                user = User.objects.create_user(username=username, password=password)

                # Step 2: Assign role-based flags
                if role == "admin":
                    user.is_superuser = True
                    user.is_staff = True
                elif role == "staff":
                    user.is_staff = True
                user.save()

                # Step 3: Ensure no duplicate profile (failsafe check)
                if UserProfile.objects.filter(user=user).exists():
                    raise ValidationError("UserProfile already exists for this user.")

                # Step 4: Create user profile
                UserProfile.objects.create(user=user, role=role)

                # Step 5: Create token
                token, _ = Token.objects.get_or_create(user=user)

                return Response({
                    "message": "User registered successfully",
                    "token": token.key,
                    "username": user.username,
                    "role": role
                }, status=status.HTTP_201_CREATED)

        except ValidationError as ve:
            user.delete()  # Cleanup orphaned user
            return Response({"error": str(ve)}, status=400)

        except Exception as e:
            # Handle any unknown issue and try to rollback user if created
            if 'user' in locals():
                user.delete()
            return Response({"error": f"Registration failed: {str(e)}"}, status=500)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            try:
                role = user.userprofile.role
            except UserProfile.DoesNotExist:
                role = "unknown"
            return Response({
                'token': token.key,
                'username': user.username,
                'role': role
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

# ✅ Car Views
class CarListCreateView(generics.ListCreateAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    authentication_classes = [TokenAuthentication]
    pagination_class = CarPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'brand': ['exact', 'icontains'],
        'model': ['exact', 'icontains'],
        'year': ['exact', 'lt', 'lte', 'gt', 'gte'],
        'price': ['exact', 'lt', 'lte', 'gt', 'gte'],
        'stock': ['exact', 'lt', 'lte', 'gt', 'gte']
    }
    search_fields = ['brand', 'model']
    ordering_fields = ['price', 'year', 'stock']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

# ✅ Car Stats
class CarStatisticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "total_cars": Car.objects.count(),
            "average_price": Car.objects.aggregate(Avg("price"))["price__avg"],
            "total_stock": Car.objects.aggregate(Sum("stock"))["stock__sum"],
            "unique_models": Car.objects.values("brand", "model").distinct().count()
        }
        return Response(data)

class AveragePriceView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        avg_price = Car.objects.aggregate(avg_price=Avg('price'))['avg_price']
        if avg_price is None:
            return Response({"error": "No cars available"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"average_price": avg_price}, status=status.HTTP_200_OK)

# ✅ Sales Views
class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsStaffOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        customer_id = self.request.query_params.get('customer', None)
        if customer_id is not None:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset

    def perform_create(self, serializer):
        car = serializer.validated_data['car']
        quantity = serializer.validated_data['quantity']
        if car.stock < quantity:
            raise ValidationError(f"Not enough stock! Only {car.stock} left.")
        with transaction.atomic():
            car.stock -= quantity
            car.save()
            serializer.save()

class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

# ✅ Customer Views
class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

# ✅ Advanced Raw SQL Queries
class LowStockCarsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]

    def get(self, request):
        query = "SELECT id, brand, model, year, price, stock FROM inventory_car WHERE stock < 5 ORDER BY stock ASC"
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                cars = cursor.fetchall()
            result = [
                {
                    "id": c[0], "brand": c[1], "model": c[2],
                    "year": c[3], "price": c[4], "stock": c[5]
                } for c in cars
            ]
            return Response({"low_stock_cars": result}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ExpensiveCarsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]  # Changed: Removed IsStaffOrAdmin to allow all authenticated users

    def get(self, request):
        query = "SELECT id, brand, model, year, price, stock FROM inventory_car WHERE price > 5000000 ORDER BY price DESC"
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                cars = cursor.fetchall()
            result = [
                {
                    "id": c[0], "brand": c[1], "model": c[2],
                    "year": c[3], "price": c[4], "stock": c[5]
                } for c in cars
            ]
            return Response({"expensive_cars": result})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
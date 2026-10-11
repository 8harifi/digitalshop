from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .throttles import LoginRateThrottle
from .views import (
    CarpetImageViewSet,
    CarpetViewSet,
    CategoryViewSet,
    InquiryViewSet,
    MeView,
    StatsView,
    UserViewSet,
)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', CarpetViewSet)
router.register(r'carpet-images', CarpetImageViewSet)
router.register(r'inquiry', InquiryViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', MeView.as_view(), name='me'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('token/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

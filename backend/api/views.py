from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from shop.models import Carpet, CarpetImage, Category, Inquiry

from .permissions import IsSuperUser, PublicCreateStaffRead, ReadOnlyOrAdmin
from .serializers import (
    CarpetDetailSerializer,
    CarpetImageSerializer,
    CarpetListSerializer,
    CarpetWriteSerializer,
    CategorySerializer,
    InquirySerializer,
    UserSerializer,
)
from .throttles import InquiryRateThrottle

User = get_user_model()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [ReadOnlyOrAdmin]


class CarpetViewSet(viewsets.ModelViewSet):
    queryset = Carpet.objects.select_related('category').prefetch_related('images').all()
    permission_classes = [ReadOnlyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'origin', 'stock_status']
    search_fields = ['title', 'title_ar', 'title_fa', 'title_en', 'description', 'sku']
    ordering_fields = ['price', 'created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CarpetWriteSerializer
        if self.action in ('retrieve', 'by_slug'):
            return CarpetDetailSerializer
        return CarpetListSerializer

    @action(detail=False, methods=['get'], url_path=r'by-slug/(?P<slug>[^/]+)')
    def by_slug(self, request, slug=None):
        carpet = get_object_or_404(self.get_queryset(), slug=slug)
        return Response(CarpetDetailSerializer(carpet, context={'request': request}).data)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAdminUser],
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def images(self, request, pk=None):
        carpet = self.get_object()
        if not request.FILES.get('image'):
            return Response({'detail': 'image file is required'}, status=status.HTTP_400_BAD_REQUEST)

        is_primary = str(request.data.get('is_primary', '')).lower() in ('1', 'true', 'yes')
        payload = request.data.copy()
        payload['carpet'] = carpet.pk
        serializer = CarpetImageSerializer(data=payload, context={'request': request})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            if is_primary or not carpet.images.exists():
                carpet.images.update(is_primary=False)
                serializer.validated_data['is_primary'] = True
            img = serializer.save()
        return Response(
            CarpetImageSerializer(img, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class CarpetImageViewSet(viewsets.ModelViewSet):
    queryset = CarpetImage.objects.select_related('carpet').all()
    serializer_class = CarpetImageSerializer
    permission_classes = [ReadOnlyOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['carpet']

    def perform_create(self, serializer):
        img = serializer.save()
        self._sync_primary(img)

    def perform_update(self, serializer):
        img = serializer.save()
        self._sync_primary(img)

    def perform_destroy(self, instance):
        carpet = instance.carpet
        was_primary = instance.is_primary
        instance.delete()
        if was_primary:
            replacement = CarpetImage.objects.filter(carpet=carpet).first()
            if replacement:
                CarpetImage.objects.filter(pk=replacement.pk).update(is_primary=True)

    @staticmethod
    def _sync_primary(img):
        if img.is_primary:
            CarpetImage.objects.filter(carpet=img.carpet).exclude(pk=img.pk).update(is_primary=False)
            return
        has_primary = (
            CarpetImage.objects.filter(carpet=img.carpet, is_primary=True)
            .exclude(pk=img.pk)
            .exists()
        )
        if not has_primary:
            CarpetImage.objects.filter(pk=img.pk).update(is_primary=True)


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.select_related('carpet').all().order_by('-created_at')
    serializer_class = InquirySerializer
    permission_classes = [PublicCreateStaffRead]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['carpet']
    search_fields = ['name', 'email', 'phone', 'message']

    def get_throttles(self):
        if self.action == 'create':
            return [InquiryRateThrottle()]
        return []


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError('You cannot delete your own account.')
        instance.delete()


class MeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class StatsView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        recent = Inquiry.objects.select_related('carpet').order_by('-created_at')[:5]
        return Response({
            'carpets': Carpet.objects.count(),
            'available': Carpet.objects.filter(stock_status='available').count(),
            'reserved': Carpet.objects.filter(stock_status='reserved').count(),
            'sold': Carpet.objects.filter(stock_status='sold').count(),
            'categories': Category.objects.count(),
            'inquiries': Inquiry.objects.count(),
            'users': User.objects.count(),
            'recent_inquiries': InquirySerializer(recent, many=True).data,
        })

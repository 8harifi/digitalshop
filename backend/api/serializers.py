from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from shop.models import Category, Carpet, CarpetImage, Inquiry

User = get_user_model()

ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'}
MAX_IMAGE_BYTES = 8 * 1024 * 1024


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'name_ar', 'name_fa', 'name_en', 'slug')


class CarpetImageSerializer(serializers.ModelSerializer):
    def validate_image(self, image):
        if image.size > MAX_IMAGE_BYTES:
            raise serializers.ValidationError('Image must be 8 MB or smaller.')
        content_type = getattr(image, 'content_type', '')
        if content_type and content_type not in ALLOWED_IMAGE_TYPES:
            raise serializers.ValidationError('Unsupported image type.')
        return image

    class Meta:
        model = CarpetImage
        fields = ('id', 'carpet', 'image', 'is_primary')


class CarpetListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Carpet
        fields = (
            'id', 'title', 'slug', 'category', 'price',
            'origin', 'stock_status', 'primary_image', 'colors',
        )

    def get_primary_image(self, obj):
        images = list(obj.images.all())
        img = next((image for image in images if image.is_primary), None)
        if not img and images:
            img = images[0]
        if img:
            url = img.image.url
            request = self.context.get('request')
            return request.build_absolute_uri(url) if request else url
        return None


class CarpetDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    images = CarpetImageSerializer(many=True, read_only=True)

    class Meta:
        model = Carpet
        fields = (
            'id', 'title', 'title_ar', 'title_fa', 'title_en', 'slug', 'category',
            'description', 'description_ar', 'description_fa', 'description_en',
            'origin', 'origin_ar', 'origin_fa', 'origin_en',
            'material', 'material_ar', 'material_fa', 'material_en',
            'pattern', 'pattern_ar', 'pattern_fa', 'pattern_en',
            'price', 'width', 'length', 'knot_density', 'colors', 'stock_status',
            'sku', 'images',
        )


class CarpetWriteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Carpet
        fields = (
            'id', 'title', 'title_ar', 'title_fa', 'title_en', 'slug', 'category',
            'description', 'description_ar', 'description_fa', 'description_en',
            'origin', 'origin_ar', 'origin_fa', 'origin_en',
            'material', 'material_ar', 'material_fa', 'material_en',
            'pattern', 'pattern_ar', 'pattern_fa', 'pattern_en',
            'price', 'width', 'length', 'knot_density', 'colors', 'stock_status', 'sku',
        )
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
            'origin': {'required': False, 'allow_blank': True},
            'material': {'required': False, 'allow_blank': True},
            'pattern': {'required': False, 'allow_blank': True},
            'knot_density': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True},
            'sku': {'read_only': True},
        }

    def _fill_defaults(self, attrs):
        for field in ('title', 'description', 'origin', 'material', 'pattern'):
            translations = (
                attrs.get(f'{field}_ar'),
                attrs.get(f'{field}_fa'),
                attrs.get(f'{field}_en'),
            )
            # Only derive the base field when it (or one of its translations)
            # is actually part of this request, so partial updates don't wipe
            # the default-language value.
            if field not in attrs and all(value is None for value in translations):
                continue
            if not attrs.get(field):
                attrs[field] = next((value for value in translations if value), '')
        return attrs

    def create(self, validated_data):
        return super().create(self._fill_defaults(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._fill_defaults(validated_data))


class InquirySerializer(serializers.ModelSerializer):
    carpet_title = serializers.CharField(source='carpet.title', read_only=True)

    class Meta:
        model = Inquiry
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser', 'is_active',
            'date_joined', 'last_login', 'password',
        )
        read_only_fields = ('date_joined', 'last_login')

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return
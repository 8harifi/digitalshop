from django.db import IntegrityError, models, transaction
from django.db.models import IntegerField, Max
from django.db.models.functions import Cast, Substr
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Carpet(models.Model):
    STOCK_STATUS = (
        ('available', _('Available')),
        ('reserved', _('Reserved')),
        ('sold', _('Sold')),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='carpets')
    description = models.TextField()
    origin = models.CharField(max_length=100)
    material = models.CharField(max_length=100)
    pattern = models.CharField(max_length=100)

    price = models.DecimalField(max_digits=12, decimal_places=0) # Toman
    width = models.IntegerField(help_text=_("Width in cm"))
    length = models.IntegerField(help_text=_("Length in cm"))
    knot_density = models.CharField(max_length=50, help_text=_("e.g., 50 Raj"))

    colors = models.JSONField(default=list, help_text=_("List of hex colors"))
    stock_status = models.CharField(max_length=20, choices=STOCK_STATUS, default='available')
    sku = models.CharField(max_length=50, unique=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['stock_status']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        if self.sku:
            return super().save(*args, **kwargs)
        # Retry on the unique constraint so two concurrent creates cannot keep
        # the same generated code.
        for _ in range(5):
            self.sku = self.generate_sku()
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                # Only a real SKU collision is retryable; anything else (e.g. a
                # missing relation) must surface unchanged.
                if type(self).objects.filter(sku=self.sku).exists():
                    self.sku = ''
                    continue
                raise
        raise IntegrityError('Could not generate a unique SKU')

    @classmethod
    def generate_sku(cls, prefix='KH'):
        latest = cls.objects.filter(sku__startswith=f'{prefix}-').aggregate(
            value=Max(Cast(Substr('sku', len(prefix) + 2), output_field=IntegerField()))
        )['value']
        return f'{prefix}-{(latest or 0) + 1:04d}'

    def _generate_slug(self):
        base = slugify(self.title_en or self.title or self.title_fa or self.title_ar or '') or 'carpet'
        slug = base
        index = 2
        while type(self).objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f'{base}-{index}'
            index += 1
        return slug

class CarpetImage(models.Model):
    carpet = models.ForeignKey(Carpet, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='carpets/')
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"Image for {self.carpet.title}"

class Inquiry(models.Model):
    STATUS = (
        ('new', _('New')),
        ('in_progress', _('In progress')),
        ('done', _('Done')),
    )

    carpet = models.ForeignKey(Carpet, on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Inquiries"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

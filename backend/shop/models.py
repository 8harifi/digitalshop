from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Carpet(models.Model):
    STOCK_STATUS = (
        ('available', _('Available')),
        ('reserved', _('Reserved')),
        ('sold', _('Sold')),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
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

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = self.generate_sku()
        super().save(*args, **kwargs)

    @classmethod
    def generate_sku(cls, prefix='KH'):
        numbers = []
        for value in cls.objects.filter(sku__startswith=f'{prefix}-').values_list('sku', flat=True):
            try:
                numbers.append(int(value.rsplit('-', 1)[-1]))
            except (ValueError, IndexError):
                continue
        return f'{prefix}-{max(numbers, default=0) + 1:04d}'

class CarpetImage(models.Model):
    carpet = models.ForeignKey(Carpet, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='carpets/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.carpet.title}"

class Inquiry(models.Model):
    carpet = models.ForeignKey(Carpet, on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Inquiries"

from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Category, Carpet, CarpetImage, Inquiry

class CarpetImageInline(admin.TabularInline):
    model = CarpetImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(TranslationAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Carpet)
class CarpetAdmin(TranslationAdmin):
    list_display = ('title', 'category', 'price', 'stock_status', 'origin')
    list_filter = ('category', 'stock_status', 'origin')
    search_fields = ('title', 'sku')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [CarpetImageInline]

@admin.register(CarpetImage)
class CarpetImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'carpet', 'is_primary')
    list_filter = ('is_primary',)


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'carpet', 'email', 'created_at')
    readonly_fields = ('created_at',)

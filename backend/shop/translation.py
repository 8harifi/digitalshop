from modeltranslation.translator import register, TranslationOptions
from .models import Category, Carpet

@register(Category)
class CategoryTranslationOptions(TranslationOptions):
    fields = ('name',)

@register(Carpet)
class CarpetTranslationOptions(TranslationOptions):
    fields = ('title', 'description', 'origin', 'material', 'pattern',)

import os
import shutil
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from shop.models import Carpet, CarpetImage, Category, Inquiry

User = get_user_model()

DEFAULT_ASSETS_DIR = Path(settings.BASE_DIR).parent / 'public' / 'assets'
ASSETS_DIR = Path(os.environ.get('SEED_ASSETS_DIR', DEFAULT_ASSETS_DIR))

CATEGORIES = [
    {'slug': 'tabriz', 'ar': 'تبريز', 'fa': 'تبریز', 'en': 'Tabriz'},
    {'slug': 'kashan', 'ar': 'كاشان', 'fa': 'کاشان', 'en': 'Kashan'},
    {'slug': 'nain', 'ar': 'نائين', 'fa': 'نائین', 'en': 'Nain'},
    {'slug': 'isfahan', 'ar': 'أصفهان', 'fa': 'اصفهان', 'en': 'Isfahan'},
]

CARPETS = [
    {
        'sku': 'TBZ-001', 'slug': 'tabriz-heritage', 'category': 'tabriz',
        'ar': 'إرث تبريز', 'fa': 'میراث تبریز', 'en': 'Tabriz Heritage',
        'desc_ar': 'سجادة تبريز يدوية الصنع بنقشة المدالية الكلاسيكية وألوان دافئة.',
        'desc_fa': 'فرش دستباف تبریز با نقش لچک‌ترنج کلاسیک و رنگ‌های گرم.',
        'desc_en': 'Hand-knotted Tabriz rug with a classic medallion design and warm tones.',
        'origin_ar': 'تبريز', 'origin_fa': 'تبریز', 'origin_en': 'Tabriz',
        'material_ar': 'صوف وأساس قطني', 'material_fa': 'پشم و تار پنبه', 'material_en': 'Wool & cotton warp',
        'pattern_ar': 'مدالية', 'pattern_fa': 'لچک‌ترنج', 'pattern_en': 'Medallion',
        'price': 48000000, 'width': 200, 'length': 300, 'knot': '50 Raj',
        'colors': ['#6B1F2E', '#E8D6A3', '#2F3B18'], 'stock': 'available',
        'image': 'carpet-tabriz.jpg',
    },
    {
        'sku': 'KSH-001', 'slug': 'kashan-garden', 'category': 'kashan',
        'ar': 'حديقة كاشان', 'fa': 'گلستان کاشان', 'en': 'Kashan Garden',
        'desc_ar': 'سجادة كاشان بزهور خيالية وألوان ناضجة تزيّن أي غرفة.',
        'desc_fa': 'فرش کاشان با گل‌های خیال‌انگیز و رنگ‌های پخته، زینت هر فضایی است.',
        'desc_en': 'Kashan rug with imaginative florals and mature colors that grace any room.',
        'origin_ar': 'كاشان', 'origin_fa': 'کاشان', 'origin_en': 'Kashan',
        'material_ar': 'صوف ناعم', 'material_fa': 'پشم لطیف', 'material_en': 'Fine wool',
        'pattern_ar': 'زهوري', 'pattern_fa': 'گل‌افشان', 'pattern_en': 'Floral',
        'price': 36000000, 'width': 150, 'length': 225, 'knot': '45 Raj',
        'colors': ['#4A0F1C', '#EFE6DD', '#636B2F'], 'stock': 'available',
        'image': 'carpet-kashan.jpg',
    },
    {
        'sku': 'NIN-001', 'slug': 'nain-silk', 'category': 'nain',
        'ar': 'نائين الحرير', 'fa': 'ابریشم نائین', 'en': 'Nain Silk',
        'desc_ar': 'سجادة نائين بإطار حريري ورسومات دقيقة بلون العاج.',
        'desc_fa': 'فرش نائین با حاشیه ابریشمی و نقش‌های ظریف به رنگ عاج.',
        'desc_en': 'Nain rug with a silk border and delicate ivory-toned motifs.',
        'origin_ar': 'نائين', 'origin_fa': 'نائین', 'origin_en': 'Nain',
        'material_ar': 'صوف وإطار حرير', 'material_fa': 'پشم و حاشیه ابریشم', 'material_en': 'Wool & silk border',
        'pattern_ar': 'زهوري', 'pattern_fa': 'شاه‌عباسی', 'pattern_en': 'Shah Abbasi',
        'price': 89000000, 'width': 170, 'length': 250, 'knot': '60 Raj',
        'colors': ['#EFE6DD', '#0C0A08', '#E8D6A3'], 'stock': 'reserved',
        'image': 'carpet-nain.jpg',
    },
    {
        'sku': 'HRZ-001', 'slug': 'heriz-nomad', 'category': 'tabriz',
        'ar': 'هريز الرحّل', 'fa': 'هریس عشایری', 'en': 'Heriz Nomad',
        'desc_ar': 'سجادة هريز هندسية بروح القبائل وألوان ترابية جسورة.',
        'desc_fa': 'فرش هریس هندسی با روح ایلی و رنگ‌های خاکی پررنگ.',
        'desc_en': 'Geometric Heriz rug with tribal spirit and bold earthy colors.',
        'origin_ar': 'هريز', 'origin_fa': 'هریس', 'origin_en': 'Heriz',
        'material_ar': 'صوف قبلي', 'material_fa': 'پشم ایلی', 'material_en': 'Tribal wool',
        'pattern_ar': 'هندسي', 'pattern_fa': 'هندسی', 'pattern_en': 'Geometric',
        'price': 27500000, 'width': 240, 'length': 320, 'knot': '40 Raj',
        'colors': ['#65041D', '#636B2F', '#D4B483'], 'stock': 'available',
        'image': 'carpet-heriz.jpg',
    },
    {
        'sku': 'TBZ-002', 'slug': 'tabriz-ivory', 'category': 'tabriz',
        'ar': 'تبريز العاج', 'fa': 'تبریز عاج', 'en': 'Tabriz Ivory',
        'desc_ar': 'سجادة تبريز بأرضية عاجية ونقوش أنيقة للمجالس الفاخرة.',
        'desc_fa': 'فرش تبریز با زمینه عاجی و نقش‌های ظریف برای فضاهای لوکس.',
        'desc_en': 'Tabriz rug with an ivory field and elegant detailing for refined interiors.',
        'origin_ar': 'تبريز', 'origin_fa': 'تبریز', 'origin_en': 'Tabriz',
        'material_ar': 'صوف وأساس قطني', 'material_fa': 'پشم و تار پنبه', 'material_en': 'Wool & cotton warp',
        'pattern_ar': 'مدالية', 'pattern_fa': 'لچک‌ترنج', 'pattern_en': 'Medallion',
        'price': 52000000, 'width': 200, 'length': 300, 'knot': '55 Raj',
        'colors': ['#EFE6DD', '#6B1F2E', '#2F3B18'], 'stock': 'sold',
        'image': 'carpet-tabriz.jpg',
    },
    {
        'sku': 'KSH-002', 'slug': 'kashan-crimson', 'category': 'kashan',
        'ar': 'كاشان القرمزي', 'fa': 'کاشان ارغوانی', 'en': 'Kashan Crimson',
        'desc_ar': 'سجادة كاشان بقرمزي عميق وحدود متناغمة.',
        'desc_fa': 'فرش کاشان با ارغوانی عمیق و حاشیه‌ای هماهنگ.',
        'desc_en': 'Kashan rug with deep crimson tones and a harmonious border.',
        'origin_ar': 'كاشان', 'origin_fa': 'کاشان', 'origin_en': 'Kashan',
        'material_ar': 'صوف ناعم', 'material_fa': 'پشم لطیف', 'material_en': 'Fine wool',
        'pattern_ar': 'زهوري', 'pattern_fa': 'گل‌افشان', 'pattern_en': 'Floral',
        'price': 41000000, 'width': 160, 'length': 240, 'knot': '50 Raj',
        'colors': ['#4A0F1C', '#E8D6A3', '#0C0A08'], 'stock': 'available',
        'image': 'carpet-kashan.jpg',
    },
]


class Command(BaseCommand):
    help = 'Seed demo categories, carpets (with images), inquiries and an admin user.'

    def handle(self, *args, **options):
        self._seed_admin()
        categories = self._seed_categories()
        self._seed_carpets(categories)
        self._seed_inquiries()
        self.stdout.write(self.style.SUCCESS('Demo data seeded.'))

    def _seed_admin(self):
        password = os.environ.get('DJANGO_SEED_ADMIN_PASSWORD', 'admin12345')
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.WARNING(
                    f'Created admin user "admin" (password: {password}). '
                    'Change it before deploying.'
                )
            )
        else:
            self.stdout.write('Admin user "admin" already exists; left unchanged.')

    def _seed_categories(self):
        result = {}
        for data in CATEGORIES:
            cat, _ = Category.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'name': data['ar'], 'name_ar': data['ar'],
                    'name_fa': data['fa'], 'name_en': data['en'],
                },
            )
            result[data['slug']] = cat
        self.stdout.write(f'Categories: {Category.objects.count()}')
        return result

    def _seed_carpets(self, categories):
        media_carpets = Path(settings.MEDIA_ROOT) / 'carpets'
        media_carpets.mkdir(parents=True, exist_ok=True)

        for data in CARPETS:
            carpet, _ = Carpet.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'title': data['ar'], 'title_ar': data['ar'],
                    'title_fa': data['fa'], 'title_en': data['en'],
                    'slug': data['slug'],
                    'category': categories[data['category']],
                    'description': data['desc_ar'], 'description_ar': data['desc_ar'],
                    'description_fa': data['desc_fa'], 'description_en': data['desc_en'],
                    'origin': data['origin_ar'], 'origin_ar': data['origin_ar'],
                    'origin_fa': data['origin_fa'], 'origin_en': data['origin_en'],
                    'material': data['material_ar'], 'material_ar': data['material_ar'],
                    'material_fa': data['material_fa'], 'material_en': data['material_en'],
                    'pattern': data['pattern_ar'], 'pattern_ar': data['pattern_ar'],
                    'pattern_fa': data['pattern_fa'], 'pattern_en': data['pattern_en'],
                    'price': data['price'], 'width': data['width'], 'length': data['length'],
                    'knot_density': data['knot'], 'colors': data['colors'],
                    'stock_status': data['stock'],
                },
            )

            source = ASSETS_DIR / data['image']
            if source.exists():
                dest_name = f'{data["slug"]}.jpg'
                shutil.copyfile(source, media_carpets / dest_name)
                CarpetImage.objects.update_or_create(
                    carpet=carpet, is_primary=True,
                    defaults={'image': f'carpets/{dest_name}'},
                )
            else:
                self.stdout.write(self.style.WARNING(f'  missing asset: {source}'))

        self.stdout.write(f'Carpets: {Carpet.objects.count()}  Images: {CarpetImage.objects.count()}')

    def _seed_inquiries(self):
        if Inquiry.objects.exists():
            return
        sample = [
            {'name': 'Layla Hassan', 'email': 'layla@example.com', 'phone': '+971500000001',
             'message': 'Interested in the Tabriz Heritage rug — is the price negotiable?'},
            {'name': 'Omid Karimi', 'email': 'omid@example.com', 'phone': '+989120000002',
             'message': 'Do you ship the Nain Silk rug to Tehran?'},
            {'name': 'Sara Nouri', 'email': 'sara@example.com', 'phone': '+971500000003',
             'message': 'Can I book a private viewing for the Kashan Garden?'},
        ]
        for item in sample:
            Inquiry.objects.create(**item)
        self.stdout.write(f'Inquiries: {Inquiry.objects.count()}')

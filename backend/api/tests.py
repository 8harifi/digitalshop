from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from shop.models import Carpet, Category, Inquiry

User = get_user_model()

STRONG = 'Str0ngPass!23'


class ProductApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Tabriz', slug='tabriz')
        self.superuser = User.objects.create_superuser('admin', 'admin@example.com', STRONG)

    def _carpet(self, **kwargs):
        defaults = dict(
            title='Rug',
            title_en='Rug EN',
            slug='rug',
            category=self.category,
            price=100,
            width=1,
            length=1,
        )
        defaults.update(kwargs)
        return Carpet.objects.create(**defaults)

    def test_list_is_public_and_paginated(self):
        self._carpet()
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('results', res.data)

    def test_by_slug_detail(self):
        self._carpet(slug='with-slug')
        res = self.client.get('/api/products/by-slug/with-slug/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['slug'], 'with-slug')
        self.assertNotIn('created_at', res.data)

    def test_sku_is_auto_generated_in_order(self):
        first = self._carpet(slug='a')
        second = self._carpet(slug='b')
        self.assertEqual(first.sku, 'KH-0001')
        self.assertEqual(second.sku, 'KH-0002')

    def test_slug_auto_generated_when_blank(self):
        carpet = Carpet.objects.create(
            title='Auto Slug', category=self.category, price=1, width=1, length=1
        )
        self.assertEqual(carpet.slug, 'auto-slug')

    def test_partial_update_keeps_base_fields(self):
        carpet = self._carpet(
            title='Keep', description='Desc', origin='Tabriz', material='Wool', pattern='Medallion'
        )
        self.client.force_authenticate(self.superuser)
        res = self.client.patch(f'/api/products/{carpet.id}/', {'price': 999}, format='json')
        self.assertEqual(res.status_code, 200)
        carpet.refresh_from_db()
        self.assertEqual(carpet.title, 'Keep')
        self.assertEqual(carpet.description, 'Desc')
        self.assertEqual(carpet.origin, 'Tabriz')

    def test_writes_require_staff(self):
        res = self.client.post('/api/products/', {'title': 'x'}, format='json')
        self.assertEqual(res.status_code, 401)


class InquiryApiTests(APITestCase):
    def test_public_can_create_inquiry(self):
        res = self.client.post(
            '/api/inquiry/',
            {'name': 'A', 'email': 'a@b.com', 'phone': '1', 'message': 'hi'},
            format='json',
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Inquiry.objects.count(), 1)


class UserApiTests(APITestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser('admin', 'admin@example.com', STRONG)

    def test_requires_superuser(self):
        staff = User.objects.create_user('staff', 'staff@example.com', STRONG, is_staff=True)
        self.client.force_authenticate(staff)
        self.assertEqual(self.client.get('/api/users/').status_code, 403)
        self.client.force_authenticate(self.superuser)
        self.assertEqual(self.client.get('/api/users/').status_code, 200)

    def test_cannot_delete_self(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.delete(f'/api/users/{self.superuser.id}/')
        self.assertEqual(res.status_code, 400)

    def test_weak_password_rejected(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.post('/api/users/', {'username': 'weak', 'password': '123'}, format='json')
        self.assertEqual(res.status_code, 400)

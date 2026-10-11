'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import ProductForm, {
  type ProductInitial,
} from '@/components/admin/ProductForm';
import { getProduct } from '@/lib/api';

export default function EditProductPage() {
  const t = useTranslations('Admin');
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const [initial, setInitial] = useState<ProductInitial | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then(setInitial)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <div className="ad-empty">{t('common.error')}</div>;
  if (!initial) return <div className="ad-loading">{t('common.loading')}</div>;

  return <ProductForm productId={id} initial={initial} />;
}

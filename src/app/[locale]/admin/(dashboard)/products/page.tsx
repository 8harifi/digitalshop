'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { API_URL, deleteProduct, getCarpets } from '@/lib/api';

type Row = {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: number;
  stock_status: 'available' | 'reserved' | 'sold';
  primary_image: string | null;
};

const origin = API_URL.replace(/\/api\/?$/, '');
const imgSrc = (path: string) => (path.startsWith('http') ? path : `${origin}${path}`);

export default function AdminProductsPage() {
  const t = useTranslations('Admin');
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const data = await getCarpets(term ? { search: term } : {});
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const onDelete = async (id: number) => {
    if (!window.confirm(t('products.confirmDelete'))) return;
    await deleteProduct(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <section className="ad-card">
      <div className="ad-card__head">
        <h3 className="ad-card__title ad-display">{t('products.title')}</h3>
        <div className="ad-toolbar__group">
          <input
            className="ad-input ad-search"
            placeholder={t('products.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
          />
          <Link href="/admin/products/new" className="ad-btn ad-btn--sm">
            <Plus size={15} />
            {t('products.new')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading">{t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="ad-empty">{t('products.empty')}</div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>{t('products.image')}</th>
                <th>{t('products.name')}</th>
                <th>{t('products.category')}</th>
                <th>{t('products.price')}</th>
                <th>{t('products.stock')}</th>
                <th style={{ textAlign: 'end' }}>{t('products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.primary_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgSrc(row.primary_image)} alt="" className="ad-thumb" />
                    ) : (
                      <span className="ad-thumb ad-thumb--placeholder">—</span>
                    )}
                  </td>
                  <td>{row.title}</td>
                  <td className="ad-muted">{row.category}</td>
                  <td className="ad-gold">{Number(row.price).toLocaleString()}</td>
                  <td>
                    <span className={`ad-badge ad-badge--${row.stock_status}`}>
                      {row.stock_status}
                    </span>
                  </td>
                  <td>
                    <div className="ad-table__row-actions">
                      <Link
                        href={`/admin/products/${row.id}/edit`}
                        className="ad-btn ad-btn--ghost ad-btn--sm"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        type="button"
                        className="ad-btn ad-btn--danger ad-btn--sm"
                        onClick={() => onDelete(row.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { deleteInquiry, getInquiries } from '@/lib/api';

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  carpet: number | null;
  carpet_title: string | null;
  created_at: string;
};

export default function AdminInquiriesPage() {
  const t = useTranslations('Admin');
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Inquiry | null>(null);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const data = await getInquiries(term ? { search: term } : {});
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const remove = async (id: number) => {
    if (!window.confirm(t('inquiries.confirmDelete'))) return;
    await deleteInquiry(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <section className="ad-card">
        <div className="ad-card__head">
          <h3 className="ad-card__title ad-display">{t('inquiries.title')}</h3>
          <input
            className="ad-input ad-search"
            aria-label={t('inquiries.search')}
            placeholder={t('inquiries.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
          />
        </div>

        {loading ? (
          <div className="ad-loading">{t('common.loading')}</div>
        ) : rows.length === 0 ? (
          <div className="ad-empty">{t('inquiries.empty')}</div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th scope="col">{t('inquiries.name')}</th>
                  <th scope="col">{t('inquiries.email')}</th>
                  <th scope="col">{t('inquiries.phone')}</th>
                  <th scope="col">{t('inquiries.carpet')}</th>
                  <th scope="col">{t('inquiries.date')}</th>
                  <th scope="col" style={{ textAlign: 'end' }}>
                    {t('inquiries.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td className="ad-muted">{row.email}</td>
                    <td className="ad-muted">{row.phone}</td>
                    <td>{row.carpet_title || t('inquiries.general')}</td>
                    <td className="ad-muted">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="ad-table__row-actions">
                        <button
                          type="button"
                          aria-label={t('inquiries.view')}
                          className="ad-btn ad-btn--ghost ad-btn--sm"
                          onClick={() => setViewing(row)}
                        >
                          <Eye size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          aria-label={t('common.delete')}
                          className="ad-btn ad-btn--danger ad-btn--sm"
                          onClick={() => remove(row.id)}
                        >
                          <Trash2 size={14} aria-hidden />
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

      {viewing && (
        <div
          className="ad-modal"
          role="dialog"
          aria-modal="true"
          aria-label={viewing.name}
          onClick={() => setViewing(null)}
        >
          <div className="ad-modal__panel" onClick={(e) => e.stopPropagation()}>
            <h3
              className="ad-card__title ad-display"
              style={{ marginBottom: '1rem' }}
            >
              {viewing.name}
            </h3>
            <dl style={{ display: 'grid', gap: '0.6rem' }}>
              <div>
                <dt className="ad-label">{t('inquiries.email')}</dt>
                <dd>{viewing.email}</dd>
              </div>
              <div>
                <dt className="ad-label">{t('inquiries.phone')}</dt>
                <dd>{viewing.phone}</dd>
              </div>
              <div>
                <dt className="ad-label">{t('inquiries.carpet')}</dt>
                <dd>{viewing.carpet_title || t('inquiries.general')}</dd>
              </div>
              <div>
                <dt className="ad-label">{t('inquiries.message')}</dt>
                <dd>{viewing.message}</dd>
              </div>
            </dl>
            <div className="ad-form-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="ad-btn"
                onClick={() => setViewing(null)}
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

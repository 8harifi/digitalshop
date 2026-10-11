'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/api';

type Category = {
  id: number;
  name: string;
  name_ar: string | null;
  name_fa: string | null;
  name_en: string | null;
  slug: string;
};

const EMPTY = { name_ar: '', name_fa: '', name_en: '', slug: '' };

export default function AdminCategoriesPage() {
  const t = useTranslations('Admin');
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getCategories());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing('new');
  };

  const openEdit = (cat: Category) => {
    setForm({
      name_ar: cat.name_ar ?? cat.name ?? '',
      name_fa: cat.name_fa ?? '',
      name_en: cat.name_en ?? '',
      slug: cat.slug,
    });
    setEditing(cat);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name_ar,
      name_ar: form.name_ar,
      name_fa: form.name_fa,
      name_en: form.name_en,
      slug: form.slug,
    };
    try {
      if (editing && editing !== 'new') {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm(t('categories.confirmDelete'))) return;
    await deleteCategory(id);
    setRows((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <section className="ad-card">
        <div className="ad-card__head">
          <h3 className="ad-card__title ad-display">{t('categories.title')}</h3>
          <button type="button" className="ad-btn ad-btn--sm" onClick={openNew}>
            <Plus size={15} />
            {t('categories.new')}
          </button>
        </div>

        {loading ? (
          <div className="ad-loading">{t('common.loading')}</div>
        ) : rows.length === 0 ? (
          <div className="ad-empty">{t('categories.empty')}</div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th scope="col">AR</th>
                  <th scope="col">FA</th>
                  <th scope="col">EN</th>
                  <th scope="col">{t('categories.slug')}</th>
                  <th scope="col" style={{ textAlign: 'end' }}>
                    {t('categories.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name_ar || cat.name}</td>
                    <td className="ad-muted">{cat.name_fa}</td>
                    <td className="ad-muted">{cat.name_en}</td>
                    <td className="ad-muted">{cat.slug}</td>
                    <td>
                      <div className="ad-table__row-actions">
                        <button
                          type="button"
                          aria-label={t('common.edit')}
                          className="ad-btn ad-btn--ghost ad-btn--sm"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil size={14} aria-hidden />
                        </button>
                        <button
                          type="button"
                          aria-label={t('common.delete')}
                          className="ad-btn ad-btn--danger ad-btn--sm"
                          onClick={() => remove(cat.id)}
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

      {editing && (
        <div
          className="ad-modal"
          role="dialog"
          aria-modal="true"
          aria-label={
            editing === 'new' ? t('categories.new') : t('categories.edit')
          }
          onClick={() => setEditing(null)}
        >
          <form
            className="ad-modal__panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
          >
            <h3
              className="ad-card__title ad-display"
              style={{ marginBottom: '1rem' }}
            >
              {editing === 'new' ? t('categories.new') : t('categories.edit')}
            </h3>
            <div className="ad-grid-2">
              <div className="ad-field">
                <label className="ad-label">AR</label>
                <input
                  className="ad-input"
                  value={form.name_ar}
                  onChange={(e) =>
                    setForm({ ...form, name_ar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">FA</label>
                <input
                  className="ad-input"
                  value={form.name_fa}
                  onChange={(e) =>
                    setForm({ ...form, name_fa: e.target.value })
                  }
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">EN</label>
                <input
                  className="ad-input"
                  value={form.name_en}
                  onChange={(e) =>
                    setForm({ ...form, name_en: e.target.value })
                  }
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">{t('categories.slug')}</label>
                <input
                  className="ad-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="ad-form-actions" style={{ marginTop: '1.25rem' }}>
              <button className="ad-btn" type="submit" disabled={saving}>
                {saving ? t('categories.saving') : t('categories.save')}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => setEditing(null)}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

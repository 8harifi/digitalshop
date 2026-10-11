'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { createUser, deleteUser, getUsers, updateUser } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type AdminUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
};

const EMPTY = { username: '', email: '', password: '', is_staff: true };

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const { user: me } = useAuth();
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getUsers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(false);
    try {
      await createUser(form);
      setCreating(false);
      setForm({ ...EMPTY });
      await load();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: AdminUser) => {
    const updated = await updateUser(row.id, { is_active: !row.is_active });
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, ...updated } : r)),
    );
  };

  const remove = async (id: number) => {
    if (!window.confirm(t('users.confirmDelete'))) return;
    await deleteUser(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      <section className="ad-card">
        <div className="ad-card__head">
          <h3 className="ad-card__title ad-display">{t('users.title')}</h3>
          <button
            type="button"
            className="ad-btn ad-btn--sm"
            onClick={() => setCreating(true)}
          >
            <Plus size={15} />
            {t('users.new')}
          </button>
        </div>

        {loading ? (
          <div className="ad-loading">{t('common.loading')}</div>
        ) : rows.length === 0 ? (
          <div className="ad-empty">{t('users.empty')}</div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th scope="col">{t('users.username')}</th>
                  <th scope="col">{t('users.email')}</th>
                  <th scope="col">{t('users.staff')}</th>
                  <th scope="col">{t('users.active')}</th>
                  <th scope="col">{t('users.lastLogin')}</th>
                  <th scope="col" style={{ textAlign: 'end' }}>
                    {t('users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.username}</td>
                    <td className="ad-muted">{row.email}</td>
                    <td>
                      {row.is_superuser ? (
                        <span className="ad-badge ad-badge--staff">
                          {t('users.superuser')}
                        </span>
                      ) : row.is_staff ? (
                        <span className="ad-badge ad-badge--staff">
                          {t('users.staff')}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        aria-pressed={row.is_active}
                        aria-label={`${t('users.active')}: ${row.username}`}
                        className={`ad-badge ad-badge--${row.is_active ? 'available' : 'sold'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggle(row)}
                        disabled={row.id === me?.id}
                      >
                        {row.is_active ? t('users.active') : '—'}
                      </button>
                    </td>
                    <td className="ad-muted">
                      {row.last_login
                        ? new Date(row.last_login).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="ad-table__row-actions">
                        <button
                          type="button"
                          aria-label={t('common.delete')}
                          className="ad-btn ad-btn--danger ad-btn--sm"
                          onClick={() => remove(row.id)}
                          disabled={row.id === me?.id}
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

      {creating && (
        <div
          className="ad-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t('users.create')}
          onClick={() => setCreating(false)}
        >
          <form
            className="ad-modal__panel"
            onClick={(e) => e.stopPropagation()}
            onSubmit={create}
          >
            <h3
              className="ad-card__title ad-display"
              style={{ marginBottom: '1rem' }}
            >
              {t('users.create')}
            </h3>
            <div className="ad-grid-2">
              <div className="ad-field">
                <label className="ad-label" htmlFor="new-user-username">
                  {t('users.username')}
                </label>
                <input
                  id="new-user-username"
                  className="ad-input"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ad-field">
                <label className="ad-label" htmlFor="new-user-email">
                  {t('users.email')}
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  className="ad-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label" htmlFor="new-user-password">
                  {t('users.password')}
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  className="ad-input"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="ad-field">
                <label className="ad-label" htmlFor="new-user-staff">
                  {t('users.staff')}
                </label>
                <select
                  id="new-user-staff"
                  className="ad-select"
                  value={String(form.is_staff)}
                  onChange={(e) =>
                    setForm({ ...form, is_staff: e.target.value === 'true' })
                  }
                >
                  <option value="true">{t('common.yes')}</option>
                  <option value="false">{t('common.no')}</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="ad-error" style={{ marginTop: '0.75rem' }}>
                {t('common.error')}
              </p>
            )}
            <div className="ad-form-actions" style={{ marginTop: '1.25rem' }}>
              <button className="ad-btn" type="submit" disabled={saving}>
                {saving ? t('users.saving') : t('users.save')}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => setCreating(false)}
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

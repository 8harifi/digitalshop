'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth';

export default function AdminLoginPage() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [loading, user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      await login(username.trim(), password);
      router.replace('/admin');
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ad-login">
      <form className="ad-login__card" onSubmit={onSubmit}>
        <div className="ad-login__mark">
          <span>KH</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 className="ad-display" style={{ fontSize: '1.6rem' }}>
            {t('login.title')}
          </h1>
          <p
            className="ad-muted"
            style={{ marginTop: '0.4rem', fontSize: '1rem' }}
          >
            {t('login.subtitle')}
          </p>
        </div>

        <div className="ad-field">
          <label className="ad-label" htmlFor="username">
            {t('login.username')}
          </label>
          <input
            id="username"
            className="ad-input"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="ad-field">
          <label className="ad-label" htmlFor="password">
            {t('login.password')}
          </label>
          <input
            id="password"
            type="password"
            className="ad-input"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="ad-error">{t('login.error')}</p>}

        <button
          className="ad-btn ad-btn--block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Header from '@/components/Header';
import { getProduct, submitInquiry } from '@/lib/api';
import '@/styles/public.css';

function ContactInner() {
  const t = useTranslations('Contact');
  const params = useSearchParams();
  const carpetId = params.get('carpet');
  const carpetPk = carpetId && /^\d+$/.test(carpetId) ? Number(carpetId) : null;

  const [carpetName, setCarpetName] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [state, setState] = useState<
    'idle' | 'sending' | 'done' | 'error' | 'invalid'
  >('idle');

  useEffect(() => {
    if (carpetPk === null) return;
    getProduct(carpetPk)
      .then((data) => setCarpetName(data.title))
      .catch(() => setCarpetName(null));
  }, [carpetPk]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setState('invalid');
      return;
    }
    setState('sending');
    try {
      await submitInquiry({
        ...form,
        carpet: carpetPk,
      });
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <main className="pub-root">
      <Header />
      <div className="pub-wrap">
        <div className="pub-hero">
          <h1 className="pub-display pub-hero__title">{t('title')}</h1>
          <p className="pub-hero__sub">{t('subtitle')}</p>
        </div>

        {state === 'done' ? (
          <div className="pub-success">
            <h2 className="pub-display" style={{ fontSize: '1.6rem' }}>
              {t('success')}
            </h2>
            <p className="pub-muted" style={{ marginTop: '0.6rem' }}>
              {t('successNote')}
            </p>
            <button
              type="button"
              className="pub-btn"
              style={{ marginTop: '1.5rem' }}
              onClick={() => {
                setForm({ name: '', email: '', phone: '', message: '' });
                setState('idle');
              }}
            >
              {t('another')}
            </button>
          </div>
        ) : (
          <form
            className="pub-card"
            onSubmit={submit}
            style={{ display: 'grid', gap: '1rem' }}
          >
            <div className="pub-grid-2">
              <div className="pub-field">
                <label className="pub-label" htmlFor="contact-name">
                  {t('name')}
                </label>
                <input
                  id="contact-name"
                  className="pub-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="pub-field">
                <label className="pub-label" htmlFor="contact-email">
                  {t('email')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="pub-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="pub-field">
                <label className="pub-label" htmlFor="contact-phone">
                  {t('phone')}
                </label>
                <input
                  id="contact-phone"
                  className="pub-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="pub-field">
                <label className="pub-label">{t('subject')}</label>
                <input
                  className="pub-input"
                  value={carpetName ?? t('general')}
                  readOnly
                />
              </div>
            </div>

            <div className="pub-field">
              <label className="pub-label" htmlFor="contact-message">
                {t('message')}
              </label>
              <textarea
                id="contact-message"
                className="pub-textarea"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            {state === 'invalid' && (
              <p className="pub-error">{t('required')}</p>
            )}
            {state === 'error' && <p className="pub-error">{t('error')}</p>}

            <button
              className="pub-btn"
              type="submit"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? t('sending') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactInner />
    </Suspense>
  );
}

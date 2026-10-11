'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import Header from '@/components/Header';
import { Link } from '@/i18n/navigation';
import { API_URL, submitInquiry } from '@/lib/api';
import { useCart } from '@/lib/cart';
import '@/styles/public.css';

const origin = API_URL.replace(/\/api\/?$/, '');

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const cart = useTranslations('Cart');
  const locale = useLocale();
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const { items, subtotal, setQty, remove, clear } = useCart();

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [state, setState] = useState<'idle' | 'placing' | 'done' | 'error'>('idle');

  const image = (src: string | null) =>
    !src ? '' : src.startsWith('http') ? src : `${origin}${src}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name || !form.email) {
      setState('error');
      return;
    }
    setState('placing');
    const summary = items
      .map((i) => `${i.title} ×${i.qty} — ${(i.price * i.qty).toLocaleString()}`)
      .join('\n');
    try {
      await submitInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        carpet: items.length === 1 ? items[0].id : null,
        message: `Checkout (test mode)\n\n${summary}\n\nTotal: ${subtotal.toLocaleString()}`,
      });
      clear();
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <main className="pub-root" dir={dir}>
        <Header />
        <div className="pub-wrap">
          <div className="pub-success">
            <h1 className="pub-display" style={{ fontSize: '1.8rem' }}>
              {t('success')}
            </h1>
            <p className="pub-muted" style={{ marginTop: '0.6rem' }}>
              {t('successNote')}
            </p>
            <Link href="/shop" className="pub-btn" style={{ marginTop: '1.5rem' }}>
              {cart('continueShopping')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pub-root" dir={dir}>
      <Header />
      <div className="pub-wrap">
        <div className="pub-hero" style={{ paddingBlock: '2rem 1rem' }}>
          <h1 className="pub-display pub-hero__title">{t('title')}</h1>
        </div>

        {items.length === 0 ? (
          <div className="pub-success">
            <p className="pub-muted">{t('emptyCart')}</p>
            <Link href="/shop" className="pub-btn" style={{ marginTop: '1.25rem' }}>
              {cart('continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="pub-grid-2" style={{ alignItems: 'start' }}>
            <section className="pub-card">
              <h2 className="pub-display" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                {t('orderSummary')}
              </h2>
              {items.map((item) => (
                <div key={item.id} className="pub-cart-row">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image(item.image)} alt={item.title} />
                  ) : (
                    <span />
                  )}
                  <div>
                    <Link href={`/shop/${item.slug}`} className="pub-display">
                      {item.title}
                    </Link>
                    <p className="pub-gold" style={{ fontSize: '0.95rem' }}>
                      {item.price.toLocaleString()}
                    </p>
                    <div className="pub-qty">
                      <button type="button" onClick={() => setQty(item.id, item.qty - 1)}>
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => setQty(item.id, item.qty + 1)}>
                        +
                      </button>
                      <button
                        type="button"
                        className="pub-muted"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => remove(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="pub-gold">{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
              <div className="pub-summary-total">
                <span>{t('total')}</span>
                <span>{subtotal.toLocaleString()}</span>
              </div>
            </section>

            <form className="pub-card" onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
              <h2 className="pub-display" style={{ fontSize: '1.3rem' }}>
                {t('contactInfo')}
              </h2>
              <div className="pub-field">
                <label className="pub-label">{t('name')}</label>
                <input
                  className="pub-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="pub-field">
                <label className="pub-label">{t('email')}</label>
                <input
                  type="email"
                  className="pub-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="pub-field">
                <label className="pub-label">{t('phone')}</label>
                <input
                  className="pub-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <h2 className="pub-display" style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>
                {t('payment')}
              </h2>
              <p className="pub-muted" style={{ fontSize: '0.95rem' }}>
                {t('testNotice')}
              </p>
              <div className="pub-field">
                <label className="pub-label">{t('cardNumber')}</label>
                <input className="pub-input" placeholder="4242 4242 4242 4242" disabled />
              </div>
              <div className="pub-grid-2">
                <div className="pub-field">
                  <label className="pub-label">{t('expiry')}</label>
                  <input className="pub-input" placeholder="12/34" disabled />
                </div>
                <div className="pub-field">
                  <label className="pub-label">{t('cvc')}</label>
                  <input className="pub-input" placeholder="123" disabled />
                </div>
              </div>

              {state === 'error' && <p className="pub-error">{t('required')}</p>}

              <button className="pub-btn pub-btn--block" type="submit" disabled={state === 'placing'}>
                {state === 'placing' ? t('placing') : t('placeOrder')}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

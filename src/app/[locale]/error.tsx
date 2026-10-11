'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        color: '#f2e8d5',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '2rem',
            margin: 0,
            fontFamily: 'var(--font-display), Georgia, serif',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ marginTop: '0.75rem', opacity: 0.75 }}>{t('message')}</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: '1.5rem',
            padding: '0.8rem 2rem',
            background: '#d4b483',
            color: '#0c0a08',
            borderRadius: 999,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {t('retry')}
        </button>
      </div>
    </main>
  );
}

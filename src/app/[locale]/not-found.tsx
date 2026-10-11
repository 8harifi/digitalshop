import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
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
            fontSize: '2.5rem',
            margin: 0,
            fontFamily: 'var(--font-display), Georgia, serif',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ marginTop: '0.75rem', opacity: 0.75 }}>{t('message')}</p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.8rem 2rem',
            background: '#d4b483',
            color: '#0c0a08',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {t('home')}
        </Link>
      </div>
    </main>
  );
}

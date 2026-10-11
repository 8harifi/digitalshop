'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import Header from '@/components/Header';
import { Link, useRouter } from '@/i18n/navigation';
import { API_URL, getCarpets } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import '@/styles/public.css';

type Rug = {
  id: number;
  slug: string;
  title: string;
  origin: string;
  price: number;
  primary_image: string | null;
};

const origin = API_URL.replace(/\/api\/?$/, '');
const imgSrc = (path: string) =>
  path.startsWith('http') ? path : `${origin}${path}`;

function SearchInner() {
  const t = useTranslations('Search');
  const ct = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const initialTerm = params.get('search') ?? '';

  const [term, setTerm] = useState(initialTerm);
  const [results, setResults] = useState<Rug[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errored, setErrored] = useState(false);

  const run = useCallback(async (value: string) => {
    const q = value.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      setErrored(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    setErrored(false);
    try {
      const data = await getCarpets({ search: q });
      setResults(data);
    } catch {
      setResults([]);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialTerm) run(initialTerm);
  }, [initialTerm, run]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    router.replace(q ? `/search?search=${encodeURIComponent(q)}` : '/search');
    run(q);
  };

  return (
    <main className="pub-root">
      <Header />
      <div className="pub-wrap">
        <div className="pub-hero">
          <h1 className="pub-display pub-hero__title">{t('title')}</h1>
          <p className="pub-hero__sub">{t('subtitle')}</p>
        </div>

        <form
          onSubmit={submit}
          className="pub-card"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <input
            className="pub-input"
            style={{ flex: 1 }}
            placeholder={t('placeholder')}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button className="pub-btn" type="submit">
            {t('button')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          {loading ? (
            <p
              className="pub-muted"
              style={{ textAlign: 'center', padding: '3rem 0' }}
            >
              {ct('loading')}
            </p>
          ) : errored ? (
            <p
              className="pub-error"
              style={{ textAlign: 'center', padding: '3rem 0' }}
            >
              {t('error')}
            </p>
          ) : !searched ? (
            <p
              className="pub-muted"
              style={{ textAlign: 'center', padding: '2rem 0' }}
            >
              {t('hint')}
            </p>
          ) : results.length === 0 ? (
            <p
              className="pub-muted"
              style={{ textAlign: 'center', padding: '3rem 0' }}
            >
              {t('noResults')}
            </p>
          ) : (
            <>
              <p className="pub-gold" style={{ marginBottom: '1rem' }}>
                {t('results', { count: results.length })}
              </p>
              <div className="pub-results">
                {results.map((rug) => (
                  <Link
                    key={rug.id}
                    href={`/shop/${rug.slug}`}
                    className="pub-rug"
                  >
                    <div className="pub-rug__media">
                      {rug.primary_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgSrc(rug.primary_image)} alt={rug.title} />
                      ) : (
                        <span className="pub-muted">—</span>
                      )}
                    </div>
                    <div className="pub-rug__body">
                      <h3
                        className="pub-display"
                        style={{ fontSize: '1.2rem' }}
                      >
                        {rug.title}
                      </h3>
                      <p className="pub-muted" style={{ fontSize: '0.95rem' }}>
                        {rug.origin}
                      </p>
                      <p
                        className="pub-rug__price"
                        style={{ marginTop: '0.5rem' }}
                      >
                        {formatPrice(rug.price, locale)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}

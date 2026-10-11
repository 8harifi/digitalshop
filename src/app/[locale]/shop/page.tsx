"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  cubicBezier,
} from "framer-motion";
import { useTranslations, useLocale } from 'next-intl';
import { getCarpets } from '@/lib/api';
import { formatPrice, toLocalizedDigits } from '@/lib/format';
import Header from '@/components/Header';

/* ============================================================
   Types & Utilities
   ============================================================ */

type Carpet = {
  id: string;
  slug: string;
  primary_image: string;
  title: string;
  origin: string;
  price: number | string;
  colors: string[];
  category: string;
  stock_status: "available" | "reserved" | "sold";
};

const softEase = cubicBezier(0.4, 0, 0.2, 1);

/* ============================================================
   Product Card
   ============================================================ */

function ProductCard({ carpet, index, locale }: { carpet: Carpet; index: number; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const t = useTranslations('Common');

  const statusLabel = carpet.stock_status === 'available' ? t('available') :
                     carpet.stock_status === 'sold' ? t('sold') : t('reserved');

  return (
    <motion.article
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: softEase }}
      className="group"
    >
      <Link href={`/shop/${carpet.slug}`} className="block">
        <div className="fs-card">
          <div className="fs-card__media">
            {carpet.primary_image ? (
              <Image
                src={carpet.primary_image}
                alt={carpet.title}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-walnut/10">{t('noImage')}</div>
            )}
            <div className="fs-card__veil" aria-hidden="true" />

            <span className={`fs-badge ${carpet.stock_status === 'available' ? 'fs-badge--in' : 'fs-badge--out'}`}>
              {statusLabel}
            </span>
          </div>

          <div className="fs-card__body">
            <h3 className="fs-display text-xl sm:text-2xl lg:text-3xl">
              {carpet.title}
            </h3>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(carpet.colors) && carpet.colors.map((c) => (
                  <span
                    key={c}
                    className="fs-swatch"
                    style={{ background: c }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="fs-price">
                {formatPrice(carpet.price, locale)}
                <span className="fs-price__unit"> {t('currency')}</span>
              </p>
            </div>
          </div>
          <span className="fs-card__line" aria-hidden="true" />
        </div>
      </Link>
    </motion.article>
  );
}

/* ============================================================
   Shop Page
   ============================================================ */

export default function ShopPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations('Shop');
  const ct = useTranslations('Common');
  const locale = useLocale();
  const isRTL = locale !== 'en';

  const [carpetsData, setCarpetsData] = useState<Carpet[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setErrored(false);
      try {
        const params: Record<string, string> = {};
        if (onlyAvailable) params.stock_status = 'available';
        if (sortBy === 'price-asc') params.ordering = 'price';
        if (sortBy === 'price-desc') params.ordering = '-price';

        const data = await getCarpets(params);
        setCarpetsData(data);
      } catch {
        setErrored(true);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [sortBy, onlyAvailable, locale]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? "rtl" : "ltr"}
      className="fs-root min-h-screen overflow-clip"
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Header />

      <header className="fs-intro flex min-h-[52svh] flex-col items-center justify-center px-6 text-center">
        <p className="fs-muted-gold text-[1.875rem]">{t('title', { defaultValue: 'Gallery' })}</p>
        <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem]">
          {t('header', { defaultValue: 'Art of Persia' })}
        </h1>
      </header>

      <div className="relative">
        <div className="fs-rail" aria-hidden="true" />
        <motion.div
          className="fs-progress"
          aria-hidden="true"
          style={{ scaleY: progressScaleY }}
        />

        <div className="mx-auto max-w-6xl px-6 pb-8">
          {/* Simple Filter Bar Placeholder */}
          <div className="flex flex-wrap gap-4 justify-between items-center py-6 border-b border-burgundy/10">
             <div className="flex gap-2">
                <button onClick={() => setOnlyAvailable(!onlyAvailable)} className={`fs-chip ${onlyAvailable ? 'is-active' : ''}`}>
                  {t('available', { defaultValue: 'Only Available' })}
                </button>
             </div>
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="fs-select">
                <option value="newest">{t('newest')}</option>
                <option value="price-asc">{t('priceAsc')}</option>
                <option value="price-desc">{t('priceDesc')}</option>
             </select>
          </div>

          {!loading && !errored && (
            <p className="fs-muted mt-4 text-base sm:text-lg">
              {t('found', { count: toLocalizedDigits(carpetsData.length, locale) })}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-24">
          {loading ? (
            <div className="py-20 text-center">{ct('loading')}</div>
          ) : errored ? (
            <p className="py-20 text-center text-lg" style={{ color: '#e0a0a0' }}>{ct('error')}</p>
          ) : carpetsData.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fs-muted py-20 text-center text-lg"
            >
              {t('noResults')}
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {carpetsData.map((carpet, i) => (
                <ProductCard key={carpet.id} carpet={carpet} index={i} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="flex min-h-[36svh] items-center justify-center px-6 text-center">
        <div>
          <div className="fs-mark mx-auto" aria-hidden="true">✦</div>
          <p className="fs-display mt-7 text-3xl sm:text-4xl lg:text-5xl">{ct('consult')}</p>
          <Link href="/contact" className="fs-cta mt-8 inline-block">{ct('contact')}</Link>
        </div>
      </footer>
    </section>
  );
}

const styles = `
  .fs-root {
    --fs-background: #2F3B18;
    --fs-background-deep: #232C12;
    --fs-primary: #EFE6DD;
    --fs-muted-foreground: rgba(239, 230, 221, 0.92);
    --fs-muted-gold: #E8D6A3;
    --fs-gold: #E8D6A3;
    --fs-gold-soft: rgba(232, 214, 163, 0.35);
    --fs-border: rgba(232, 214, 163, 0.32);
    --fs-olive: #2F3B18;
    --fs-olive-deep: #232C12;

    background:
      radial-gradient(ellipse 130% 90% at 50% 0%, rgba(47, 59, 24, 0.9), transparent 72%),
      linear-gradient(180deg, var(--fs-background) 0%, var(--fs-background-deep) 100%);
    color: var(--fs-primary);
    font-family: var(--font-AKETAB), var(--font-cinzel), Georgia, serif;
    font-size: clamp(1.15rem, 1.1rem + 0.5vw, 1.55rem);
    line-height: 1.6;
  }

  .fs-display {
    font-family: var(--font-AKETAB), var(--font-cinzel), Georgia, serif;
    letter-spacing: 0.02em;
    color: var(--fs-primary);
  }

  .fs-muted { color: var(--fs-muted-foreground); }
  .fs-muted-gold { color: var(--fs-muted-gold); }

  .fs-intro {
    background-image:
      linear-gradient(var(--fs-border), var(--fs-border)),
      linear-gradient(90deg, transparent 49.8%, var(--fs-border) 50%, transparent 50.2%);
    background-position: center bottom, center;
    background-repeat: no-repeat;
    background-size: min(72vw, 34rem) 1px, 100% 34%;
  }

  .fs-mark {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    color: var(--fs-gold);
    border: 1px solid var(--fs-border);
    transform: rotate(45deg);
  }

  .fs-rail {
    position: absolute;
    inset-block: 0;
    inset-inline-start: clamp(1.1rem, 3vw, 3rem);
    width: 1px;
    background: var(--fs-border);
  }

  .fs-progress {
    position: absolute;
    top: 0;
    inset-inline-start: clamp(1.1rem, 3vw, 3rem);
    width: 2px;
    height: 100%;
    background: linear-gradient(180deg, var(--fs-gold) 0%, var(--fs-gold-soft) 100%);
    transform-origin: top;
    box-shadow: 0 0 12px rgba(232, 214, 163, 0.5);
    z-index: 5;
    border-radius: 2px;
  }

  .fs-chip {
    min-height: 48px;
    padding: 0 20px;
    font-size: 16px;
    font-weight: 600;
    color: var(--fs-primary);
    background: rgba(47, 59, 24, 0.92);
    border: 1px solid var(--fs-gold);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .fs-chip.is-active {
    background: var(--fs-gold);
    color: var(--fs-background-deep);
  }

  .fs-select {
    padding: 8px 16px;
    background: rgba(47, 59, 24, 0.92);
    border: 1px solid var(--fs-gold);
    border-radius: 999px;
    color: var(--fs-primary);
  }

  .fs-card {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: rgba(35, 44, 18, 0.5);
    transition: all 0.4s ease;
  }

  .fs-card:hover {
    border-color: var(--fs-gold);
    transform: translateY(-4px);
    box-shadow: 0 1.5rem 3rem -1.5rem rgba(10, 14, 5, 0.85);
  }

  .fs-card__media {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: #1a2010;
  }

  .fs-card__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(35, 44, 18, 0.9) 100%);
    pointer-events: none;
  }

  .fs-card__body {
    padding: 1.1rem 1.25rem 1.35rem;
  }

  .fs-card__line {
    position: absolute;
    bottom: 0;
    inset-inline: 1.25rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--fs-gold) 50%, transparent);
    transform: scaleX(0);
    transition: transform 0.5s ease;
  }

  .fs-card:hover .fs-card__line {
    transform: scaleX(1);
  }

  .fs-badge {
    position: absolute;
    top: 0.75rem;
    inset-inline-end: 0.75rem;
    z-index: 2;
    padding: 0.25rem 0.7rem;
    font-size: 0.75rem;
    border-radius: 999px;
    backdrop-filter: blur(6px);
  }

  .fs-badge--in {
    color: var(--fs-background-deep);
    background: var(--fs-gold);
  }

  .fs-badge--out {
    color: var(--fs-primary);
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid var(--fs-border);
  }

  .fs-swatch {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1px solid rgba(232, 214, 163, 0.4);
  }

  .fs-price {
    font-family: var(--font-AKETAB), Georgia, serif;
    font-size: 1.15rem;
    color: var(--fs-gold);
  }

  .fs-price__unit {
    font-size: 0.8rem;
    color: var(--fs-muted-gold);
  }

  .fs-cta {
    padding: 0.85rem 2rem;
    font-family: inherit;
    font-size: 1rem;
    color: var(--fs-background-deep);
    background: var(--fs-gold);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .fs-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem -1rem rgba(232, 214, 163, 0.7);
  }
`;

'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import Header from '@/components/Header';
import { useCart } from '@/lib/cart';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getCarpet } from '@/lib/api';
import { formatPrice, toLocalizedDigits } from '@/lib/format';
import '@/styles/rug.css';

/* ============================================================
   Types
   ============================================================ */

type RugDetail = {
  id: string;
  slug: string;
  images: { id: number; image: string; is_primary: boolean }[];
  title: string;
  origin: string;
  description: string;
  longDescription: string;
  price: number | string;
  width: number;
  length: number;
  knot_density: string;
  material: string;
  pattern: string;
  colors: string[];
  category: { id: number; name: string };
  stock_status: 'available' | 'reserved' | 'sold';
};

/* ============================================================
   Gallery
   ============================================================ */

function RugGallery({
  images,
  title,
}: {
  images: RugDetail['images'];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const t = useTranslations('Common');

  if (!images || images.length === 0)
    return (
      <div className="aspect-square bg-walnut/10 rounded-xl flex items-center justify-center">
        {t('noImage')}
      </div>
    );

  return (
    <div className="fs-gallery">
      <div className="fs-gallery__thumbs">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`${title} ${i + 1}`}
            aria-current={i === activeIndex}
            className={`fs-gallery__thumb ${i === activeIndex ? 'is-active' : ''}`}
          >
            <Image
              src={img.image}
              alt={title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div className="fs-gallery__main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].image}
              alt={title}
              fill
              priority
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================
   Main Page
   ============================================================ */

export default function RugDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const locale = useLocale();
  const t = useTranslations('Common');
  const router = useRouter();
  const { add } = useCart();
  const [rug, setRug] = useState<RugDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const pageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
  });
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    if (!slug) return;
    const fetchItem = async () => {
      try {
        const data = await getCarpet(slug);
        setRug(data);
      } catch {
        setErrored(true);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [slug, locale]);

  if (loading)
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center text-cream">
        {t('loading')}
      </div>
    );
  if (errored)
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center text-cream">
        {t('error')}
      </div>
    );
  if (!rug)
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center text-cream">
        {t('notFound')}
      </div>
    );

  const statusLabel =
    rug.stock_status === 'available'
      ? t('available')
      : rug.stock_status === 'sold'
        ? t('sold')
        : t('reserved');

  const handleBuy = () => {
    const image =
      rug.images && rug.images.length > 0 ? rug.images[0].image : null;
    add({
      id: Number(rug.id),
      slug: rug.slug,
      title: rug.title,
      price: Number(rug.price),
      image,
    });
    router.push('/checkout');
  };

  return (
    <section ref={pageRef} className="fs-root min-h-screen overflow-clip">
      <Header />

      <nav className="fs-breadcrumb">
        <Link href="/" className="fs-breadcrumb__link">
          {t('home')}
        </Link>
        <span>/</span>
        <Link href="/shop" className="fs-breadcrumb__link">
          {t('shop')}
        </Link>
        <span>/</span>
        <span className="fs-muted-gold">{rug.title}</span>
      </nav>

      <div className="relative">
        <div className="fs-rail" aria-hidden="true" />
        <motion.div
          className="fs-progress"
          aria-hidden="true"
          style={{ scaleY: progressScaleY }}
        />

        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-12">
          <RugGallery images={rug.images} title={rug.title} />

          <div className="fs-info">
            <p className="fs-muted-gold text-sm sm:text-base">{rug.origin}</p>
            <h1 className="fs-display mt-3 text-3xl leading-tight sm:text-5xl lg:text-6xl">
              {rug.title}
            </h1>
            <p className="fs-muted mt-5 text-base leading-8 sm:text-lg">
              {rug.description}
            </p>

            <div className="fs-price-box mt-7">
              <p className="fs-price-lg">
                {formatPrice(rug.price, locale)}
                <span className="fs-price__unit"> {t('currency')}</span>
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  className="fs-cta fs-cta--block"
                  disabled={rug.stock_status !== 'available'}
                  onClick={handleBuy}
                >
                  {rug.stock_status === 'available' ? t('buy') : statusLabel}
                </button>
                <Link
                  href={`/contact?carpet=${rug.id}`}
                  className="fs-cta fs-cta--block bg-transparent border border-cream text-cream hover:bg-cream/10 text-center"
                >
                  {t('consult')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
          <div className="fs-specs">
            <h2 className="fs-display text-2xl sm:text-3xl">{t('specs')}</h2>
            <dl className="fs-specs__grid">
              <div>
                <dt>{t('origin')}</dt>
                <dd>{rug.origin}</dd>
              </div>
              <div>
                <dt>{t('size')}</dt>
                <dd>
                  {toLocalizedDigits(rug.width, locale)} x{' '}
                  {toLocalizedDigits(rug.length, locale)} {t('cm')}
                </dd>
              </div>
              <div>
                <dt>{t('knotDensity')}</dt>
                <dd>{rug.knot_density}</dd>
              </div>
              <div>
                <dt>{t('material')}</dt>
                <dd>{rug.material}</dd>
              </div>
              <div>
                <dt>{t('pattern')}</dt>
                <dd>{rug.pattern}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  cubicBezier,
} from "framer-motion";

/* ============================================================
   Types & Data (در پروژه واقعی از API/DB بخوانید)
   ============================================================ */

type RugDetail = {
  id: string;
  slug: string;
  images: string[];
  title: string;
  origin: string;
  description: string;
  longDescription: string;
  price: number;
  oldPrice?: number;
  size: string;
  material: string;
  knot: string;
  age: string;
  colors: { name: string; hex: string }[];
  category: string;
  inStock: boolean;
  features: string[];
};

const rugsData: Record<string, RugDetail> = {
  "tabriz-lachak-toranj": {
    id: "1",
    slug: "tabriz-lachak-toranj",
    images: [
      "/assets/carpet-tabriz.jpg",
      "/assets/carpet-tabriz-2.jpg",
      "/assets/carpet-tabriz-3.jpg",
      "/assets/carpet-tabriz-4.jpg",
    ],
    title: "هنرِ ماندگار",
    origin: "تبریز — نقش لچک و ترنج",
    description:
      "هر نقش، روایتگر بخشی از تاریخ و فرهنگ ایران است؛ فرش‌هایی که با دقت و عشق بافته شده‌اند تا سال‌ها بخشی از زندگی شما باشند.",
    longDescription:
      "این فرش دستباف تبریز با نقش اصیل لچک و ترنج، حاصل ماه‌ها کار مداوم استادکاران این خطه است. رنگ‌های گیاهی به‌کاررفته و ظرافت گره‌های آن، این اثر را به یک قطعه هنری ماندگار تبدیل کرده است. ترنج مرکزی با ظرافت تمام بافته شده و لچک‌های چهارگانه، تعادلی بی‌نظیر در ترکیب‌بندی ایجاد کرده‌اند.",
    price: 48500000,
    oldPrice: 55000000,
    size: "۳۰۰ × ۲۰۰ سانتی‌متر",
    material: "پشم کرک و ابریشم",
    knot: "۵۰ رج",
    age: "نو بافت",
    colors: [
      { name: "لاکی", hex: "#8B1A1A" },
      { name: "زیتونی", hex: "#2F3B18" },
      { name: "طلایی", hex: "#E8D6A3" },
      { name: "قهوه‌ای", hex: "#3A2A1A" },
    ],
    category: "تبریز",
    inStock: true,
    features: [
      "رنگ‌های گیاهی و طبیعی",
      "بافت دستی با گره ترکی",
      "ضمانت اصالت و کیفیت",
      "ارسال رایگان و بیمه‌شده",
    ],
  },
};

/* ============================================================
   Utilities
   ============================================================ */

const softEase = cubicBezier(0.4, 0, 0.2, 1);

function toPersianDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatPrice(price: number) {
  return toPersianDigits(price.toLocaleString("en-US"));
}

/* ============================================================
   Gallery with Zoom
   ============================================================ */

function RugGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const reducedMotion = useReducedMotion();

  const openZoom = (index: number) => {
    setActiveIndex(index);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  /* Zoom with wheel */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.002)));
  };

  /* Drag to pan */
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: dragStart.current.posX + (e.clientX - dragStart.current.x),
      y: dragStart.current.posY + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  /* Keyboard */
  useEffect(() => {
    if (!isZoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "+" || e.key === "=") setZoomLevel((z) => Math.min(4, z + 0.25));
      if (e.key === "-") setZoomLevel((z) => Math.max(1, z - 0.25));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen, images.length]);

  const resetView = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Main gallery */}
      <div className="fs-gallery">
        <div className="fs-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`fs-gallery__thumb ${i === activeIndex ? "is-active" : ""}`}
              aria-label={`تصویر ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${title} - نمای ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className="fs-gallery__main"
          onClick={() => openZoom(activeIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openZoom(activeIndex)}
          aria-label="بزرگ‌نمایی تصویر"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={reducedMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.4, ease: softEase }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex]}
                alt={`${title} - نمای ${activeIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>

          <span className="fs-gallery__zoom-hint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="m20 20-3.5-3.5M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            برای بزرگ‌نمایی کلیک کنید
          </span>
        </div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            className="fs-zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="نمایش بزرگ تصویر"
          >
            <div className="fs-zoom__backdrop" onClick={closeZoom} />

            <div className="fs-zoom__stage">
              <div
                className="fs-zoom__canvas"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                  touchAction: "none",
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget && zoomLevel === 1) closeZoom();
                }}
              >
                <motion.div
                  className="fs-zoom__image"
                  animate={{
                    scale: zoomLevel,
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                >
                  <Image
                    src={images[activeIndex]}
                    alt={`${title} - بزرگ‌نمایی`}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    draggable={false}
                  />
                </motion.div>
              </div>

              {/* Thumbs */}
              <div className="fs-zoom__thumbs">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => {
                      setActiveIndex(i);
                      resetView();
                    }}
                    className={`fs-gallery__thumb ${i === activeIndex ? "is-active" : ""}`}
                    aria-label={`تصویر ${i + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="60px" className="object-cover" />
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="fs-zoom__controls">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
                  className="fs-zoom__btn"
                  aria-label="بزرگ‌تر"
                >
                  +
                </button>
                <span className="fs-zoom__level">
                  {toPersianDigits(Math.round(zoomLevel * 100))}٪
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                  className="fs-zoom__btn"
                  aria-label="کوچک‌تر"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="fs-zoom__btn fs-zoom__btn--ghost"
                  aria-label="بازنشانی"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={closeZoom}
                  className="fs-zoom__btn fs-zoom__btn--close"
                  aria-label="بستن"
                >
                  ✕
                </button>
              </div>

              {/* Prev / Next */}
              <button
                type="button"
                className="fs-zoom__nav fs-zoom__nav--prev"
                onClick={() => {
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                  resetView();
                }}
                aria-label="تصویر قبلی"
              >
                ‹
              </button>
              <button
                type="button"
                className="fs-zoom__nav fs-zoom__nav--next"
                onClick={() => {
                  setActiveIndex((i) => (i + 1) % images.length);
                  resetView();
                }}
                aria-label="تصویر بعدی"
              >
                ›
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   Main Page
   ============================================================ */

export default function RugDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "tabriz-lachak-toranj";
  const rug = rugsData[slug] ?? rugsData["tabriz-lachak-toranj"];

  const pageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [qty, setQty] = useState(1);

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const discountPercent = rug.oldPrice
    ? Math.round(((rug.oldPrice - rug.price) / rug.oldPrice) * 100)
    : 0;

  return (
    <section ref={pageRef} dir="rtl" className="fs-root min-h-screen overflow-clip">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Breadcrumb */}
      <nav className="fs-breadcrumb" aria-label="مسیر صفحه">
        <Link href="/" className="fs-breadcrumb__link">خانه</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="fs-breadcrumb__link">فروشگاه</Link>
        <span aria-hidden="true">/</span>
        <span className="fs-muted-gold">{rug.title}</span>
      </nav>

      <div className="relative">
        <div className="fs-rail" aria-hidden="true" />
        <motion.div
          className="fs-progress"
          aria-hidden="true"
          style={{ scaleY: progressScaleY }}
        />

        {/* Hero: gallery + info */}
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-12">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: softEase }}
          >
            <RugGallery images={rug.images} title={rug.title} />
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: softEase }}
            className="fs-info"
          >
            <p className="fs-muted-gold text-sm sm:text-base">{rug.origin}</p>

            <h1 className="fs-display mt-3 text-3xl leading-tight sm:text-5xl lg:text-6xl">
              {rug.title}
            </h1>

            <p className="fs-muted mt-5 text-base leading-8 sm:text-lg">
              {rug.description}
            </p>

            {/* Colors */}
            <div className="mt-6">
              <p className="fs-muted text-xs">رنگ‌بندی</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {rug.colors.map((c) => (
                  <div key={c.hex} className="flex items-center gap-2">
                    <span className="fs-swatch fs-swatch--lg" style={{ background: c.hex }} />
                    <span className="fs-muted text-xs">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="fs-price-box mt-7">
              <div className="flex flex-wrap items-end gap-3">
                <p className="fs-price-lg">
                  {formatPrice(rug.price)}
                  <span className="fs-price__unit"> تومان</span>
                </p>
                {rug.oldPrice && (
                  <p className="fs-price-old">{formatPrice(rug.oldPrice)}</p>
                )}
                {discountPercent > 0 && (
                  <span className="fs-discount">
                    {toPersianDigits(discountPercent)}٪ تخفیف
                  </span>
                )}
              </div>

              {/* Quantity + CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="fs-qty" role="group" aria-label="تعداد">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="کاهش"
                  >
                    −
                  </button>
                  <span aria-live="polite">{toPersianDigits(qty)}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(9, q + 1))}
                    aria-label="افزایش"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="fs-cta fs-cta--block"
                  disabled={!rug.inStock}
                >
                  {rug.inStock ? "افزودن به سبد خرید" : "ناموجود"}
                </button>
              </div>

              <ul className="fs-features mt-6">
                {rug.features.map((f) => (
                  <li key={f}>
                    <span className="fs-features__dot" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Specs */}
        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
          <div className="fs-specs">
            <h2 className="fs-display text-2xl sm:text-3xl">مشخصات فنی</h2>
            <dl className="fs-specs__grid">
              <div>
                <dt>ابعاد</dt>
                <dd>{rug.size}</dd>
              </div>
              <div>
                <dt>جنس</dt>
                <dd>{rug.material}</dd>
              </div>
              <div>
                <dt>رجشمار</dt>
                <dd>{rug.knot}</dd>
              </div>
              <div>
                <dt>وضعیت</dt>
                <dd>{rug.age}</dd>
              </div>
              <div>
                <dt>دسته‌بندی</dt>
                <dd>{rug.category}</dd>
              </div>
              <div>
                <dt>موجودی</dt>
                <dd>{rug.inStock ? "موجود در انبار" : "ناموجود"}</dd>
              </div>
            </dl>
          </div>

          <div className="fs-long-desc mt-12">
            <h2 className="fs-display text-2xl sm:text-3xl">درباره این فرش</h2>
            <p className="fs-muted mt-5 text-base leading-8 sm:text-lg sm:leading-9">
              {rug.longDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex min-h-[32svh] items-center justify-center px-6 text-center">
        <div>
          <div className="fs-mark mx-auto" aria-hidden="true">✦</div>
          <p className="fs-display mt-7 text-2xl sm:text-3xl lg:text-4xl">
            نیاز به مشاوره دارید؟
          </p>
          <p className="fs-muted mt-4 text-base sm:text-lg">
            کارشناسان ما آماده پاسخ‌گویی به سوالات شما هستند
          </p>
          <Link href="/shop" className="fs-cta mt-8 inline-block">
            بازگشت به فروشگاه
          </Link>
        </div>
      </footer>
    </section>
  );
}

/* ============================================================
   Styles
   ============================================================ */

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
    --fs-lamp-metal: #C9B47E;
    --fs-art-shadow: 0 1.8rem 5rem -1.8rem rgba(10, 14, 5, 0.75);

    background:
      radial-gradient(ellipse 130% 90% at 50% 0%, rgba(47, 59, 24, 0.9), transparent 72%),
      linear-gradient(180deg, var(--fs-background) 0%, var(--fs-background-deep) 100%);
    color: var(--fs-primary);
    font-family: var(--font-AKETAB), var(--font-cinzel), Georgia, serif;
    font-size: clamp(1.05rem, 1rem + 0.4vw, 1.4rem);
    line-height: 1.6;
  }

  .fs-display {
    font-family: var(--font-AKETAB), var(--font-cinzel), Georgia, serif;
    letter-spacing: 0.02em;
    color: var(--fs-primary);
  }

  .fs-muted { color: var(--fs-muted-foreground); }
  .fs-muted-gold { color: var(--fs-muted-gold); }

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

  /* === Breadcrumb === */
  .fs-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1.5rem 0;
    font-size: 0.9rem;
    color: var(--fs-muted-foreground);
  }
  .fs-breadcrumb__link {
    color: var(--fs-muted-gold);
    text-decoration: none;
    transition: color 0.3s ease;
  }
  .fs-breadcrumb__link:hover { color: var(--fs-gold); }

  /* === Gallery === */
  .fs-gallery {
    display: flex;
    flex-direction: column-reverse;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .fs-gallery {
      display: grid;
      grid-template-columns: 88px 1fr;
      align-items: start;
    }
  }

  .fs-gallery__thumbs {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  @media (min-width: 640px) {
    .fs-gallery__thumbs {
      flex-direction: column;
      overflow: visible;
    }
  }

  .fs-gallery__thumb {
    position: relative;
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    overflow: hidden;
    border: 1px solid var(--fs-border);
    border-radius: 0.5rem;
    background: #1a2010;
    cursor: pointer;
    transition: border-color 0.3s ease, transform 0.3s ease;
    padding: 0;
  }

  .fs-gallery__thumb:hover { border-color: var(--fs-gold-soft); }
  .fs-gallery__thumb.is-active {
    border-color: var(--fs-gold);
    box-shadow: 0 0 0 1px var(--fs-gold);
  }

  .fs-gallery__main {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: rgba(26, 32, 16, 0.6);
    cursor: zoom-in;
    box-shadow: var(--fs-art-shadow);
  }

  @media (min-width: 640px) {
    .fs-gallery__main { aspect-ratio: 4 / 5; }
  }

  .fs-gallery__zoom-hint {
    position: absolute;
    bottom: 1rem;
    inset-inline-start: 1rem;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.9rem;
    font-size: 0.75rem;
    color: var(--fs-primary);
    background: rgba(35, 44, 18, 0.75);
    border: 1px solid var(--fs-border);
    border-radius: 999px;
    backdrop-filter: blur(8px);
  }

  /* === Zoom modal === */
  .fs-zoom {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .fs-zoom__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(10, 14, 5, 0.92);
    backdrop-filter: blur(6px);
  }

  .fs-zoom__stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .fs-zoom__canvas {
    position: relative;
    width: min(92vw, 1100px);
    height: min(80svh, 900px);
    overflow: hidden;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: #0d1108;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fs-zoom__image {
    position: relative;
    width: 100%;
    height: 100%;
    transform-origin: center;
    will-change: transform;
  }

  .fs-zoom__thumbs {
    position: absolute;
    bottom: 1.25rem;
    inset-inline-start: 50%;
    translate: -50% 0;
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--fs-border);
    border-radius: 0.75rem;
    background: rgba(35, 44, 18, 0.85);
    backdrop-filter: blur(8px);
    max-width: calc(100vw - 2rem);
    overflow-x: auto;
  }

  .fs-zoom__controls {
    position: absolute;
    top: 1.25rem;
    inset-inline-end: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem;
    border: 1px solid var(--fs-border);
    border-radius: 999px;
    background: rgba(35, 44, 18, 0.85);
    backdrop-filter: blur(8px);
  }

  .fs-zoom__btn {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    font-size: 1.1rem;
    color: var(--fs-primary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;
    font-family: inherit;
  }

  .fs-zoom__btn:hover {
    background: var(--fs-gold);
    color: var(--fs-background-deep);
  }

  .fs-zoom__btn--close { color: #ff9a9a; }
  .fs-zoom__btn--close:hover {
    background: rgba(255, 100, 100, 0.9);
    color: #fff;
  }

  .fs-zoom__level {
    min-width: 3.5rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--fs-muted-gold);
  }

  .fs-zoom__nav {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    font-size: 2rem;
    line-height: 1;
    color: var(--fs-primary);
    background: rgba(35, 44, 18, 0.75);
    border: 1px solid var(--fs-border);
    border-radius: 999px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background 0.3s ease, color 0.3s ease;
    font-family: inherit;
  }

  .fs-zoom__nav:hover {
    background: var(--fs-gold);
    color: var(--fs-background-deep);
  }

  .fs-zoom__nav--prev { inset-inline-start: 1.25rem; }
  .fs-zoom__nav--next { inset-inline-end: 1.25rem; }

  /* === Info panel === */
  .fs-info { padding-top: 0.5rem; }

  .fs-swatch {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1px solid rgba(232, 214, 163, 0.4);
  }
  .fs-swatch--lg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .fs-price-box {
    padding: 1.5rem;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: rgba(35, 44, 18, 0.55);
    backdrop-filter: blur(8px);
  }

  .fs-price-lg {
    font-family: var(--font-AKETAB), Georgia, serif;
    font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
    color: var(--fs-gold);
    white-space: nowrap;
  }

  .fs-price__unit {
    font-size: 0.9rem;
    color: var(--fs-muted-gold);
  }

  .fs-price-old {
    font-size: 1rem;
    color: var(--fs-muted-foreground);
    text-decoration: line-through;
    opacity: 0.7;
  }

  .fs-discount {
    padding: 0.25rem 0.7rem;
    font-size: 0.85rem;
    color: var(--fs-background-deep);
    background: var(--fs-gold);
    border-radius: 999px;
  }

  .fs-qty {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem;
    border: 1px solid var(--fs-border);
    border-radius: 999px;
    background: rgba(26, 32, 16, 0.6);
  }

  .fs-qty button {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    font-size: 1.1rem;
    color: var(--fs-primary);
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;
    font-family: inherit;
  }

  .fs-qty button:hover {
    background: var(--fs-gold);
    color: var(--fs-background-deep);
  }

  .fs-qty span {
    min-width: 2rem;
    text-align: center;
    font-size: 1rem;
  }

  .fs-cta {
    padding: 0.85rem 2rem;
    font-family: inherit;
    font-size: 1rem;
    color: var(--fs-background-deep);
    background: var(--fs-gold);
    border: 1px solid var(--fs-gold);
    border-radius: 999px;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  }

  .fs-cta:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem -1rem rgba(232, 214, 163, 0.7);
    background: #f0e3bc;
  }

  .fs-cta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fs-cta--block {
    flex: 1;
    min-width: 12rem;
  }

  .fs-features {
    display: grid;
    gap: 0.6rem;
    margin-top: 1.5rem;
    list-style: none;
    padding: 0;
  }

  .fs-features li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
    color: var(--fs-muted-foreground);
  }

  .fs-features__dot {
    width: 6px;
    height: 6px;
    background: var(--fs-gold);
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 8px rgba(232, 214, 163, 0.6);
  }

  /* === Specs === */
  .fs-specs {
    padding: 2rem 1.5rem;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: rgba(35, 44, 18, 0.45);
  }

  .fs-specs__grid {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .fs-specs__grid > div {
    padding: 0.9rem 1rem;
    border: 1px solid var(--fs-border);
    border-radius: 0.75rem;
    background: rgba(26, 32, 16, 0.5);
  }

  .fs-specs__grid dt {
    font-size: 0.8rem;
    color: var(--fs-muted-gold);
    margin-bottom: 0.35rem;
  }

  .fs-specs__grid dd {
    font-size: 1rem;
    color: var(--fs-primary);
    margin: 0;
  }

  .fs-long-desc {
    padding: 2rem 1.5rem;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: rgba(35, 44, 18, 0.35);
  }

  @media (max-width: 640px) {
    .fs-rail { opacity: 0.5; }
    .fs-breadcrumb { font-size: 0.8rem; padding: 1rem 1rem 0; }
    .fs-price-box { padding: 1.1rem; }
    .fs-specs { padding: 1.5rem 1rem; }
    .fs-long-desc { padding: 1.5rem 1rem; }
    .fs-zoom__nav { width: 2.4rem; height: 2.4rem; font-size: 1.5rem; }
    .fs-zoom__controls { top: 0.75rem; inset-inline-end: 0.75rem; }
    .fs-zoom__thumbs { bottom: 0.75rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fs-progress { transition: none; }
  }
`;
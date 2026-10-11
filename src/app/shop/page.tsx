"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  cubicBezier,
} from "framer-motion";

/* ============================================================
   Types & Data
   ============================================================ */

type Carpet = {
  id: string;
  slug: string;
  image: string;
  title: string;
  origin: string;
  description: string;
  price: number;
  size: string;
  knot: string;
  colors: string[];
  category: "تبریز" | "کاشان" | "هریس" | "نائین";
  inStock: boolean;
};

const carpets: Carpet[] = [
  {
    id: "1",
    slug: "tabriz-lachak-toranj",
    image: "/assets/carpet-tabriz.jpg",
    title: "هنرِ ماندگار",
    origin: "تبریز — نقش لچک و ترنج",
    description:
      "هر نقش، روایتگر بخشی از تاریخ و فرهنگ ایران است؛ فرش‌هایی که با دقت و عشق بافته شده‌اند.",
    price: 48500000,
    size: "۳۰۰ × ۲۰۰ سانتی‌متر",
    knot: "۵۰ رج",
    colors: ["#8B1A1A", "#2F3B18", "#E8D6A3", "#3A2A1A"],
    category: "تبریز",
    inStock: true,
  },
  {
    id: "2",
    slug: "kashan-gol-o-boteh",
    image: "/assets/carpet-kashan.jpg",
    title: "روایتِ گلستان",
    origin: "کاشان — بافت ظریف گل‌وبوته",
    description:
      "باغی آرام در تار و پود؛ جایی که رنگ‌های پخته و گل‌های خیال‌انگیز، شکوه هنر کاشان را حفظ می‌کنند.",
    price: 62000000,
    size: "۳۵۰ × ۲۵۰ سانتی‌متر",
    knot: "۶۰ رج",
    colors: ["#6B2C4A", "#2F3B18", "#E8D6A3", "#4A6B3A"],
    category: "کاشان",
    inStock: true,
  },
  {
    id: "3",
    slug: "heriz-geometric",
    image: "/assets/carpet-heriz.jpg",
    title: "شکوهِ هندسه",
    origin: "هریس — ترنج هندسی",
    description:
      "خطوط استوار و رنگ‌های خاکی، قصه کوهستان را بازمی‌گویند؛ اثری اصیل که با گذر زمان وقار می‌گیرد.",
    price: 39000000,
    size: "۲۸۰ × ۱۹۰ سانتی‌متر",
    knot: "۴۰ رج",
    colors: ["#A0522D", "#2F3B18", "#E8D6A3", "#8B7355"],
    category: "هریس",
    inStock: true,
  },
  {
    id: "4",
    slug: "nain-afshan",
    image: "/assets/carpet-nain.jpg",
    title: "آرامشِ نیلی",
    origin: "نائین — نقش افشان",
    description:
      "ظرافتی روشن بر زمینه‌ای نیلی؛ هزاران گره کوچک، تصویری آرام از مهارت دست‌های هنرمند ایرانی ساخته‌اند.",
    price: 55000000,
    size: "۳۲۰ × ۲۲۰ سانتی‌متر",
    knot: "۵۵ رج",
    colors: ["#1A2A4A", "#2F3B18", "#E8D6A3", "#C9B47E"],
    category: "نائین",
    inStock: false,
  },
];

const categories = ["همه", "تبریز", "کاشان", "هریس", "نائین"] as const;
const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
] as const;

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
   Product Card
   ============================================================ */

function ProductCard({ carpet, index }: { carpet: Carpet; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reducedMotion = useReducedMotion();

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
            <Image
              src={carpet.image}
              alt={`فرش دستباف ${carpet.origin}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="fs-card__veil" aria-hidden="true" />

            {!carpet.inStock ? (
              <span className="fs-badge fs-badge--out">ناموجود</span>
            ) : (
              <span className="fs-badge fs-badge--in">موجود</span>
            )}
          </div>

     <div className="fs-card__body">
  {/* اسم فرش */}
  <h3 className="fs-display text-xl sm:text-2xl lg:text-3xl">
    {carpet.title}
  </h3>

  {/* پالت رنگی + قیمت */}
  <div className="mt-4 flex items-center justify-between gap-4">
    <div className="flex flex-wrap gap-2">
      {carpet.colors.map((c) => (
        <span
          key={c}
          className="fs-swatch"
          style={{ background: c }}
          aria-hidden="true"
        />
      ))}
    </div>

    <p className="fs-price">
      {formatPrice(carpet.price)}
      <span className="fs-price__unit"> تومان</span>
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
   Filter Bar  (motion + new background + big text)
   ============================================================ */

function FilterBar({
  activeCategory,
  setActiveCategory,
  onlyAvailable,
  setOnlyAvailable,
  sortBy,
  setSortBy,
}: {
  activeCategory: (typeof categories)[number];
  setActiveCategory: (c: (typeof categories)[number]) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  sortBy: (typeof sortOptions)[number]["value"];
  setSortBy: (v: (typeof sortOptions)[number]["value"]) => void;
}) {
  const reducedMotion = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: softEase,
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: softEase } },
  };

  return (
    <motion.div
      className="fs-filter-bar"
      variants={container}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Background image + olive overlay */}
      <div className="fs-filter-bar__bg" aria-hidden="true">
        <Image
          src="/assets/navunder.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <span className="fs-filter-bar__veil" />
      </div>

      {/* Content */}
      <div className="fs-filter-bar__content">
        <div className="flex flex-wrap items-center gap-2.5">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              type="button"
              variants={item}
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              onClick={() => setActiveCategory(cat)}
              className={`fs-chip ${activeCategory === cat ? "is-active" : ""}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            variants={item}
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            onClick={() => setOnlyAvailable((v) => !v)}
            className={`fs-chip ${onlyAvailable ? "is-active" : ""}`}        >
            فقط موجود
          </motion.button>

          <motion.select
            variants={item}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="fs-select"
            aria-label="ترتیب نمایش"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </motion.select>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Shop Page
   ============================================================ */

export default function ShopPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("همه");
  const [sortBy, setSortBy] =
    useState<(typeof sortOptions)[number]["value"]>("newest");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const visibleCarpets = useMemo(() => {
    let list = carpets.slice();
    if (activeCategory !== "همه") {
      list = list.filter((c) => c.category === activeCategory);
    }
    if (onlyAvailable) {
      list = list.filter((c) => c.inStock);
    }
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [activeCategory, sortBy, onlyAvailable]);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="fs-root min-h-screen overflow-clip"
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ===== Header ===== */}
      <header className="fs-intro flex min-h-[52svh] flex-col items-center justify-center px-6 text-center">
        <p className="fs-muted-gold text-[30px]">گالری فرش دستباف</p>
        <h1 className="text-[40px] sm:text-[56px] lg:text-[72px]">
          مجموعه‌ای از هنر ایرانی
        </h1>
       

     
      </header>

      {/* ===== Filters + Grid ===== */}
      <div className="relative">
        <div className="fs-rail" aria-hidden="true" />
        <motion.div
          className="fs-progress"
          aria-hidden="true"
          style={{ scaleY: progressScaleY }}
        />

        <div className="mx-auto max-w-6xl px-6 pb-8">
          <FilterBar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onlyAvailable={onlyAvailable}
            setOnlyAvailable={setOnlyAvailable}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <p className="fs-muted mt-4 text-base sm:text-lg">
            {toPersianDigits(visibleCarpets.length)} فرش یافت شد
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-24">
          <AnimatePresence mode="popLayout">
            {visibleCarpets.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fs-muted py-20 text-center text-lg"
              >
                فرشی با این فیلترها یافت نشد.
              </motion.p>
            ) : (
              <div
                key={activeCategory + sortBy + String(onlyAvailable)}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
              >
                {visibleCarpets.map((carpet, i) => (
                  <ProductCard key={carpet.id} carpet={carpet} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Footer CTA ===== */}
      <footer className="flex min-h-[36svh] items-center justify-center px-6 text-center">
        <div>
          <div className="fs-mark mx-auto" aria-hidden="true">
            ✦
          </div>
          <p className="fs-display mt-7 text-3xl sm:text-4xl lg:text-5xl">
            مشاوره تخصصی خرید
          </p>
          <p className="fs-muted mt-5 text-base sm:text-xl">
            برای انتخاب فرشی متناسب با فضای شما، با ما در تماس باشید
          </p>
          <button type="button" className="fs-cta mt-8">
            تماس با کارشناسان
          </button>
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

  .fs-scroll-line {
    width: 1px;
    height: 3rem;
    background: var(--fs-gold);
    transform-origin: top;
    animation: fs-scroll 2.4s ease-in-out infinite;
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

  /* ===== Filter Bar (new) ===== */
  .fs-filter-bar {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--fs-border);
    border-radius: 1rem;
    background: var(--fs-olive-deep);
    backdrop-filter: blur(8px);
    isolation: isolate;
  }

  .fs-filter-bar__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .fs-filter-bar__veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(35, 44, 18, 0.82), rgba(35, 44, 18, 0.92)),
      radial-gradient(ellipse at 50% 0%, rgba(47, 59, 24, 0.6), transparent 70%);
    pointer-events: none;
  }

  .fs-filter-bar__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }

.fs-chip {
  width: auto;
  min-height: 52px;

  padding: 0 24px;

  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;

  color: var(--fs-primary);
  background: rgba(47, 59, 24, 0.92);

  border: 1px solid var(--fs-gold);
  border-radius: 999px;

  cursor: pointer;
  white-space: nowrap;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.8);

  transition:
    color 0.3s ease,
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

  .fs-chip:hover {
    color: var(--fs-primary);
    background: rgba(47, 59, 24, 1);
    border-color: var(--fs-gold);
    box-shadow: 0 6px 18px -6px rgba(232, 214, 163, 0.55);
  }

  .fs-chip.is-active {
    color: var(--fs-olive-deep);
    background: var(--fs-gold);
    border-color: var(--fs-gold);
    box-shadow: 0 6px 20px -6px rgba(232, 214, 163, 0.8);
  }

  .fs-select {
    padding: 0.6rem 1.15rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--fs-primary);
    background: rgba(47, 59, 24, 0.92);
    border: 1px solid var(--fs-gold);
    border-radius: 999px;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.8);
  }

  .fs-select:focus {
    outline: 2px solid var(--fs-gold);
    outline-offset: 2px;
  }

  .fs-select option {
    background: var(--fs-olive-deep);
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
    transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
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
    background: linear-gradient(
      90deg,
      transparent,
      var(--fs-gold-soft) 20%,
      var(--fs-gold) 50%,
      var(--fs-gold-soft) 80%,
      transparent
    );
    transform: scaleX(0);
    transform-origin: center;
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
    white-space: nowrap;
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
    border: 1px solid var(--fs-gold);
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  }

  .fs-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem -1rem rgba(232, 214, 163, 0.7);
    background: #f0e3bc;
  }

  @keyframes fs-scroll {
    0%, 100% { transform: scaleY(0.2); opacity: 0.35; }
    50% { transform: scaleY(1); opacity: 1; }
  }

@media (max-width: 640px) {
  .fs-rail {
    opacity: 0.5;
  }

  .fs-filter-bar {
    padding: 1rem;
  }

  .fs-chip {
    min-height: 48px;
    padding: 0 18px;
    font-size: 19px;
  }
}

  @media (prefers-reduced-motion: reduce) {
    .fs-scroll-line { animation: none; }
    .fs-progress { transition: none; }
  }
`;
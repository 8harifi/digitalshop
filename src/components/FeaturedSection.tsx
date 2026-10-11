"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  cubicBezier,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";

type CarpetStory = {
  image: string;
  title: string;
  origin: string;
  description: string;
};

const carpets: CarpetStory[] = [
  {
    image: "/assets/carpet-tabriz.jpg",
    title: "هنرِ ماندگار",
    origin: "تبریز — نقش لچک و ترنج",
    description:
      "هر نقش، روایتگر بخشی از تاریخ و فرهنگ ایران است؛ فرش‌هایی که با دقت و عشق بافته شده‌اند تا سال‌ها بخشی از زندگی شما باشند.",
  },
  {
    image: "/assets/carpet-kashan.jpg",
    title: "روایتِ گلستان",
    origin: "کاشان — بافت ظریف گل‌وبوته",
    description:
      "باغی آرام در تار و پود؛ جایی که رنگ‌های پخته و گل‌های خیال‌انگیز، شکوه هنر کاشان را برای نسل‌ها حفظ می‌کنند.",
  },
  {
    image: "/assets/carpet-heriz.jpg",
    title: "شکوهِ هندسه",
    origin: "هریس — ترنج هندسی",
    description:
      "خطوط استوار و رنگ‌های خاکی، قصه کوهستان را بازمی‌گویند؛ اثری اصیل که با گذر زمان، وقار بیشتری پیدا می‌کند.",
  },
  {
    image: "/assets/carpet-nain.jpg",
    title: "آرامشِ نیلی",
    origin: "نائین — نقش افشان",
    description:
      "ظرافتی روشن بر زمینه‌ای نیلی؛ هزاران گره کوچک در کنار هم، تصویری آرام و موزون از مهارت دست‌های هنرمند ایرانی ساخته‌اند.",
  },
];

const DROP_POSITIONS = [26, 37.5, 49, 60, 71, 82.5, 94];

const softEase = cubicBezier(0.4, 0, 0.2, 1);
const verySoftEase = cubicBezier(0.25, 0.1, 0.25, 1);

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function AnimatedTitle({ text, active }: { text: string; active: boolean }) {
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (reducedMotion) {
    return <span className="inline-block">{text}</span>;
  }

  return (
    <motion.span
      className="inline-block"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          variants={wordVariants}
          className="inline-block"
          style={{ marginLeft: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GalleryLamp({ lightOpacity }: { lightOpacity?: MotionValue<number> | undefined }) {
  const lit = lightOpacity ? { opacity: lightOpacity } : { opacity: 1 };

  return (
    <div className="fs-lamp" aria-hidden="true">
      <motion.div className="fs-lamp__halo" style={lit} />

      <svg viewBox="0 0 120 160" className="fs-lamp__fixture">
        <path d="M60 0v48" className="fs-lamp__line" />
        <path
          d="M60 4c3 0 4.5 2 4.5 4.5S62 13 60 13s-4.5-2-4.5-4.5S57 4 60 4Z"
          className="fs-lamp__cap"
        />
        <path
          d="M60 22c3 0 4.5 2 4.5 4.5S62 31 60 31s-4.5-2-4.5-4.5S57 22 60 22Z"
          className="fs-lamp__cap"
        />
        <path d="M52 54c2-4 3-6 8-6s6 2 8 6Z" className="fs-lamp__cap" />
        <path d="M48 54h24l-3 6H51Z" className="fs-lamp__cap" />

        <motion.path d="M20 100a40 40 0 0 1 80 0Z" className="fs-lamp__dome" style={lit} />
        <motion.path d="M20 100a40 40 0 0 1 80 0Z" className="fs-lamp__dome-lit" style={lit} />

        {[-30, -15, 0, 15, 30].map((angle) => (
          <path
            key={angle}
            d="M60 60v40"
            className="fs-lamp__filigree"
            transform={`rotate(${angle} 60 100)`}
          />
        ))}

        <path d="M26 88a36 36 0 0 1 68 0" className="fs-lamp__filigree" />
        <path d="M34 74a30 30 0 0 1 52 0" className="fs-lamp__filigree" />

        {[38, 60, 82].map((cx, i) => (
          <circle key={cx} cx={cx} cy={i === 1 ? 76 : 87} r="4.2" className="fs-lamp__petal" />
        ))}

        {[48, 71].map((cx) => (
          <circle key={cx} cx={cx} cy={93} r="2.6" className="fs-lamp__petal" />
        ))}

        <path d="M18 100h84v5H18Z" className="fs-lamp__cap" />

        {DROP_POSITIONS.map((x) => (
          <g key={x}>
            <path d={`M${x} 105v4`} className="fs-lamp__line" />
            <path d={`M${x - 3.6} 109h7.2l-1.4 5h-4.4Z`} className="fs-lamp__cap" />
            <path
              d={`M${x - 5.6} 140c.6-11 1.6-18 5.6-26 4 8 5 15 5.6 26Z`}
              className="fs-lamp__drop"
            />
            <motion.path
              d={`M${x - 5.6} 140c.6-11 1.6-18 5.6-26 4 8 5 15 5.6 26Z`}
              className="fs-lamp__drop-lit"
              style={lit}
            />
          </g>
        ))}

        <motion.ellipse cx="60" cy="102" rx="34" ry="9" className="fs-lamp__light" style={lit} />
      </svg>
    </div>
  );
}

function CarpetChapter({ carpet, index }: { carpet: CarpetStory; index: number }) {
  const chapterRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  /* ✅ useInView روی wrapper متن — تضمین می‌کنه متن دیده بشه */
  const textInView = useInView(textRef, { once: true, amount: 0.1 });

  const [titleActive, setTitleActive] = useState(false);

  /* ✅ فعال‌سازی از inView */
  useEffect(() => {
    if (textInView && !titleActive) {
      const t = setTimeout(() => setTitleActive(true), 200);
      return () => clearTimeout(t);
    }
  }, [textInView, titleActive]);

  /* ✅ fallback: اگه inView کار نکرد، از scroll فعال کن */
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.05 && !titleActive) {
        setTitleActive(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, titleActive]);

  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, -60], { ease: softEase });

  /* ✅ چراغ: اول خاموش، با اسکرول روشن */
  const lightOn = useTransform(scrollYProgress, [0, 0.03, 0.1], [0, 0.4, 1], { ease: softEase });
  const lampBody = useTransform(scrollYProgress, [0, 0.94, 1], [1, 1, 0.7], { ease: verySoftEase });
  const lampScale = useTransform(scrollYProgress, [0, 0.08, 1], [0.99, 1, 1], { ease: softEase });

  const coneOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.1, 0.18, 0.92, 1],
    [0, 0, 0.5, 0.92, 0.92, 0.35],
    { ease: softEase },
  );
  const coneSpread = useTransform(scrollYProgress, [0.05, 0.2], [0.55, 1], { ease: verySoftEase });

  const poolOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.1, 0.18, 0.92, 1],
    [0, 0, 0.5, 0.95, 0.95, 0.3],
    { ease: softEase },
  );
  const groundOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.1, 0.18, 0.92, 1],
    [0, 0, 0.5, 0.9, 0.9, 0.25],
    { ease: softEase },
  );
  const groundSpread = useTransform(scrollYProgress, [0.05, 0.22], [0.6, 1], {
    ease: verySoftEase,
  });

  const brightness = useTransform(scrollYProgress, [0, 0.08, 0.25], [0.8, 0.98, 1.04], {
    ease: softEase,
  });
  const saturate = useTransform(scrollYProgress, [0, 0.08, 0.25], [0.84, 1, 1.05], {
    ease: softEase,
  });
  const contrast = useTransform(scrollYProgress, [0, 0.08, 0.25], [0.97, 1, 1.03], {
    ease: softEase,
  });

  const carpetFilter = useMotionTemplate`
    brightness(${brightness})
    saturate(${saturate})
    contrast(${contrast})
  `;

  const carpetOpacity = useTransform(scrollYProgress, [0, 0.03, 0.94, 1], [0.96, 1, 1, 0.5], {
    ease: softEase,
  });
  const carpetY = useTransform(scrollYProgress, [0, 0.25, 0.9, 1], [12, 0, 0, -14], {
    ease: softEase,
  });
  const carpetScale = useTransform(scrollYProgress, [0, 0.25, 0.9, 1], [0.99, 1, 1, 0.992], {
    ease: softEase,
  });

  /* ✅ متن از همان ابتدا visible، هرگز صفر نمی‌شه */
  const textOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0.85, 1, 1, 0.7], {
    ease: softEase,
  });
  const textY = useTransform(scrollYProgress, [0, 0.2, 1], [10, 0, -6], { ease: softEase });

  return (
    <article
      ref={chapterRef}
      className="relative h-[145svh]"
      aria-labelledby={`carpet-${index}-title`}
    >

  
     <div className="sticky top-0 flex h-svh flex-col items-center overflow-hidden px-5 py-4 sm:px-10 sm:py-6 lg:py-7">

  

  <motion.div
    className="fs-cone"
    aria-hidden="true"
    style={reducedMotion ? {} : { opacity: coneOpacity, scaleY: coneSpread, y: bgParallaxY }}
  />

        <motion.div
          className="relative z-20 h-[14svh] max-h-36 min-h-20 w-32 shrink-0 sm:w-40"
          style={reducedMotion ? {} : { opacity: lampBody, scale: lampScale }}
        >
          <GalleryLamp lightOpacity={reducedMotion ? undefined : lightOn} />
        </motion.div>

        <motion.figure
  className="relative z-10 flex h-[53svh] shrink-0 items-center justify-center"       
     style={reducedMotion ? {} : { opacity: carpetOpacity, y: carpetY, scale: carpetScale }}
        >
          <div className="fs-artwork">
            <motion.div
              className="fs-artwork__ground"
              aria-hidden="true"
              style={reducedMotion ? {} : { opacity: groundOpacity, scaleX: groundSpread }}
            />
            <motion.div
              className="relative h-full w-full"
              style={reducedMotion ? {} : { filter: carpetFilter }}
            >
              <Image
                src={carpet.image}
                alt={`فرش دستباف ${carpet.origin}`}
                width={1024}
                height={1408}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 640px) 84vw, min(53svh, 39rem)"
                className="h-full w-full object-contain"
              />
            </motion.div>
            <motion.span
              className="fs-artwork__pool"
              aria-hidden="true"
              style={reducedMotion ? {} : { opacity: poolOpacity }}
            />
          </div>
        </motion.figure>

     <motion.div
            ref={textRef}
            className="relative z-20 mx-auto w-full max-w-2xl shrink-0 pt-0 pb-1 text-center sm:pt-1"
            style={reducedMotion ? {} : { opacity: textOpacity, y: textY }}
          >
          <p className="fs-muted-gold mb-2 text-sm sm:text-base lg:text-lg">
            {String(index + 1).padStart(2, "۰")} / {carpet.origin}
          </p>

          <h2 id={`carpet-${index}-title`} className="fs-display text-3xl sm:text-4xl lg:text-7xl">
            <AnimatedTitle text={carpet.title} active={titleActive} />
          </h2>
         <p className="fs-muted mx-auto mt-0 max-w-3xl text-[20px] leading-9 sm:text-[22px] sm:leading-10 lg:text-[30px] lg:leading-[2.2]">
  {carpet.description}
</p>
        </motion.div>
      </div>
    </article>
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
    --fs-lamp-metal: #C9B47E;
    --fs-lamp-lit: #E8D6A3;
    --fs-lamp-glow: rgba(232, 214, 163, 0.22);
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

   .fs-lamp {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.fs-lamp__halo {
  position: absolute;
  z-index: 0;

  left: 50%;
  top: 55%;

  width: 260%;
  height: 65svh;

  transform: translateX(-50%);

  pointer-events: none;

  background: radial-gradient(
    ellipse 42% 58% at 50% 0%,
    rgba(232, 214, 163, 0.55) 0%,
    rgba(232, 214, 163, 0.38) 18%,
    rgba(147, 23, 158, 0.22) 38%,
    rgba(232, 214, 163, 0.10) 58%,
    transparent 82%
  );

  filter: blur(2rem);
  mix-blend-mode: screen;

  opacity: 0;
}



.fs-cone {
  position: absolute;
  top: 10svh;
  left: 50%;
  z-index: 0;
  width: min(125%, 82rem);
  height: 88svh;
  translate: -50% 0;
  transform-origin: 50% 0;
  pointer-events: none;

  clip-path: polygon(43% 0%, 57% 0%, 94% 100%, 6% 100%);

  background: linear-gradient(
    to bottom,
    rgba(182, 163, 232, 0.22) 0%,
    rgba(232, 214, 163, 0.14) 30%,
    rgba(232, 214, 163, 0.06) 62%,
    transparent 96%
  );

  filter: blur(2.4rem);
  opacity: 0;
}
.fs-lamp__fixture {
  position: relative;
  z-index: 2;

  width: 100%;
  height: 100%;

  color: var(--fs-lamp-metal);
  overflow: visible;
}

  .fs-lamp__line, .fs-lamp__filigree { fill: none; stroke: currentColor; stroke-width: 1.5; }
  .fs-lamp__filigree { opacity: 0.5; stroke-width: 1.1; }
  .fs-lamp__dome { fill: rgba(80, 63, 177, 0.18); stroke: var(--fs-lamp-metal); stroke-width: 2; opacity: 0; }
  .fs-lamp__dome-lit { fill: rgba(27, 117, 139, 0.55); stroke: var(--fs-lamp-metal); stroke-width: 2; opacity: 0; }
  .fs-lamp__petal { fill: rgba(200, 160, 90, 0.55); stroke: var(--fs-lamp-metal); stroke-width: 0.7; }
  .fs-lamp__drop { fill: rgba(232, 214, 163, 0.22); stroke: var(--fs-lamp-metal); stroke-width: 1.1; opacity: 0; }
  .fs-lamp__drop-lit { fill: rgba(232, 163, 163, 0.62); stroke: var(--fs-lamp-metal); stroke-width: 1.1; opacity: 0; }
  .fs-lamp__cap { fill: var(--fs-lamp-metal); }
  .fs-lamp__light {
    fill: var(--fs-lamp-lit);
    filter: blur(0.55rem) drop-shadow(0 0.3rem 1.6rem rgba(232, 214, 163, 0.55));
    opacity: 0;
  }

  .fs-artwork {
    position: relative;
    height: min(53svh, 39rem);
    width: auto;
    aspect-ratio: 1024 / 1408;
    filter: drop-shadow(var(--fs-art-shadow));
  }

  .fs-artwork__ground {
    position: absolute;
    left: 50%;
    bottom: -12%;
    width: 145%;
    height: 38%;
    translate: -50% 0;
    pointer-events: none;
    opacity: 0;
    transform-origin: 50% 50%;
    background: radial-gradient(ellipse 55% 50% at 50% 50%, rgba(232, 214, 163, 0.42) 0%, rgba(232, 214, 163, 0.2) 38%, rgba(232, 214, 163, 0.08) 62%, transparent 82%);
    filter: blur(2rem);
    mix-blend-mode: plus-lighter;
  }

  .fs-artwork__pool {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(ellipse 78% 62% at 50% 28%, rgba(232, 214, 163, 0.3) 0%, rgba(232, 214, 163, 0.14) 45%, rgba(232, 214, 163, 0.05) 65%, transparent 82%);
    filter: blur(0.6rem);
    mix-blend-mode: soft-light;
  }

  @keyframes fs-scroll {
    0%, 100% { transform: scaleY(0.2); opacity: 0.35; }
    50% { transform: scaleY(1); opacity: 1; }
  }

 @media (max-width: 640px) {
  .fs-artwork {
    height: min(45svh, 31rem);
    max-width: 84vw;
  }

  .fs-cone {
    width: 160%;
    filter: blur(2rem);
  }

  .fs-artwork__ground {
    width: 155%;
    height: 32%;
    filter: blur(1.6rem);
  }

  .fs-lamp__light {
    filter: blur(0.4rem) drop-shadow(0 0.25rem 1.2rem rgba(232, 214, 163, 0.5));
  }

  .fs-rail {
    opacity: 0.5;
  }
}

  @media (prefers-reduced-motion: reduce) {
    .fs-scroll-line { animation: none; }
    .fs-progress { transition: none; }
  }

  .fs-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  padding: 0.95rem 2.4rem;

  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 600;

  color: var(--fs-background-deep);
  background: var(--fs-gold);

  border: 1px solid var(--fs-gold);
  border-radius: 999px;

  text-decoration: none;
  cursor: pointer;

  box-shadow: 0 6px 22px -8px rgba(232, 214, 163, 0.75);

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.fs-cta:hover {
  transform: translateY(-2px);
  background: #f0e3bc;
  box-shadow: 0 1rem 2.2rem -1rem rgba(232, 214, 163, 0.85);
}

.fs-cta:active {
  transform: translateY(0);
}
`;

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: galleryProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progressScaleY = useTransform(galleryProgress, [0, 1], [0, 1]);

  return (
    <section ref={sectionRef} dir="rtl" className="fs-root min-h-screen overflow-clip">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className="fs-intro flex min-h-[72svh] flex-col items-center justify-center px-6 text-center">
        <h2 className="fs-display mt-5 text-4xl leading-tight sm:text-6xl lg:text-8xl">
          روایتِ تار و پود
        </h2>
     
        <div className="mt-14 flex flex-col items-center gap-3" aria-hidden="true">
          <span className="fs-muted-gold text-lg sm:text-2xl">برای تماشا حرکت کنید</span>
          <span className="fs-scroll-line" />
        </div>
      </header>

      <div aria-label="گالری فرش‌های ایرانی" className="relative">
        <div className="fs-rail" aria-hidden="true" />
        <motion.div className="fs-progress" aria-hidden="true" style={{ scaleY: progressScaleY }} />

        {carpets.map((carpet, index) => (
          <CarpetChapter key={carpet.title} carpet={carpet} index={index} />
        ))}
      </div>

      <footer className="flex min-h-[42svh] items-center justify-center px-6 text-center">
  <div>
    <div className="fs-mark mx-auto" aria-hidden="true">
      ✦
    </div>
  
    <p className="fs-muted mt-5 text-base sm:text-2xl">دست‌بافته ایران، ماندگار در خانه شما</p>

    {/* ✅ دکمه‌ی مشاهده فروشگاه */}
    <Link href="/shop" className="fs-cta mt-10  text-[20px] inline-flex">
      دیدن فرش‌های بیشتر
    </Link>
  </div>
</footer>
    </section>
  );
}
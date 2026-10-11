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
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

type CarpetStory = {
  image: string;
  titleKey: string;
  originKey: string;
  descKey: string;
};

const carpets: CarpetStory[] = [
  {
    image: "/assets/carpet-tabriz.jpg",
    titleKey: "t1",
    originKey: "o1",
    descKey: "d1",
  },
  {
    image: "/assets/carpet-kashan.jpg",
    titleKey: "t2",
    originKey: "o2",
    descKey: "d2",
  },
];

const DROP_POSITIONS = [26, 37.5, 49, 60, 71, 82.5, 94];
const softEase = cubicBezier(0.4, 0, 0.2, 1);

function AnimatedTitle({ text, active }: { text: string; active: boolean }) {
  const words = text.split(" ");
  return (
    <motion.span initial="hidden" animate={active ? "visible" : "hidden"}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GalleryLamp({ lightOpacity }: { lightOpacity?: MotionValue<number> }) {
  const lit = lightOpacity ? { opacity: lightOpacity } : { opacity: 1 };
  return (
    <div className="fs-lamp" aria-hidden="true">
      <motion.div className="fs-lamp__halo" style={lit} />
      <svg viewBox="0 0 120 160" className="fs-lamp__fixture">
        <path d="M60 0v48" stroke="#C9B47E" strokeWidth="1.5" fill="none" />
        <circle cx="60" cy="100" r="40" fill="rgba(232, 214, 163, 0.2)" stroke="#C9B47E" />
      </svg>
    </div>
  );
}

function CarpetChapter({ carpet, index }: { carpet: CarpetStory; index: number }) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const chapterRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textInView = useInView(textRef, { once: true, amount: 0.1 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (textInView) setActive(true);
  }, [textInView]);

  return (
    <article ref={chapterRef} className="relative h-[145svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center overflow-hidden py-10">
        <div className="relative z-10 h-[50svh] aspect-[3/4]">
           <Image src={carpet.image} alt="Rug" fill className="object-contain" />
        </div>
        <div ref={textRef} className="mt-10 text-center px-6">
           <h2 className="fs-display text-4xl sm:text-6xl">
             {t(carpet.titleKey, { defaultValue: 'Handmade Rug' })}
           </h2>
           <p className="fs-muted mt-4 max-w-2xl text-lg sm:text-xl">
             {t(carpet.descKey, { defaultValue: 'Experience the art.' })}
           </p>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedSection() {
  const t = useTranslations('Shop');
  const ct = useTranslations('Common');

  return (
    <section className="fs-root min-h-screen bg-olive">
       <style dangerouslySetInnerHTML={{ __html: styles }} />
       <div className="py-20 text-center">
          <h2 className="fs-display text-5xl sm:text-7xl">{t('filter')}</h2>
       </div>
       {carpets.map((c, i) => <CarpetChapter key={i} carpet={c} index={i} />)}
       <div className="py-20 text-center">
          <Link href="/shop" className="fs-cta text-xl">{t('all')}</Link>
       </div>
    </section>
  );
}

const styles = `
  .fs-root { --fs-gold: #E8D6A3; color: #EFE6DD; }
  .fs-display { font-family: var(--font-AKETAB), serif; }
  .fs-muted { opacity: 0.8; }
  .fs-cta { background: #E8D6A3; color: #2F3B18; padding: 1rem 2.5rem; border-radius: 999px; font-weight: bold; }
`;

"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import "@/styles/featured.css";

type CarpetStory = {
  image: string;
  titleKey: string;
  descKey: string;
};

const carpets: CarpetStory[] = [
  {
    image: "/assets/carpet-tabriz.jpg",
    titleKey: "t1",
    descKey: "d1",
  },
  {
    image: "/assets/carpet-kashan.jpg",
    titleKey: "t2",
    descKey: "d2",
  },
];

function CarpetChapter({ carpet }: { carpet: CarpetStory }) {
  const t = useTranslations("Shop");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [48, -48]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);

  return (
    <article className="relative flex min-h-[78svh] flex-col items-center justify-center px-6 py-12">
      <div ref={ref} className="w-full max-w-[22rem]">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="group relative"
        >
          <span className="fs-chapter__glow" aria-hidden="true" />

          <motion.div style={reduced ? undefined : { y }} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_2.5rem_4.5rem_-1.5rem_rgba(0,0,0,0.75)]">
              <motion.div
                style={reduced ? undefined : { scale }}
                className="absolute inset-0"
              >
                <Image
                  src={carpet.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 22rem"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </motion.div>
              <span className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-[rgba(232,214,163,0.28)]" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 text-center"
        >
          <h2 className="fs-display text-4xl sm:text-5xl lg:text-6xl">
            {t(carpet.titleKey)}
          </h2>
          <p className="fs-muted mx-auto mt-3 max-w-xl text-base leading-8 sm:text-lg">
            {t(carpet.descKey)}
          </p>
        </motion.div>
      </div>
    </article>
  );
}

export default function FeaturedSection() {
  const t = useTranslations("Shop");

  return (
    <section className="fs-root">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pt-24 pb-6 text-center"
      >
        <h2 className="fs-display text-5xl sm:text-7xl">{t("title")}</h2>
      </motion.div>

      {carpets.map((c) => (
        <CarpetChapter key={c.titleKey} carpet={c} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="pt-6 pb-24 text-center"
      >
        <Link href="/shop" className="fs-cta text-xl">
          {t("all")}
        </Link>
      </motion.div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
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
  const textRef = useRef<HTMLDivElement>(null);
  const textInView = useInView(textRef, { once: true, amount: 0.1 });

  return (
    <article className="flex min-h-[80svh] flex-col items-center justify-center px-6 py-10">
      <div className="relative z-10 h-[50svh] aspect-[3/4]">
        <Image src={carpet.image} alt="" fill className="object-contain" />
      </div>
      <motion.div
        ref={textRef}
        initial={{ opacity: 0, y: 12 }}
        animate={textInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mt-8 text-center px-6"
      >
        <h2 className="fs-display text-4xl sm:text-6xl">
          {t(carpet.titleKey)}
        </h2>
        <p className="fs-muted mt-4 max-w-2xl text-lg sm:text-xl">
          {t(carpet.descKey)}
        </p>
      </motion.div>
    </article>
  );
}

export default function FeaturedSection() {
  const t = useTranslations("Shop");

  return (
    <section className="fs-root min-h-screen bg-olive">
      <div className="py-20 text-center">
        <h2 className="fs-display text-5xl sm:text-7xl">{t("title")}</h2>
      </div>
      {carpets.map((c) => (
        <CarpetChapter key={c.titleKey} carpet={c} />
      ))}
      <div className="py-20 text-center">
        <Link href="/shop" className="fs-cta text-xl">
          {t("all")}
        </Link>
      </div>
    </section>
  );
}

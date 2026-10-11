"use client";

import { Award, Sparkles, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { key: "handmade", Icon: Sparkles },
  { key: "authentic", Icon: Award },
  { key: "delivery", Icon: Truck },
] as const;

export default function ValuesStrip() {
  const t = useTranslations("Values");

  return (
    <section className="values-strip">
      <div className="values-strip__inner">
        {ITEMS.map(({ key, Icon }) => (
          <div className="values-strip__item" key={key}>
            <span className="values-strip__icon">
              <Icon size={22} strokeWidth={1.6} aria-hidden />
            </span>
            <h3 className="values-strip__title">{t(key)}</h3>
            <p className="values-strip__text">{t(`${key}Desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X, Globe } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

const CREAM = "#F5EBDC";
const CREAM_SOFT = "#F5EBDC";
const BURGUNDY = "#6B1F2E";
const BURGUNDY_DEEP = "#4A0F1C";

export default function Header(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/contact", label: t("contact") },
  ];

  const languages = [
    { code: "ar", name: "العربية" },
    { code: "fa", name: "فارسی" },
    { code: "en", name: "English" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    const query = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${pathname}${query}`, {
      locale: newLocale as "ar" | "fa" | "en",
    });
  };

  const linkStyle = { color: BURGUNDY };
  const linkHover = { color: BURGUNDY_DEEP };

  return (
    <header
      className="relative z-40 w-full text-[#6B1F2E]"
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_SOFT} 100%)`,
        fontFamily: "var(--font-Media), var(--font-cinzel), Georgia, serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12"
      >
        <button
          type="button"
          className="p-1 lg:hidden text-[#6B1F2E]"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xl font-medium uppercase tracking-[0.1em] transition-colors"
              style={linkStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = linkHover.color)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = linkStyle.color)
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/assets/toplpgo.png"
            alt={t("logoAlt")}
            width={180}
            height={80}
            priority
            className="h-auto w-[140px] sm:w-[180px]"
          />
        </Link>

        {/* Language & Tools */}
        <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
          <div className="flex items-center gap-3 border-r border-burgundy/20 pr-6 mr-6">
            <Globe size={16} aria-hidden />
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-sm font-semibold transition-colors ${locale === lang.code ? "underline underline-offset-4" : "opacity-60 hover:opacity-100"}`}
                style={linkStyle}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="p-1 transition-colors"
            style={{ color: BURGUNDY }}
            aria-label={t("search")}
            onClick={() => router.push("/search")}
            onMouseEnter={(e) => (e.currentTarget.style.color = BURGUNDY_DEEP)}
            onMouseLeave={(e) => (e.currentTarget.style.color = BURGUNDY)}
          >
            <Search size={18} strokeWidth={1.6} />
          </button>
        </div>

        <button
          type="button"
          className="p-1 lg:hidden"
          style={{ color: BURGUNDY }}
          aria-label={t("search")}
          onClick={() => router.push("/search")}
        >
          <Search size={18} strokeWidth={1.6} />
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden lg:hidden"
            style={{
              background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_SOFT} 100%)`,
              borderTop: `1px solid rgba(107, 31, 46, 0.18)`,
              borderBottom: `1px solid rgba(107, 31, 46, 0.18)`,
            }}
          >
            <div
              className="flex flex-col gap-4 px-6 py-5 text-center text-base uppercase"
              style={{ color: BURGUNDY }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex justify-center gap-4 pt-4 border-t border-burgundy/10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setMenuOpen(false);
                    }}
                    className={`text-sm font-semibold ${locale === lang.code ? "underline" : "opacity-60"}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

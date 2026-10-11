import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';
import { locales, getDir } from '@/i18n/config';
import { CartProvider } from '@/lib/cart';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../globals.css';

const nastaliq = localFont({
  src: '../../../public/fonts/IranNastaliq.ttf',
  variable: '--font-nastaliq',
  display: 'swap',
  weight: '400',
});
const shekasteh = localFont({
  src: '../../../public/fonts/Shekasteh.ttf',
  variable: '--font-shekasteh',
  display: 'swap',
  weight: '400',
});
const Regular = localFont({
  src: '../../../public/fonts/Regular.ttf',
  variable: '--font-Regular',
  display: 'swap',
  weight: '400',
});
const Dima = localFont({
  src: '../../../public/fonts/Dima.ttf',
  variable: '--font-Dima',
  display: 'swap',
  weight: '400',
});
const AKETAB = localFont({
  src: '../../../public/fonts/AKetabBold.ttf',
  variable: '--font-AKETAB',
  display: 'swap',
  weight: '400',
});
const Media = localFont({
  src: '../../../public/fonts/KOMedia.otf',
  variable: '--font-Media',
  display: 'swap',
  weight: '400',
});
const Maktab = localFont({
  src: '../../../public/fonts/Maktab.ttf',
  variable: '--font-Maktab',
  display: 'swap',
  weight: '400',
});
const Muharam = localFont({
  src: '../../../public/fonts/Muharam.ttf',
  variable: '--font-Muharam',
  display: 'swap',
  weight: '400',
});
const Miremad = localFont({
  src: '../../../public/fonts/Miremad.ttf',
  variable: '--font-Miremad',
  display: 'swap',
  weight: '400',
});
const cormorant = localFont({
  src: [
    {
      path: '../../../public/fonts/cormorant-garamond-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cormorant-garamond-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cormorant-garamond-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cormorant-garamond-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
});
const cinzel = localFont({
  src: [
    {
      path: '../../../public/fonts/cinzel-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cinzel-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cinzel-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/cinzel-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-cinzel',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = getDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${nastaliq.variable} ${Media.variable} ${shekasteh.variable} ${Regular.variable} ${Dima.variable} ${Miremad.variable} ${Muharam.variable} ${cormorant.variable} ${cinzel.variable} ${AKETAB.variable} ${Maktab.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

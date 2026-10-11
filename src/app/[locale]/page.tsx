import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import LineBanner from '@/components/LineBanner';
import FeaturedSection from '@/components/FeaturedSection';
import { useLocale } from 'next-intl';

export default function Home(): React.JSX.Element {
  const locale = useLocale();
  const isRTL = locale !== 'en';

  return (
    <main className="min-h-screen bg-[#2F3B18]">
      <Header />
      <HeroSection />
      <LineBanner />
      <div dir={isRTL ? "rtl" : "ltr"}>
        <FeaturedSection />
      </div>
    </main>
  );
}

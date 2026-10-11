import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import LineBanner from '@/components/LineBanner';
import FeaturedSection from '@/components/FeaturedSection';

export default function Home(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[#2F3B18]">
      <Header />
      <HeroSection />
      <LineBanner />
      <FeaturedSection />
    </main>
  );
}

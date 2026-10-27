import React, { useEffect } from 'react';
import NavBar from '@/components/layout/NavBar';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import Benefits from '@/components/sections/Benefits';
import EpochHero from '@/components/sections/EpochHero';
import Testimonials from '@/components/sections/Testimonials';
import AppStore from '@/components/sections/AppStore';
import SchedulingFor from '@/components/sections/SchedulingFor';
import GetStarted from '@/components/sections/GetStarted/GetStarted';
import Footer from '@/components/sections/Footer';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Veyro';
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#111111] selection:bg-[#151819] selection:text-white overflow-x-hidden font-matter">
      <NavBar />
      <main className="w-full">
        <Hero />
        <HowItWorks />
        <Benefits />
        <EpochHero />
        <Testimonials />
        <AppStore />
        <SchedulingFor className="[&>:last-child]:md:gap-y-14" />
        <GetStarted />
        <Footer />
      </main>
    </div>
  );
}

import React, { useEffect } from 'react';
import NavBar from '@/components/layout/NavBar';
import Hero from '@/components/sections/Hero';
import TrustedBy from '@/components/sections/TrustedBy';
import HowItWorks from '@/components/sections/HowItWorks';
import Benefits from '@/components/sections/Benefits';
import Testimonials from '@/components/sections/Testimonials';
import AppStore from '@/components/sections/AppStore';
import Business from '@/components/sections/Business/Business';
import WallOfLove from '@/components/sections/WallOfLove';
import SchedulingFor from '@/components/sections/SchedulingFor';
import GetStarted from '@/components/sections/GetStarted/GetStarted';
import Footer from '@/components/sections/Footer';
import WhatsBetter from '@/components/WhatsBetter';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Veyro — Next-Generation Learning Management System';
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#111111] selection:bg-[#151819] selection:text-white overflow-x-hidden font-matter">
      <NavBar />
      <main className="w-full">
        <Hero />
        <TrustedBy />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <AppStore />
        <Business />
        <WallOfLove />
        <SchedulingFor className="[&>:last-child]:md:gap-y-14" />
        <GetStarted />
        <Footer />
        <WhatsBetter />
      </main>
    </div>
  );
}

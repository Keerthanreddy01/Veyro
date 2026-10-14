import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import HeroClient from "./HeroClient";

export default function Hero() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate(`/register?email=${encodeURIComponent(email)}`);
    } else {
      navigate("/register");
    }
  };

  return (
    <section id="hero" className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-[#FAFAFC]">
      {/* Ambient Left Aura Blur (Amplemarket Signature Gradient) */}
      <div
        aria-hidden="true"
        className="absolute -left-28 sm:-left-36 top-16 sm:top-24 w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full pointer-events-none -z-10 filter blur-[90px] sm:blur-[115px] opacity-75 sm:opacity-85"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #FF4D30 0%, #FF7854 30%, #B27CFF 70%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-[38px] sm:text-[54px] md:text-[66px] lg:text-[72px] font-semibold tracking-[-0.035em] text-[#111111] leading-[1.06] text-balance">
            Step <span className="font-serif italic font-normal text-[#171717]">into</span> the future
            <br />
            of learning: Human + AI
          </h1>

          <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg md:text-[19px] text-[#6B7280] max-w-xl mx-auto leading-relaxed text-balance font-normal">
            Empower learners, uncover opportunities, and
            <br className="hidden sm:inline" />
            grow skills with an all-in-one AI learning platform.
          </p>
        </motion.div>

        {/* Email Pill Input + Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-7 sm:mt-8 max-w-[490px] mx-auto"
        >
          <form
            onSubmit={handleEmailSubmit}
            className="bg-white rounded-full p-1.5 pl-5 sm:pl-6 border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 focus-within:border-black/30 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-transparent border-0 outline-none text-[#111111] placeholder:text-[#9CA3AF] text-sm sm:text-[15px] w-full"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-6 h-6 rounded-md bg-[#E11D48] text-white flex items-center justify-center text-[10px] font-bold shadow-xs select-none">
                ···
              </span>
              <button
                type="submit"
                className="bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow"
              >
                Get free trial
              </button>
            </div>
          </form>

          {/* Review / Gartner Social Proof Line */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 text-xs sm:text-[13px] text-[#6B7280]">
            <div className="flex items-center gap-1.5 text-[#111111]">
              <span className="font-bold text-[13px] tracking-wide text-amber-500">★★★★★</span>
            </div>
            <span className="text-[#D1D5DB] select-none">|</span>
            <span>
              Generative AI Learning Platform by <strong className="font-semibold text-[#111111]">Gartner</strong>
            </span>
          </div>
        </motion.div>

        {/* Dashboard Preview Showcase with Rocket Doodle */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative mt-10 sm:mt-14 max-w-5xl mx-auto"
        >
          {/* Main Dashboard Container */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-black/10 bg-white shadow-[0_24px_70px_-15px_rgba(0,0,0,0.12)] overflow-hidden text-left">
            {/* Top Browser / App Window Bar */}
            <div className="h-10 bg-[#FAFAFC] border-b border-black/5 px-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10" />
                <span className="ml-3 text-[11px] font-medium text-[#77736D] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Duo leads • Live Learning Stream
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#9CA3AF] bg-white px-2.5 py-1 rounded-md border border-black/5">
                <span>Search curriculum or ask AI... ⌘K</span>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-3 sm:p-5 relative">
              <HeroClient />

              {/* Floating Central Video Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                  aria-label="Play Product Overview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/85 text-white flex items-center justify-center shadow-2xl pl-1 pointer-events-auto cursor-pointer hover:scale-105 hover:bg-black transition-transform"
                >
                  <Play size={28} className="fill-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Rocket Rider Hand-Drawn Doodle on the Right */}
          <div className="absolute -right-6 sm:-right-14 md:-right-20 -bottom-10 sm:-bottom-14 md:-bottom-18 w-40 sm:w-56 md:w-68 pointer-events-none select-none z-30">
            <img
              src="/hero-rocket-doodle.jpg"
              alt="Rocket Rider Doodle"
              className="w-full h-auto drop-shadow-md mix-blend-multiply filter contrast-125"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

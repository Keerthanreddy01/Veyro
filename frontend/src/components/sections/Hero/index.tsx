import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import AmpleHeroDashboard from "./AmpleHeroDashboard";

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
    <section id="hero" className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 overflow-hidden bg-[#FAFAFC]">
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
              className="bg-transparent border-0 outline-none text-[#111111] placeholder:text-[#9CA3AF] text-sm sm:text-[15px] w-full font-sans"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-6 h-6 rounded-md bg-[#E11D48] text-white flex items-center justify-center text-[10px] font-bold shadow-xs select-none">
                ···
              </span>
              <button
                type="submit"
                className="bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs hover:shadow font-sans"
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

        {/* Amplemarket-Style High-Fidelity Dashboard Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          <AmpleHeroDashboard />
        </motion.div>
      </div>
    </section>
  );
}

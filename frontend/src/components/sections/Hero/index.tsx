import React from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const partners = [
    { name: "Headway", font: "font-black tracking-tight" },
    { name: "brightline", font: "font-semibold tracking-normal lowercase" },
    { name: "hazel", font: "font-medium tracking-tight lowercase" },
    { name: "G&STC", font: "font-bold tracking-widest uppercase" },
  ];

  return (
    <section
      id="hero"
      className="relative w-full pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden text-[#111111]"
      style={{ fontFamily: "'Matter', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Headline, Actions & Partner Proof */}
          <div className="lg:col-span-6 flex flex-col justify-between pt-2">
            <div>
              {/* Main Headline — Clean Sans-Serif, Normal/Light Weight Matching Reference */}
              <h1
                className="text-[44px] sm:text-[56px] xl:text-[62px] font-normal tracking-[-0.035em] text-[#111111] leading-[1.08]"
                style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
              >
                {/* Visual Pill Pebble */}
                <span className="inline-block align-middle w-12 h-6 sm:w-14 sm:h-7.5 mr-3 rounded-full bg-gradient-to-r from-[#f0d0fc] via-[#e2c8fc] to-[#aed6ff] shadow-xs" />
                Learn smarter
                <br />
                with AI. Build
                <br />
                skills for the{" "}
                {/* Inline "Meet Veyro AI" pill button */}
                <a
                  href="#meet-aero"
                  className="inline-flex items-center gap-2 align-middle px-4 py-1 my-1 rounded-full border border-[#111111] text-[14px] sm:text-[15px] font-normal text-[#111111] hover:bg-neutral-50 transition-colors"
                  style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                >
                  <span className="text-[12px] leading-none select-none">▷</span>
                  <span className="tracking-tight whitespace-nowrap">Meet Veyro AI</span>
                </a>
                <br />
                future.
              </h1>

              {/* Action Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-6">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#82b4ff] hover:bg-[#6fa5f7] text-white font-normal text-[15px] shadow-xs hover:shadow transition-all"
                  style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                >
                  <span>Explore learning</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="text-[15px] font-normal text-[#111111] underline underline-offset-4 decoration-1 hover:text-neutral-600 transition-colors"
                  style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                >
                  Request a demo
                </a>
              </div>
            </div>

            {/* Bottom Caption & Partner Logos */}
            <div className="mt-14 lg:mt-20 pt-4">
              <p
                className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#666666] max-w-[420px] font-normal"
                style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
              >
                Veyro brings courses, personalized learning paths, and AI-powered guidance together to help every learner make meaningful progress.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-8 sm:gap-10 text-[#111111] opacity-90 select-none">
                {partners.map((p) => (
                  <span key={p.name} className={`text-[19px] sm:text-[21px] ${p.font}`}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3 Bento Cards Matching Bionova Reference */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Top Large Bento Card (Deep Plum / 3D Iridescent Glass Star) */}
            <div className="relative w-full rounded-[32px] sm:rounded-[36px] overflow-hidden p-8 sm:p-10 min-h-[340px] flex flex-col justify-between bg-[#2d243e] text-white shadow-md">
              {/* Central 3D Iridescent Glass Star Visual Matching Reference */}
              <div
                aria-hidden="true"
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-[240px] sm:w-[280px] h-[240px] sm:h-[280px] pointer-events-none select-none rounded-[32px] overflow-hidden mix-blend-screen opacity-95"
              >
                <img
                  src="/iridescent-glass-star.jpg"
                  alt="3D Iridescent Glass Sculpture"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
                />
              </div>

              {/* Text Top — Clean Sans-Serif, Regular Weight */}
              <h2
                className="relative z-10 text-[26px] sm:text-[30px] lg:text-[32px] font-normal leading-[1.25] max-w-[340px] tracking-tight text-white"
                style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
              >
                Meet Veyro AI, your personal learning companion.
              </h2>

              {/* Bottom Row */}
              <div className="relative z-10 flex items-end justify-between gap-4 mt-12">
                <p
                  className="text-[13px] sm:text-[13.5px] leading-relaxed text-white/70 max-w-[280px] font-normal"
                  style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                >
                  Understand complex topics, explore new concepts, and strengthen your knowledge with AI-powered learning support.
                </p>

                <Link
                  to="/register"
                  className="size-11 rounded-full bg-white text-[#111111] flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-md"
                  aria-label="Get in touch"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#111111]" />
                </Link>
              </div>
            </div>

            {/* Bottom 2 Bento Cards Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Bottom-Left Card (Pastel Blue / Iridescent Orb) */}
              <div className="relative rounded-[28px] overflow-hidden p-6 sm:p-7 min-h-[260px] flex flex-col justify-between bg-[#a2cadc] text-[#111111] shadow-xs">
                {/* Floating Iridescent Orb Visual */}
                <div
                  aria-hidden="true"
                  className="absolute -right-4 top-4 w-44 h-44 pointer-events-none select-none mix-blend-multiply opacity-90 rounded-full overflow-hidden"
                >
                  <img
                    src="/iridescent-bubble.jpg"
                    alt="3D Iridescent Orb"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Top Badge Row */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="px-3.5 py-1 rounded-full bg-white text-[#111111] text-[12px] font-normal tracking-wide shadow-2xs"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    locations
                  </span>
                  <Link
                    to="/courses"
                    className="size-8 rounded-full bg-white text-[#111111] flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
                    aria-label="View locations"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Bottom Content — Clean Sans-Serif Normal */}
                <div className="relative z-10 mt-8">
                  <h3
                    className="text-[19px] sm:text-[20px] font-medium tracking-tight text-[#0f172a] leading-tight"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    Learning without limits
                  </h3>
                  <p
                    className="mt-2 text-[12px] sm:text-[12.5px] leading-relaxed text-[#2c3e50] font-normal"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    Explore structured courses and personalized learning experiences from anywhere.
                  </p>
                </div>
              </div>

              {/* Bottom-Right Card (Lime-Yellow Vibrant Gradient / "AI") */}
              <div className="relative rounded-[28px] overflow-hidden p-6 sm:p-7 min-h-[260px] flex flex-col justify-between bg-gradient-to-br from-[#d4f04c] via-[#bce82e] to-[#88c520] text-[#111111] shadow-xs">
                {/* Organic Ambient Sheen */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-radial from-white/35 via-transparent to-black/5 pointer-events-none"
                />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="px-3.5 py-1 rounded-full bg-white text-[#111111] text-[12px] font-normal tracking-wide shadow-2xs"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    AI learning
                  </span>
                </div>

                {/* Bottom Content — Clean Sans-Serif "AI" */}
                <div className="relative z-10 mt-6">
                  <div
                    className="text-[52px] sm:text-[58px] font-normal text-white tracking-tight leading-none drop-shadow-xs"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    AI
                  </div>
                  <p
                    className="mt-2 text-[12.5px] leading-relaxed text-[#1a2e05] font-normal"
                    style={{ fontFamily: "'Matter', 'Inter', -apple-system, sans-serif" }}
                  >
                    Your learning companion helps you understand concepts, revise lessons, and practice what you learn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

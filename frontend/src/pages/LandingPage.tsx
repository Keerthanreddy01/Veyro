import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  Lock,
  Play,
  Menu,
  X,
  Eye,
  Building,
  BarChart3,
  Coffee,
  FileCheck,
  GraduationCap,
  Zap,
  BookOpen,
  ArrowRight,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Hand-Drawn Exact Reference SVG Accents & Doodles ──────────────────────────

function DoubleUnderlineHero() {
  return (
    <svg
      viewBox="0 0 420 18"
      className="w-full h-3 sm:h-4 fill-none stroke-[#111111] stroke-linecap-round stroke-linejoin-round overflow-visible pointer-events-none mt-1"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="2" y1="4" x2="418" y2="4" strokeWidth="3.5" />
      <line x1="12" y1="12" x2="410" y2="12" strokeWidth="2.5" />
    </svg>
  );
}

function CurvedSwoopArrowHero() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-16 h-16 sm:w-20 sm:h-20 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round pointer-events-none select-none"
      aria-hidden="true"
    >
      <path d="M 32 108 C 24 75, 48 42, 85 30 C 102 24, 108 42, 92 56 C 75 70, 48 55, 62 25 L 68 14" />
      <path d="M 48 18 L 68 14 L 75 32" />
    </svg>
  );
}

function LoopSpiralArrow() {
  return (
    <svg
      viewBox="0 0 90 70"
      className="w-12 h-10 sm:w-16 sm:h-12 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round inline-block align-middle ml-2"
      aria-hidden="true"
    >
      <path d="M 14 42 C 26 14, 65 14, 76 28 C 86 46, 56 60, 36 50 C 20 40, 46 16, 75 32 L 82 40" />
      <path d="M 68 38 L 84 42 L 80 26" />
    </svg>
  );
}

function ArrowRightHandDrawnHero() {
  return (
    <svg
      viewBox="0 0 100 60"
      className="w-18 h-11 sm:w-22 sm:h-13 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round"
      aria-hidden="true"
    >
      <path d="M 12 36 C 38 20, 66 46, 90 30" />
      <path d="M 72 18 L 94 30 L 78 46" />
    </svg>
  );
}

function DoodleSparkle() {
  return (
    <svg viewBox="0 0 40 40" className="w-5 h-5 fill-none stroke-[#111111] stroke-[2.5] stroke-linecap-round">
      <line x1="20" y1="4" x2="20" y2="36" />
      <line x1="4" y1="20" x2="36" y2="20" />
      <line x1="8" y1="8" x2="32" y2="32" />
      <line x1="8" y1="32" x2="32" y2="8" />
    </svg>
  );
}

// ── Problem Section Line-Art Doodles (Exact Match to Reference Cards) ────────

function LaptopFaceDoodle() {
  return (
    <svg viewBox="0 0 120 90" className="w-24 h-18 sm:w-28 sm:h-20 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Screen */}
      <rect x="25" y="16" width="70" height="48" rx="4" fill="#60C5F1" />
      {/* Face on Screen */}
      <line x1="45" y1="36" x2="52" y2="36" strokeWidth="2.5" />
      <line x1="68" y1="36" x2="75" y2="36" strokeWidth="2.5" />
      <line x1="53" y1="46" x2="67" y2="46" strokeWidth="2.2" />
      {/* Base */}
      <path d="M 12 68 L 108 68 C 112 68, 114 72, 110 76 L 102 80 L 18 80 L 10 76 C 6 72, 8 68, 12 68 Z" fill="#60C5F1" />
      {/* Radiating sound lines */}
      <line x1="14" y1="28" x2="18" y2="32" strokeWidth="2" />
      <line x1="102" y1="28" x2="98" y2="32" strokeWidth="2" />
      <line x1="12" y1="44" x2="17" y2="44" strokeWidth="2" />
      <line x1="104" y1="44" x2="99" y2="44" strokeWidth="2" />
    </svg>
  );
}

function ChaosCloudDoodle() {
  return (
    <svg viewBox="0 0 120 90" className="w-24 h-18 sm:w-28 sm:h-20 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Cloud outline */}
      <path d="M 38 48 C 30 48, 24 42, 28 32 C 26 24, 34 18, 44 20 C 50 14, 64 16, 68 24 C 76 20, 86 24, 86 32 C 94 36, 90 46, 84 50 C 88 58, 78 66, 68 62 C 62 66, 50 62, 44 58 C 36 62, 28 56, 38 48 Z" fill="#60C5F1" />
      {/* Question mark inside cloud */}
      <path d="M 54 32 C 54 26, 64 26, 64 32 C 64 37, 58 39, 58 44" strokeWidth="2.5" />
      <circle cx="58" cy="49" r="1.5" fill="#111111" />
      {/* Circling arrows */}
      <path d="M 22 28 C 16 38, 18 52, 26 60" />
      <path d="M 20 60 L 26 60 L 28 54" />
      <path d="M 98 60 C 104 50, 102 36, 94 28" />
      <path d="M 100 28 L 94 28 L 92 34" />
    </svg>
  );
}

function ResentmentCrossDoodle() {
  return (
    <svg viewBox="0 0 120 90" className="w-24 h-18 sm:w-28 sm:h-20 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Cloud outline */}
      <path d="M 68 62 C 62 66, 50 62, 44 58 C 36 62, 28 56, 38 48 C 30 48, 24 42, 28 32 C 26 24, 34 18, 44 20 C 50 14, 64 16, 68 24 C 76 20, 86 24, 86 32 C 94 36, 90 46, 84 50 C 88 58, 78 66, 68 62 Z" fill="#60C5F1" />
      {/* Sad face */}
      <circle cx="50" cy="38" r="2.5" fill="#111111" />
      <circle cx="68" cy="38" r="2.5" fill="#111111" />
      <path d="M 52 50 C 56 46, 62 46, 66 50" strokeWidth="2.2" />
      {/* Top Cross bubble */}
      <circle cx="78" cy="22" r="14" fill="#60C5F1" strokeWidth="2.2" />
      <line x1="72" y1="16" x2="84" y2="28" strokeWidth="2.5" />
      <line x1="84" y1="16" x2="72" y2="28" strokeWidth="2.5" />
    </svg>
  );
}

function MagnifyingSadDoodle() {
  return (
    <svg viewBox="0 0 120 90" className="w-24 h-18 sm:w-28 sm:h-20 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Lens */}
      <circle cx="52" cy="38" r="26" fill="#60C5F1" strokeWidth="2.5" />
      <line x1="72" y1="58" x2="98" y2="82" strokeWidth="4" />
      {/* Sad Face inside lens */}
      <line x1="42" y1="32" x2="48" y2="34" strokeWidth="2.2" />
      <line x1="62" y1="34" x2="56" y2="32" strokeWidth="2.2" />
      <circle cx="44" cy="36" r="2" fill="#111111" />
      <circle cx="60" cy="36" r="2" fill="#111111" />
      <path d="M 46 48 C 50 44, 54 44, 58 48" strokeWidth="2.2" />
    </svg>
  );
}

// ── Down-Section Hand-Drawn Doodles (Exact Match to Reference Image) ─────────

function ZigZagSwoopDoodle() {
  return (
    <svg viewBox="0 0 100 120" className="w-16 h-20 sm:w-20 sm:h-24 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round">
      <path d="M 68 12 C 45 22, 28 36, 42 50 C 58 64, 22 75, 40 92 L 48 102" />
      <path d="M 32 98 L 48 102 L 52 86" />
    </svg>
  );
}

function GlassesDoodle() {
  return (
    <svg viewBox="0 0 120 70" className="w-20 h-12 sm:w-24 sm:h-14 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Left Frame */}
      <rect x="15" y="20" width="38" height="28" rx="8" fill="#FFF490" strokeWidth="2.5" />
      <line x1="22" y1="28" x2="36" y2="28" strokeWidth="2" strokeOpacity="0.6" />
      {/* Bridge */}
      <path d="M 53 28 Q 60 22, 67 28" strokeWidth="2.5" />
      {/* Right Frame */}
      <rect x="67" y="20" width="38" height="28" rx="8" fill="#FFF490" strokeWidth="2.5" />
      <line x1="74" y1="28" x2="88" y2="28" strokeWidth="2" strokeOpacity="0.6" />
      {/* Temples (Arms) */}
      <path d="M 15 26 L 4 20" strokeWidth="2.2" />
      <path d="M 105 26 L 116 20" strokeWidth="2.2" />
    </svg>
  );
}

function SmartCoordinationDoodle() {
  return (
    <svg viewBox="0 0 120 80" className="w-20 h-14 sm:w-24 sm:h-16 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Main Speech Bubble */}
      <path d="M 24 16 C 14 16, 8 24, 8 36 C 8 48, 16 56, 32 56 L 32 68 L 46 56 L 68 56 C 80 56, 86 48, 86 36 C 86 24, 78 16, 64 16 Z" fill="#FFF490" strokeWidth="2.2" />
      {/* Eyes & smile in main bubble */}
      <circle cx="34" cy="34" r="3" fill="#111111" />
      <circle cx="58" cy="34" r="3" fill="#111111" />
      <path d="M 40 44 Q 46 48, 52 44" strokeWidth="2.2" />
      {/* Secondary mini chat bubble */}
      <path d="M 80 34 C 84 30, 94 30, 102 34 C 110 38, 110 48, 102 54 L 108 62 L 98 58 C 92 60, 84 56, 82 50" fill="#FFF490" strokeWidth="2" />
      <line x1="90" y1="42" x2="98" y2="42" strokeWidth="2" />
      <line x1="90" y1="48" x2="96" y2="48" strokeWidth="2" />
    </svg>
  );
}

function ClockGaugeDoodle() {
  return (
    <svg viewBox="0 0 100 80" className="w-18 h-14 sm:w-22 sm:h-16 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Outer Circle */}
      <circle cx="50" cy="42" r="26" fill="#FFF490" strokeWidth="2.5" />
      {/* Quarter pie slice filled */}
      <path d="M 50 42 L 50 16 A 26 26 0 0 1 76 42 Z" fill="#111111" />
      {/* Clock hands */}
      <line x1="50" y1="42" x2="36" y2="34" strokeWidth="2.5" />
      <circle cx="50" cy="42" r="3" fill="#111111" />
      {/* Top Stopwatch button */}
      <line x1="50" y1="16" x2="50" y2="8" strokeWidth="3" />
      <line x1="44" y1="8" x2="56" y2="8" strokeWidth="3" />
      {/* Side button */}
      <line x1="68" y1="24" x2="74" y2="18" strokeWidth="2.5" />
    </svg>
  );
}

function SteamingCupDoodle() {
  return (
    <svg viewBox="0 0 100 80" className="w-18 h-14 sm:w-22 sm:h-16 fill-none stroke-[#111111] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
      {/* Mug Body */}
      <path d="M 28 28 L 32 64 C 33 68, 67 68, 68 64 L 72 28 Z" fill="#FFF490" strokeWidth="2.5" />
      {/* Handle */}
      <path d="M 70 34 C 84 34, 84 54, 68 56" strokeWidth="2.5" />
      {/* Happy Face on mug */}
      <circle cx="44" cy="44" r="2" fill="#111111" />
      <circle cx="56" cy="44" r="2" fill="#111111" />
      <path d="M 46 52 Q 50 56, 54 52" strokeWidth="2" />
      {/* Steam curves */}
      <path d="M 38 22 C 36 16, 42 12, 40 6" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 22 C 48 16, 54 12, 52 6" strokeWidth="2" strokeLinecap="round" />
      <path d="M 62 22 C 60 16, 66 12, 64 6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CurvedStepsArrow() {
  return (
    <svg viewBox="0 0 110 110" className="w-14 h-14 sm:w-18 sm:h-18 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round inline-block ml-3">
      <path d="M 18 24 C 42 6, 78 18, 68 46 C 58 74, 28 58, 48 84 L 56 94" />
      <path d="M 40 90 L 56 94 L 62 78" />
    </svg>
  );
}

// ── Native iOS Status Bar Icons ──────────────────────────────────────────────

function IosSignalIcon() {
  return (
    <svg viewBox="0 0 18 12" className="w-4 h-3 fill-current" aria-hidden="true">
      <rect x="1" y="8" width="2.5" height="4" rx="0.6" />
      <rect x="5.2" y="5.5" width="2.5" height="6.5" rx="0.6" />
      <rect x="9.4" y="3" width="2.5" height="9" rx="0.6" />
      <rect x="13.6" y="0.5" width="2.5" height="11.5" rx="0.6" />
    </svg>
  );
}

function IosWifiIcon() {
  return (
    <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-current" aria-hidden="true">
      <path d="M8 10a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 8 10Zm-3.5-3a5 5 0 0 1 7 0 .8.8 0 1 1-1.1 1.1 3.5 3.5 0 0 0-4.8 0 .8.8 0 1 1-1.1-1.1ZM1.5 4a9 9 0 0 1 13 0 .8.8 0 1 1-1.1 1.1 7.5 7.5 0 0 0-10.8 0 .8.8 0 1 1-1.1-1.1Z" />
    </svg>
  );
}

function IosBatteryIcon() {
  return (
    <svg viewBox="0 0 24 12" className="w-5 h-2.5 fill-current" aria-hidden="true">
      <rect x="1" y="1" width="19" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill="currentColor" />
      <path d="M21.5 4.5v3c.5-.3.8-.8.8-1.5s-.3-1.2-.8-1.5Z" fill="currentColor" />
    </svg>
  );
}

// ── Editorial Pop-Up Grocer / Veyro Footer Helpers (with Smooth Parallax) ──

function VeyroSmileyBadge({ scrollY = 0 }: { scrollY?: number }) {
  const rotate = Math.sin(scrollY * 0.004) * 12;
  const translateY = Math.cos(scrollY * 0.003) * 10;
  return (
    <div 
      className="w-20 h-20 sm:w-24 sm:h-24 text-[#1E3A8A] flex-shrink-0 flex items-center justify-center relative select-none transition-transform duration-100 ease-out"
      style={{
        transform: `translateY(${translateY}px) rotate(${rotate}deg)`
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1E3A8A] drop-shadow-sm">
        <path d="M50 0 C56 10 67 7 74 2 C79 10 89 11 93 20 C91 29 99 36 98 45 C99 54 91 61 93 70 C89 79 79 80 74 88 C67 83 56 80 50 90 C44 80 33 83 26 88 C21 80 11 79 7 70 C9 61 1 54 2 45 C1 36 9 29 7 20 C11 11 21 10 26 2 C33 7 44 10 50 0 Z" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FFF490] font-syne font-black text-center leading-none">
        <span className="text-[13px] tracking-wider uppercase">VEYRO</span>
        <svg viewBox="0 0 30 14" className="w-5 h-2.5 fill-none stroke-[#FFF490] stroke-[2.5] stroke-linecap-round mt-1">
          <path d="M 3 3 Q 15 14, 27 3" />
        </svg>
      </div>
    </div>
  );
}

function FooterMascotDoodle({ scrollY = 0 }: { scrollY?: number }) {
  const walkTranslateX = Math.sin(scrollY * 0.004) * 16;
  const walkTranslateY = Math.abs(Math.cos(scrollY * 0.004)) * -10;
  const tilt = Math.sin(scrollY * 0.004) * 8;
  return (
    <div 
      className="hidden lg:block absolute bottom-6 right-10 w-24 h-28 pointer-events-none select-none transition-transform duration-100 ease-out"
      style={{
        transform: `translateX(${walkTranslateX}px) translateY(${walkTranslateY}px) rotate(${tilt}deg)`
      }}
    >
      <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-[#1E3A8A] stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
        {/* Head */}
        <circle cx="50" cy="22" r="16" fill="#FAF7EE" stroke="#1E3A8A" strokeWidth="2.5" />
        <circle cx="50" cy="22" r="6" fill="#111111" />
        {/* Torso */}
        <path d="M36 38 L64 38 L68 70 L32 70 Z" fill="#EF4444" stroke="#1E3A8A" strokeWidth="2.5" />
        <line x1="50" y1="38" x2="50" y2="70" stroke="#1E3A8A" strokeWidth="2" />
        {/* Arms */}
        <path d="M34 44 L16 80 L12 95" stroke="#1E3A8A" strokeWidth="2" />
        <path d="M66 44 L84 65 L88 78" stroke="#1E3A8A" strokeWidth="2" />
        {/* Legs walking */}
        <path d="M40 70 L34 98 L24 102" stroke="#1E3A8A" strokeWidth="2.5" />
        <path d="M58 70 L68 94 L80 98" stroke="#1E3A8A" strokeWidth="2.5" />
        {/* Shoes */}
        <ellipse cx="22" cy="103" rx="7" ry="3" fill="#111111" />
        <ellipse cx="82" cy="99" rx="7" ry="3" fill="#111111" />
      </svg>
    </div>
  );
}

function WavyDividerLine({ scrollY = 0 }: { scrollY?: number }) {
  const shiftX = (scrollY * 0.08) % 60;
  return (
    <div className="w-full overflow-hidden">
      <svg 
        viewBox="0 0 1200 20" 
        className="w-[110%] -ml-[5%] h-4 fill-none stroke-[#1E3A8A] stroke-[2.5] stroke-linecap-round transition-transform duration-75 ease-out" 
        style={{
          transform: `translateX(${shiftX}px)`
        }}
        preserveAspectRatio="none"
      >
        <path d="M 0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10 T 150 10 T 180 10 T 210 10 T 240 10 T 270 10 T 300 10 T 330 10 T 360 10 T 390 10 T 420 10 T 450 10 T 480 10 T 510 10 T 540 10 T 570 10 T 600 10 T 630 10 T 660 10 T 690 10 T 720 10 T 750 10 T 780 10 T 810 10 T 840 10 T 870 10 T 900 10 T 930 10 T 960 10 T 990 10 T 1020 10 T 1050 10 T 1080 10 T 1110 10 T 1140 10 T 1170 10 T 1200 10" />
      </svg>
    </div>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.23.94-.04 1.98.54 2.75.64.88 1.74 1.34 2.83 1.25.96-.04 1.88-.58 2.39-1.39.38-.58.54-1.29.54-1.99.03-4.66.01-9.33.02-14 .01-1.28.01-2.56.02-3.84z" />
    </svg>
  );
}

function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── Curated Avatars (Matching Reference Image Personas) ──────────────────────
const AVATARS = {
  heroGuy: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
  anita: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  sean: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  dennis: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  oksana: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  elena: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  david: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<number>(0);
  const [activeStoryStep, setActiveStoryStep] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.landing-page .reveal-section'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-story-step]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetEl = entry.target as HTMLElement;
            setActiveStoryStep(Number(targetEl.dataset.storyStep));
          }
        });
      },
      { rootMargin: '-34% 0px -47% 0px', threshold: 0 }
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) {
      toast.error('Please enter a certificate verification code.');
      return;
    }
    navigate(`/verify/${verifyCodeInput.trim()}`);
  };

  return (
    <div className="landing-page min-h-screen bg-[#FAF7EE] text-[#111111] font-body selection:bg-[#FFF490] selection:text-[#111111]">

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION A: HERO HEADER & EXACT HERO CANVAS (Cream #FAF7EE)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7EE] pt-6 sm:pt-8 pb-16 sm:pb-28 px-4 sm:px-8 lg:px-14 border-editorial-b relative overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* ── TOP HEADER (Left wordmark + Left subhead + Right CTAs) ── */}
          <header className="flex items-center justify-between gap-4 pb-8 sm:pb-12">
            {/* Left Brand Wordmark */}
            <div className="space-y-1">
              <Link to="/" className="inline-block" aria-label="Veyro home">
                <span className="font-syne font-black text-3xl sm:text-4xl tracking-tight text-[#111111] lowercase select-none">
                  veyro<span className="text-[#60C5F1]">.</span>
                </span>
              </Link>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 max-w-xs leading-snug">
                The integrated LMS app for all your flexible learning needs.
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/courses"
                className="bg-[#60C5F1] text-[#111111] border-2 border-[#111111] rounded-full px-4 sm:px-5 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-[#48b8e9] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Video size={13} className="text-[#111111]" />
                <span>BOOK A DEMO</span>
              </Link>

              <Link
                to="/login"
                className="bg-[#111111] text-white rounded-full px-4 sm:px-5 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-black transition-all shadow-xs hidden sm:inline-flex items-center gap-1.5"
              >
                <span>MENU</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-[#111111] text-white rounded-full hover:bg-black transition flex items-center justify-center sm:hidden shadow-sm"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 text-white" />}
              </button>
            </div>
          </header>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="mb-6 p-5 bg-white border-editorial-2 rounded-2xl shadow-brutal space-y-2.5 sm:hidden">
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-[#111111] p-2 rounded-lg hover:bg-[#FAF7EE]"
              >
                Course Catalog
              </Link>
              <a
                href="#problem"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-[#111111] p-2 rounded-lg hover:bg-[#FAF7EE]"
              >
                Why Veyro
              </a>
              <a
                href="#solution"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-[#111111] p-2 rounded-lg hover:bg-[#FAF7EE]"
              >
                Platform Solution
              </a>
              <div className="pt-2 border-t border-black/10 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 bg-white border-editorial-2 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 bg-[#111111] text-white rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}

          {/* ── HERO CANVAS ── */}
          <div className="relative pt-6 sm:pt-10 pb-8 sm:pb-16">

            {/* ── 4 Floating Status Badges (Exact Positioning from Reference Image) ── */}

            {/* Badge 1: Top Center-Left (Anita Davis - IN OFFICE) */}
            <div className="hidden sm:inline-flex items-center gap-2 bg-[#FAF7EE] border-2 border-[#111111] rounded-full pl-3 pr-1 py-1 absolute -top-2 sm:top-1 left-[30%] -rotate-1 z-20 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> IN OFFICE
              </span>
              <span className="font-bold text-xs text-[#111111]">Anita Davis</span>
              <img src={AVATARS.anita} alt="Anita" className="w-5 h-5 rounded-full object-cover border border-[#111111]" />
            </div>

            {/* Badge 2: Top Right (Sean Gilliers - LEAVING) */}
            <div className="hidden md:inline-flex items-center gap-2 bg-[#FAF7EE] border-2 border-[#111111] rounded-full pl-3 pr-1 py-1 absolute -top-1 right-8 lg:right-24 rotate-2 z-20 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> LEAVING
              </span>
              <span className="font-bold text-xs text-[#111111]">Sean Gilliers</span>
              <img src={AVATARS.sean} alt="Sean" className="w-5 h-5 rounded-full object-cover border border-[#111111]" />
            </div>

            {/* Badge 3: Middle-Bottom Right (Dennis Ross - IN 10:15) */}
            <div className="hidden sm:inline-flex items-center gap-2 bg-[#FAF7EE] border-2 border-[#111111] rounded-full pl-3 pr-1 py-1 absolute bottom-6 right-[26%] -rotate-2 z-20 shadow-xs">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> IN 10:15
              </span>
              <span className="font-bold text-xs text-[#111111]">Dennis Ross</span>
              <img src={AVATARS.dennis} alt="Dennis" className="w-5 h-5 rounded-full object-cover border border-[#111111]" />
            </div>

            {/* Badge 4: Far Bottom Right (Oksana Levina - HOME) */}
            <div className="hidden lg:inline-flex items-center gap-2 bg-[#FAF7EE] border-2 border-[#111111] rounded-full pl-3 pr-1 py-1 absolute bottom-12 right-2 rotate-1 z-20 shadow-xs">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> HOME
              </span>
              <span className="font-bold text-xs text-[#111111]">Oksana Levina</span>
              <img src={AVATARS.oksana} alt="Oksana" className="w-5 h-5 rounded-full object-cover border border-[#111111]" />
            </div>

            {/* ── Main Hero Giant Headline ── */}
            <div className="w-full relative z-10">
              <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight text-[#111111] uppercase leading-[0.98] select-none">
                <span>MAKE </span>
                {/* Embedded Video Avatar with Play Button (Guy waving ✌️) */}
                <span className="inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2.5">
                  <span className="w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-18 rounded-xl sm:rounded-2xl border-2 sm:border-[2.5px] border-[#111111] overflow-hidden shadow-xs relative inline-block bg-slate-900">
                    <img
                      src={AVATARS.heroGuy}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                    {/* Floating mini white play button in corner */}
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 text-[#111111] flex items-center justify-center shadow-xs">
                      <Play size={10} className="fill-[#111111] ml-0.5" />
                    </div>
                  </span>
                </span>
                <span> FLEXIBLE</span> <br />
                <span>WORK, </span>
                <span className="relative inline-block">
                  REALLY WORK
                  {/* Clean Double Underline */}
                  <span className="absolute -bottom-2 sm:-bottom-3 left-0 w-full pointer-events-none">
                    <DoubleUnderlineHero />
                  </span>
                </span>
              </h1>
            </div>

            {/* ── Lower CTA with Curvy Swoop Arrow (Bottom-Left) ── */}
            <div className="mt-14 sm:mt-20 relative z-10 flex items-start gap-3">
              <div className="relative inline-block">
                <Link
                  to="/courses"
                  className="bg-[#60C5F1] text-[#111111] border-2 border-[#111111] rounded-full px-6 sm:px-7 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider hover:bg-[#48b8e9] hover:shadow-md transition-all shadow-xs flex items-center gap-2"
                >
                  <span>+ ADD TO SLACK</span>
                </Link>

                {/* Curvy Swoop Hand-Drawn Arrow Arching Upward */}
                <div className="absolute -top-16 -right-18 sm:-right-22 pointer-events-none">
                  <CurvedSwoopArrowHero />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION B: THE PROBLEM SECTION (Vibrant Bright Sky Blue #60C5F1)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="bg-[#60C5F1] py-16 sm:py-24 px-4 sm:px-8 lg:px-14 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">

          {/* Headline: FLEXIBLE WORK IS GREAT [BUT] with loop spiral doodle */}
          <div className="space-y-2">
            <h2 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl text-[#111111] uppercase tracking-tight leading-[1.02]">
              FLEXIBLE <br />
              WORK IS <br />
              <span className="inline-flex items-center gap-2 sm:gap-3">
                <span>GREAT</span>
                {/* Slanted White Sticker Badge [BUT] */}
                <span className="inline-flex items-center justify-center bg-white text-[#111111] border-2 border-[#111111] rounded-lg px-3 sm:px-4 py-0.5 text-2xl sm:text-4xl md:text-5xl font-syne font-black uppercase shadow-xs">
                  BUT
                </span>
                {/* Spiral Hand-Drawn Arrow */}
                <LoopSpiralArrow />
              </span>
            </h2>
          </div>

          {/* 4 Light-Blue Outlined Cards (Exact match to reference image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

            {/* Card 1: It can make work isolating */}
            <div className="bg-[#74D0F6]/85 border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[250px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  It can make work isolating
                </h3>
              </div>
              <div className="pt-4 flex justify-center items-center">
                <LaptopFaceDoodle />
              </div>
            </div>

            {/* Card 2: It can create operational Chaos */}
            <div className="bg-[#74D0F6]/85 border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[250px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  It can create operational Chaos
                </h3>
              </div>
              <div className="pt-4 flex justify-center items-center">
                <ChaosCloudDoodle />
              </div>
            </div>

            {/* Card 3: Mandates can create Resentment */}
            <div className="bg-[#74D0F6]/85 border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[250px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Mandates can create Resentment
                </h3>
              </div>
              <div className="pt-4 flex justify-center items-center">
                <ResentmentCrossDoodle />
              </div>
            </div>

            {/* Card 4: Decision making in the Dark */}
            <div className="bg-[#74D0F6]/85 border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[250px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Decision making in the Dark
                </h3>
              </div>
              <div className="pt-4 flex justify-center items-center">
                <MagnifyingSadDoodle />
              </div>
            </div>

          </div>

          {/* ── SECTION C: THAT'S WHERE VEYRO COMES IN (Yellow Sticker Transition & Mockup) ── */}
          <div className="pt-12 sm:pt-20 text-center space-y-6">
            
            {/* Angled Yellow Sticker 1: THAT'S WHERE */}
            <div className="inline-block transform -rotate-3">
              <span className="bg-[#FFF490] text-[#111111] border-2 border-[#111111] font-syne font-black text-xl sm:text-3xl md:text-4xl uppercase px-5 py-1.5 rounded-lg shadow-sm">
                THAT'S WHERE
              </span>
            </div>

            {/* Giant Flowing Wordmark: veyro. */}
            <div className="py-2">
              <span className="font-syne font-black text-6xl sm:text-8xl md:text-9xl text-[#111111] lowercase tracking-tight block">
                veyro<span className="text-white">.</span>
              </span>
            </div>

            {/* Angled Yellow Sticker 2: COMES IN */}
            <div className="inline-block transform rotate-2">
              <span className="bg-[#FFF490] text-[#111111] border-2 border-[#111111] font-syne font-black text-xl sm:text-3xl md:text-4xl uppercase px-5 py-1.5 rounded-lg shadow-sm">
                COMES IN
              </span>
            </div>

          </div>

          {/* ── Slack / LMS App Window Mockup with ZigZag Doodle ── */}
          <div className="relative pt-6 sm:pt-10 max-w-4xl mx-auto">
            
            {/* Top Floating Prompt Dialog */}
            <div className="mb-3 sm:mb-4 bg-white border-2 border-[#111111] rounded-2xl p-3 sm:p-4 shadow-brutal-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#60C5F1] border-2 border-[#111111] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Zap size={14} className="text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#111111]">
                    Hey Alex, <span className="text-[#2563eb] font-bold">@Sam</span> and <span className="text-[#2563eb] font-bold">@Pat</span> are in the Distributed Systems track today. Join them?
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Automated cohort coordination • Live verified room</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/courses"
                  className="bg-[#60C5F1] text-[#111111] border-2 border-[#111111] rounded-full px-3 py-1.5 text-xs font-bold hover:bg-[#48b8e9] transition"
                >
                  Start Learning
                </Link>
                <button
                  type="button"
                  onClick={() => toast.success('Passing for now.')}
                  className="bg-white text-[#111111] border-2 border-[#111111] rounded-full px-3 py-1.5 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Pass
                </button>
              </div>
            </div>

            {/* App Window Container */}
            <div className="relative bg-white border-2 border-[#111111] rounded-3xl shadow-brutal-lg overflow-hidden text-[#111111]">
              
              {/* Window Top Controls Bar */}
              <div className="bg-[#24172f] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#111111]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-black/30" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-black/30" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981] border border-black/30" />
                  <span className="text-xs text-white/70 font-mono-tag ml-2 hidden sm:inline">veyro.workspace // cohort-sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-[#60C5F1] text-[#111111] px-2.5 py-0.5 rounded-full border border-black/30">
                    LIVE COHORT ACTIVE
                  </span>
                </div>
              </div>

              {/* Window Body Grid: Sidebar + Main Schedule Canvas */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
                
                {/* Left Dark Sidebar */}
                <div className="md:col-span-4 bg-[#2b1b36] p-4 text-white/80 space-y-3 border-b md:border-b-0 md:border-r-2 md:border-[#111111] text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-syne font-bold text-white text-sm">Veyro Learning Hub</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-[#60C5F1] text-[#111111] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                      <span># distributed-systems</span>
                      <span className="text-[10px] bg-[#111111] text-white px-1.5 py-0.5 rounded">3 ACTIVE</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-white/70">
                      <span># state-machines</span>
                      <span className="text-[10px] text-white/40">12:00 PM</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-white/70">
                      <span># proctor-audits</span>
                      <span className="text-[10px] text-emerald-400 font-bold">100% PASS</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-white/70">
                      <span># cert-ledger</span>
                      <span className="text-[10px] text-[#FFF490] font-bold">8 ISSUED</span>
                    </div>
                  </div>
                </div>

                {/* Main Workspace Area */}
                <div className="md:col-span-8 p-5 sm:p-6 bg-[#FAF7EE] flex flex-col justify-between space-y-4 text-left">
                  
                  {/* Schedule Header & Status Chips */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-syne font-bold text-base sm:text-lg text-[#111111]">
                        Monday, 23 September
                      </span>
                      <span className="text-xs bg-[#FFF490] text-[#111111] border-2 border-[#111111] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        TODAY
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-[#60C5F1] border-2 border-[#111111] rounded-lg px-2.5 py-1 font-bold text-[#111111] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Progress (84%)
                      </span>
                      <span className="bg-white border-2 border-[#111111] rounded-lg px-2.5 py-1 font-bold text-[#111111]">
                        18/20 Lessons Verified
                      </span>
                      <span className="bg-[#FFF490] border-2 border-[#111111] rounded-lg px-2.5 py-1 font-bold text-[#111111]">
                        Exam Unlocked
                      </span>
                    </div>
                  </div>

                  {/* Floating Live Status Comment Bubble */}
                  <div className="bg-white border-2 border-[#111111] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
                    <img
                      src={AVATARS.dennis}
                      alt="Dennis"
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#111111] flex-shrink-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-[#111111]">
                        Dennis Ross reached 94% verified playback in Lesson 03.
                      </p>
                      <p className="text-[10px] text-slate-500">Timed server assessment is ready to take • 0 violations</p>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 font-semibold">Cohort Room: Live stream active</span>
                    <Link
                      to="/courses"
                      className="text-[#111111] hover:underline flex items-center gap-1"
                    >
                      Take Timed Assessment ↗
                    </Link>
                  </div>

                </div>

              </div>

            </div>

            {/* Hand-Drawn Squiggly Swoop Arrow on the Right */}
            <div className="absolute -bottom-8 -right-4 sm:-right-10 pointer-events-none hidden sm:block">
              <ZigZagSwoopDoodle />
            </div>

          </div>

          {/* ── 4 Yellow Benefit Cards with Hand-Drawn Line Doodles ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-8 sm:pt-14 text-left">
            
            {/* Card 1: Increases Visibility */}
            <div className="bg-[#FFF490] border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Increases Visibility
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Real-time telemetry on active learning and completion rates.
                </p>
              </div>
              <div className="pt-3 flex justify-center items-center">
                <GlassesDoodle />
              </div>
            </div>

            {/* Card 2: Enables Smart Coordination */}
            <div className="bg-[#FFF490] border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Enables Smart Coordination
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Automated cohort study pairing and peer evaluation milestones.
                </p>
              </div>
              <div className="pt-3 flex justify-center items-center">
                <SmartCoordinationDoodle />
              </div>
            </div>

            {/* Card 3: Optimises Office / Learning Utilisation */}
            <div className="bg-[#FFF490] border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Optimises Office Utilisation
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Streamlined course completion with guaranteed verified watch-time.
                </p>
              </div>
              <div className="pt-3 flex justify-center items-center">
                <ClockGaugeDoodle />
              </div>
            </div>

            {/* Card 4: Strengthens Work Culture */}
            <div className="bg-[#FFF490] border-2 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[200px] sm:min-h-[220px] transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                  Strengthens Work Culture
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Certified credentials and shared mastery that teams celebrate.
                </p>
              </div>
              <div className="pt-3 flex justify-center items-center">
                <SteamingCupDoodle />
              </div>
            </div>

          </div>

          {/* ── Social Proof & Crosshair Logo Grid (Still on Sky Blue #60C5F1) ── */}
          <div className="pt-14 sm:pt-20 space-y-8 sm:space-y-10 text-left">
            
            {/* Headline with Orange Sticker Badge */}
            <div className="space-y-2">
              <h3 className="font-syne font-black text-2xl sm:text-4xl md:text-5xl text-[#111111] uppercase tracking-tight leading-[1.08] max-w-3xl">
                HELPING{' '}
                <span className="inline-block bg-[#FF6B4A] text-white border-2 border-[#111111] px-3 sm:px-4 py-0.5 rounded-lg -rotate-2 font-syne font-black text-2xl sm:text-4xl shadow-xs mx-1">
                  1,000'S
                </span>{' '}
                FLEXIBLE COMPANIES AVOID OFFICE MANDATES
              </h3>
            </div>

            {/* 6-Cell Crosshair Logo Grid */}
            <div className="border-t-2 border-b-2 border-[#111111] grid grid-cols-2 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#111111]">
              
              {/* Row 1, Col 1: Adaptavist */}
              <div className="p-6 sm:p-8 flex items-center justify-center gap-2.5 font-bold text-base sm:text-lg text-[#111111]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#111111" strokeWidth="2" fill="none" />
                </svg>
                <span className="font-syne tracking-tight">Adaptavist</span>
              </div>

              {/* Row 1, Col 2: marshmallow */}
              <div className="p-6 sm:p-8 flex items-center justify-center gap-2 font-bold text-base sm:text-lg text-[#111111] border-l-2 md:border-l-0 border-[#111111]">
                <div className="w-4 h-4 bg-[#111111] rounded-sm" />
                <span className="tracking-tight lowercase font-bold">marshmallow</span>
              </div>

              {/* Row 1, Col 3: ultra ninja */}
              <div className="col-span-2 md:col-span-1 p-6 sm:p-8 flex items-center justify-center gap-2.5 font-bold text-base sm:text-lg text-[#111111] border-t-2 md:border-t-0 border-[#111111]">
                <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-black">
                  🥷
                </div>
                <span className="font-mono-tag tracking-wider text-sm sm:text-base lowercase font-bold">ultra ninja</span>
              </div>

            </div>

            <div className="border-b-2 border-[#111111] grid grid-cols-2 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#111111] -mt-8 sm:-mt-10">
              
              {/* Row 2, Col 1: Lemonade */}
              <div className="p-6 sm:p-8 flex items-center justify-center font-serif italic text-xl sm:text-2xl text-[#111111] font-bold">
                <span>Lemonade</span>
              </div>

              {/* Row 2, Col 2: Bolt */}
              <div className="p-6 sm:p-8 flex items-center justify-center gap-1.5 font-syne font-black text-xl sm:text-2xl text-[#111111] border-l-2 md:border-l-0 border-[#111111]">
                <span className="text-amber-500">⚡</span>
                <span className="tracking-tighter uppercase">Bolt</span>
              </div>

              {/* Row 2, Col 3: Remote */}
              <div className="col-span-2 md:col-span-1 p-6 sm:p-8 flex items-center justify-center font-serif text-lg sm:text-xl text-[#111111] font-bold border-t-2 md:border-t-0 border-[#111111]">
                <span className="tracking-wide">Remote</span>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION D: SEAMLESS INTEGRATION (Cream #FAF7EE)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="solution" className="reveal-section bg-[#FAF7EE] py-16 sm:py-24 px-4 sm:px-8 lg:px-14 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">

          {/* Top Headline + Integrations Pill Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl text-[#111111] uppercase tracking-tight leading-[1.02] max-w-2xl">
              VEYRO WILL <br />
              INTEGRATE WITH <br />
              YOUR WORK <br />
              SEAMLESSLY.
            </h2>

            <div>
              <Link
                to="/courses"
                className="bg-[#60C5F1] text-[#111111] border-2 border-[#111111] rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:bg-[#48b8e9] transition shadow-xs inline-flex items-center gap-2"
              >
                <span>+ INTEGRATIONS DIRECTORY</span>
              </Link>
            </div>
          </div>

          {/* 2-Column Layout: Visual Card on Left + 4-Row Matrix on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Modern Learning Visual Card with Sticker Overlays */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl border-2 border-[#111111] overflow-hidden bg-white shadow-brutal">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80"
                  alt="Student Collaborating"
                  className="w-full aspect-[4/3] object-cover"
                />

                {/* Top-Left Yellow Sticker */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFF490] text-[#111111] border-2 border-[#111111] rounded-lg px-2.5 py-1 text-[11px] font-syne font-black uppercase shadow-xs">
                    ⚡ LIVE COHORT
                  </span>
                </div>

                {/* Bottom-Left Purple Pill */}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-[#a855f7] text-white border-2 border-[#111111] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> 90% VERIFIED STREAM
                  </span>
                </div>

                {/* Bottom-Right White Check Tag */}
                <div className="absolute bottom-4 right-4 bg-white border-2 border-[#111111] rounded-xl px-2.5 py-1 text-[10px] font-bold shadow-xs">
                  AUDIT #VY-8920 OK
                </div>
              </div>
            </div>

            {/* Right Column: 4-Row Numbered Interactive List with Diagonal Arrows */}
            <div className="lg:col-span-7 divide-y-2 divide-[#111111] border-y-2 border-[#111111] relative">
              
              {/* Row 1 */}
              <div 
                onClick={() => setActiveAccordion(0)}
                className={`py-5 px-3 sm:px-4 cursor-pointer transition-colors ${activeAccordion === 0 ? 'bg-[#FFF490]/40' : 'hover:bg-black/5'} flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-syne font-black text-lg sm:text-xl text-[#111111] w-6 flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                      See who is in and what's going on in the Learning Track
                    </h4>
                    <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${activeAccordion === 0 ? 'block' : 'hidden sm:block'}`}>
                      Instant visibility into active student streams, proctored assessments, and completion rates.
                    </p>
                  </div>
                </div>
                <span className="font-syne font-black text-xl text-[#111111] flex-shrink-0">
                  {activeAccordion === 0 ? '↙' : '↗'}
                </span>
              </div>

              {/* Row 2 */}
              <div 
                onClick={() => setActiveAccordion(1)}
                className={`py-5 px-3 sm:px-4 cursor-pointer transition-colors ${activeAccordion === 1 ? 'bg-[#FFF490]/40' : 'hover:bg-black/5'} flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-syne font-black text-lg sm:text-xl text-[#111111] w-6 flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                      Effortless collaboration through automated Suggestions
                    </h4>
                    <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${activeAccordion === 1 ? 'block' : 'hidden sm:block'}`}>
                      Sync cohort study groups and auto-schedule proctored peer evaluations.
                    </p>
                  </div>
                </div>
                <span className="font-syne font-black text-xl text-[#111111] flex-shrink-0">
                  {activeAccordion === 1 ? '↙' : '↗'}
                </span>
              </div>

              {/* Row 3 */}
              <div 
                onClick={() => setActiveAccordion(2)}
                className={`py-5 px-3 sm:px-4 cursor-pointer transition-colors ${activeAccordion === 2 ? 'bg-[#FFF490]/40' : 'hover:bg-black/5'} flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-syne font-black text-lg sm:text-xl text-[#111111] w-6 flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                      Revitalise your Skill Culture with certified credentials
                    </h4>
                    <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${activeAccordion === 2 ? 'block' : 'hidden sm:block'}`}>
                      Issue verifiable cryptographically backed certificates your team and recruiters trust.
                    </p>
                  </div>
                </div>
                <span className="font-syne font-black text-xl text-[#111111] flex-shrink-0">
                  {activeAccordion === 2 ? '↙' : '↗'}
                </span>
              </div>

              {/* Row 4 */}
              <div 
                onClick={() => setActiveAccordion(3)}
                className={`py-5 px-3 sm:px-4 cursor-pointer transition-colors ${activeAccordion === 3 ? 'bg-[#FFF490]/40' : 'hover:bg-black/5'} flex items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-syne font-black text-lg sm:text-xl text-[#111111] w-6 flex-shrink-0">
                    4
                  </span>
                  <div>
                    <h4 className="font-syne font-bold text-base sm:text-lg text-[#111111] leading-snug">
                      Understand how Course Content is being used
                    </h4>
                    <p className={`text-xs text-slate-600 mt-1 leading-relaxed ${activeAccordion === 3 ? 'block' : 'hidden sm:block'}`}>
                      Deep telemetry on playback retention, quiz difficulty curves, and dropout bottlenecks.
                    </p>
                  </div>
                </div>
                <span className="font-syne font-black text-xl text-[#111111] flex-shrink-0">
                  {activeAccordion === 3 ? '↙' : '↗'}
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION E: THREE SIMPLE STEPS (Warm Olive Sand #D8D1BE)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="steps" className="reveal-section bg-[#D8D1BE] py-16 sm:py-24 px-4 sm:px-8 lg:px-14 border-editorial-b relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl text-[#111111] uppercase tracking-tight leading-[1.02]">
                    THREE <br />
                    SIMPLE <br />
                    STEPS
                  </h2>
                  <CurvedStepsArrow />
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-md">
                  Getting certified on Veyro is transparent, rigorous, and automated from your first stream to ledger verification.
                </p>
              </div>

              {/* 3 Step Details */}
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#111111] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm font-body">
                    01
                  </span>
                  <div>
                    <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                      1. Choose what you want to master
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      Select your specialized curriculum in full-stack, distributed systems, or cloud architecture.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#60C5F1] text-[#111111] border-2 border-[#111111] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm font-body">
                    02
                  </span>
                  <div>
                    <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                      2. Learn with verified anti-cheat streaming
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      Stream verified 90% video playback and pass timed assessments with zero tab violations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#FFF490] text-[#111111] border-2 border-[#111111] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm font-body">
                    03
                  </span>
                  <div>
                    <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                      3. Earn your tamper-proof certificate
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      Download your vector PDF certificate stamped with an immutable cryptographic verification hash.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="bg-[#60C5F1] text-[#111111] border-2 border-[#111111] rounded-full px-6 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider hover:bg-[#48b8e9] transition shadow-xs inline-flex items-center gap-2"
                >
                  <span>+ START STEP 01 NOW</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Sleek Device Workspace Mockup */}
            <div className="lg:col-span-6 flex justify-center items-center py-4">
              <div className="relative w-full max-w-[340px] sm:max-w-[360px]">

                <div className="relative rounded-[46px] p-[3px] bg-gradient-to-b from-[#5c5c60] via-[#242426] to-[#3a3a3c] shadow-brutal-lg">
                  <div className="rounded-[43px] p-[8px] bg-[#0c0d0f]">
                    <div className="rounded-[36px] overflow-hidden bg-[#FAF7EE] relative flex flex-col justify-between min-h-[560px] p-4 sm:p-5 text-[#111111] space-y-3.5 border border-black/10">

                      {/* Top iOS Bar */}
                      <div className="flex items-center justify-between pt-1 pb-1 relative z-20">
                        <span className="text-[12px] font-semibold text-[#111111] tracking-tight pl-2">
                          9:41
                        </span>
                        <div className="w-[90px] h-[22px] bg-black rounded-full flex items-center justify-between px-2.5 mx-auto">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c28]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a14]" />
                        </div>
                        <div className="flex items-center gap-1.5 pr-2 text-[#111111]">
                          <IosSignalIcon />
                          <IosWifiIcon />
                          <IosBatteryIcon />
                        </div>
                      </div>

                      {/* Veyro Pro Header */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-syne font-black text-xl lowercase text-[#111111]">
                          veyro<span className="text-[#60C5F1]">.</span>
                        </span>
                        <span className="text-[10px] font-bold bg-[#FFF490] border border-[#111111] px-2 py-0.5 rounded-full uppercase">
                          PRO LEARNER
                        </span>
                      </div>

                      {/* Active Learning Track Module */}
                      <div className="bg-[#60C5F1] border-2 border-[#111111] rounded-2xl p-4 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 rounded-full">
                            CURRENT MODULE
                          </span>
                          <span className="text-[10px] font-bold text-[#111111] font-mono-tag">
                            LESSON 7/9
                          </span>
                        </div>
                        <h4 className="font-syne font-bold text-sm text-[#111111]">
                          Distributed Systems Architecture
                        </h4>
                        <div className="space-y-1">
                          <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden border border-black/15">
                            <div className="bg-[#111111] h-full rounded-full" style={{ width: '84%' }} />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-[#111111]">
                            <span>Progress: 84%</span>
                            <span>90% Threshold Required</span>
                          </div>
                        </div>
                      </div>

                      {/* Proctor Guard Ready Status */}
                      <div className="bg-white border-2 border-[#111111] rounded-xl p-3 flex items-center gap-3 shadow-xs">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-600/30">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none text-[#111111]">Assessment Ready</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Server Proctor Armed (0 Violations)</p>
                        </div>
                      </div>

                      {/* Verified Certificate Badge */}
                      <div className="bg-[#FFF490] border-2 border-[#111111] rounded-xl p-3 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#111111]" />
                          <span className="text-xs font-bold text-[#111111]">Certificate #VY-8921</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 rounded-full">
                          VERIFIED
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        <Link
                          to="/courses"
                          className="w-full bg-[#111111] text-white border-2 border-[#111111] text-center block text-xs font-bold py-2.5 rounded-full hover:bg-black transition shadow-xs uppercase tracking-wider"
                        >
                          Resume Study Session ↗
                        </Link>
                      </div>

                      <div className="pt-1">
                        <div className="w-32 h-1 bg-[#111111]/25 rounded-full mx-auto" />
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION F: FINAL CTA (Butter Yellow Panel)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="reveal-section bg-[#FAF7EE] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FFF490] border-editorial-2 rounded-3xl p-8 sm:p-14 shadow-brutal text-center space-y-6 relative overflow-hidden">

            <div className="inline-flex items-center gap-2">
              <span className="sticker-yellow bg-white text-xs px-3.5 py-1">
                START YOUR VERIFIED JOURNEY TODAY
              </span>
              <DoodleSparkle />
            </div>

            <h2 className="text-display-section text-[#111111] max-w-2xl mx-auto">
              READY TO MAKE FLEXIBLE LEARNING REALLY WORK?
            </h2>

            <p className="text-xs sm:text-sm text-body-copy max-w-lg mx-auto leading-relaxed">
              Join thousands of ambitious students, instructors, and teams transforming distance education with guaranteed verified mastery.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="btn-sky-pill px-6 py-3 shadow-brutal-sm"
              >
                <span>START FREE TRIAL</span>
              </Link>
              <Link
                to="/courses"
                className="btn-white-pill px-5 py-3 shadow-brutal-sm"
              >
                <span>EXPLORE COURSE CATALOG</span>
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION J: EDITORIAL POP-UP GROCER-STYLE VEYRO FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="font-body selection:bg-[#60C5F1] selection:text-[#111111]">
        
        {/* ── 1. Top Social Bar (Cream #FAF7EE) ── */}
        <div className="bg-[#FAF7EE] border-t-2 border-[#1E3A8A] py-5 px-6 sm:px-12 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Retro Surveillance Camera / Megaphone Icon */}
            <svg 
              viewBox="0 0 32 24" 
              className="w-8 h-6 fill-[#60C5F1] stroke-[#1E3A8A] stroke-2 transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${Math.sin(scrollY * 0.003) * 8}deg)`
              }}
            >
              <path d="M 4 8 L 22 4 L 22 18 L 4 14 Z" />
              <rect x="22" y="8" width="6" height="6" rx="1" fill="#FFF490" />
              <circle cx="10" cy="11" r="2.5" fill="#EF4444" stroke="#1E3A8A" strokeWidth="1.5" />
              <path d="M 12 16 L 8 22" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="font-syne font-black text-lg tracking-tight text-[#1E3A8A] lowercase">
              follow us
            </span>
          </div>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-syne font-black text-base sm:text-lg tracking-tight text-[#1E3A8A] hover:underline lowercase"
          >
            @veyro.learning
          </a>
        </div>

        {/* ── 2. Main Butter Yellow Content Block (#FFF490) ── */}
        <div className="bg-[#FFF490] border-t-2 border-[#1E3A8A] text-[#1E3A8A] pt-12 sm:pt-16 pb-8 px-6 sm:px-12 lg:px-16 relative overflow-hidden">
          
          <div className="max-w-7xl mx-auto space-y-12">

            {/* Giant Editorial Serif Headline */}
            <h2 
              className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#1E3A8A] tracking-tight leading-[1.05] font-normal transition-transform duration-100 ease-out"
              style={{
                transform: `translateY(${Math.sin(scrollY * 0.002) * 6}px)`
              }}
            >
              Thank you for your ambition.
            </h2>

            {/* 5-Column Navigation Grid + Stamp */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 items-start pt-2">
              
              {/* Stamp Column */}
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <VeyroSmileyBadge scrollY={scrollY} />
              </div>

              {/* Col 1: Headquarters */}
              <div className="col-span-1 lg:col-span-2 space-y-2 text-xs sm:text-[13px] leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[#1E3A8A] pb-1 font-body">
                  HEADQUARTERS
                </p>
                <p>540 Howard Street</p>
                <p>San Francisco, CA</p>
                <p>94105</p>
                <p className="pt-2 text-[11px] opacity-80">24/7 Verified Audits</p>
              </div>

              {/* Col 2: Explore */}
              <div className="col-span-1 lg:col-span-2 space-y-2 text-xs sm:text-[13px] leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[#1E3A8A] pb-1 font-body">
                  EXPLORE
                </p>
                <div className="flex flex-col space-y-1.5 font-medium">
                  <Link to="/courses" className="hover:underline">Course Catalog</Link>
                  <Link to="/courses" className="hover:underline">Learning Tracks</Link>
                  <Link to="/login" className="hover:underline">Proctor Engine</Link>
                  <Link to="/verify/VY-DEMO-2026" className="hover:underline">Public Ledger</Link>
                </div>
              </div>

              {/* Col 3: Learn */}
              <div className="col-span-1 lg:col-span-2 space-y-2 text-xs sm:text-[13px] leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[#1E3A8A] pb-1 font-body">
                  LEARN
                </p>
                <div className="flex flex-col space-y-1.5 font-medium">
                  <Link to="/" className="hover:underline">About Us</Link>
                  <Link to="/courses" className="hover:underline">Anti-Cheat AI</Link>
                  <Link to="/login" className="hover:underline">Instructor Desk</Link>
                  <Link to="/courses" className="hover:underline">Audit Blog</Link>
                  <a href="#steps" className="hover:underline">FAQ</a>
                </div>
              </div>

              {/* Col 4: Let's Talk Shop */}
              <div className="col-span-1 lg:col-span-2 space-y-2 text-xs sm:text-[13px] leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[#1E3A8A] pb-1 font-body">
                  LET&apos;S TALK SHOP
                </p>
                <p className="text-[12px] opacity-90">Questions? Comments?</p>
                <p className="text-[12px] opacity-90">Enterprise & Recruiter info:</p>
                <a href="mailto:admissions@veyro.edu" className="font-semibold underline block">
                  admissions@veyro.edu
                </a>
                <p className="pt-2 text-[12px]">Direct Proctor Line:</p>
                <p className="font-bold">+1 (800) 555-VEYRO</p>
              </div>

              {/* Col 5: Newsletter Box */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-3">
                <p className="text-xs sm:text-[13px] leading-snug opacity-95">
                  Join 25,000+ ambitious learners & engineers who already receive our weekly curriculum drops.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newsletterEmail || !newsletterEmail.includes('@')) {
                      toast.error('Please enter a valid email address.');
                      return;
                    }
                    toast.success(`Subscribed ${newsletterEmail} to Veyro drops!`);
                    setNewsletterEmail('');
                  }}
                  className="pt-1"
                >
                  <div className="border-2 border-[#1E3A8A] flex items-center justify-between px-3 py-2 bg-transparent focus-within:ring-2 focus-within:ring-[#1E3A8A]/30">
                    <input
                      type="email"
                      placeholder="Email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs text-[#1E3A8A] placeholder-[#1E3A8A]/60 w-full font-medium"
                    />
                    <button type="submit" className="text-[#1E3A8A] font-bold text-base hover:translate-x-0.5 transition-transform">
                      →
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Mascot Character Doodle (Right Bottom with Parallax) */}
            <FooterMascotDoodle scrollY={scrollY} />

            {/* Wavy Divider Line with Parallax */}
            <div className="pt-8">
              <WavyDividerLine scrollY={scrollY} />
            </div>

            {/* Bottom Legal Links & Social Media Icons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold tracking-wider uppercase text-[#1E3A8A] gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <button onClick={() => toast('Refund Policy: 14-day guaranteed refund.')} className="hover:underline">
                  REFUND POLICY
                </button>
                <button onClick={() => toast('Privacy Policy: Enterprise zero data selling.')} className="hover:underline">
                  PRIVACY POLICY
                </button>
                <button onClick={() => toast('Terms: Server authoritative assessments.')} className="hover:underline">
                  TERMS OF SERVICE
                </button>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4 text-base">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="TikTok">
                  <TikTokIcon className="w-4 h-4" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Discord">
                  <DiscordIcon className="w-4 h-4" />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="X">
                  <XIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

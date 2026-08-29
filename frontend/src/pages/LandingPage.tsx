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
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Hand-Drawn Static SVG Accents & Doodles ──────────────────────────────────

function SquiggleUnderlineHero() {
  return (
    <svg
      viewBox="0 0 320 24"
      className="w-full h-4 sm:h-5 md:h-6 fill-none stroke-[#111111] stroke-[3.5] stroke-linecap-round stroke-linejoin-round overflow-visible pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 4 15 C 45 4, 95 24, 145 10 C 195 -2, 245 22, 285 8 C 300 3, 312 14, 316 12"
        className="animate-draw-loop"
        pathLength="100"
      />
    </svg>
  );
}

function CurvedArrowHero() {
  return (
    <svg
      viewBox="0 0 110 110"
      className="w-16 h-16 sm:w-20 sm:h-20 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round"
      aria-hidden="true"
    >
      <path d="M 22 15 C 55 10, 90 32, 75 70 C 65 92, 32 82, 44 58 C 54 42, 80 58, 74 95" />
      <path d="M 58 84 L 75 98 L 92 78" />
    </svg>
  );
}

function LoopDoodleBig() {
  return (
    <svg
      viewBox="0 0 90 65"
      className="w-12 h-9 sm:w-16 sm:h-12 fill-none stroke-[#111111] stroke-[2.75] stroke-linecap-round stroke-linejoin-round inline-block align-middle ml-2"
      aria-hidden="true"
    >
      <path d="M 12 36 C 26 12, 64 12, 74 28 C 84 46, 56 60, 38 50 C 22 40, 48 18, 74 34 L 82 42" />
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

// ── Static Line-Art Problem Card Illustrations ───────────────────────────────

function LaptopSignalIconHero() {
  return (
    <svg viewBox="0 0 100 70" className="w-20 h-14 fill-none stroke-[#111111] stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <rect x="22" y="12" width="56" height="38" rx="4" fill="#ffffff" strokeWidth="2" />
      <line x1="34" y1="24" x2="66" y2="24" strokeWidth="2" />
      <line x1="38" y1="32" x2="62" y2="32" strokeWidth="2" />
      <path d="M 12 52 L 88 52 C 92 52, 93 55, 90 58 L 84 61 L 16 61 L 10 58 C 7 55, 8 52, 12 52 Z" fill="#ffffff" strokeWidth="2" />
      <path d="M 10 20 C 15 25, 15 35, 10 40" strokeWidth="2" />
      <path d="M 90 20 C 85 25, 85 35, 90 40" strokeWidth="2" />
      <path d="M 5 13 C 12 21, 12 44, 5 52" strokeWidth="2" />
      <path d="M 95 13 C 88 21, 88 44, 95 52" strokeWidth="2" />
    </svg>
  );
}

function ChaosCloudIconHero() {
  return (
    <svg viewBox="0 0 100 70" className="w-20 h-14 fill-none stroke-[#111111] stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <path d="M 28 42 C 20 42, 14 36, 18 26 C 16 18, 24 12, 34 14 C 40 8, 54 10, 58 18 C 66 14, 76 18, 76 26 C 84 30, 80 40, 74 44 C 78 52, 68 60, 58 56 C 52 60, 40 56, 34 52 C 26 56, 18 50, 28 42 Z" fill="#ffffff" strokeWidth="2" />
      <path d="M 32 30 C 42 22, 54 38, 66 28 C 70 36, 50 44, 42 36 C 36 42, 56 50, 64 42" strokeWidth="2" />
      <line x1="14" y1="14" x2="18" y2="18" strokeWidth="2" />
      <line x1="86" y1="18" x2="82" y2="22" strokeWidth="2" />
      <line x1="86" y1="54" x2="82" y2="50" strokeWidth="2" />
    </svg>
  );
}

function SadCrossIconHero() {
  return (
    <svg viewBox="0 0 100 70" className="w-20 h-14 fill-none stroke-[#111111] stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <rect x="30" y="12" width="42" height="46" rx="10" fill="#ffffff" strokeWidth="2" />
      <line x1="42" y1="22" x2="58" y2="34" strokeWidth="2.75" />
      <line x1="58" y1="22" x2="42" y2="34" strokeWidth="2.75" />
      <path d="M 40 48 C 44 44, 56 44, 60 48" strokeWidth="2.5" />
      <circle cx="20" cy="26" r="3.5" strokeWidth="1.75" />
      <circle cx="80" cy="44" r="4" strokeWidth="1.75" />
    </svg>
  );
}

function InspectSearchIconHero() {
  return (
    <svg viewBox="0 0 100 70" className="w-20 h-14 fill-none stroke-[#111111] stroke-[2] stroke-linecap-round stroke-linejoin-round">
      <circle cx="44" cy="30" r="21" fill="#ffffff" strokeWidth="2.5" />
      <line x1="60" y1="46" x2="80" y2="62" strokeWidth="4" />
      <circle cx="36" cy="28" r="2" fill="#111111" />
      <circle cx="50" cy="28" r="2" fill="#111111" />
      <path d="M 38 38 C 42 35, 48 35, 50 38" strokeWidth="2" />
      <line x1="14" y1="18" x2="20" y2="22" strokeWidth="2" />
      <line x1="10" y1="34" x2="16" y2="34" strokeWidth="2" />
      <line x1="14" y1="50" x2="20" y2="46" strokeWidth="2" />
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

// ── Organic Labs Shape SVGs & Social Icons ───────────────────────────────────

function ScallopedFlowerShape({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor">
      <path d="M100,0 C115,20 138,16 150,6 C160,22 180,26 188,44 C184,62 198,76 196,94 C198,112 184,126 188,144 C180,162 160,166 150,182 C138,172 115,168 100,188 C85,168 62,172 50,182 C40,166 20,162 12,144 C16,126 2,112 4,94 C2,76 16,62 12,44 C20,26 40,22 50,6 C62,16 85,20 100,0 Z" />
    </svg>
  );
}

function OrganicCrossBlob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor">
      <path d="M72,12 C72,2 128,2 128,12 C128,48 152,72 188,72 C198,72 198,128 188,128 C152,128 128,152 128,188 C128,198 72,198 72,188 C72,152 48,128 12,128 C2,128 2,72 12,72 C48,72 72,48 72,12 Z" />
    </svg>
  );
}

function LilacPillBlob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} fill="currentColor">
      <path d="M40,30 C90,8 160,8 200,32 C230,55 235,115 205,145 C170,175 75,175 35,145 C5,115 0,55 40,30 Z" />
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

function RedditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.492 1.207-.492.941 0 1.704.763 1.704 1.704 0 .614-.324 1.152-.809 1.45.015.148.023.298.023.45 0 2.302-2.678 4.17-5.981 4.17s-5.981-1.868-5.981-4.17c0-.152.008-.302.023-.45-.485-.298-.809-.836-.809-1.45 0-.941.763-1.704 1.704-1.704.477 0 .899.183 1.207.492 1.194-.856 2.85-1.418 4.674-1.488l.8-3.747 2.597.547a1.248 1.248 0 0 1 1.249-1.249z" />
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

// ── Curated Avatars ──────────────────────────────────────────────────────────
const AVATARS = {
  heroGuy: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  sarah: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  marcus: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  elena: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  alex: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  david: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  leila: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<number>(0);
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

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) {
      toast.error('Please enter a certificate verification code.');
      return;
    }
    navigate(`/verify/${verifyCodeInput.trim()}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success(`Subscribed ${newsletterEmail} to Veyro updates.`);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#1E293B] font-body selection:bg-[#FFF490] selection:text-[#111111]">

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION A: NAVBAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7EE] pt-6 sm:pt-8 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 border-editorial-b relative overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* ── TOP HEADER ── */}
          <header className="flex items-center justify-between gap-4 pb-10 sm:pb-14">
            {/* Left: Lowercase organic wordmark logo: veyro. */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-1">
                <span className="font-syne font-extrabold text-3xl sm:text-4xl tracking-tight text-[#111111] lowercase">
                  veyro<span className="text-[#60C5F1]">.</span>
                </span>
              </Link>
            </div>

            {/* Subtitle Tagline */}
            <div className="hidden lg:block max-w-xs text-xs font-medium text-[#1E293B]/70 leading-snug">
              The verified learning platform for <br />
              accredited online mastery.
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/courses"
                className="btn-sky-pill"
              >
                <span>BOOK A DEMO</span>
              </Link>

              <Link
                to="/login"
                className="btn-dark-pill hidden sm:inline-flex"
              >
                <span>SIGN IN</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-[#111111] text-white rounded-full hover:bg-black transition flex items-center justify-center sm:hidden shadow-sm"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              <a
                href="#steps"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-[#111111] p-2 rounded-lg hover:bg-[#FAF7EE]"
              >
                Three Simple Steps
              </a>
              <div className="pt-2 border-t border-black/10 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 bg-white border-editorial-2 rounded-full text-xs font-bold uppercase tracking-wider font-body"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 bg-[#111111] text-white rounded-full text-xs font-bold uppercase tracking-wider font-body"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION B: HERO SECTION
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative pt-4 sm:pt-6 pb-8 sm:pb-12">

            {/* Floating Status Badge 1 (Top Left): ENROLLED Sarah Jenkins */}
            <div className="hidden sm:inline-flex status-pill absolute -top-5 left-16 md:left-24 -rotate-2 z-20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]/70 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-[#60C5F1]" /> ENROLLED
              </span>
              <span className="font-bold text-xs text-[#111111]">Sarah Jenkins</span>
              <img
                src={AVATARS.sarah}
                alt="Sarah"
                className="w-5 h-5 rounded-full object-cover border border-[#111111]"
              />
            </div>

            {/* Floating Status Badge 2 (Top Right): QUIZ ACTIVE Marcus Vance */}
            <div className="hidden md:inline-flex status-pill absolute -top-4 right-16 lg:right-32 rotate-2 z-20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" /> QUIZ ACTIVE
              </span>
              <span className="font-bold text-xs text-[#111111]">Marcus Vance</span>
              <img
                src={AVATARS.marcus}
                alt="Marcus"
                className="w-5 h-5 rounded-full object-cover border border-[#111111]"
              />
            </div>

            {/* Main Headline: Multi-line massive uppercase with inline circular avatar */}
            <div className="w-full">
              <h1 className="text-display-hero text-[#111111] select-none max-w-5xl">
                <span>MAKE </span>
                {/* Embedded Circular Avatar Cutout */}
                <span className="inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2.5">
                  <span className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-editorial-2 overflow-hidden shadow-brutal-sm inline-block">
                    <img
                      src={AVATARS.heroGuy}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </span>
                </span>
                <span> ONLINE</span> <br />
                <span className="relative inline-block">
                  LEARNING,
                  {/* Hand-Drawn Squiggly Underline */}
                  <span className="absolute -bottom-2 sm:-bottom-3 left-0 w-full pointer-events-none">
                    <SquiggleUnderlineHero />
                  </span>
                </span>
                <span> REALLY WORK</span>
              </h1>
            </div>

            {/* Lower Hero Row: Curved Arrow, CTA & Verification Input */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative">

              {/* Left Column: CTA with Sketchy Vector Arrow */}
              <div className="md:col-span-6 space-y-3">
                <div className="relative inline-block pt-8 sm:pt-10 pl-8 sm:pl-12">

                  {/* Static Hand-drawn Curved Arrow */}
                  <div className="absolute -top-4 left-0 sm:left-1 pointer-events-none">
                    <CurvedArrowHero />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/register"
                      className="btn-sky-pill px-6 py-3 shadow-brutal-sm"
                    >
                      <span>START FREE TRIAL</span>
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-body-copy pt-1 pl-2">
                  Server-verified anti-cheat assessments • 90% watch auditing
                </p>
              </div>

              {/* Right Column: Floating Status Badges & Certificate Verification Form */}
              <div className="md:col-span-6 flex flex-col items-start md:items-end justify-between gap-4">

                {/* Floating Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="status-pill -rotate-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> PROCTOR
                    </span>
                    <span className="font-bold text-xs text-[#111111]">0 Violations</span>
                    <img
                      src={AVATARS.elena}
                      alt="Elena"
                      className="w-5 h-5 rounded-full object-cover border border-[#111111]"
                    />
                  </div>

                  <div className="status-pill rotate-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]/70 flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#60C5F1]" /> CERTIFIED
                    </span>
                    <span className="font-bold text-xs text-[#111111]">Alex Morgan</span>
                    <img
                      src={AVATARS.alex}
                      alt="Alex"
                      className="w-5 h-5 rounded-full object-cover border border-[#111111]"
                    />
                  </div>
                </div>

                {/* Certificate Verification Lookup */}
                <div className="w-full sm:w-auto bg-white border-editorial-2 rounded-xl p-2.5 shadow-brutal-sm flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111] px-1 font-body">
                    VERIFY:
                  </span>
                  <form onSubmit={handleVerifySubmit} className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cert Code (e.g. VY-8921)"
                        value={verifyCodeInput}
                        onChange={(e) => setVerifyCodeInput(e.target.value)}
                        className="w-full sm:w-48 bg-[#FAF7EE] border border-black/20 text-xs rounded-full px-3 py-1.5 pr-7 focus:outline-none focus:border-[#111111] font-body font-medium text-[#1E293B]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#111111] text-white hover:bg-black text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition font-body"
                    >
                      Check ↗
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION C: VALUE MATRIX / 4-COLUMN BENTO ROW (Butter Yellow #FFF490)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFF490] py-10 sm:py-14 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-editorial-2 rounded-2xl p-6 sm:p-8 shadow-brutal">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#111111]/20">

              {/* Card 1 */}
              <div className="pt-3 sm:pt-0 sm:px-4 first:pl-0 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-5 h-5 text-[#111111]" />
                  <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                    90% Watch Auditing
                  </h4>
                </div>
                <p className="text-xs text-body-copy leading-relaxed">
                  Real-time watch streams track exact student interaction without relying on fake progress bars.
                </p>
              </div>

              {/* Card 2 */}
              <div className="pt-3 sm:pt-0 sm:px-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#111111]" />
                  <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                    Anti-Cheat Guardian
                  </h4>
                </div>
                <p className="text-xs text-body-copy leading-relaxed">
                  Server timers and live tab violation detection guarantee exam and quiz integrity.
                </p>
              </div>

              {/* Card 3 */}
              <div className="pt-3 sm:pt-0 sm:px-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-[#111111]" />
                  <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                    Ledger Verification
                  </h4>
                </div>
                <p className="text-xs text-body-copy leading-relaxed">
                  Zero-auth public verification portal allows instant recruiter and employer audit.
                </p>
              </div>

              {/* Card 4 */}
              <div className="pt-3 sm:pt-0 sm:px-4 last:pr-0 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#111111]" />
                  <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                    Tamper-Proof Credentials
                  </h4>
                </div>
                <p className="text-xs text-body-copy leading-relaxed">
                  Tamper-proof vector PDF certificates stamped with unique hashes verifiable anywhere.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION D: PROBLEM / FRICTION SECTION (Bright Sky Blue #60C5F1)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="bg-[#60C5F1] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">

          {/* Title: ONLINE EDUCATION IS [GREAT BUT] with loop doodle */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <h2 className="font-syne font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#111111] uppercase tracking-tight">
                ONLINE EDUCATION IS
              </h2>
              {/* Slanted Yellow Sticker Badge */}
              <span className="sticker-yellow text-xl sm:text-3xl px-4 py-1 -rotate-3 shadow-brutal-sm">
                GREAT BUT
              </span>
              {/* Loop Doodle */}
              <LoopDoodleBig />
            </div>
          </div>

          {/* 4 White Problem Cards in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

            {/* Card 1 */}
            <div className="bg-white border-editorial-2 rounded-2xl p-5 sm:p-6 shadow-brutal-sm flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
              <div>
                <h3 className="text-card-heading text-base sm:text-lg text-[#111111]">
                  Passive Watching without Retention
                </h3>
              </div>
              <div className="pt-4 flex justify-center">
                <LaptopSignalIconHero />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-editorial-2 rounded-2xl p-5 sm:p-6 shadow-brutal-sm flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
              <div>
                <h3 className="text-card-heading text-base sm:text-lg text-[#111111]">
                  Rampant Assessment Cheating
                </h3>
              </div>
              <div className="pt-4 flex justify-center">
                <ChaosCloudIconHero />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border-editorial-2 rounded-2xl p-5 sm:p-6 shadow-brutal-sm flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
              <div>
                <h3 className="text-card-heading text-base sm:text-lg text-[#111111]">
                  Unverified Resume Credentials
                </h3>
              </div>
              <div className="pt-4 flex justify-center">
                <SadCrossIconHero />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border-editorial-2 rounded-2xl p-5 sm:p-6 shadow-brutal-sm flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
              <div>
                <h3 className="text-card-heading text-base sm:text-lg text-[#111111]">
                  Zero Real-Time Verification
                </h3>
              </div>
              <div className="pt-4 flex justify-center">
                <InspectSearchIconHero />
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION E: TRANSITION / BRAND STICKER BREAK & MOCKUP
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="solution" className="bg-[#FAF7EE] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">

          {/* Angled Sticker Banner tilted at -3deg */}
          <div className="text-center space-y-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="sticker-yellow text-xl sm:text-3xl px-4 py-1 -rotate-3 shadow-brutal-sm">
                THAT'S WHERE
              </span>
              <span className="text-display-veyro text-[#111111] lowercase block my-1 sm:my-2">
                veyro
              </span>
              <span className="sticker-yellow text-xl sm:text-3xl px-4 py-1 rotate-2 shadow-brutal-sm">
                COMES IN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-body-copy max-w-xl mx-auto pt-1">
              Next-generation LMS engineered with server-authoritative anti-cheat, 90% video progress auditing, and tamper-proof PDF verification.
            </p>
          </div>

          {/* Product UI Mockup */}
          <div className="relative bg-[#111111] border-editorial-2 rounded-3xl p-4 sm:p-7 shadow-brutal-lg overflow-hidden text-white max-w-5xl mx-auto">

            {/* Top Window Bar */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/15 text-xs font-mono-tag">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-black/20" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-black/20" />
                <span className="w-3 h-3 rounded-full bg-[#10b981] border border-black/20" />
                <span className="ml-2 text-white/60 font-medium hidden sm:inline">veyro.lms.cloud // live-session</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1.5 border border-emerald-500/30 font-body uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> SERVER PROCTOR ACTIVE
                </span>
                <span className="text-white/60 font-bold hidden md:inline">AUDIT #VY-9820</span>
              </div>
            </div>

            {/* Prompt Card */}
            <div className="mb-4 bg-white text-[#111111] border-editorial-2 rounded-xl p-3.5 sm:p-4 shadow-brutal-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#60C5F1] flex items-center justify-center text-[#111111] font-bold text-sm border-editorial-2">
                  <Zap className="w-4 h-4 text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#111111]">
                    Hey Alex, you reached <span className="text-emerald-700 font-bold">88% verified watch time</span> in Distributed Systems. Ready for the timed exam?
                  </p>
                  <p className="text-[10px] text-body-subtle mt-0.5">
                    Zero tab violations recorded • Video audit active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/courses"
                  className="btn-sky-pill text-xs py-1.5 px-3 flex-1 sm:flex-initial text-center"
                >
                  Take Exam Now
                </Link>
                <button
                  type="button"
                  onClick={() => toast.success('Reviewing course notes.')}
                  className="btn-white-pill text-xs py-1.5 px-3 flex-1 sm:flex-initial text-center"
                >
                  Review Notes
                </button>
              </div>
            </div>

            {/* Mockup Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

              {/* Sidebar */}
              <div className="lg:col-span-4 bg-[#1f2024] rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 font-body">CURRICULUM TRACK</span>
                  <span className="text-[10px] bg-[#FFF490] text-[#111111] font-bold px-2 py-0.5 rounded-md font-mono-tag">84% DONE</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-[#2a2b30] p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold text-white text-xs">01. Architectural Foundations</p>
                        <p className="text-[10px] text-white/50">42 mins • 100% verified watch</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase font-body">COMPLETED</span>
                  </div>

                  <div className="bg-[#60C5F1] text-[#111111] p-2.5 rounded-lg border-editorial-2 font-bold flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Play className="w-4 h-4 fill-current" />
                      <div>
                        <p className="font-bold text-xs text-[#111111]">02. State Machines & SSR</p>
                        <p className="text-[10px] text-[#111111]/80 font-semibold">Currently Playing • 18:24 / 22:00</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded-full font-bold font-body">LIVE</span>
                  </div>

                  <div className="bg-[#2a2b30] p-2.5 rounded-lg border border-white/10 flex items-center justify-between text-white/70">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-white/40" />
                      <div>
                        <p className="font-semibold text-white/80 text-xs">03. Server-Authoritative Quiz</p>
                        <p className="text-[10px] text-white/40">Requires &ge;90% playback</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase font-body">LOCKED</span>
                  </div>
                </div>

                <div className="bg-[#111111] p-2.5 rounded-lg border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white/90 text-xs">Anti-Cheat Guardian</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs uppercase font-body">0 VIOLATIONS</span>
                </div>
              </div>

              {/* Center Panel */}
              <div className="lg:col-span-8 bg-[#1a1b1e] rounded-xl p-4 border border-white/10 flex flex-col justify-between space-y-4">

                <div className="relative aspect-[16/9] bg-black rounded-lg overflow-hidden border border-white/10 flex flex-col justify-between p-4">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80"
                    alt="Active Lesson"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/20 uppercase font-body">
                      LESSON 02: ASYNC ROUTING
                    </span>
                    <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-body">
                      90% AUDIT STREAMING
                    </span>
                  </div>

                  <div className="relative z-10 self-center">
                    <div className="w-12 h-12 rounded-full bg-[#FFF490] text-[#111111] border-2 border-[#111111] flex items-center justify-center shadow-brutal cursor-pointer">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-white/90 font-semibold font-body">
                      <span>18:24 (83%)</span>
                      <span className="text-[#FFF490] font-bold">Threshold: 90% unique playback required</span>
                      <span>22:00</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#60C5F1] rounded-full" style={{ width: '83%' }} />
                      <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-[#FFF490] z-20" />
                    </div>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 font-body">
                  <div className="bg-[#24252a] p-2.5 rounded-lg border border-white/10">
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Cryptographic Stamp</p>
                    <p className="font-bold text-white font-mono-tag mt-0.5 text-xs">HASH #VY-7819-B</p>
                  </div>
                  <div className="bg-[#24252a] p-2.5 rounded-lg border border-white/10">
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Assessment Timer</p>
                    <p className="font-bold text-emerald-400 mt-0.5 text-xs">Server Authoritative</p>
                  </div>
                  <div className="bg-[#24252a] p-2.5 rounded-lg border border-white/10">
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Vector PDF Generation</p>
                    <p className="font-bold text-[#FFF490] mt-0.5 text-xs">Instant Verification</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Alert Bubble */}
            <div className="mt-4 bg-[#FAF7EE] text-[#111111] border-editorial-2 rounded-xl p-3.5 sm:p-4 shadow-brutal-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFF490] flex items-center justify-center font-bold text-sm border-editorial-2">
                  <FileCheck className="w-4 h-4 text-[#111111]" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#111111]">
                  Tamper-proof <span className="font-bold text-[#2563eb]">Certificate #VY-8921</span> issued to Sarah Jenkins. Cryptographic hash verified on ledger.
                </p>
              </div>
              <Link
                to="/verify/VY-DEMO-2026"
                className="btn-dark-pill text-xs py-1.5 px-3.5 flex-shrink-0"
              >
                Inspect Ledger ↗
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION F: LOGO CLOUD / TECH STACK TRUST GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#60C5F1] py-12 sm:py-16 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">

          {/* Header */}
          <div className="max-w-3xl">
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#111111] uppercase tracking-tight leading-tight">
              BUILT FOR ACCREDITED DISTANCE LEARNING EXPERIENCES
            </h2>
          </div>

          {/* 6-Cell Bordered Grid (2x3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { name: 'React 19', symbol: 'React 19' },
              { name: 'Node.js', symbol: 'Node.js' },
              { name: 'Express', symbol: 'Express' },
              { name: 'MongoDB Atlas', symbol: 'MongoDB Atlas' },
              { name: 'PDFKit Crypto', symbol: 'PDFKit Crypto' },
              { name: 'Tailwind CSS', symbol: 'Tailwind CSS' },
            ].map((tech, idx) => (
              <div
                key={idx}
                className="bg-[#E8F5FD] hover:bg-white border-editorial-2 rounded-xl p-5 sm:p-6 flex items-center justify-center text-center shadow-brutal-sm transition-colors"
              >
                <span className="font-syne font-bold text-base sm:text-xl text-[#111111] tracking-tight">
                  {tech.symbol}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION G: INTERACTIVE / WALKTHROUGH SHOWCASE (Split Layout)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7EE] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-syne font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#111111] uppercase tracking-tight leading-tight">
                VEYRO FITS INTO YOUR LEARNING JOURNEY SEAMLESSLY.
              </h2>
            </div>
            <Link
              to="/courses"
              className="btn-sky-pill self-start sm:self-auto"
            >
              <span>DISCOVER HOW IT WORKS →</span>
            </Link>
          </div>

          {/* Split Layout: App Preview Left + Numbered Accordion Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Side 1: App screenshot preview inside frame */}
            <div className="lg:col-span-5 relative">
              <div className="bg-[#60C5F1] border-editorial-2 rounded-2xl p-4 shadow-brutal relative overflow-hidden">
                <div className="rounded-xl overflow-hidden border-editorial aspect-[4/3] relative bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
                    alt="Cohort Learning Session"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Floating badge 1 */}
                  <div className="absolute top-3 left-3 status-pill shadow-sm">
                    <span className="text-[9px] font-bold uppercase text-[#1E293B]/70">STUDENT</span>
                    <span className="font-bold text-xs">Leila Chen</span>
                    <img src={AVATARS.leila} alt="Leila" className="w-5 h-5 rounded-full border border-black" />
                  </div>
                  {/* Floating badge 2 */}
                  <div className="absolute bottom-3 right-3 status-pill shadow-sm">
                    <span className="text-[9px] font-bold uppercase text-[#1E293B]/70">INSTRUCTOR</span>
                    <span className="font-bold text-xs">Devin Bennett</span>
                    <img src={AVATARS.david} alt="Devin" className="w-5 h-5 rounded-full border border-black" />
                  </div>
                </div>
                <div className="mt-2.5 text-center">
                  <p className="text-[10px] font-bold text-[#111111] uppercase tracking-wider font-body">
                    ACCREDITED PEER ASSESSMENT & PROCTORING
                  </p>
                </div>
              </div>
            </div>

            {/* Side 2: Numbered vertical accordion/tabs 1, 2, 3, 4 */}
            <div className="lg:col-span-7 space-y-3">
              {[
                {
                  num: '1',
                  title: "Discover a Course and Enroll Instantly",
                  desc: "Browse curated technical tracks across backend, frontend, devops, and security with interactive curriculum syllabi and instant enrollment."
                },
                {
                  num: '2',
                  title: "Learn Through Verified 90% Playback Streaming",
                  desc: "Granular HTML5 timeupdate auditing ensures students stream at least 90% unique playback before unlocking assessments. Zero skipping, zero fake completions."
                },
                {
                  num: '3',
                  title: "Complete Server-Guarded Timed Assessments",
                  desc: "Timers run strictly server-side, immune to client DOM tampering. Automatic question permutation and live tab-violation triggers lock down cheat vectors."
                },
                {
                  num: '4',
                  title: "Earn & Publicly Verify Tamper-Proof Credentials",
                  desc: "Instant on-the-fly programmatic PDF generation with unique cryptographic hashes stamped on every document, verifiable via zero-auth public portals."
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveAccordion(idx)}
                  className={`border-editorial-2 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer ${activeAccordion === idx
                    ? 'bg-white shadow-brutal-sm'
                    : 'bg-[#FAF7EE] hover:bg-white'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-editorial-2 font-body ${activeAccordion === idx ? 'bg-[#60C5F1] text-[#111111]' : 'bg-[#FAF7EE] text-gray-700'
                      }`}>
                      {step.num}
                    </span>
                    <h3 className="text-card-heading text-sm sm:text-base text-[#111111] flex-1">
                      {step.title}
                    </h3>
                    <span className="text-base font-bold text-gray-600 font-body">
                      {activeAccordion === idx ? '−' : '+'}
                    </span>
                  </div>
                  {activeAccordion === idx && (
                    <p className="text-xs text-body-copy mt-2.5 pl-12 leading-relaxed">
                      {step.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION H: THREE SIMPLE STEPS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="steps" className="bg-[#FAF7EE] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <h2 className="font-syne font-extrabold text-3xl sm:text-5xl text-[#111111] uppercase tracking-tight leading-[1.02]">
                    THREE <br />
                    SIMPLE <br />
                    STEPS
                  </h2>
                  <div className="hidden sm:inline-block">
                    <ArrowRightHandDrawnHero />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-body-copy">
                  Getting certified on Veyro is transparent, rigorous, and fast.
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
                      Choose your learning path
                    </h4>
                    <p className="text-xs text-body-copy mt-0.5 leading-relaxed">
                      Select your specialized curriculum in frontend, backend, or cloud architecture.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#60C5F1] text-[#111111] border-editorial-2 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm font-body">
                    02
                  </span>
                  <div>
                    <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                      Complete verified learning & assessments
                    </h4>
                    <p className="text-xs text-body-copy mt-0.5 leading-relaxed">
                      Stream verified 90% video playback and pass timed assessments with zero tab violations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#FFF490] text-[#111111] border-editorial-2 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm font-body">
                    03
                  </span>
                  <div>
                    <h4 className="text-card-heading text-sm sm:text-base text-[#111111]">
                      Earn your certificate
                    </h4>
                    <p className="text-xs text-body-copy mt-0.5 leading-relaxed">
                      Download your tamper-proof vector PDF stamped with an immutable verification code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="btn-sky-pill shadow-brutal-sm"
                >
                  Start Step 01 Now ↗
                </Link>
              </div>
            </div>

            {/* Right Column: Premium Realistic iPhone Device Mockup */}
            <div className="lg:col-span-6 flex justify-center items-center py-4">
              <div className="relative w-full max-w-[325px] sm:max-w-[345px]">
                
                {/* Realistic ambient soft glow behind phone */}
                <div className="absolute -inset-6 bg-gradient-to-tr from-[#60C5F1]/30 via-[#FFF490]/35 to-[#60C5F1]/20 rounded-[64px] blur-2xl -z-10 pointer-events-none" />
                
                {/* iPhone Outer Titanium Chassis with Sleek Metallic Edge */}
                <div className="relative rounded-[50px] p-[3px] bg-gradient-to-b from-[#5c5c60] via-[#242426] to-[#3a3a3c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_10px_20px_-5px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  
                  {/* Subtle Side Button Accents (Left Volume & Right Power) */}
                  <div className="absolute -left-[5px] top-[100px] w-[3px] h-[36px] bg-[#3a3a3c] rounded-l-sm" />
                  <div className="absolute -left-[5px] top-[145px] w-[3px] h-[36px] bg-[#3a3a3c] rounded-l-sm" />
                  <div className="absolute -right-[5px] top-[115px] w-[3px] h-[52px] bg-[#3a3a3c] rounded-r-sm" />

                  {/* Ultra-thin Inner Bezel & Display Screen */}
                  <div className="rounded-[47px] p-[8px] bg-[#0c0d0f] shadow-[inset_0_0_4px_rgba(255,255,255,0.1)]">
                    <div className="rounded-[40px] overflow-hidden bg-[#FAF7EE] relative shadow-[inset_0_0_12px_rgba(0,0,0,0.15)] flex flex-col justify-between min-h-[580px] p-4 sm:p-5 text-[#111111] space-y-3.5">
                      
                      {/* Native iOS Status Bar & Dynamic Island */}
                      <div className="flex items-center justify-between pt-1 pb-1 relative z-20">
                        {/* Left: iOS Time */}
                        <span className="text-[12px] font-semibold text-[#111111] tracking-tight pl-2">
                          9:41
                        </span>

                        {/* Center: Dynamic Island */}
                        <div className="w-[100px] h-[24px] bg-black rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.4)] flex items-center justify-between px-2.5 mx-auto">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c28] ring-1 ring-white/10" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a14] opacity-80" />
                        </div>

                        {/* Right: Native iOS Status Glyphs */}
                        <div className="flex items-center gap-1.5 pr-2 text-[#111111]">
                          <IosSignalIcon />
                          <IosWifiIcon />
                          <IosBatteryIcon />
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-syne font-extrabold text-xl lowercase text-[#111111]">
                          veyro<span className="text-[#60C5F1]">.</span>
                        </span>
                        <span className="status-pill text-[10px] py-0.5 px-2 font-bold shadow-sm">
                          PRO LEARNER
                        </span>
                      </div>

                      {/* Course Active Module Card */}
                      <div className="bg-[#60C5F1] border-editorial-2 rounded-2xl p-4 shadow-brutal-sm space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 rounded-full font-body">
                            CURRENT MODULE
                          </span>
                          <span className="text-[10px] font-bold text-[#111111] font-mono-tag">
                            LESSON 7/9
                          </span>
                        </div>
                        <h4 className="text-card-heading text-sm text-[#111111]">
                          Full-Stack Distributed Systems
                        </h4>
                        <div className="space-y-1">
                          <div className="w-full bg-white/50 h-2.5 rounded-full overflow-hidden border border-black/15">
                            <div className="bg-[#111111] h-full rounded-full" style={{ width: '84%' }} />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-[#111111] font-body">
                            <span>Progress: 84%</span>
                            <span>90% Threshold Required</span>
                          </div>
                        </div>
                      </div>

                      {/* Anti-Cheat Badge */}
                      <div className="bg-white border-editorial-2 rounded-xl p-3 flex items-center gap-3 shadow-brutal-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-600/30">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none text-[#111111]">Assessment Ready</p>
                          <p className="text-[10px] text-body-subtle mt-0.5">Server Proctor Guard Armed (0 Violations)</p>
                        </div>
                      </div>

                      {/* Issued Certificate Pill */}
                      <div className="bg-[#FFF490] border-editorial-2 rounded-xl p-3 flex items-center justify-between shadow-brutal-sm">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#111111]" />
                          <span className="text-xs font-bold text-[#111111]">Certificate #VY-8921</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 rounded-full font-body">
                          VERIFIED
                        </span>
                      </div>

                      {/* Mobile CTA */}
                      <div className="pt-1">
                        <Link
                          to="/courses"
                          className="w-full btn-dark-pill text-center block text-xs py-2.5 shadow-brutal-sm"
                        >
                          Resume Study Session ↗
                        </Link>
                      </div>

                      {/* iOS Home Indicator Bar */}
                      <div className="pt-2">
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
          SECTION I: FINAL CALL TO ACTION (Butter Yellow Panel)
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7EE] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-editorial-b relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FFF490] border-editorial-2 rounded-3xl p-8 sm:p-14 shadow-brutal text-center space-y-6 relative overflow-hidden">

            {/* Top Badge with Sparkle */}
            <div className="inline-flex items-center gap-2">
              <span className="sticker-yellow bg-white text-xs px-3.5 py-1">
                START YOUR VERIFIED JOURNEY TODAY
              </span>
              <DoodleSparkle />
            </div>

            <h2 className="text-display-section text-[#111111] max-w-2xl mx-auto">
              READY TO MAKE ONLINE LEARNING REALLY WORK?
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
          SECTION J: EDITORIAL STUDIO FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white text-neutral-900 overflow-hidden relative border-t border-neutral-200 font-body">
        
        {/* ── 1. Protocol Architecture & Live Proof Ribbon ── */}
        <div className="border-b border-neutral-200 bg-[#FAF7EE]/50 py-5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Live Status indicator */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-800 tracking-tight">
                Protocol Status: All Verification Engines Operational
              </span>
            </div>

            {/* Interactive Protocol Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 bg-white border border-neutral-300/80 rounded-full px-3.5 py-1 text-neutral-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60C5F1]"></span>
                Anti-Cheat Engine v2.4 Active
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-neutral-300/80 rounded-full px-3.5 py-1 text-neutral-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                90% Playback Audited
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-neutral-300/80 rounded-full px-3.5 py-1 text-neutral-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                SHA-256 Ledger Verified
              </span>
            </div>

          </div>
        </div>

        {/* ── 2. Protocol Feature Matrix Bento Cards ── */}
        <div className="border-b border-neutral-200 bg-white py-8 sm:py-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-900 transition-colors bg-white group shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold font-syne text-[#60C5F1] tracking-wider uppercase">01 / INTEGRITY</span>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-black transition-colors">↗</span>
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 pb-1">Server-Authoritative Proctor</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Real-time browser-lock, webcam integrity monitoring, and audio anomaly detection.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-900 transition-colors bg-white group shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold font-syne text-amber-500 tracking-wider uppercase">02 / AUDITING</span>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-black transition-colors">↗</span>
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 pb-1">90% Video Retention Gate</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Guaranteed lesson completion tracking enforced server-side before quiz unlocks.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-900 transition-colors bg-white group shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold font-syne text-emerald-500 tracking-wider uppercase">03 / PROOF</span>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-black transition-colors">↗</span>
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 pb-1">Cryptographic Credentials</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Vector-stamped PDF certificates embedded with permanent SHA-256 validation proof.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-900 transition-colors bg-white group shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold font-syne text-purple-500 tracking-wider uppercase">04 / DISCOVERY</span>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-black transition-colors">↗</span>
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 pb-1">Instant Recruiter Lookup</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Public verification portal providing zero-friction candidate credentials lookup.
              </p>
            </div>

          </div>
        </div>

        {/* ── 3. Middle Navigation & Newsletter Grid ── */}
        <div className="max-w-7xl mx-auto py-12 px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-between">
            
            {/* Column 1 (Left - 50% width) */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-medium text-2xl text-neutral-900 leading-snug max-w-lg">
                Stay connected for early access to our newest tools and local events
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-neutral-300 rounded-full w-9 h-9 flex items-center justify-center text-neutral-700 hover:text-black hover:border-neutral-900 transition-colors"
                  aria-label="Discord"
                >
                  <DiscordIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://reddit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-neutral-300 rounded-full w-9 h-9 flex items-center justify-center text-neutral-700 hover:text-black hover:border-neutral-900 transition-colors"
                  aria-label="Reddit"
                >
                  <RedditIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-neutral-300 rounded-full w-9 h-9 flex items-center justify-center text-neutral-700 hover:text-black hover:border-neutral-900 transition-colors"
                  aria-label="X"
                >
                  <XIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    const email = prompt('Enter your email for Veyro updates:');
                    if (email && email.includes('@')) {
                      toast.success(`Subscribed ${email} to Veyro updates!`);
                    }
                  }}
                  className="border border-neutral-300 rounded-full px-5 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900 transition-colors font-body"
                >
                  Sign up for our newsletter
                </button>
              </div>
            </div>

            {/* Column 2 (Navigation) */}
            <div className="lg:col-span-3 space-y-3">
              <p className="font-medium text-sm text-neutral-900 mb-3 font-body">
                Navigation
              </p>
              <div className="flex flex-col space-y-2 text-sm font-normal text-neutral-500 font-body">
                <Link to="/" className="hover:text-black transition-colors">About</Link>
                <Link to="/courses" className="hover:text-black transition-colors">Experiments</Link>
                <Link to="/courses" className="hover:text-black transition-colors">Sessions</Link>
                <a href="#steps" className="hover:text-black transition-colors">Community</a>
              </div>
            </div>

            {/* Column 3 (Product Areas) */}
            <div className="lg:col-span-3 space-y-3">
              <p className="font-medium text-sm text-neutral-900 mb-3 font-body">
                Other teams and product areas
              </p>
              <div className="flex flex-col space-y-2 text-sm font-normal text-neutral-500 font-body">
                <Link to="/courses" className="hover:text-black transition-colors">Veyro AI</Link>
                <Link to="/courses" className="hover:text-black hover:text-black transition-colors">Veyro Cloud</Link>
                <Link to="/courses" className="hover:text-black transition-colors">Veyro Research</Link>
                <Link to="/courses" className="hover:text-black transition-colors">Veyro DeepMind</Link>
                <Link to="/verify/VY-DEMO-2026" className="hover:text-black transition-colors">Search Labs</Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. Massive Brand Anchor (Lower Section) ── */}
        <div className="max-w-7xl mx-auto px-8 py-8 sm:py-14 text-center select-none overflow-hidden">
          <div className="font-body font-normal text-[clamp(4.5rem,15vw,13.5rem)] tracking-[-0.04em] text-neutral-900 leading-none inline-block">
            veyro<span className="text-[#60C5F1]">.</span>
          </div>
        </div>

        {/* ── 5. Bottom Legal Bar ── */}
        <div className="max-w-7xl mx-auto py-4 px-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-4 font-body">
          <span className="font-medium text-sm text-neutral-900">
            veyro<span className="text-[#60C5F1]">.</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium tracking-wider text-neutral-600 uppercase">
            <Link to="/courses" className="hover:text-black transition-colors">ABOUT VEYRO</Link>
            <Link to="/courses" className="hover:text-black transition-colors">VEYRO PRODUCTS</Link>
            <button onClick={() => toast('Privacy Policy: Enterprise zero data selling.')} className="hover:text-black transition-colors">PRIVACY</button>
            <button onClick={() => toast('Terms: Platform terms of service.')} className="hover:text-black hover:text-black transition-colors">TERMS</button>
            <button onClick={() => toast('Help Center: Dedicated student support.')} className="hover:text-black transition-colors">HELP</button>
          </div>
        </div>

      </footer>

    </div>
  );
}

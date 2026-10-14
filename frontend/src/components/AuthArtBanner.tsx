import React from 'react';

interface AuthArtBannerProps {
  caption?: string;
}

/**
 * Fine-art Pointillist / Impressionist Oil Painting banner (inspired by Georges Seurat).
 * Renders an artistic landscape with rich dotted textures and warm, golden lighting.
 */
export default function AuthArtBanner({ caption = 'Art & Knowledge' }: AuthArtBannerProps) {
  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] lg:min-h-[560px] rounded-3xl overflow-hidden bg-[#243322] select-none shadow-inner group font-sans">
      <svg
        viewBox="0 0 480 640"
        className="w-full h-full object-cover absolute inset-0 transform group-hover:scale-105 transition-transform duration-1000 ease-out"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="pointillism-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0.3" result="desat" />
            <feBlend in="SourceGraphic" in2="desat" mode="multiply" />
          </filter>

          <pattern id="stipple-dots-1" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.8" fill="#d97706" opacity="0.45" />
            <circle cx="9" cy="4" r="1.5" fill="#65a30d" opacity="0.5" />
            <circle cx="4" cy="9" r="1.7" fill="#0284c7" opacity="0.4" />
            <circle cx="10" cy="10" r="1.9" fill="#eab308" opacity="0.55" />
            <circle cx="7" cy="7" r="1.2" fill="#ec4899" opacity="0.35" />
          </pattern>

          <pattern id="stipple-dots-2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#84cc16" opacity="0.6" />
            <circle cx="6" cy="3" r="1.1" fill="#f59e0b" opacity="0.5" />
            <circle cx="3" cy="6" r="1.3" fill="#10b981" opacity="0.55" />
            <circle cx="7" cy="7" r="1.0" fill="#3b82f6" opacity="0.45" />
          </pattern>

          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>

          <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4d7c0f" />
            <stop offset="50%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="40%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#skyGrad)" />
        <rect width="100%" height="100%" fill="url(#stipple-dots-1)" opacity="0.4" />

        <ellipse cx="240" cy="120" rx="90" ry="40" fill="#ffffff" opacity="0.55" />
        <ellipse cx="140" cy="90" rx="70" ry="30" fill="#ffffff" opacity="0.45" />
        <ellipse cx="360" cy="140" rx="60" ry="25" fill="#fef08a" opacity="0.5" />

        <path d="M-40 400 Q120 280 280 340 T520 290 L520 640 L-40 640 Z" fill="url(#hillGrad1)" />
        <path d="M-40 460 Q160 380 340 440 T520 400 L520 640 L-40 640 Z" fill="url(#hillGrad2)" opacity="0.9" />

        <rect width="100%" height="100%" fill="url(#stipple-dots-2)" opacity="0.65" />
        <rect width="100%" height="100%" filter="url(#pointillism-grain)" opacity="0.45" />

        <circle cx="210" cy="410" r="14" fill="#1e293b" />
        <ellipse cx="210" cy="445" rx="20" ry="35" fill="#1e3a8a" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white z-10">
        <span className="font-serif text-xl sm:text-2xl font-normal leading-tight drop-shadow-sm">
          {caption}
        </span>
        <span className="text-[11px] font-sans text-white/70 mt-1">
          Where verified knowledge comes alive.
        </span>
      </div>
    </div>
  );
}

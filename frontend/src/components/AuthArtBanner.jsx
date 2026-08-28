import React from 'react';

/**
 * Fine-art Pointillist / Impressionist Oil Painting banner (inspired by Georges Seurat).
 * Renders an artistic landscape with rich dotted textures and warm, golden lighting.
 */
export default function AuthArtBanner({ caption = 'Art & Knowledge' }) {
  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] lg:min-h-[560px] rounded-3xl overflow-hidden bg-[#243322] select-none shadow-inner group">
      {/* Dynamic Painterly Pointillism Canvas / SVG */}
      <svg
        viewBox="0 0 480 640"
        className="w-full h-full object-cover absolute inset-0 transform group-hover:scale-105 transition-transform duration-1000 ease-out"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grain / Stipple noise filter */}
          <filter id="pointillism-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0.3" result="desat" />
            <feBlend in="SourceGraphic" in2="desat" mode="multiply" />
          </filter>

          {/* Dotted pointillist texture pattern */}
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

          {/* Sky Gradient */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>

          {/* Meadow / Hill Gradients */}
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

          <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="60%" stopColor="#166534" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>

        {/* Sky / Morning Horizon */}
        <rect width="480" height="640" fill="url(#skyGrad)" />
        <rect width="480" height="300" fill="url(#stipple-dots-1)" opacity="0.4" />

        {/* Distant Hills */}
        <path d="M 0,220 Q 120,150 260,190 T 480,180 L 480,640 L 0,640 Z" fill="url(#hillGrad1)" />
        <path d="M 0,260 Q 160,190 320,240 T 480,220 L 480,640 L 0,640 Z" fill="url(#hillGrad2)" opacity="0.9" />

        {/* Midground Rolling Pointillist Slopes */}
        <path d="M 0,330 Q 180,270 340,350 T 480,310 L 480,640 L 0,640 Z" fill="#84cc16" />
        <path d="M 0,330 Q 180,270 340,350 T 480,310 L 480,640 L 0,640 Z" fill="url(#stipple-dots-2)" />

        {/* Warm Golden Harvest Slope */}
        <path d="M 0,420 Q 140,370 290,440 T 480,400 L 480,640 L 0,640 Z" fill="#eab308" opacity="0.85" />
        <path d="M 0,420 Q 140,370 290,440 T 480,400 L 480,640 L 0,640 Z" fill="url(#stipple-dots-1)" />

        {/* Impressionist Trees & Groves (Left & Top) */}
        <ellipse cx="60" cy="180" rx="90" ry="140" fill="url(#treeGrad)" opacity="0.9" />
        <ellipse cx="40" cy="300" rx="70" ry="120" fill="#14532d" opacity="0.85" />
        <ellipse cx="440" cy="190" rx="80" ry="130" fill="url(#treeGrad)" opacity="0.85" />

        {/* Foreground Wildflower Meadow */}
        <path d="M 0,490 Q 200,450 360,520 T 480,480 L 480,640 L 0,640 Z" fill="#166534" />
        <path d="M 0,490 Q 200,450 360,520 T 480,480 L 480,640 L 0,640 Z" fill="url(#stipple-dots-2)" />

        {/* Stylized Impressionist Figures (Learners in the field) */}
        {/* Figure 1 - Seated scholar / harvester */}
        <g transform="translate(130, 380) scale(0.9)">
          <ellipse cx="20" cy="40" rx="14" ry="12" fill="#b45309" /> {/* Straw Hat */}
          <ellipse cx="20" cy="36" rx="7" ry="6" fill="#fef08a" />
          <path d="M 12,48 Q 20,44 28,48 L 32,80 L 8,80 Z" fill="#1e3a8a" /> {/* Blue coat */}
          <circle cx="20" cy="48" r="4" fill="#fed7aa" />
          {/* Stipple on coat */}
          <ellipse cx="20" cy="62" rx="10" ry="14" fill="url(#stipple-dots-1)" opacity="0.5" />
        </g>

        {/* Figure 2 - Standing Observer / Thinker */}
        <g transform="translate(240, 290) scale(0.85)">
          <circle cx="16" cy="16" r="6" fill="#3f3f46" /> {/* Hat */}
          <path d="M 10,22 L 22,22 L 20,68 L 12,68 Z" fill="#1f2937" /> {/* Silhouette */}
          <ellipse cx="16" cy="40" rx="8" ry="18" fill="url(#stipple-dots-2)" opacity="0.4" />
        </g>

        {/* Large Foreground Character Silhouette */}
        <g transform="translate(30, 480) scale(1.4)">
          <ellipse cx="30" cy="30" rx="20" ry="10" fill="#78350f" /> {/* Hat */}
          <circle cx="30" cy="36" r="7" fill="#fde047" opacity="0.8" />
          <path d="M 15,42 Q 30,36 45,42 L 52,110 L 8,110 Z" fill="#1e40af" /> {/* Deep Blue Smock */}
          <ellipse cx="30" cy="70" rx="16" ry="24" fill="url(#stipple-dots-1)" opacity="0.7" />
        </g>

        {/* Global Pointillism Textured Overlay */}
        <rect width="480" height="640" fill="url(#stipple-dots-1)" opacity="0.35" />
        <rect width="480" height="640" fill="url(#stipple-dots-2)" opacity="0.25" />
      </svg>

      {/* Atmospheric painterly vignette & sunlight glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay pointer-events-none" />
      
      {/* Decorative Canvas Texture Frame Border */}
      <div className="absolute inset-0 rounded-3xl border border-black/10 pointer-events-none shadow-inner" />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Compass, Brain, BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';

export const VEYRO_AI_MASCOT_ASSET = '/veyroai-image.png';

interface VeyroAIFloatingButtonProps {
  className?: string;
}

export default function VeyroAIFloatingButton({ className }: VeyroAIFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-50 flex flex-col items-end pointer-events-none select-none',
        'bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))]',
        'right-[max(1rem,calc(env(safe-area-inset-right,0px)+0.75rem))]',
        'sm:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]',
        'sm:right-[max(1.5rem,calc(env(safe-area-inset-right,0px)+1rem))]',
        className
      )}
      style={{
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {/* Floating Modal / Panel */}
      {isOpen && (
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="false"
          aria-label="Veyro AI Assistant Panel"
          className={cn(
            'pointer-events-auto mb-3 w-[calc(100vw-2rem)] sm:w-88 max-w-sm',
            'rounded-2xl bg-white/95 backdrop-blur-md border border-[#E7E2DA]',
            'shadow-[0_12px_40px_-8px_rgba(23,23,23,0.14)] p-4 sm:p-5',
            'transition-all duration-200 ease-out animate-fade-in'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E7E2DA] shadow-xs shrink-0 bg-slate-900 flex items-center justify-center">
                <img
                  src={VEYRO_AI_MASCOT_ASSET}
                  alt="Veyro AI mascot"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#171717] tracking-tight">Veyro AI</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#369EFF]/10 text-[#0066cc] px-1.5 py-0.2 rounded">
                    Companion
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-[#77736D] font-medium">Ready Soon</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Veyro AI assistant panel"
              className="p-1.5 text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* 3D Mascot Preview Banner */}
          <div className="mt-3.5 relative rounded-xl overflow-hidden border border-[#E7E2DA] bg-slate-950 aspect-[16/9] shadow-inner group">
            <img
              src={VEYRO_AI_MASCOT_ASSET}
              alt="Veyro AI 3D mascot artwork"
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white/95 border border-white/20 shadow-xs">
                <Sparkles size={10} className="text-[#369EFF]" /> Preview
              </span>
            </div>
          </div>

          {/* Primary Announcement Content */}
          <div className="mt-4 space-y-1">
            <h3 className="text-base font-bold text-[#171717] tracking-tight">
              Hello! I'm Veyro AI.
            </h3>
            <p className="text-xs sm:text-sm text-[#77736D] leading-relaxed">
              Your intelligent learning companion is coming soon.
            </p>
          </div>

          {/* Feature Teasers */}
          <div className="mt-3.5 pt-3 border-t border-[#E7E2DA]/80 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#77736D]">
              Upcoming Features
            </p>
            <div className="space-y-1.5 text-xs text-[#171717]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#369EFF]/10 flex items-center justify-center shrink-0 text-[#0066cc]">
                  <Brain size={12} />
                </div>
                <span className="truncate">Context-aware lesson tutoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#ff9447]/10 flex items-center justify-center shrink-0 text-[#d96514]">
                  <BookOpen size={12} />
                </div>
                <span className="truncate">Syllabus-aligned revision quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#25d0ab]/10 flex items-center justify-center shrink-0 text-[#0d9475]">
                  <Compass size={12} />
                </div>
                <span className="truncate">Curriculum progress acceleration</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Veyro AI learning companion"
        className={cn(
          'pointer-events-auto group inline-flex items-center gap-2.5',
          'px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full',
          'bg-white/95 backdrop-blur-md border border-[#E7E2DA]',
          'shadow-[0_4px_20px_rgba(23,23,23,0.08)] hover:shadow-[0_8px_28px_rgba(23,23,23,0.14)]',
          'hover:border-[#171717]/25 hover:-translate-y-0.5',
          'active:translate-y-0 active:scale-95',
          'transition-all duration-200 ease-out cursor-pointer',
          isOpen && 'ring-2 ring-[#171717]/10 border-[#171717]/30 bg-white'
        )}
      >
        {/* Mascot Avatar with Preserved Original Aspect Ratio */}
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs shrink-0 flex items-center justify-center">
          <img
            src={VEYRO_AI_MASCOT_ASSET}
            alt="Veyro AI 3D mascot"
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Text Label Beside Mascot */}
        <span className="font-sans font-semibold text-xs sm:text-sm text-[#171717] tracking-tight">
          Veyro AI
        </span>

        {/* Subtle Accent Sparkle */}
        <Sparkles
          size={14}
          className="text-[#369EFF] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shrink-0"
        />
      </button>
    </div>,
    document.body
  );
}

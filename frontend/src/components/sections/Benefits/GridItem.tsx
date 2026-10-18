"use client";
import React from "react";
import {
  CreditCard,
  Video,
  ShieldCheck,
  Lock,
  Globe2,
  Award,
  Terminal,
  Layers,
  ArrowUpRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard,
  Video,
  ShieldCheck,
  Lock,
  Globe2,
  Award,
  Terminal,
  Layers,
};

interface GridItemProps {
  title: string;
  description: string;
  tag?: string;
  iconName?: string;
  img?: string;
}

const GridItem = ({
  title,
  description,
  tag,
  iconName,
  img,
}: GridItemProps) => {
  const IconComponent = iconName ? ICON_MAP[iconName] : null;

  return (
    <div className="group relative w-full h-full min-h-[195px] bg-white hover:bg-neutral-50/80 rounded-2xl border border-[#E5E7EB] hover:border-neutral-900/40 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-900/5 cursor-pointer overflow-hidden font-matter select-none">
      {/* Top ambient highlight on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header with Icon and Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="size-11 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 border border-neutral-200/80 group-hover:border-neutral-900 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-105 shrink-0">
            {IconComponent ? (
              <IconComponent className="size-5 text-neutral-800 group-hover:text-white transition-colors duration-300" />
            ) : (
              <div
                className={`size-6 bg-no-repeat bg-center [backgroundSize:22px] transition-all duration-300 group-hover:invert ${img}`}
              />
            )}
          </div>
          {tag && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/70 group-hover:text-neutral-800 border border-neutral-200/60 transition-colors">
              {tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-[15px] sm:text-[16px] font-semibold text-neutral-900 tracking-tight leading-snug group-hover:text-black transition-colors">
          {title}
        </h4>

        {/* Description */}
        <p className="text-[12px] sm:text-[13px] text-neutral-500 leading-relaxed font-normal mt-1.5 line-clamp-2 group-hover:text-neutral-700 transition-colors">
          {description}
        </p>
      </div>

      {/* Subtle bottom indicator */}
      <div className="pt-2 mt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-medium text-neutral-400 group-hover:text-neutral-800 transition-colors">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 font-semibold text-neutral-900">
          Learn more
        </span>
        <ArrowUpRight className="size-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
      </div>
    </div>
  );
};

export default GridItem;

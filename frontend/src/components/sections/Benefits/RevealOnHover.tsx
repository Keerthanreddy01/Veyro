"use client";
import React from "react";
import {
  Layers,
  ShieldAlert,
  CreditCard,
  Video,
  Award,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function RevealOnHover() {
  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 text-left font-matter">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 select-none">
        
        {/* ── CARD 1: Lilac (Tall, Col 1, Rows 1-2) ── Course Builder */}
        <div className="lg:col-span-1 lg:row-span-2 bg-[#CBBCE6] text-[#241538] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[460px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="size-13 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#241538] shadow-xs group-hover:scale-105 transition-transform">
                <Layers className="size-6 text-[#241538]" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/45 text-[#241538]">
                Curriculum Studio
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-cal font-bold tracking-tight text-[#241538] mb-3">
              Course Builder
            </h3>
            <p className="text-sm font-medium text-[#241538]/85 leading-relaxed mb-6">
              Design modular video chapters, downloadable PDF packs, rich-text lessons, and automated pass criteria in minutes.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm font-semibold text-[#241538]/90">
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#241538]" />
                Drag-and-drop chapter sequencing
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#241538]" />
                90% unique video watch verification
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#241538]" />
                Downloadable PDF resources & rich text
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#241538]" />
                Target grade & class alignment
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-5 mt-6 border-t border-[#241538]/15 text-xs font-bold text-[#241538]/80">
            <span>Modular Course Authoring</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* ── CARD 2: Coral / Rose (Wide, Col 2-3, Row 1) ── Anti-Cheat Proctoring */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-1 bg-[#F89AA8] text-[#3B151C] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[220px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="size-13 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#3B151C] shadow-xs group-hover:scale-105 transition-transform">
                <ShieldAlert className="size-6 text-[#3B151C]" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/45 text-[#3B151C]">
                Integrity Engine
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-cal font-bold tracking-tight text-[#3B151C] mb-2">
              Proctored Anti-Cheat
            </h3>
            <p className="text-sm font-medium text-[#3B151C]/85 leading-relaxed max-w-2xl">
              Server-authoritative timer, Fisher-Yates question permutation, and zero-invasive tab-switch focus telemetry without desktop spyware.
            </p>

            <div className="flex flex-wrap gap-2 mt-5 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3B151C]">
                Server Timer Lock
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3B151C]">
                Fisher-Yates Shuffle
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3B151C]">
                Zero-Knowledge Payload
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3B151C]">
                Tab-Blur Detection
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-6 border-t border-[#3B151C]/15 text-xs font-bold text-[#3B151C]/80">
            <span>Cryptographic Assessment Engine</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* ── CARD 3: Pistachio / Lime (Col 2, Row 2) ── Monetization */}
        <div className="lg:col-span-1 lg:row-span-1 bg-[#C6DE94] text-[#1F2C10] rounded-[32px] p-7 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[240px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#1F2C10] shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard className="size-5 text-[#1F2C10]" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/45 text-[#1F2C10]">
                Stripe Payments
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-cal font-bold tracking-tight text-[#1F2C10] mb-2">
              Monetization
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#1F2C10]/85 leading-relaxed">
              Monetize curricula, cohort seats, and private mentorship with automated bank deposits.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-white/45">Tiered Pricing</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/45">Instant Payouts</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-5 border-t border-[#1F2C10]/15 text-xs font-bold text-[#1F2C10]/80">
            <span>Creator Revenue</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* ── CARD 4: Buttercup / Yellow (Col 3, Row 2) ── Live Classroom */}
        <div className="lg:col-span-1 lg:row-span-1 bg-[#FDE27E] text-[#362B0A] rounded-[32px] p-7 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[240px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#362B0A] shadow-xs group-hover:scale-105 transition-transform">
                <Video className="size-5 text-[#362B0A]" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/45 text-[#362B0A]">
                Virtual Studio
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-cal font-bold tracking-tight text-[#362B0A] mb-2">
              Live Classroom
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#362B0A]/85 leading-relaxed">
              Low-latency video streaming, whiteboard sync, and live student question queues.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-white/45">Attendance Audit</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/45">Whiteboard Sync</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-5 border-t border-[#362B0A]/15 text-xs font-bold text-[#362B0A]/80">
            <span>Real-Time Learning</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* ── CARD 5: Peach / Terracotta (Wide, Col 1-2, Row 3) ── Verifiable Diplomas */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-1 bg-[#FBAA80] text-[#3A1E11] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[220px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="size-13 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#3A1E11] shadow-xs group-hover:scale-105 transition-transform">
                <Award className="size-6 text-[#3A1E11]" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/45 text-[#3A1E11]">
                Tamper-Proof Verification
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-cal font-bold tracking-tight text-[#3A1E11] mb-2">
              Verifiable Diplomas
            </h3>
            <p className="text-sm font-medium text-[#3A1E11]/85 leading-relaxed max-w-2xl">
              Programmatically generated vector PDF diplomas backed by public cryptographic SHA-256 validation URLs and instant QR scans.
            </p>

            <div className="flex flex-wrap gap-2 mt-5 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3A1E11]">
                Cryptographic SHA-256
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3A1E11]">
                Public Verification Link
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3A1E11]">
                PDFKit Vector Output
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/45 text-[#3A1E11]">
                Embeddable Badges
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-6 border-t border-[#3A1E11]/15 text-xs font-bold text-[#3A1E11]/80">
            <span>Academic Credential Infrastructure</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* ── CARD 6: Sky Blue (Col 3, Row 3) ── AI Mentor */}
        <div className="lg:col-span-1 lg:row-span-1 bg-[#B7E0F7] text-[#0F2838] rounded-[32px] p-7 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-h-[240px]">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/55 backdrop-blur-xs flex items-center justify-center text-[#0F2838] shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="size-5 text-[#0F2838]" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/45 text-[#0F2838]">
                Contextual AI
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-cal font-bold tracking-tight text-[#0F2838] mb-2">
              AI Study Assistant
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#0F2838]/85 leading-relaxed">
              Syllabus guidance, quiz review guidelines, and automated pacing reminders available 24/7.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-white/45">24/7 Contextual Q&A</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/45">Pacing Alerts</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-5 border-t border-[#0F2838]/15 text-xs font-bold text-[#0F2838]/80">
            <span>Adaptive Study Companion</span>
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}

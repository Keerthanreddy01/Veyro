import * as motion from "motion/react-client";
import { useState } from "react";
import { Video, ShieldCheck, Terminal, Users, Clock } from "lucide-react";

export default function StreamlineBookersExperience() {
  const [format24, setFormat24] = useState(false);
  const [synced, setSynced] = useState(true);

  const days = [
    { name: "Mon", date: "06", isToday: false },
    { name: "Tue", date: "07", isToday: false },
    { name: "Wed", date: "08", isToday: true },
    { name: "Thu", date: "09", isToday: false },
    { name: "Fri", date: "10", isToday: false },
  ];

  return (
    <div
      aria-hidden={true}
      role="presentation"
      className="w-full h-full px-3 sm:px-6 pt-1 pb-3 flex flex-col justify-end select-none font-matter"
    >
      <div className="w-full bg-[#fbfbfb] rounded-2xl border border-gray/70 shadow-xs flex flex-col overflow-hidden">
        {/* Calendar Top Toolbar */}
        <div className="px-3.5 py-2.5 border-b border-gray/50 bg-white flex items-center justify-between gap-2">
          {/* Left: Sync Toggle & Status */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSynced(!synced)}
              className="group flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <div
                className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                  synced ? "bg-[#111111]" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`size-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                    synced ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-[#111111] tracking-tight whitespace-nowrap">
                Sync study calendar
              </span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          {/* Right: 12h / 24h Switch */}
          <div className="flex items-center gap-0.5 p-0.5 bg-neutral-100 rounded-lg border border-neutral-200/80 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setFormat24(false)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                !format24
                  ? "bg-white text-[#111111] font-semibold shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              12h
            </button>
            <button
              type="button"
              onClick={() => setFormat24(true)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                format24
                  ? "bg-white text-[#111111] font-semibold shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              24h
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-5 border-b border-gray/50 bg-[#f9fafb] text-center py-1.5">
          {days.map((day) => (
            <div
              key={day.name}
              className="flex items-center justify-center gap-1.5 py-0.5 text-xs"
            >
              <span
                className={`font-medium ${
                  day.isToday ? "text-[#111111] font-semibold" : "text-neutral-500"
                }`}
              >
                {day.name}
              </span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold transition-colors ${
                  day.isToday
                    ? "bg-[#111111] text-white shadow-xs"
                    : "text-neutral-600 bg-neutral-200/50"
                }`}
              >
                {day.date}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid & Events */}
        <div className="relative h-[155px] bg-white grid grid-cols-5 divide-x divide-gray/30 p-1.5 overflow-hidden">
          {/* Subtle background hour lines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2.5 opacity-25">
            <div className="border-b border-dashed border-neutral-300 w-full" />
            <div className="border-b border-dashed border-neutral-300 w-full" />
            <div className="border-b border-dashed border-neutral-300 w-full" />
          </div>

          {/* Current Time Indicator on Wednesday (placed cleanly above the event) */}
          <div className="absolute top-[20%] left-[40%] w-[20%] z-20 pointer-events-none flex items-center">
            <span className="size-2 rounded-full bg-rose-500 shadow-xs ring-2 ring-rose-200 animate-ping absolute" />
            <span className="size-2 rounded-full bg-rose-500 shadow-xs relative" />
            <div className="h-[1.5px] bg-rose-500 w-full shadow-xs" />
          </div>

          {/* Column 1: Mon (Lecture: Microservices) */}
          <div className="relative p-1">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-1.5 shadow-xs flex flex-col gap-1 cursor-default hover:border-sky-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#0369a1] uppercase tracking-wider">
                  <Video className="size-2.5" />
                  Lecture
                </span>
                <span className="size-1.5 rounded-full bg-sky-500" />
              </div>
              <div className="text-[11px] font-semibold text-[#0c4a6e] leading-snug line-clamp-1">
                Microservices
              </div>
              <div className="text-[9px] font-medium text-sky-700/80 flex items-center gap-1">
                <Clock className="size-2.5" />
                {format24 ? "09:00 - 10:30" : "9:00 AM"}
              </div>
            </motion.div>
          </div>

          {/* Column 2: Tue (Code Lab: Kubernetes) */}
          <div className="relative p-1 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full bg-[#faf5ff] border border-[#e9d5ff] rounded-lg p-1.5 shadow-xs flex flex-col gap-1 cursor-default hover:border-purple-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#7e22ce] uppercase tracking-wider">
                  <Terminal className="size-2.5" />
                  Lab
                </span>
                <span className="size-1.5 rounded-full bg-purple-500" />
              </div>
              <div className="text-[11px] font-semibold text-[#581c87] leading-snug line-clamp-1">
                Kubernetes
              </div>
              <div className="text-[9px] font-medium text-purple-700/80 flex items-center gap-1">
                <Clock className="size-2.5" />
                {format24 ? "11:30 - 13:00" : "11:30 AM"}
              </div>
            </motion.div>
          </div>

          {/* Column 3: Wed (Live Proctored Exam) */}
          <div className="relative p-1 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-1.5 shadow-xs flex flex-col gap-1 cursor-default ring-1 ring-rose-300/50 hover:border-rose-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#be123c] uppercase tracking-wider">
                  <ShieldCheck className="size-2.5 text-rose-600" />
                  Exam
                </span>
                <span className="text-[8px] bg-rose-600 text-white font-bold px-1 rounded">
                  Lock
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[#881337] leading-snug line-clamp-1">
                Proctored Test
              </div>
              <div className="text-[9px] font-medium text-rose-700/80 flex items-center gap-1">
                <Clock className="size-2.5" />
                {format24 ? "14:00 - 15:30" : "2:00 PM"}
              </div>
            </motion.div>
          </div>

          {/* Column 4: Thu (Mentor Office Hours) */}
          <div className="relative p-1 pt-3">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="w-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-1.5 shadow-xs flex flex-col gap-1 cursor-default hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#047857] uppercase tracking-wider">
                  <Users className="size-2.5" />
                  1:1 Review
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] font-semibold text-[#064e3b] leading-snug line-clamp-1">
                Dr. James
              </div>
              <div className="text-[9px] font-medium text-emerald-700/80 flex items-center gap-1">
                <Clock className="size-2.5" />
                {format24 ? "10:00 - 11:00" : "10:00 AM"}
              </div>
            </motion.div>
          </div>

          {/* Column 5: Fri (Capstone Presentation) */}
          <div className="relative p-1 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="w-full bg-[#fffbeb] border border-[#fde68a] rounded-lg p-1.5 shadow-xs flex flex-col gap-1 cursor-default hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#b45309] uppercase tracking-wider">
                  Capstone
                </span>
                <span className="size-1.5 rounded-full bg-amber-500" />
              </div>
              <div className="text-[11px] font-semibold text-[#78350f] leading-snug line-clamp-1">
                Presentation
              </div>
              <div className="text-[9px] font-medium text-amber-700/80 flex items-center gap-1">
                <Clock className="size-2.5" />
                {format24 ? "18:00 - 20:30" : "6:00 PM"}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

import CrossSVG from "@/components/CrossSVG";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useState } from "react";

export default function WhatsBetter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 font-matter text-xs font-semibold px-3.5 py-2 rounded-full bg-[#171717]/95 backdrop-blur-xs text-white hover:bg-[#242424] shadow-lg border border-white/10 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        aria-label="View Veyro Advantages"
      >
        <span className="w-2 h-2 rounded-full bg-[#60C5F1] animate-pulse" />
        <span className="hidden sm:inline">The Veyro Advantage</span>
        <span className="sm:hidden">Advantage</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed z-50 backdrop-blur-sm bg-black/40 top-0 h-screen w-full flex flex-col justify-center items-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[800px] max-h-[85vh] shrink-0 relative p-3 border-r-gray border border-gray"
            >
              <CrossSVG
                className="absolute -left-3 -bottom-3 "
                fill="#c0c2c4"
                stroke="white"
              />
              <CrossSVG
                className="absolute -right-3 -bottom-3 "
                fill="#c0c2c4"
                stroke="white"
              />
              <CrossSVG
                className="absolute -left-3 -top-3 "
                fill="#c0c2c4"
                stroke="white"
              />
              <CrossSVG
                className="absolute -right-3 -top-3 "
                fill="#c0c2c4"
                stroke="white"
              />
              <motion.div className="card-shadow border flex flex-col border-gray rounded-2xl bg-white h-full p-6 font-matter">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#60C5F1]" />
                    <h2 className="font-cal text-2xl text-[#111827]">
                      The Veyro Advantage
                    </h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-[#898989] hover:text-black font-semibold text-sm px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="overflow-y-auto space-y-6 text-[#4b5563] pr-2">
                  <div className="flex gap-4">
                    <SNo className="bg-[#369EFF]">1</SNo>
                    <div>
                      <h3 className="font-cal text-lg text-primary-black mb-1">
                        Server-Authoritative Anti-Cheat Proctoring
                      </h3>
                      <p className="text-sm leading-relaxed text-[#6f6f6f]">
                        Full-screen lock enforcement, tab-switch and blur detection, and server-side integrity violation monitoring. If a student attempts unauthorized switching, violations are recorded and the exam auto-submits, guaranteeing legitimate evaluation validity.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <SNo className="bg-[#ff9447]">2</SNo>
                    <div>
                      <h3 className="font-cal text-lg text-primary-black mb-1">
                        90% Video Watch Auditing
                      </h3>
                      <p className="text-sm leading-relaxed text-[#6f6f6f]">
                        Video milestones enforce authentic watch progression. Fast-forwarding and scrub skipping are audited in real time before milestone chapter quizzes unlock, ensuring consistent curriculum engagement.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <SNo className="bg-[#25d0ab]">3</SNo>
                    <div>
                      <h3 className="font-cal text-lg text-primary-black mb-1">
                        Cryptographic SHA-256 Completion Certificates
                      </h3>
                      <p className="text-sm leading-relaxed text-[#6f6f6f]">
                        Every graduate receives a tamper-proof PDF certificate with a verifiable SHA-256 hash and a live verification route at&nbsp;
                        <Link
                          href="/verify/VY-DEMO-2026"
                          className="text-[#0561A2] font-semibold underline underline-offset-2"
                        >
                          /verify/VY-DEMO-2026
                        </Link>
                        . Employers and institutions can independently validate credentials in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const SNo = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <span
    className={cn(
      "mt-0.5 h-fit shrink-0 grid place-items-center rounded-full tracking-tighter text-sm size-[26px] leading-none text-white font-semibold",
      className
    )}
  >
    {children}
  </span>
);


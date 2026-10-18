import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  X,
  Sparkles,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Mail,
  ShieldAlert,
} from "lucide-react";

export interface SetupStep {
  title: string;
  detail: string;
}

export interface EducationPlatform {
  id: string;
  name: string;
  badge: string;
  src: string;
  gradient: string;
  howItWorks: string;
  studentBenefits: string[];
  requirements: string;
  setupSteps: SetupStep[];
}

interface IntegrationModalProps {
  platform: EducationPlatform | null;
  onClose: () => void;
}

export default function IntegrationModal({
  platform,
  onClose,
}: IntegrationModalProps) {
  const [view, setView] = useState<"overview" | "request">("overview");
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Reset view state whenever platform changes
  useEffect(() => {
    if (platform) {
      setView("overview");
      setCopied(false);
    }
  }, [platform]);

  // Lock body scroll and register Escape key listener
  useEffect(() => {
    if (!platform) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Auto-focus close button for keyboard accessibility
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [platform, onClose]);

  if (!platform) return null;

  const mailtoSubject = encodeURIComponent(
    `Veyro AI LMS Integration Request — ${platform.name}`
  );
  const mailtoBody = encodeURIComponent(
    `Hello Veyro Academic Partnerships Team,\n\n` +
      `I am requesting integration access for ${platform.name} with Veyro AI for our institution.\n\n` +
      `Institution / School Name: \n` +
      `My Role (Administrator / Faculty / Department Head): \n` +
      `Estimated Active Students / Cohorts: \n` +
      `LMS Deployment Domain: \n\n` +
      `Please provide the relevant LTI 1.3 registration credentials and technical documentation.\n\n` +
      `Thank you.`
  );
  const mailtoUrl = `mailto:integrations@veyro.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("integrations@veyro.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = "integrations@veyro.com";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="integration-modal-title"
        aria-describedby="integration-modal-description"
      >
        {/* Compositor-friendly lightweight backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.05 : 0.18,
            ease: "easeOut",
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window: Fixed Header, Scrollable Body, Fixed Footer */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.98, y: 8 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.98, y: 6 }
          }
          transition={{
            duration: shouldReduceMotion ? 0.05 : 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[580px] max-h-[85vh] sm:max-h-[88vh] bg-white rounded-[26px] sm:rounded-[30px] shadow-[0_20px_60px_-15px_rgba(10,21,45,0.22)] border border-slate-200/80 flex flex-col overflow-hidden text-[#111111]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {/* 1. FIXED HEADER */}
          <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white z-10">
            <div className="flex items-center gap-3 min-w-0">
              {/* Platform Brand Icon Container */}
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/70 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src={platform.src}
                  alt={platform.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Badge */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    LMS INTEGRATION
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                    {platform.badge}
                  </span>
                </div>
                <h3
                  id="integration-modal-title"
                  className="text-lg sm:text-xl font-semibold text-[#0a1b33] tracking-tight truncate mt-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {platform.name}
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close integration panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* 2. SCROLLABLE CONTENT BODY */}
          <div
            id="integration-modal-description"
            className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-4.5 overscroll-contain"
          >
            {view === "overview" ? (
              <>
                {/* Connection Status Row */}
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span className="font-semibold text-amber-900">
                      Not connected
                    </span>
                  </div>
                  <span className="text-[11.5px] text-amber-800/80 font-medium text-right">
                    Institutional authorization required
                  </span>
                </div>

                {/* Section A: How It Works */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    How It Works
                  </h4>
                  <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {platform.howItWorks}
                  </p>
                </div>

                {/* Section B: Student Benefits */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Student Benefits
                  </h4>
                  <div className="space-y-1.5">
                    {platform.studentBenefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/80"
                      >
                        <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <p className="text-[12.5px] text-slate-700 leading-snug">
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Requirements & Permissions */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-700">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Requirements & Permissions
                    </h4>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    {platform.requirements}
                  </p>
                </div>

                {/* Section D: Proposed Setup Sequence */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Setup Sequence
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Proposed · Subject to Admin Approval
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {platform.setupSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-slate-200/80 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[11.5px] font-semibold text-slate-800 line-clamp-1">
                            {step.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* REAL / HONEST REQUEST NEXT STEP VIEW */
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed">
                    <p className="font-semibold text-indigo-900 mb-0.5">
                      Institutional Rollout Process
                    </p>
                    <p className="text-indigo-800/90 text-[11.5px]">
                      Veyro AI connects to {platform.name} via official LTI 1.3 Advantage and REST endpoints. Activation requires configuration by your institution's LMS or campus IT administrator.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Academic Partnerships Desk
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md hover:border-slate-300 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs font-mono text-slate-800 select-all">
                    integrations@veyro.com
                  </div>

                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Clicking below prepares a pre-structured email draft with {platform.name} deployment parameters for our academic engineering team.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800 text-[11.5px] uppercase tracking-wider">
                    Information to have ready:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-500">
                    <li>Campus / University domain URL</li>
                    <li>LMS administrator contact name or department</li>
                    <li>Approximate student or department cohort size</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 3. FIXED FOOTER */}
          <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/80 sm:bg-white flex items-center justify-between gap-3 z-10">
            {view === "overview" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setView("request")}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0a152d] text-white text-xs font-semibold shadow-xs hover:bg-[#060e20] transition-all cursor-pointer"
                >
                  <span>Request integration</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setView("overview")}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Back to overview
                </button>
                <a
                  href={mailtoUrl}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0a152d] text-white text-xs font-semibold shadow-xs hover:bg-[#060e20] transition-all cursor-pointer"
                >
                  <span>Open email draft</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

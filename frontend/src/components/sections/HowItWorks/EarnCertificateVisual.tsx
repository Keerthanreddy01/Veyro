import * as motion from "motion/react-client";
import Link from "next/link";

export default function EarnCertificateVisual() {
  return (
    <div
      aria-hidden={true}
      role="presentation"
      className="h-full relative overflow-hidden flex flex-col justify-end p-5"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-[#f8f9fa] border border-gray rounded-xl p-4 shadow-sm font-matter space-y-3"
      >
        <div className="flex items-center justify-between border-b border-gray/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Verified Credential
            </span>
          </div>
          <span className="font-mono text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded-full font-bold">
            VY-DEMO-2026
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-[#6b7280]">Full-Stack Systems Specialization</div>
          <div className="text-[11px] font-mono text-[#9ca3af] truncate">
            SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae...
          </div>
        </div>

        <Link
          href="/verify/VY-DEMO-2026"
          className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-[#111111] text-white hover:bg-[#242424] transition-colors"
        >
          Check Authenticity Ledger →
        </Link>
      </motion.div>
    </div>
  );
}

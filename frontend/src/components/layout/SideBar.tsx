import { motion } from "motion/react";
import Link from "next/link";

interface SideBarProps {
  onClose?: () => void;
}

const navItems = [
  { label: "Courses", href: "/courses" },
  { label: "Learning Paths", href: "/courses" },
  { label: "For Instructors", href: "/instructor/courses/new" },
  { label: "About Veyro", href: "#benefits" },
  { label: "How It Works", href: "#how-it-works" },
];

const SideBar = ({ onClose }: SideBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed top-[57px] inset-x-0 bottom-0 bg-[#f4f4f4] z-50 flex flex-col overflow-y-auto font-matter border-t border-black/10"
    >
      <div className="w-full max-w-md mx-auto px-5 py-3 sm:px-8 sm:py-5 flex flex-col">
        {/* Navigation list with thin, subtle solid dividers */}
        <nav className="flex flex-col" aria-label="Mobile Navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between py-3.5 text-[17px] sm:text-[18px] font-semibold text-[#141414] hover:text-black border-b border-black/[0.08] active:bg-black/[0.03] px-1 rounded-sm transition-colors"
            >
              <span>{item.label}</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black/30"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Compact Auth & CTA Section directly beneath navigation */}
        <div className="pt-6 pb-8 flex flex-col gap-3.5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <div className="text-center text-[14px] text-[#666]">
            <span className="opacity-70 mr-1.5">Existing student or instructor?</span>
            <Link
              href="/login"
              onClick={onClose}
              className="font-bold text-[#141414] underline underline-offset-2 hover:opacity-80 py-1 inline-block"
            >
              Sign In
            </Link>
          </div>

          <Link
            href="/register"
            onClick={onClose}
            className="w-full h-12 text-[15px] font-semibold bg-[#151819] hover:bg-[#25282a] active:scale-[0.99] transition-all rounded-xl flex items-center justify-center text-white shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SideBar;


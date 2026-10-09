import { ReactNode, useRef, useState } from "react";
import {
  useScroll,
  motion,
  useMotionValueEvent,
  AnimatePresence,
  MotionConfig,
} from "motion/react";
import StyledLink from "@/components/StyledLink";
import Logo from "@/components/SVGs/Logo";
import Link from "next/link";
import SideBar from "../SideBar";
import Solutions from "./DropDown/Solutions";
import Developer from "./DropDown/Developer";
import Resources from "./DropDown/Resourses";
import DropDownIcon from "@/components/sections/Benefits/BenefitsIcons/DropDownIcon";

interface animateProps {
  backgroundColor: string;
  boxShadow?: string;
}
let controlInterval: ReturnType<typeof setInterval> | undefined;

const NavBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<string | null>(null);
  const [openSideBar, setOpenSideBar] = useState<boolean>(false);
  const [animate, setAnimate] = useState<animateProps>({
    backgroundColor: "#F4F4F4",
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 0", "50px 0"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest == 1) {
      setAnimate({
        boxShadow:
          "0px 4px 8px rgba(34, 42, 53, .05), 0px 0px 0px 1px rgba(34, 42, 53, .08), 0px 1px 5px -4px rgba(19, 19, 22, .7)",
        backgroundColor: "#FEFEFE",
      });
    } else {
      setAnimate({
        backgroundColor: "#F4F4F4",
      });
    }
  });

  const handleMouseEnter = (tab: string) => {
    clearInterval(controlInterval);
    setState(tab);
  };
  const handleMouseLeave = () => {
    controlInterval = setInterval(() => {
      setState(null);
    }, 300);
  };

  const DropDownCard: { [key: string]: ReactNode } = {
    Solutions: <Solutions />,
    Developer: <Developer />,
    Resources: <Resources />,
  };

  return (
    <div ref={ref} className="w-full fixed top-0 flex justify-center z-40">
      <div className="w-full max-w-screen-xl lg:pt-2 lg:px-9 flex justify-center">
        {state && (
          <motion.div
            key={state}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.4 }}
            onMouseEnter={() => clearInterval(controlInterval)}
            onMouseLeave={handleMouseLeave}
            className="absolute top-[110%] p-4 rounded-2xl border border-gray bg-[#fefefe] font-matter mx-2 [box-shadow:rgba(0,0,0,0.05)_0px_10px_20px_0px]"
          >
            {DropDownCard[state]}
          </motion.div>
        )}
        <motion.div
          initial={{ backgroundColor: "#F4F4F4" }}
          animate={{ ...animate }}
          className="w-full flex justify-between items-center p-4 md:px-[34px] lg:rounded-2xl"
        >
          <Link href="/" className="flex items-center gap-1">
            <Logo />
            <span className="-mt-1.5 font-cal">®</span>
          </Link>
          <button
            aria-label="Open sidebar"
            onClick={() => setOpenSideBar((prev) => !prev)}
            className="lg:hidden size-4 space-y-1"
          >
            <MotionConfig transition={{ ease: "linear" }}>
              <motion.div
                initial={{ rotate: "0deg", y: "0px" }}
                animate={
                  openSideBar
                    ? { rotate: "45deg", y: "6px" }
                    : { rotate: "0deg", y: "0px" }
                }
                className="py-px bg-black rounded-full"
              />
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: openSideBar ? 0 : 1 }}
                className="py-px bg-black rounded-full"
              />
              <motion.div
                initial={{ rotate: "0deg" }}
                animate={
                  openSideBar
                    ? { rotate: "-45deg", y: "-6px" }
                    : { rotate: "0deg", y: "0px" }
                }
                className="py-px bg-black rounded-full"
              />
            </MotionConfig>
          </button>
          <ol className="hidden lg:flex font-matter text-[14px] text-[#141414] gap-8 [&>li]:cursor-pointer items-center">
            <li>
              <Link href="/courses" className="hover:text-black font-medium transition-colors">Courses</Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-black font-medium transition-colors">Learning Paths</Link>
            </li>
            <li>
              <Link href="/instructor/courses/new" className="hover:text-black font-medium transition-colors">For Instructors</Link>
            </li>
            <li>
              <Link href="#benefits" className="hover:text-black font-medium transition-colors">About</Link>
            </li>
            <li>
              <Link
                href="/verify/VY-DEMO-2026"
                className="px-3 py-1 rounded-full bg-[#f0f0f0] hover:bg-[#e4e4e4] text-xs font-semibold border border-black/10 transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#60C5F1]" />
                <span>Verify Credential</span>
              </Link>
            </li>
          </ol>
          <div className="hidden gap-3 lg:flex items-center">
            <Link
              href="/login"
              className="font-medium font-matter text-[15px] hover:opacity-80"
            >
              Sign In
            </Link>
            <StyledLink href="/register" className="flex-grow-0">
              Get Started
            </StyledLink>
          </div>
        </motion.div>
        <AnimatePresence>{openSideBar && <SideBar />}</AnimatePresence>
      </div>
    </div>
  );
};

export default NavBar;

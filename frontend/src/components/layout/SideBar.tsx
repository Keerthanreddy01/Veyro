import * as motion from "motion/react-client";
import Link from "next/link";

const SideBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-t-2 border-black fixed top-12 inset-x-0 bottom-0 bg-[#f4f4f4] flex flex-col justify-center font-cal text-[22px]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
        exit={{ opacity: 0 }}
        className="flex-1 overflow-y-scroll tracking-wide pb-[55px]"
      >
        {[
          { label: "Courses", href: "/courses" },
          { label: "Learning Paths", href: "/courses" },
          { label: "For Instructors", href: "/instructor/courses/new" },
          { label: "Verify Credential", href: "/verify/VY-DEMO-2026" },
          { label: "About Veyro", href: "#benefits" },
          { label: "How It Works", href: "#how-it-works" },
        ].map((eachTab) => (
          <Link
            key={eachTab.label}
            href={eachTab.href}
            className="block p-4 md:px-[34px] font-bold border-b-2 border-dashed border-black hover:bg-black/5"
          >
            {eachTab.label}
          </Link>
        ))}
      </motion.div>
      <li
        className="flex flex-col items-center px-4 pb-6 pt-12 gap-4 bg-transparent list-none"
        style={{ boxShadow: "0px -10px 30px 20px #f4f4f4" }}
      >
        <div className="">
          <span className="opacity-40 mr-2">Existing student or instructor?</span>
          <Link href="/login" className="font-bold underline">
            Sign In
          </Link>
        </div>
        <Link
          href="/register"
          className="font-cal w-full min-h-16 text-lg bg-gradient-to-b from-[#2c2c30] to-[#1d1d20] hover:opacity-90 rounded-xl grid place-items-center text-white max-w-lg"
        >
          Get Started
        </Link>
      </li>
    </motion.div>
  );
};

export default SideBar;

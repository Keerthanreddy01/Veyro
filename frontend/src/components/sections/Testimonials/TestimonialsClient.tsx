"use client";
import useToggleState from "@/hooks/useToggleState";
import { useMemo } from "react";
import { motion } from "motion/react";
import CrossSVG from "@/components/CrossSVG";
import Image from "next/image";
interface Testimonial {
  testimonial: string;
  name: string;
  occupation: string;
  profilePicture: string;
  brandLogo: string;
}

const testimonials: Testimonial[] = [
  {
    testimonial:
      "The 90% watch threshold ensured I actually absorbed every lesson before attempting the quiz. Receiving the cryptographic certificate at the end felt genuinely earned.",
    name: "Alex Rivera",
    occupation: "Learner (Beta Cohort) — Full-Stack Systems",
    profilePicture: "/testimonials/Aria Minaei.png",
    brandLogo: "/testimonials/TheatreJSLogo.svg",
  },
  {
    testimonial:
      "As an instructor, authoring video modules and proctored quizzes in Veyro is effortless. The tab-focus monitoring eliminates any doubt during grading.",
    name: "Dr. Marcus Chen",
    occupation: "Instructor — Distributed Cloud Systems",
    profilePicture: "/testimonials/Ant Wilson.png",
    brandLogo: "/testimonials/SupaBaseLogo.png",
  },
  {
    testimonial:
      "Being able to verify my certificate instantly using the public verification code gave me a huge advantage when applying for senior engineering roles.",
    name: "Priya Sharma",
    occupation: "Graduate (Beta Cohort) — DevOps & SRE",
    profilePicture: "/testimonials/Kent C. Dodds.png",
    brandLogo: "/testimonials/EpicWebLogo.png",
  },
  {
    testimonial:
      "Veyro sets a benchmark for modern educational software. Clean, fast, dark mode aesthetics with non-invasive browser proctoring.",
    name: "Elena Rostova",
    occupation: "Student — Cybersecurity & Cryptography",
    profilePicture: "/testimonials/Guillermo Rauch.png",
    brandLogo: "/testimonials/VercelLogo.svg",
  },
];
export default function TestimonialsClient() {
  const { ref, state } = useToggleState<HTMLDivElement>(
    { from: 0, to: testimonials.length },
    5000
  );
  const orderedTestimonials: Testimonial[] = useMemo(() => {
    let i = state;
    const orderedTestimonials: Testimonial[] = [];
    do {
      orderedTestimonials.push(testimonials[i]);
      i = (i + 1) % testimonials.length;
    } while (i != state);
    return orderedTestimonials;
  }, [state]);
  return (
    <div
      ref={ref}
      className="px-1 h-[360px] sm:h-[270px] border-y border-y-gray flex justify-center relative overflow-x-clip"
    >
      {orderedTestimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.name}
          layoutId={testimonial.name}
          initial={{
            opacity: index == 2 ? 0 : index == 0 ? 1 : 0.5,
          }}
          style={{
            position: index == 2 ? "absolute" : "relative",
            display: index == 2 ? "hidden" : "block",
            zIndex: index == 2 ? 1 : 2,
            order: index == 0 ? 2 : index,
          }}
          animate={{
            opacity: index == 2 ? 0 : index == 0 ? 1 : 0.5,
          }}
          transition={{
            layout: { duration: 0.8 },
            opacity: { duration: 0.8 },
          }}
          className="w-[85%] sm:w-[75%] md:w-[65%] lg:w-[50%] h-full shrink-0 relative p-3 border-r-gray border-r"
        >
          <CrossSVG className="absolute -left-3 -bottom-3 " />
          <CrossSVG className="absolute -right-3 -bottom-3 " />
          <CrossSVG className="absolute -left-3 -top-3 " />
          <CrossSVG className="absolute -right-3 -top-3 " />
          <motion.div className="card-shadow border border-gray rounded-2xl bg-white h-full flex flex-col justify-between p-4 lg:p-6 font-matter">
            <p className="text-[20px] lg:text-[24px] text-[#141414] [text-indent:-6px] lg:[text-indent:-7px] font-semibold">
              &quot;{testimonial.testimonial}&quot;
            </p>
            <div className="flex gap-3 items-center">
              <Image
                src={testimonial.profilePicture}
                width={44}
                height={44}
                className="size-[44px] rounded-lg"
                alt={testimonial.name}
              />
              <div className="text-[14px]">
                <p className="text-[#111827] font-medium">{testimonial.name}</p>
                <p className="text-[#6b7280]">{testimonial.occupation}</p>
              </div>

              <Image
                src={testimonial.brandLogo}
                alt="Brand Logo"
                width={50}
                height={50}
                className="w-[50px] h-fit ml-4"
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

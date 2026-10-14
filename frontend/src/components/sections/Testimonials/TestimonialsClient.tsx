"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import CrossSVG from "@/components/CrossSVG";
import Image from "next/image";
import { Star, Plus, X, CheckCircle2, MessageSquarePlus } from "lucide-react";
import toast from "react-hot-toast";
import useToggleState from "@/hooks/useToggleState";

export interface Testimonial {
  id?: string;
  testimonial: string;
  name: string;
  occupation: string;
  profilePicture?: string;
  rating?: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "alex",
    testimonial:
      "The 90% watch threshold ensured I actually absorbed every lesson before attempting the quiz. Receiving the cryptographic certificate at the end felt genuinely earned.",
    name: "Alex Rivera",
    occupation: "Learner — Full-Stack Systems",
    profilePicture: "/testimonials/Aria Minaei.png",
    rating: 5,
  },
  {
    id: "marcus",
    testimonial:
      "As an instructor, authoring video modules and proctored quizzes in Veyro is effortless. The tab-focus monitoring eliminates any doubt during grading.",
    name: "Dr. Marcus Chen",
    occupation: "Instructor — Distributed Cloud Systems",
    profilePicture: "/testimonials/Ant Wilson.png",
    rating: 5,
  },
  {
    id: "priya",
    testimonial:
      "Being able to verify my certificate instantly using the public verification code gave me a huge advantage when applying for senior engineering roles.",
    name: "Priya Sharma",
    occupation: "Graduate — DevOps & SRE",
    profilePicture: "/testimonials/Kent C. Dodds.png",
    rating: 5,
  },
  {
    id: "elena",
    testimonial:
      "Veyro sets a benchmark for modern educational software. Clean, fast, dark mode aesthetics with non-invasive browser proctoring.",
    name: "Elena Rostova",
    occupation: "Student — Cybersecurity & Cryptography",
    profilePicture: "/testimonials/Guillermo Rauch.png",
    rating: 5,
  },
];

const LOCAL_STORAGE_KEY = "veyro_custom_testimonials";

export default function TestimonialsClient() {
  const [list, setList] = useState<Testimonial[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...DEFAULT_TESTIMONIALS];
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TESTIMONIALS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const { ref, state } = useToggleState<HTMLDivElement>(
    { from: 0, to: list.length },
    5000
  );

  const orderedTestimonials: Testimonial[] = useMemo(() => {
    if (list.length === 0) return [];
    let i = state % list.length;
    const ordered: Testimonial[] = [];
    let count = 0;
    while (count < list.length) {
      ordered.push(list[i]);
      i = (i + 1) % list.length;
      count++;
    }
    return ordered;
  }, [state, list]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (testimonialText.trim().length < 10) {
      toast.error("Testimonial must be at least 10 characters long");
      return;
    }

    const newTestimonial: Testimonial = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      occupation: occupation.trim() || "Veyro Learner",
      testimonial: testimonialText.trim(),
      rating,
    };

    const updated = [newTestimonial, ...list];
    setList(updated);

    try {
      const customOnes = updated.filter((item) => item.id?.startsWith("custom-"));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnes));
    } catch {
      // ignore storage error
    }

    toast.success("Thank you! Your review has been published.");
    setName("");
    setOccupation("");
    setTestimonialText("");
    setRating(5);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar: Add Testimonial Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99]"
        >
          <MessageSquarePlus size={16} />
          <span>Add your testimonial</span>
        </button>
      </div>

      {/* Testimonials Carousel Container */}
      <div
        ref={ref}
        className="px-1 h-[370px] sm:h-[280px] border-y border-y-gray flex justify-center relative overflow-x-clip"
      >
        {orderedTestimonials.map((testimonial, index) => {
          const isSubmitted = testimonial.id?.startsWith("custom-");
          return (
            <motion.div
              key={testimonial.id || testimonial.name}
              layoutId={testimonial.id || testimonial.name}
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
              <CrossSVG className="absolute -left-3 -bottom-3" />
              <CrossSVG className="absolute -right-3 -bottom-3" />
              <CrossSVG className="absolute -left-3 -top-3" />
              <CrossSVG className="absolute -right-3 -top-3" />

              <motion.div className="card-shadow border border-gray rounded-2xl bg-white h-full flex flex-col justify-between p-5 lg:p-6 font-matter text-left">
                <p className="text-[18px] sm:text-[20px] lg:text-[22px] text-[#141414] [text-indent:-6px] font-semibold leading-snug line-clamp-4">
                  &quot;{testimonial.testimonial}&quot;
                </p>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    {testimonial.profilePicture ? (
                      <Image
                        src={testimonial.profilePicture}
                        width={44}
                        height={44}
                        className="size-[42px] sm:size-[44px] rounded-full object-cover border border-black/10"
                        alt={testimonial.name}
                      />
                    ) : (
                      <div className="size-[42px] sm:size-[44px] rounded-full bg-gradient-to-tr from-[#111] to-[#444] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {testimonial.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-[13px] sm:text-[14px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#111827] font-semibold">{testimonial.name}</span>
                        {isSubmitted && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[#6b7280] text-xs sm:text-[13px] truncate max-w-[200px] sm:max-w-[280px]">
                        {testimonial.occupation}
                      </p>
                    </div>
                  </div>

                  {/* Clean Star Rating Badge instead of third-party company logos */}
                  <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0 bg-[#FAF9F5] px-2.5 py-1 rounded-full border border-black/5">
                    {[...Array(testimonial.rating || 5)].map((_, starIdx) => (
                      <Star key={starIdx} size={12} className="fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal: Add Your Testimonial */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-black/10 shadow-2xl relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-black/5 text-[#777] hover:text-[#111] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77736D] bg-[#FAF8F4] px-2.5 py-1 rounded-md border border-black/5">
                  Share Your Story
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111] mt-2 tracking-tight">
                  Add Your Testimonial
                </h3>
                <p className="text-xs sm:text-sm text-[#666] mt-1">
                  Share your experience with Veyro's audited courses, proctored quizzes, and accredited certificates.
                </p>
              </div>

              <form onSubmit={handleAddReview} className="space-y-4">
                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#333] mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          className={`${
                            (hoverRating || rating) >= star
                              ? "fill-amber-400 text-amber-500"
                              : "text-zinc-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-[#777] ml-2 font-medium">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#333] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    required
                    className="w-full bg-[#FAF9F6] border border-black/10 focus:border-black/30 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-[#999] text-[#111]"
                  />
                </div>

                {/* Role / Track */}
                <div>
                  <label className="block text-xs font-semibold text-[#333] mb-1">
                    Role / Learning Track
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Student — Cloud Architecture or DevOps Fellow"
                    className="w-full bg-[#FAF9F6] border border-black/10 focus:border-black/30 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-[#999] text-[#111]"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-semibold text-[#333] mb-1">
                    Your Review <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="Tell us what you loved about learning on Veyro..."
                    required
                    className="w-full bg-[#FAF9F6] border border-black/10 focus:border-black/30 rounded-xl p-3.5 text-sm outline-none transition-all placeholder:text-[#999] text-[#111] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-black/10 hover:bg-black/5 text-sm font-semibold text-[#555] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#111] hover:bg-black text-white text-sm font-semibold transition-all shadow-xs hover:shadow cursor-pointer"
                  >
                    Submit Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import CrossSVG from "@/components/CrossSVG";
import Image from "next/image";
import {
  Star,
  X,
  CheckCircle2,
  MessageSquarePlus,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";

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

export default function TestimonialsClient() {
  const [list, setList] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch approved testimonials from live API
  useEffect(() => {
    let isMounted = true;
    api
      .get("/testimonials")
      .then(({ data }) => {
        if (isMounted && data?.testimonials && data.testimonials.length > 0) {
          const mapped: Testimonial[] = data.testimonials.map((t: any) => ({
            id: t._id || t.id,
            name: t.name,
            occupation: t.occupation,
            testimonial: t.testimonial,
            rating: t.rating || 5,
            profilePicture: t.profilePicture,
          }));
          setList(mapped);
        }
      })
      .catch(() => {
        // Fallback gracefully to default testimonials
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotation every 5.5 seconds, paused on hover
  useEffect(() => {
    if (list.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [list.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const handleOpenModal = () => {
    setIsSubmittedSuccess(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setName("");
      setOccupation("");
      setTestimonialText("");
      setRating(5);
    }, 200);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (testimonialText.trim().length < 10) {
      toast.error("Testimonial must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/testimonials", {
        name: name.trim(),
        occupation: occupation.trim() || "Veyro Learner",
        testimonial: testimonialText.trim(),
        rating,
      });

      const newTestimonial: Testimonial = {
        id: data?.testimonial?._id || `pending-${Date.now()}`,
        name: name.trim(),
        occupation: occupation.trim() || "Veyro Learner",
        testimonial: testimonialText.trim(),
        rating,
      };

      // Keep locally and highlight it
      setList((prev) => [newTestimonial, ...prev]);
      setCurrentIndex(0);

      setIsSubmittedSuccess(true);
      toast.success("Thank you! Your testimonial has been received for review.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe cyclic indices for left, center, right
  const len = list.length;
  const prevIndex = (currentIndex - 1 + len) % len;
  const nextIndex = (currentIndex + 1) % len;

  const currentItem = list[currentIndex] || DEFAULT_TESTIMONIALS[0];
  const prevItem = list[prevIndex] || DEFAULT_TESTIMONIALS[0];
  const nextItem = list[nextIndex] || DEFAULT_TESTIMONIALS[0];

  return (
    <div className="space-y-6">
      {/* Action Bar: Professional Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow cursor-pointer active:scale-[0.99] font-sans"
        >
          <MessageSquarePlus size={15} />
          <span>Add your testimonial</span>
        </button>
      </div>

      {/* Testimonials Showcase Container */}
      <div
        className="relative max-w-6xl mx-auto px-2 sm:px-6 py-2 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:left-2 z-30">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="size-10 sm:size-11 rounded-full bg-white/95 hover:bg-white text-[#171717] border border-[#E7E2DA] shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:right-2 z-30">
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="size-10 sm:size-11 rounded-full bg-white/95 hover:bg-white text-[#171717] border border-[#E7E2DA] shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 3-Card Staged Showcase (Desktop) / Focused Single Card (Mobile) */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 min-h-[300px] sm:min-h-[290px] relative overflow-hidden py-4">
          {/* Left Preview Card (Desktop only, click to view) */}
          <div
            onClick={handlePrev}
            className="hidden md:flex flex-col justify-between w-[26%] shrink-0 h-[260px] p-5 rounded-2xl bg-white/60 border border-[#E7E2DA]/80 opacity-40 hover:opacity-75 scale-95 transition-all duration-300 cursor-pointer shadow-xs text-left"
          >
            <p className="text-sm text-[#555] line-clamp-4 leading-relaxed font-matter">
              &ldquo;{prevItem.testimonial}&rdquo;
            </p>
            <div className="flex items-center gap-2.5 pt-3 border-t border-black/5">
              <div className="size-8 rounded-lg bg-[#EAE6DF] text-[#171717] flex items-center justify-center font-bold text-xs shrink-0">
                {prevItem.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate text-xs">
                <p className="font-semibold text-[#171717] truncate">{prevItem.name}</p>
                <p className="text-[#777] text-[11px] truncate">{prevItem.occupation}</p>
              </div>
            </div>
          </div>

          {/* Highlight / Active Featured Card (Center) */}
          <div className="w-full md:w-[54%] shrink-0 relative z-20">
            <CrossSVG className="absolute -left-2.5 -bottom-2.5 hidden sm:block pointer-events-none" />
            <CrossSVG className="absolute -right-2.5 -bottom-2.5 hidden sm:block pointer-events-none" />
            <CrossSVG className="absolute -left-2.5 -top-2.5 hidden sm:block pointer-events-none" />
            <CrossSVG className="absolute -right-2.5 -top-2.5 hidden sm:block pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id || currentItem.name}
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-2xl border-2 border-[#171717]/15 bg-white p-6 sm:p-7 shadow-lg flex flex-col justify-between min-h-[270px] text-left relative overflow-hidden"
              >
                {/* Decorative Top Accent Bar */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E7E2DA]/80">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F4] border border-[#E7E2DA] text-[#171717] text-xs font-semibold">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Verified Review</span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-black/5">
                    {[...Array(currentItem.rating || 5)].map((_, starIdx) => (
                      <Star key={starIdx} size={13} className="fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Quote */}
                <div className="space-y-2 py-1">
                  <Quote size={22} className="text-[#171717]/25 -scale-x-100" />
                  <p className="text-base sm:text-lg lg:text-[19px] text-[#171717] font-semibold leading-snug font-matter">
                    &ldquo;{currentItem.testimonial}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    {currentItem.profilePicture ? (
                      <Image
                        src={currentItem.profilePicture}
                        width={42}
                        height={42}
                        className="size-10 sm:size-11 rounded-xl object-cover border border-[#E7E2DA]"
                        alt={currentItem.name}
                      />
                    ) : (
                      <div className="size-10 sm:size-11 rounded-xl bg-[#171717] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {currentItem.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#171717] font-bold text-sm sm:text-base">
                          {currentItem.name}
                        </span>
                        {currentItem.id?.startsWith("pending-") && (
                          <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            UNDER REVIEW
                          </span>
                        )}
                      </div>
                      <p className="text-[#6b7280] text-xs sm:text-[13px] truncate max-w-[220px] sm:max-w-[320px]">
                        {currentItem.occupation}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Preview Card (Desktop only, click to view) */}
          <div
            onClick={handleNext}
            className="hidden md:flex flex-col justify-between w-[26%] shrink-0 h-[260px] p-5 rounded-2xl bg-white/60 border border-[#E7E2DA]/80 opacity-40 hover:opacity-75 scale-95 transition-all duration-300 cursor-pointer shadow-xs text-left"
          >
            <p className="text-sm text-[#555] line-clamp-4 leading-relaxed font-matter">
              &ldquo;{nextItem.testimonial}&rdquo;
            </p>
            <div className="flex items-center gap-2.5 pt-3 border-t border-black/5">
              <div className="size-8 rounded-lg bg-[#EAE6DF] text-[#171717] flex items-center justify-center font-bold text-xs shrink-0">
                {nextItem.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate text-xs">
                <p className="font-semibold text-[#171717] truncate">{nextItem.name}</p>
                <p className="text-[#777] text-[11px] truncate">{nextItem.occupation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 pt-3">
          {list.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-7 h-2 bg-[#171717]"
                  : "w-2 h-2 bg-[#E7E2DA] hover:bg-[#A99B8A]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Professional Rectangular Box Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-xl p-6 sm:p-7 max-w-lg w-full border border-[#E7E2DA] shadow-xl relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 p-1 rounded-md hover:bg-[#FAF8F4] text-[#77736D] hover:text-[#171717] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={17} />
              </button>

              {isSubmittedSuccess ? (
                /* Success Confirmation State */
                <div className="py-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={22} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-sm text-[#555555] leading-relaxed mt-2">
                    We will review your submission and add your testimonial to the verified showcase if it helps fellow learners on Veyro.
                  </p>
                  <div className="mt-6 pt-4 border-t border-[#E7E2DA] flex justify-end">
                    <button
                      onClick={handleCloseModal}
                      className="px-5 py-2 rounded-lg bg-[#171717] hover:bg-[#2A2A2A] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Input Form */
                <>
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736D] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#E7E2DA]">
                      Community Feedback
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#171717] mt-2 tracking-tight">
                      Add Your Testimonial
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#666666] mt-1 leading-normal">
                      Share your genuine learning experience with Veyro's audited courses, proctored quizzes, and accredited certificates.
                    </p>
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-3.5">
                    {/* Rating Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              size={20}
                              className={`${
                                (hoverRating || rating) >= star
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-zinc-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-[#77736D] ml-2 font-medium">
                          {rating} out of 5 stars
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Full Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                        className="w-full bg-[#FAF9F6] border border-[#E7E2DA] focus:border-[#171717] focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-[#999] text-[#171717]"
                      />
                    </div>

                    {/* Role / Track */}
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Role / Learning Track
                      </label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="e.g. Student — Cloud Architecture or DevOps Fellow"
                        className="w-full bg-[#FAF9F6] border border-[#E7E2DA] focus:border-[#171717] focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-[#999] text-[#171717]"
                      />
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Your Review <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={testimonialText}
                        onChange={(e) => setTestimonialText(e.target.value)}
                        placeholder="Tell us what you loved about learning on Veyro..."
                        required
                        className="w-full bg-[#FAF9F6] border border-[#E7E2DA] focus:border-[#171717] focus:bg-white rounded-lg p-3 text-sm outline-none transition-all placeholder:text-[#999] text-[#171717] resize-none"
                      />
                    </div>

                    {/* Professional Review Policy Banner */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAF8F4] border border-[#E7E2DA] text-xs text-[#666666] leading-relaxed">
                      <Info size={14} className="text-[#171717] shrink-0 mt-0.5" />
                      <span>
                        We will review your submission and add your testimonial to the verified showcase if it helps fellow learners on Veyro.
                      </span>
                    </div>

                    {/* Professional Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2DA]">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 rounded-lg border border-[#E7E2DA] hover:bg-[#FAF8F4] text-xs sm:text-sm font-medium text-[#171717] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-[#171717] hover:bg-[#2A2A2A] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow cursor-pointer"
                      >
                        {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                        <span>{isSubmitting ? "Submitting..." : "Submit Testimonial"}</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

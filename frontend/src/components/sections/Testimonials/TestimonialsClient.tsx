"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import CrossSVG from "@/components/CrossSVG";
import Image from "next/image";
import { Star, X, CheckCircle2, MessageSquarePlus, Info } from "lucide-react";
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

export default function TestimonialsClient() {
  const [list, setList] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
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
      id: `pending-${Date.now()}`,
      name: name.trim(),
      occupation: occupation.trim() || "Veyro Learner",
      testimonial: testimonialText.trim(),
      rating,
    };

    // Keep locally so user can see it previewed
    setList((prev) => [newTestimonial, ...prev]);

    // Show professional confirmation inside modal
    setIsSubmittedSuccess(true);
    toast.success("Thank you! Your testimonial has been received for review.");
  };

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

      {/* Testimonials Carousel Container */}
      <div
        ref={ref}
        className="px-1 h-[370px] sm:h-[280px] border-y border-y-gray flex justify-center relative overflow-x-clip"
      >
        {orderedTestimonials.map((testimonial, index) => {
          const isPendingPreview = testimonial.id?.startsWith("pending-");
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

              <motion.div className="card-shadow border border-gray rounded-xl bg-white h-full flex flex-col justify-between p-5 lg:p-6 font-matter text-left">
                <p className="text-[17px] sm:text-[19px] lg:text-[21px] text-[#141414] [text-indent:-6px] font-semibold leading-snug line-clamp-4">
                  &quot;{testimonial.testimonial}&quot;
                </p>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    {testimonial.profilePicture ? (
                      <Image
                        src={testimonial.profilePicture}
                        width={40}
                        height={40}
                        className="size-[38px] sm:size-[40px] rounded-lg object-cover border border-black/10"
                        alt={testimonial.name}
                      />
                    ) : (
                      <div className="size-[38px] sm:size-[40px] rounded-lg bg-[#171717] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {testimonial.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-[13px] sm:text-[14px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#111827] font-semibold">{testimonial.name}</span>
                        {isPendingPreview && (
                          <span className="text-[9.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                            UNDER REVIEW
                          </span>
                        )}
                      </div>
                      <p className="text-[#6b7280] text-xs sm:text-[12.5px] truncate max-w-[200px] sm:max-w-[260px]">
                        {testimonial.occupation}
                      </p>
                    </div>
                  </div>

                  {/* Clean Star Rating Badge */}
                  <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0 bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-black/5">
                    {[...Array(testimonial.rating || 5)].map((_, starIdx) => (
                      <Star key={starIdx} size={11} className="fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
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
                        className="px-4 sm:px-5 py-2 rounded-lg bg-[#171717] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow cursor-pointer"
                      >
                        Submit Testimonial
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

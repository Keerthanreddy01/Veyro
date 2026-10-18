import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import IntegrationModal, { EducationPlatform } from "./IntegrationModal";

// Image area URL: deployment-safe relative path in public directory
export const VEYRO_AI_HERO_IMAGE_URL = "/veyroai-image.png";

const EDUCATION_PLATFORMS: EducationPlatform[] = [
  {
    id: "moodle",
    name: "Moodle",
    badge: "Open-Source LMS",
    src: "/logos/moodle.svg",
    gradient: "linear-gradient(135deg, #f98012 0%, #d85d00 100%)",
    howItWorks:
      "Veyro AI interfaces via supported REST Web Services and LTI 1.3 Advantage plugins to ground study assistance in course syllabi, assignments, and forums.",
    studentBenefits: [
      "Course-aware explanations tailored directly to your professor's syllabus",
      "Automatic lesson recaps and targeted revision questions per module",
      "Inline code debugging tips for programming assignments hosted in Moodle",
      "Practice self-checks dynamically generated before assignment deadlines",
    ],
    requirements:
      "Requires institutional Moodle Web Services token, LTI 1.3 Advantage tool registration, and campus administrator plugin approval.",
    setupSteps: [
      { title: "Plugin Install", detail: "Admin installs the verified Veyro LTI 1.3 tool." },
      { title: "Token Exchange", detail: "Configure Web Services token with read-only scopes." },
      { title: "Course Activation", detail: "Enable companion assistance across selected categories." },
    ],
  },
  {
    id: "blackboard",
    name: "Blackboard Learn",
    badge: "Enterprise LMS",
    src: "/logos/blackboard.svg",
    gradient: "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
    howItWorks:
      "Veyro AI integrates with Blackboard Ultra and Original views via REST APIs to align study guidance with lecture transcripts, milestones, and grading rubrics.",
    studentBenefits: [
      "Targeted breakdowns of complex syllabus modules in Blackboard Ultra",
      "Proactive hints on homework tasks prior to final submission",
      "Continuous study schedule synchronization with course calendar deadlines",
      "Rubric-aligned self-checks to verify deliverables before grading",
    ],
    requirements:
      "Requires institution authorization in the Blackboard Developer Portal and institutional LTI 1.3 tool deployment.",
    setupSteps: [
      { title: "Developer Key", detail: "Register Veyro Application ID in Developer Portal." },
      { title: "LTI Deployment", detail: "Deploy LTI 1.3 tool to institution's Ultra environment." },
      { title: "Module Mapping", detail: "Map course milestone alerts and study companion links." },
    ],
  },
  {
    id: "brightspace",
    name: "D2L Brightspace",
    badge: "Competency LMS",
    src: "/logos/brightspace.svg",
    gradient: "linear-gradient(135deg, #ff733b 0%, #d64100 100%)",
    howItWorks:
      "Veyro AI connects via Brightspace Valence REST APIs to map learning interactions directly against instructor competency structures and learning objectives.",
    studentBenefits: [
      "Competency-targeted coaching aligned to specific learning objectives",
      "Step-by-step guidance on complex engineering labs and assignments",
      "Automated self-assessment checkpoints prior to graded module quizzes",
      "Curriculum-matched summaries from instructor lecture slides and rubrics",
    ],
    requirements:
      "Requires Brightspace Valence API key, institutional OAuth 2.0 app authorization, and faculty permission grants.",
    setupSteps: [
      { title: "Valence Auth", detail: "Admin generates Valence API credentials and scopes." },
      { title: "Competency Sync", detail: "Sync learning objective trees with Veyro AI modules." },
      { title: "Class Launch", detail: "Activate student self-assessment widgets inside Brightspace." },
    ],
  },
  {
    id: "google-classroom",
    name: "Google Classroom",
    badge: "Google Workspace",
    src: "/logos/google-classroom.svg",
    gradient: "linear-gradient(135deg, #0f9d58 0%, #0b8043 100%)",
    howItWorks:
      "Veyro AI links via Google Workspace for Education REST APIs to index authorized coursework, assignments, and shared Docs as contextual reference materials.",
    studentBenefits: [
      "Ask questions grounded in class syllabus, slides, and shared reading PDFs",
      "Instant explanations and concept breakdowns for stream assignments",
      "Automated revision quizzes generated from classroom announcements",
      "Direct single sign-on (SSO) with your existing Google student account",
    ],
    requirements:
      "Requires Google Workspace for Education domain administrator consent, OAuth 2.0 Classroom scopes, and authorized class rosters.",
    setupSteps: [
      { title: "Domain Consent", detail: "Workspace admin approves Veyro AI API scopes." },
      { title: "Roster Sync", detail: "Select active courses and set privacy boundaries." },
      { title: "Student Access", detail: "Students launch study threads directly from Classroom." },
    ],
  },
  {
    id: "canvas",
    name: "Canvas LMS",
    badge: "Global Standard LMS",
    src: "/logos/canvas.svg",
    gradient: "linear-gradient(135deg, #e13028 0%, #b81e17 100%)",
    howItWorks:
      "Veyro AI embeds into Instructure Canvas using Canvas Developer Keys and LTI 1.3 Advantage to act as an in-context study assistant within modules and assignments.",
    studentBenefits: [
      "Context-aware AI companion embedded inside Canvas course modules",
      "Interactive step-by-step breakdowns of coding and technical problem sets",
      "Pre-submission self-auditing to review work before Canvas SpeedGrader",
      "Personalized revision roadmaps synchronized with Canvas calendar",
    ],
    requirements:
      "Requires Canvas Developer Key issued by your institution's Canvas administrator and LTI 1.3 configuration.",
    setupSteps: [
      { title: "Developer Key", detail: "Canvas admin issues an LTI 1.3 Developer Key." },
      { title: "Tool Placement", detail: "Add Veyro AI to course navigation and module views." },
      { title: "Live Sync", detail: "Verify single sign-on and module assignment sync." },
    ],
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    badge: "Education App",
    src: "/logos/microsoft-teams.svg",
    gradient: "linear-gradient(135deg, #5059c9 0%, #3b429f 100%)",
    howItWorks:
      "Veyro AI deploys into Microsoft Teams for Education via Teams App SDK and Azure Bot Service for instant interactive assistance in class channels and study chats.",
    studentBenefits: [
      "Direct 1-on-1 and group chat interactions with Veyro AI in class channels",
      "Collaborative study group assistance during technical problem solving",
      "Instant summaries of class meeting recordings, transcripts, and decks",
      "Interactive coding tips and terminal debugging commands inside chat",
    ],
    requirements:
      "Requires Microsoft 365 tenant administrator consent, Teams app manifest deployment, and Azure Bot Service permissions.",
    setupSteps: [
      { title: "Tenant Consent", detail: "M365 administrator approves Teams app permissions." },
      { title: "App Deployment", detail: "Publish Veyro AI bot to Education app catalog." },
      { title: "Channel Setup", detail: "Add @VeyroAI to cohort channels for instant tutoring." },
    ],
  },
];

export default function EpochHero() {
  const [selectedPlatform, setSelectedPlatform] = useState<EducationPlatform | null>(null);

  return (
    <section className="w-full py-10 px-4 sm:px-6 lg:px-8">
      {/* Main Hero Container */}
      <div className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden min-h-[580px] lg:h-[600px] flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full z-10 flex-1 my-auto">
          {/* Left Column: Heading, description, and button */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <h1
              className="text-[40px] md:text-[54px] font-medium tracking-tight text-[#0a1b33] leading-[1.08]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Meet Veyro AI,
              <br />
              Your AI Learning Companion.
            </h1>
            <p
              className="mt-4 max-w-xl text-[14px] md:text-[15px] text-[#64748b] leading-relaxed"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Your personal AI learning companion, helping you understand lessons,
              explore concepts, and learn with confidence — all within your learning
              journey.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 px-7 py-3 rounded-full bg-[#0a152d] text-white text-[14px] font-medium shadow-md hover:bg-[#060e20] transition-colors cursor-pointer"
            >
              Explore Veyro AI
            </motion.button>
          </motion.div>

          {/* Right Column: Veyro AI Provided Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex items-center justify-center lg:justify-end w-full"
          >
            <div className="w-full max-w-[560px] aspect-[16/9] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)] border border-slate-200/80 bg-slate-900 group">
              <img
                src={VEYRO_AI_HERO_IMAGE_URL}
                alt="Veyro AI - Your AI Learning Companion"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Seamless Marquee Logo Scroller Component (Education & LMS Platforms) */}
      <div className="mt-10 max-w-[1400px] mx-auto w-full marquee-scroller overflow-hidden marquee-mask">
        <div className="animate-marquee-infinite py-3 flex gap-4">
          {/* First loop */}
          {EDUCATION_PLATFORMS.map((platform, index) => (
            <button
              key={`platform-1-${index}`}
              type="button"
              onClick={() => setSelectedPlatform(platform)}
              aria-label={`View Veyro AI integration details for ${platform.name}`}
              className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all overflow-hidden cursor-pointer"
            >
              {/* Scaled gradient hover background */}
              <div
                className="absolute inset-0 transition-all duration-300 scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 rounded-full pointer-events-none"
                style={{ background: platform.gradient }}
              />
              <img
                src={platform.src}
                alt={platform.name}
                loading="lazy"
                className="relative z-10 w-auto h-7 max-w-[80px] object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
              />
            </button>
          ))}

          {/* Second loop for seamless wrap */}
          {EDUCATION_PLATFORMS.map((platform, index) => (
            <button
              key={`platform-2-${index}`}
              type="button"
              onClick={() => setSelectedPlatform(platform)}
              aria-label={`View Veyro AI integration details for ${platform.name}`}
              className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all overflow-hidden cursor-pointer"
            >
              {/* Scaled gradient hover background */}
              <div
                className="absolute inset-0 transition-all duration-300 scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 rounded-full pointer-events-none"
                style={{ background: platform.gradient }}
              />
              <img
                src={platform.src}
                alt={platform.name}
                loading="lazy"
                className="relative z-10 w-auto h-7 max-w-[80px] object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Integration Details Modal */}
      <IntegrationModal
        platform={selectedPlatform}
        onClose={() => setSelectedPlatform(null)}
      />
    </section>
  );
}

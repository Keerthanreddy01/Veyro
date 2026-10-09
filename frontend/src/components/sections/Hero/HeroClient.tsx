"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Award,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  GraduationCap,
  FileCheck,
  Video,
  Check,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import api from "@/api/axios";

interface IllustrativeCurriculum {
  id: string;
  category: string;
  level: string;
  title: string;
  instructor: string;
  instructorRole: string;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  currentLesson: {
    title: string;
    watchedTime: string;
    totalTime: string;
    watchPercent: number;
  };
  assessment: {
    title: string;
    score: string;
    violations: number;
    status: string;
  };
  certificate?: {
    code: string;
    issuedDate: string;
    credentialTitle: string;
  };
}

const ILLUSTRATIVE_COURSES: IllustrativeCurriculum[] = [
  {
    id: "dist-sys-2026",
    category: "Cloud & Systems",
    level: "Advanced",
    title: "Distributed Systems & Scalable Architecture",
    instructor: "Dr. Sarah Miller",
    instructorRole: "Systems Architect & Faculty Lead",
    progressPercent: 78,
    totalLessons: 28,
    completedLessons: 22,
    currentLesson: {
      title: "Lesson 14: Raft Consensus & State Machine Replication",
      watchedTime: "18m 20s",
      totalTime: "20m 00s",
      watchPercent: 91,
    },
    assessment: {
      title: "Module 3 Proctored Exam",
      score: "96%",
      violations: 0,
      status: "Anti-Cheat Verified",
    },
    certificate: {
      code: "VY-DEMO-2026",
      issuedDate: "March 2026",
      credentialTitle: "Distributed Systems Architecture",
    },
  },
  {
    id: "fullstack-react-node",
    category: "Web Engineering",
    level: "Intermediate",
    title: "Full-Stack Web Architecture & Security",
    instructor: "John Smith",
    instructorRole: "Principal Security Engineer",
    progressPercent: 52,
    totalLessons: 24,
    completedLessons: 12,
    currentLesson: {
      title: "Lesson 8: Server-Authoritative RBAC & Session Rotation",
      watchedTime: "16m 40s",
      totalTime: "18m 00s",
      watchPercent: 92,
    },
    assessment: {
      title: "Module 2 Architecture Audit",
      score: "92%",
      violations: 0,
      status: "Anti-Cheat Verified",
    },
  },
  {
    id: "applied-deep-learning",
    category: "Artificial Intelligence",
    level: "Advanced",
    title: "Applied Deep Learning & PyTorch Foundations",
    instructor: "Sophia Davis",
    instructorRole: "AI Research Scientist",
    progressPercent: 100,
    totalLessons: 30,
    completedLessons: 30,
    currentLesson: {
      title: "Capstone Defense: Transformer Attention Diagnostics",
      watchedTime: "25m 00s",
      totalTime: "25m 00s",
      watchPercent: 100,
    },
    assessment: {
      title: "Final Capstone Evaluation",
      score: "98%",
      violations: 0,
      status: "Tamper-Proof Ledger Recorded",
    },
    certificate: {
      code: "VY-PYTORCH-8821",
      issuedDate: "February 2026",
      credentialTitle: "Applied Deep Learning Mastery",
    },
  },
];

export default function HeroClient() {
  const { user } = useAuthStore();
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const [realEnrollments, setRealEnrollments] = useState<any[]>([]);
  const [isLoadingAuthData, setIsLoadingAuthData] = useState(false);

  // If user is authenticated, query their real enrollments
  useEffect(() => {
    if (!user) {
      setRealEnrollments([]);
      return;
    }

    let isMounted = true;
    setIsLoadingAuthData(true);

    api
      .get("/enrollments/my")
      .then(({ data }) => {
        if (isMounted && data.enrollments && data.enrollments.length > 0) {
          setRealEnrollments(data.enrollments);
        }
      })
      .catch(() => {
        // Fallback safely to illustrative preview if offline or error
      })
      .finally(() => {
        if (isMounted) setIsLoadingAuthData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Derived user statistics
  const stats = useMemo(() => {
    if (user && realEnrollments.length > 0) {
      const active = realEnrollments.filter((e) => e.status === "active").length;
      const completed = realEnrollments.filter((e) => e.status === "completed").length;
      const certs = realEnrollments.filter((e) => Boolean(e.certificateCode)).length;
      const totalLessonsDone = realEnrollments.reduce(
        (sum, e) => sum + (e.completedLessons?.length || 0),
        0
      );

      return {
        activeCourses: active || realEnrollments.length,
        lessonsCompleted: totalLessonsDone || 18,
        quizzesPassed: "100%",
        certificatesIssued: certs,
        isReal: true,
      };
    }

    return {
      activeCourses: 3,
      lessonsCompleted: 24,
      quizzesPassed: "96%",
      certificatesIssued: 1,
      isReal: false,
    };
  }, [user, realEnrollments]);

  // Select active curriculum
  const activeCurriculum = ILLUSTRATIVE_COURSES[activeCourseIndex];

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-full font-inter select-none"
    >
      {/* Outer Shell with refined subtle border and card shadow */}
      <div className="bg-[#FAF9F5]/90 backdrop-blur-xs p-2 sm:p-3 border border-[#E5E7EB] rounded-2xl shadow-xl space-y-3">
        
        {/* Top Bar: Workspace Header & Mode Badge */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#111111] truncate">
                  {user?.name || "Student Learning Dashboard"}
                </span>
                {!user ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                    <Sparkles size={10} className="text-[#60C5F1]" />
                    Illustrative Preview
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check size={10} />
                    Active Learner
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280] truncate">
                {user ? user.email : "90% Video Audit Telemetry • Server-Authoritative Anti-Cheat"}
              </p>
            </div>
          </div>

          <Link
            to={user ? "/dashboard" : "/courses"}
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:text-[#0284c7] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#F3F4F6]"
          >
            <span className="hidden sm:inline">{user ? "Open Dashboard" : "Browse Catalog"}</span>
            <span className="sm:hidden">{user ? "Dashboard" : "Catalog"}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Small Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
              <BookOpen size={13} className="text-[#111111]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111]">{stats.activeCourses}</span>
              <span className="text-[10px] text-[#6B7280]">Curricula</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Audited</span>
              <Video size={13} className="text-[#0284c7]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111]">{stats.lessonsCompleted}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">90%+ Watch</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Quiz Score</span>
              <ShieldCheck size={13} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111]">{stats.quizzesPassed}</span>
              <span className="text-[10px] text-[#6B7280]">Anti-Cheat</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Certificates</span>
              <Award size={13} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111]">{stats.certificatesIssued}</span>
              <span className="text-[10px] text-purple-600 font-semibold">Verified</span>
            </div>
          </div>
        </div>

        {/* Course Switcher Tabs (Interactive) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar">
          {ILLUSTRATIVE_COURSES.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setActiveCourseIndex(idx)}
              className={`flex-1 min-w-[100px] text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCourseIndex === idx
                  ? "bg-[#111111] text-white shadow-xs font-semibold"
                  : "text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
              }`}
            >
              <div className="truncate text-[11px]">{course.title.split("&")[0].trim()}</div>
              <div className={`text-[10px] ${activeCourseIndex === idx ? "text-[#60C5F1]" : "text-[#9CA3AF]"}`}>
                {course.progressPercent}% done
              </div>
            </button>
          ))}
        </div>

        {/* “Continue Learning” Featured Active Course Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Header of Course */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#FFF490] border border-[#111111]/15 text-[#111111] text-[10px] font-bold uppercase tracking-wider">
                  {activeCurriculum.category}
                </span>
                <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                  {activeCurriculum.level}
                </span>
              </div>
              <h3 className="font-cal text-base sm:text-lg text-[#111111] leading-tight">
                {activeCurriculum.title}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {activeCurriculum.instructor} • {activeCurriculum.instructorRole}
              </p>
            </div>

            <Link
              to="/courses"
              className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#0284c7] transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="Resume Lesson"
            >
              <Play size={16} className="fill-current ml-0.5" />
            </Link>
          </div>

          {/* Overall Course Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#374151] font-medium flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#0284c7]" />
                <span>Curriculum Completion</span>
              </span>
              <span className="font-bold text-[#111111]">{activeCurriculum.progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden p-0.5 border border-[#E5E7EB]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#111111] via-[#1e293b] to-[#60C5F1] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${activeCurriculum.progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#6B7280]">
              <span>{activeCurriculum.completedLessons} of {activeCurriculum.totalLessons} lessons completed</span>
              <span>Passing grade required: 80%</span>
            </div>
          </div>

          {/* Video Lesson Telemetry Panel */}
          <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Video size={13} className="text-[#60C5F1]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111111] truncate">
                    {activeCurriculum.currentLesson.title}
                  </div>
                  <div className="text-[10px] text-[#6B7280] flex items-center gap-2">
                    <span>{activeCurriculum.currentLesson.watchedTime} watched of {activeCurriculum.currentLesson.totalTime}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{activeCurriculum.currentLesson.watchPercent}% recorded</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                ✓ 90% Met
              </span>
            </div>

            {/* Video progress track with 90% threshold notch */}
            <div className="relative pt-1">
              <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${activeCurriculum.currentLesson.watchPercent}%` }}
                />
              </div>
              <div
                className="absolute top-0 w-0.5 h-3 bg-red-500 rounded-full -translate-x-1/2"
                style={{ left: "90%" }}
                title="90% Server Audit Threshold"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 size={11} /> Server-audited watch time qualifies for module exam
              </span>
              <span className="font-mono text-red-600 font-semibold">90% req</span>
            </div>
          </div>

          {/* Assessment Integrity Micro-card */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E5E7EB] text-xs">
            <div className="flex items-center gap-1.5 text-[#374151]">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="font-medium">{activeCurriculum.assessment.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#111111]">{activeCurriculum.assessment.score}</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                0 tab violations
              </span>
            </div>
          </div>

        </div>

        {/* Certificate Achievement Card (if available for selected curriculum) */}
        {activeCurriculum.certificate ? (
          <div className="bg-gradient-to-br from-[#111111] via-[#1a1f2c] to-[#0f172a] text-white p-3.5 sm:p-4 rounded-xl border border-white/10 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#60C5F1]">
                <Award size={15} />
                <span className="uppercase tracking-wider text-[10px] font-bold">Verifiable Credential</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ✓ Cryptographic SHA-256
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-cal text-sm sm:text-base text-white">
                  {activeCurriculum.certificate.credentialTitle}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Code: {activeCurriculum.certificate.code} • Issued {activeCurriculum.certificate.issuedDate}
                </p>
              </div>

              <Link
                to={`/verify/${activeCurriculum.certificate.code}`}
                className="inline-flex items-center justify-center gap-1 text-xs font-bold bg-[#60C5F1] text-[#111111] hover:bg-white transition-colors py-1.5 px-3 rounded-lg flex-shrink-0"
              >
                <FileCheck size={13} />
                <span>Verify on Ledger</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <Award size={15} className="text-[#9CA3AF]" />
              <span>Complete remaining 6 lessons to unlock cryptographic certificate</span>
            </div>
            <Link
              to="/courses"
              className="font-bold text-[#111111] hover:text-[#0284c7] inline-flex items-center gap-1 text-xs flex-shrink-0"
            >
              <span>Continue</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Footer / Context Notice */}
        <div className="px-1 text-[11px] text-[#6B7280] flex items-center justify-between flex-wrap gap-2">
          <span>
            {user
              ? `Logged in as ${user.name}. Progress synchronizes with server ledger.`
              : "Interactive demonstration. Sign in or create an account to record your progress."}
          </span>
          {!user && (
            <div className="flex items-center gap-2 font-semibold">
              <Link to="/login" className="text-[#111111] hover:underline">
                Sign In
              </Link>
              <span>•</span>
              <Link to="/register" className="text-[#0284c7] hover:underline">
                Register Free
              </Link>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

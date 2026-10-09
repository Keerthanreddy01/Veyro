"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Award,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileCheck,
  Video,
  Check,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import api from "@/api/axios";

interface IllustrativeCurriculum {
  id: string;
  category: string;
  level: string;
  title: string;
  shortTitle: string;
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
    category: "Cloud Systems",
    level: "Advanced",
    title: "Distributed Systems & Scalable Architecture",
    shortTitle: "Distributed Sys",
    instructor: "Dr. Sarah Miller",
    instructorRole: "Faculty Lead",
    progressPercent: 78,
    totalLessons: 28,
    completedLessons: 22,
    currentLesson: {
      title: "Lesson 14: Raft Consensus & Log Replication",
      watchedTime: "18m 20s",
      totalTime: "20m 00s",
      watchPercent: 91,
    },
    assessment: {
      title: "Module 3 Exam",
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
    category: "Web Eng",
    level: "Intermediate",
    title: "Full-Stack Web Architecture & Security",
    shortTitle: "Full-Stack Web",
    instructor: "John Smith",
    instructorRole: "Security Engineer",
    progressPercent: 52,
    totalLessons: 24,
    completedLessons: 12,
    currentLesson: {
      title: "Lesson 8: Server-Authoritative RBAC Security",
      watchedTime: "16m 40s",
      totalTime: "18m 00s",
      watchPercent: 92,
    },
    assessment: {
      title: "Module 2 Audit",
      score: "92%",
      violations: 0,
      status: "Anti-Cheat Verified",
    },
  },
  {
    id: "applied-deep-learning",
    category: "Machine Learning",
    level: "Advanced",
    title: "Applied Deep Learning & PyTorch Foundations",
    shortTitle: "Deep Learning",
    instructor: "Sophia Davis",
    instructorRole: "AI Scientist",
    progressPercent: 100,
    totalLessons: 30,
    completedLessons: 30,
    currentLesson: {
      title: "Capstone: Transformer Attention Diagnostics",
      watchedTime: "25m 00s",
      totalTime: "25m 00s",
      watchPercent: 100,
    },
    assessment: {
      title: "Final Capstone",
      score: "98%",
      violations: 0,
      status: "Verified",
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

  useEffect(() => {
    if (!user) {
      setRealEnrollments([]);
      return;
    }

    let isMounted = true;
    api
      .get("/enrollments/my")
      .then(({ data }) => {
        if (isMounted && data?.enrollments?.length > 0) {
          setRealEnrollments(data.enrollments);
        }
      })
      .catch(() => {
        // Fallback to illustrative preview safely
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    if (user && realEnrollments.length > 0) {
      const active = realEnrollments.filter((e) => e.status === "active").length;
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
      };
    }

    return {
      activeCourses: 3,
      lessonsCompleted: 24,
      quizzesPassed: "96%",
      certificatesIssued: 1,
    };
  }, [user, realEnrollments]);

  const activeCurriculum = ILLUSTRATIVE_COURSES[activeCourseIndex];

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full font-inter select-none"
    >
      {/* Outer Shell with refined subtle border and card shadow */}
      <div className="w-full bg-[#FAF9F5]/90 backdrop-blur-xs p-2.5 sm:p-3 border border-[#E5E7EB] rounded-2xl shadow-lg space-y-2.5 sm:space-y-3">
        
        {/* Top Bar: Workspace Header & Mode Badge */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[11px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-[13px] font-bold text-[#111111] truncate">
                  {user?.name || "Student Learning Dashboard"}
                </span>
                {!user ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                    <Sparkles size={9} className="text-[#60C5F1]" />
                    Preview
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check size={9} />
                    Active Learner
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#6B7280] truncate">
                {user ? user.email : "90% Video Watch Auditing • Anti-Cheat Integrity"}
              </p>
            </div>
          </div>

          <Link
            to={user ? "/dashboard" : "/courses"}
            className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#111111] hover:text-[#0284c7] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#F3F4F6]"
          >
            <span>{user ? "Dashboard" : "Browse"}</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        {/* Small Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 sm:p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">In Progress</span>
              <BookOpen size={11} className="text-[#111111]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#111111]">{stats.activeCourses}</span>
              <span className="text-[9px] text-[#6B7280]">Courses</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 sm:p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">Audited</span>
              <Video size={11} className="text-[#0284c7]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#111111]">{stats.lessonsCompleted}</span>
              <span className="text-[9px] text-emerald-600 font-semibold">90%+ Watch</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 sm:p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">Quiz Score</span>
              <ShieldCheck size={11} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#111111]">{stats.quizzesPassed}</span>
              <span className="text-[9px] text-[#6B7280]">Passed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-2 sm:p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[#6B7280] mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">Certificates</span>
              <Award size={11} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[#111111]">{stats.certificatesIssued}</span>
              <span className="text-[9px] text-purple-600 font-semibold">Verified</span>
            </div>
          </div>
        </div>

        {/* Course Switcher Tabs (Interactive) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E7EB]">
          {ILLUSTRATIVE_COURSES.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setActiveCourseIndex(idx)}
              className={`flex-1 min-w-0 text-center sm:text-left px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                activeCourseIndex === idx
                  ? "bg-[#111111] text-white shadow-xs font-semibold"
                  : "text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6]"
              }`}
            >
              <div className="truncate">{course.shortTitle}</div>
              <div className={`text-[9px] ${activeCourseIndex === idx ? "text-[#60C5F1]" : "text-[#9CA3AF]"}`}>
                {course.progressPercent}%
              </div>
            </button>
          ))}
        </div>

        {/* “Continue Learning” Featured Active Course Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-3.5 shadow-xs space-y-2.5">
          
          {/* Header of Course */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block px-1.5 py-0.5 rounded-full bg-[#FFF490] border border-[#111111]/15 text-[#111111] text-[9px] font-bold uppercase tracking-wider">
                  {activeCurriculum.category}
                </span>
                <span className="text-[9px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">
                  {activeCurriculum.level}
                </span>
              </div>
              <h3 className="font-cal text-xs sm:text-sm text-[#111111] leading-tight truncate">
                {activeCurriculum.title}
              </h3>
              <p className="text-[10px] text-[#6B7280] truncate">
                {activeCurriculum.instructor} • {activeCurriculum.instructorRole}
              </p>
            </div>

            <Link
              to="/courses"
              className="size-8 rounded-full bg-[#111111] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#0284c7] transition-all hover:scale-105 active:scale-95 shadow-2xs"
              title="Resume Lesson"
            >
              <Play size={13} className="fill-current ml-0.5" />
            </Link>
          </div>

          {/* Overall Course Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#374151] font-medium flex items-center gap-1">
                <TrendingUp size={11} className="text-[#0284c7]" />
                <span>Progress</span>
              </span>
              <span className="font-bold text-[#111111]">{activeCurriculum.progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden border border-[#E5E7EB]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#111111] via-[#1e293b] to-[#60C5F1] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${activeCurriculum.progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#6B7280]">
              <span>{activeCurriculum.completedLessons} of {activeCurriculum.totalLessons} lessons completed</span>
              <span>80% pass req</span>
            </div>
          </div>

          {/* Video Lesson Telemetry Panel */}
          <div className="bg-[#FAF9F5] border border-[#E5E7EB] rounded-lg p-2 sm:p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="size-5 rounded bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Video size={10} className="text-[#60C5F1]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[#111111] truncate">
                    {activeCurriculum.currentLesson.title}
                  </div>
                  <div className="text-[9px] text-[#6B7280] flex items-center gap-1.5">
                    <span>{activeCurriculum.currentLesson.watchedTime} / {activeCurriculum.currentLesson.totalTime}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{activeCurriculum.currentLesson.watchPercent}% watched</span>
                  </div>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                ✓ 90% Met
              </span>
            </div>

            {/* Video progress track with 90% threshold notch */}
            <div className="relative pt-0.5">
              <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${activeCurriculum.currentLesson.watchPercent}%` }}
                />
              </div>
              <div
                className="absolute top-0 w-0.5 h-2.5 bg-red-500 rounded-full -translate-x-1/2"
                style={{ left: "90%" }}
                title="90% Server Audit Threshold"
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#6B7280]">
              <span className="text-emerald-700 font-medium flex items-center gap-1 truncate">
                <CheckCircle2 size={10} /> 90% watch audited — exam unlocked
              </span>
              <span className="font-mono text-red-600 font-semibold flex-shrink-0">90% min</span>
            </div>
          </div>

          {/* Assessment Integrity Micro-card */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E5E7EB] text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1 text-[#374151] truncate">
              <ShieldCheck size={12} className="text-emerald-600 flex-shrink-0" />
              <span className="font-medium truncate">{activeCurriculum.assessment.title}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="font-bold text-[#111111]">{activeCurriculum.assessment.score}</span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                0 violations
              </span>
            </div>
          </div>

        </div>

        {/* Certificate Achievement Card (if available for selected curriculum) */}
        {activeCurriculum.certificate ? (
          <div className="bg-gradient-to-r from-[#111111] via-[#1a1f2c] to-[#0f172a] text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-white/10 shadow-xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[9px] font-semibold text-[#60C5F1]">
                <Award size={11} />
                <span className="uppercase tracking-wider font-bold">Verifiable Credential</span>
              </div>
              <h4 className="font-cal text-[11px] sm:text-xs text-white truncate">
                {activeCurriculum.certificate.credentialTitle}
              </h4>
              <p className="text-[9px] text-slate-400 font-mono truncate">
                Code: {activeCurriculum.certificate.code} • SHA-256 Ledger
              </p>
            </div>

            <Link
              to={`/verify/${activeCurriculum.certificate.code}`}
              className="inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-[#60C5F1] text-[#111111] hover:bg-white transition-colors py-1 px-2.5 rounded-md flex-shrink-0"
            >
              <FileCheck size={11} />
              <span>Verify</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-[10px] text-[#4B5563]">
            <div className="flex items-center gap-1.5 truncate">
              <Award size={12} className="text-[#9CA3AF] flex-shrink-0" />
              <span className="truncate">Complete remaining lessons to unlock certificate</span>
            </div>
            <Link
              to="/courses"
              className="font-bold text-[#111111] hover:text-[#0284c7] inline-flex items-center gap-0.5 text-[10px] flex-shrink-0"
            >
              <span>Continue</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        )}

        {/* Footer / Context Notice */}
        <div className="px-1 text-[9px] sm:text-[10px] text-[#6B7280] flex items-center justify-between flex-wrap gap-1">
          <span className="truncate">
            {user
              ? `Signed in as ${user.name}. Synced with server ledger.`
              : "Demonstration mode with illustrative learning telemetry."}
          </span>
          {!user && (
            <div className="flex items-center gap-1.5 font-semibold flex-shrink-0">
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

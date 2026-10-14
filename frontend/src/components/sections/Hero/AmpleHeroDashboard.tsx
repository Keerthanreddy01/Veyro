import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Layers,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Video,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  avatar: string;
  course: string;
  milestone: string;
  status: string;
  statusColor: string;
  tag: string;
  watchPercent: number;
  integrityScore: number;
}

const STUDENTS: StudentItem[] = [
  {
    id: "marcus",
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    course: "Distributed Systems & Scalable Architecture",
    milestone: "Lesson 14: Raft Consensus & Log Replication",
    status: "94% Watched • Exam Ready",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tag: "Cloud Systems",
    watchPercent: 94,
    integrityScore: 100,
  },
  {
    id: "elena",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    course: "Full-Stack Distributed Systems",
    milestone: "Module 4 Exam: Zero-Knowledge Proofs",
    status: "Passed Exam (98%)",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    tag: "Full-Stack",
    watchPercent: 91,
    integrityScore: 99,
  },
  {
    id: "alex",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    course: "Machine Learning Infrastructure",
    milestone: "Lesson 8: Distributed GPU Cluster Sharding",
    status: "Just submitted code review",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    tag: "AI Systems",
    watchPercent: 88,
    integrityScore: 98,
  },
  {
    id: "priya",
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    course: "Cybersecurity & Cryptography Labs",
    milestone: "Completed 28/28 Lessons",
    status: "Certificate Issued",
    statusColor: "bg-purple-50 text-purple-700 border-purple-200",
    tag: "Security",
    watchPercent: 100,
    integrityScore: 100,
  },
];

export default function AmpleHeroDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<StudentItem>(STUDENTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full bg-[#FFFFFF] rounded-2xl border border-black/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden text-left font-sans select-none">
      {/* Top Application Header */}
      <div className="h-11 bg-[#FAFAFC] border-b border-black/5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10" />
          <span className="ml-3 text-[12px] font-medium text-[#555] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Veyro Learning OS • Live Stream
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#777]">
          <div className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-black/5 text-[#888]">
            <Search size={12} />
            <span className="text-[11px]">Search curriculum, students, telemetry... ⌘K</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-[#111]">99.98% Uptime</span>
        </div>
      </div>

      {/* Main App Body */}
      <div className="flex flex-col md:flex-row min-h-[460px]">
        {/* Left Slim Vertical Icon Rail */}
        <div className="hidden sm:flex flex-col items-center justify-between w-12 bg-[#F8F9FA] border-r border-black/5 py-4 flex-shrink-0 text-[#6B7280]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-7 h-7 rounded-lg bg-[#111] text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <button className="p-1.5 rounded-md hover:bg-black/5 text-[#111] transition-colors">
              <Layers size={16} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-black/5 text-[#888] transition-colors">
              <BookOpen size={16} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-black/5 text-[#888] transition-colors">
              <Users size={16} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-black/5 text-[#888] transition-colors">
              <Code2 size={16} />
            </button>
          </div>
          <button className="p-1.5 rounded-md hover:bg-black/5 text-[#888] transition-colors">
            <Settings size={16} />
          </button>
        </div>

        {/* Middle Pane: Student Roster Feed */}
        <div className="w-full md:w-[48%] border-r border-black/5 p-4 sm:p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
              <div>
                <h4 className="font-semibold text-sm text-[#111]">Active Cohort Feed</h4>
                <p className="text-[11px] text-[#777]">Live telemetry & video audit stream</p>
              </div>
              <span className="text-[11px] font-semibold bg-[#F0EFEB] text-[#555] px-2 py-0.5 rounded-full">
                4 online
              </span>
            </div>

            <div className="space-y-2">
              {STUDENTS.map((s) => {
                const isSelected = selectedStudent.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#FAF9F5] border-[#D6CFC4] shadow-xs"
                        : "bg-white border-black/5 hover:border-black/15 hover:bg-[#FDFDFD]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover border border-black/10"
                        />
                        <div>
                          <div className="font-semibold text-xs text-[#111] leading-tight">
                            {s.name}
                          </div>
                          <div className="text-[10.5px] text-[#777] truncate max-w-[170px] sm:max-w-[200px]">
                            {s.course}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${s.statusColor}`}>
                        {s.tag}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#555] bg-white/70 px-2 py-1 rounded-md border border-black/5">
                      <span className="truncate pr-2 font-medium">{s.milestone}</span>
                      <span className="font-semibold text-[#111] flex-shrink-0">
                        {s.watchPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#888]">
            <span>Showing verified learner cohort</span>
            <span className="text-[#111] font-semibold flex items-center gap-0.5 cursor-pointer hover:underline">
              View all 28 students <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Right Pane: Selected Learner Detail Card */}
        <div className="w-full md:w-[52%] p-4 sm:p-5 flex flex-col justify-between bg-[#FCFCFD]">
          <div>
            {/* Inspector Header */}
            <div className="flex items-start justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-10 h-10 rounded-full object-cover border border-black/10 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm text-[#111]">{selectedStudent.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#666]">
                    Cloud Infrastructure Fellow • 90% Watch Enforced
                  </p>
                </div>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-[#111] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs">
                Certify
              </button>
            </div>

            {/* Curriculum Card Details */}
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-black/5 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <h4 className="font-semibold text-xs text-[#111]">{selectedStudent.course}</h4>
              </div>
              <p className="text-xs text-[#666] leading-relaxed">
                Advanced hands-on engineering track with real-time video watch position auditing,
                proctored quiz submissions, and cryptographic SHA-256 completion certificate.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold bg-[#F4F4F6] text-[#444] px-2 py-0.5 rounded">
                  Distributed Systems
                </span>
                <span className="text-[10px] font-semibold bg-[#F4F4F6] text-[#444] px-2 py-0.5 rounded">
                  90% Watch Threshold Met
                </span>
                <span className="text-[10px] font-semibold bg-[#F4F4F6] text-[#444] px-2 py-0.5 rounded">
                  Anti-Cheat Proctored
                </span>
              </div>
            </div>

            {/* Reasons to Engage / Verified Telemetry */}
            <div className="mt-4">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">
                Audited Telemetry & Evidence
              </h5>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-black/5 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111]">94% Continuous Watch Confirmed</span>
                    <p className="text-[11px] text-[#666] mt-0.5">
                      Learner completed 18m 20s of 20m 00s without skipping or scrub violations.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-black/5 flex items-start gap-2.5 text-xs">
                  <ShieldCheck size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111]">Proctoring Integrity: 100%</span>
                    <p className="text-[11px] text-[#666] mt-0.5">
                      Zero tab loss triggers, Fisher-Yates question permutations verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Summary */}
          <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#666]">
            <span className="font-mono text-[11px]">HASH: e3b0c44298fc1c14...</span>
            <span className="font-medium text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Accredited Ready
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Video Preview Bar (Subtle & Clean, not blocking the text!) */}
      <div className="bg-[#111111] text-white px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <Play size={11} className="fill-black pl-0.5" />
          </div>
          <span className="font-medium text-[12px]">Watch 2-minute product interactive walkthrough</span>
        </div>
        <span className="text-[#888] text-[11px] hidden sm:inline font-mono">02:14 HD</span>
      </div>
    </div>
  );
}

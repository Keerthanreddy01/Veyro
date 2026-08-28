import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, TrendingUp, Clock, CheckCircle, PlusCircle, Star,
  ArrowRight, Search, Play, Bell, Plus, Minus, Check, MoreHorizontal,
  GraduationCap, ShieldCheck, Sparkles, LogOut, FileText, Video, Award,
  Lock, Calendar, Compass, Layers, UserCheck, X, Eye, CheckSquare
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Compact Pastel Stat Pill Widget ──────────────────────────────────────────
const StatPill = ({ label, value, bg, text, badge }) => (
  <div className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl ${bg} min-w-[80px] shadow-sm border border-black/5 transition-transform hover:scale-105 select-none`}>
    <div className="flex items-center gap-1">
      <span className={`text-xl font-extrabold ${text}`}>{value}</span>
      {badge && <span className="text-xs">{badge}</span>}
    </div>
    <span className="text-[11px] font-semibold text-slate-600 tracking-tight">{label}</span>
  </div>
);

// ── Student Dashboard: Interactive Connected Learning Plan ────────────────────
function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('path'); // 'path' or 'grid'

  useEffect(() => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const filtered = enrollments.filter((e) => {
    const title = e.courseId?.title?.toLowerCase() || '';
    return title.includes(searchQuery.toLowerCase());
  });

  const activeFeatured = enrollments.find((e) => e.status === 'active') || enrollments[0];

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-3 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        
        {/* Main Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT & CENTER: My Learning Plan Canvas (8 Cols) ── */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6">
            
            {/* Header: Title + Search + Stat Widgets (Reference 1) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  My Learning Plan
                </h1>
                <span className="text-2xl">🕰️</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search modules..."
                    className="bg-[#f4f7fa] text-slate-800 placeholder:text-slate-400 text-xs font-medium rounded-full pl-9 pr-4 py-2.5 border border-slate-200/80 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all w-36 sm:w-44"
                  />
                </div>

                {/* Stat Badges in pastel colors (Reference 1: 26 Total, 2 Completed, 23 Upcoming) */}
                <div className="flex items-center gap-2">
                  <StatPill label="Total" value={enrollments.length} bg="bg-[#d6ecff]" text="text-sky-900" />
                  <StatPill label="Completed" value={completedCount} bg="bg-[#d4f4dd]" text="text-emerald-900" badge="🎉" />
                  <StatPill label="Upcoming" value={activeCount} bg="bg-[#fff3c4]" text="text-amber-900" />
                </div>
              </div>
            </div>

            {/* Canvas Body: Left Dock + Connected Progression Path */}
            <div className="flex gap-4 sm:gap-6 items-start">
              
              {/* Left Micro-Dock Toolbar (Reference 1) */}
              <div className="hidden sm:flex flex-col items-center gap-3 bg-[#181d26] text-white p-2 rounded-2xl shadow-md flex-shrink-0">
                <button
                  onClick={() => setViewMode('path')}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${viewMode === 'path' ? 'bg-white/30 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Sequential Roadmap View"
                >
                  <Compass size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white/30 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Grid View"
                >
                  <Layers size={15} />
                </button>
                <div className="w-5 h-[1px] bg-white/10 my-0.5" />
                <div className="relative">
                  <button className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center hover:bg-amber-400/30 transition-colors">
                    <Bell size={14} />
                  </button>
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-[9px] font-extrabold text-slate-950 w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {enrollments.length}
                  </span>
                </div>
                <button className="w-8 h-8 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <Plus size={13} />
                </button>
                <button className="w-8 h-8 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <Minus size={13} />
                </button>
              </div>

              {/* Connected Roadmap Node Canvas */}
              <div className="flex-1 space-y-6">
                
                {/* 1. Featured Active Stream Card (Lavender Gradient in Reference 1) */}
                {activeFeatured && activeFeatured.courseId && (
                  <div className="relative bg-gradient-to-br from-[#f3e8ff] via-[#ecd6fa] to-[#e8d5f5] rounded-3xl p-6 shadow-sm border border-purple-200/80 overflow-hidden group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/70 text-purple-900 text-[10px] font-bold tracking-wide uppercase shadow-2xs">
                            Active Stream
                          </span>
                          <span className="text-xs text-purple-800 font-semibold flex items-center gap-1">
                            <Clock size={12} /> Watching 00:30
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          {activeFeatured.courseId.title}
                        </h2>
                        <p className="text-xs text-slate-700 font-medium line-clamp-2">
                          {activeFeatured.courseId.description || 'Master core subject fundamentals through video streaming and anti-cheat quizzes.'}
                        </p>
                      </div>

                      {/* Play Action Button */}
                      <Link
                        to={`/courses/${activeFeatured.courseId._id}`}
                        className="w-14 h-14 rounded-full bg-white text-purple-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0 group/play"
                        title="Resume Lesson"
                      >
                        <Play size={20} className="fill-purple-900 ml-0.5 group-hover/play:scale-110 transition-transform" />
                      </Link>
                    </div>

                    {/* Footer Info inside Active Card */}
                    <div className="mt-5 pt-3.5 border-t border-purple-300/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full shadow-2xs">
                        <GraduationCap size={13} className="text-purple-700" />
                        <span className="font-semibold text-purple-950">
                          {activeFeatured.courseId.instructorId?.name || 'Veyro Instructor'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                            A
                          </div>
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-sky-400 text-white text-[10px] font-bold flex items-center justify-center">
                            K
                          </div>
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                            V
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-purple-900">Enrolled Learners</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Sequential Progression Road Map (Dotted Path Connector) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Sequential Course Curriculum Path
                    </h3>
                    <Link to="/courses" className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 hover:underline">
                      Explore All Courses <ArrowRight size={12} />
                    </Link>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-[#f8fafc] rounded-3xl h-28 animate-pulse border border-slate-100" />
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="bg-[#f8fafc] rounded-3xl p-8 text-center border border-dashed border-slate-200">
                      <BookOpen size={36} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 font-semibold text-sm">You haven't enrolled in any courses yet.</p>
                      <Link to="/courses" className="mt-3 inline-block px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black transition-all">
                        Explore Course Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="relative pl-4 sm:pl-6 space-y-5">
                      
                      {/* Dotted Progression Line (Reference 1) */}
                      <div className="absolute left-[26px] sm:left-[34px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-emerald-400/50 z-0 pointer-events-none" />

                      {filtered.map((e, index) => {
                        const c = e.courseId;
                        if (!c) return null;
                        const isDone = e.status === 'completed';

                        return (
                          <div key={e._id} className="relative z-10 flex items-start gap-3 sm:gap-4 group">
                            
                            {/* Path Node Indicator Bubble */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs border-2 transition-transform group-hover:scale-110 ${
                              isDone
                                ? 'bg-emerald-500 text-white border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}>
                              {isDone ? <Check size={14} /> : index + 1}
                            </div>

                            {/* Node Card in Pastel Aesthetic */}
                            <div className={`flex-1 rounded-3xl p-5 shadow-xs border transition-all ${
                              isDone
                                ? 'bg-[#f0fbf4] border-emerald-200/80 hover:shadow-sm'
                                : 'bg-[#fafbff] border-slate-200/80 hover:shadow-md'
                            }`}>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                  isDone
                                    ? 'bg-[#d4f4dd] text-emerald-900'
                                    : 'bg-[#fff3c4] text-amber-900'
                                }`}>
                                  {isDone ? 'Completed 🍃' : 'Upcoming ⏱️'}
                                </span>

                                <div className="flex items-center gap-1">
                                  <Link
                                    to={`/courses/${c._id}`}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                                    title="View Course"
                                  >
                                    <Eye size={14} />
                                  </Link>
                                  <span className="text-slate-400">
                                    {isDone ? <CheckCircle size={16} className="text-emerald-500" /> : <Clock size={16} className="text-amber-500" />}
                                  </span>
                                </div>
                              </div>

                              <h4 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                                {c.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {c.description || 'Learn structured concepts, watch video lectures, and attempt quizzes.'}
                              </p>

                              <div className="mt-3.5 pt-2.5 border-t border-black/5 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Instructor: {c.instructorId?.name || 'Faculty'}</span>
                                <Link
                                  to={`/courses/${c._id}`}
                                  className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                                >
                                  {isDone ? 'Review' : 'Continue'} <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Collaborators & Peer Strip (Reference 1 Bottom Strip) */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Faculty & Peers:</span>
                  {['T', 'A', 'P', 'E', 'D', 'K'].map((initial, idx) => {
                    const colors = [
                      'bg-[#d6ecff] text-sky-900',
                      'bg-[#fff3c4] text-amber-900',
                      'bg-[#f3e8ff] text-purple-900',
                      'bg-[#d4f4dd] text-emerald-900',
                      'bg-[#fed7aa] text-orange-900',
                      'bg-[#e2e8f0] text-slate-800',
                    ];
                    return (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full ${colors[idx % colors.length]} text-xs font-extrabold flex items-center justify-center shadow-2xs border border-white`}
                      >
                        {initial}
                      </div>
                    );
                  })}
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                    +
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── RIGHT: My Events 🥳 Sidebar Panel (4 Cols) ── */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">My Events</h3>
                <span className="text-lg">🥳</span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Schedule
              </span>
            </div>

            {/* Event Card 1: Webinar (Soft Light Blue in Reference 1) */}
            <div className="bg-[#d6ecff]/70 rounded-3xl p-4 border border-sky-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                    🎙️
                  </div>
                  <span className="font-extrabold text-sky-950">Webinar / Workshop</span>
                </div>
                <span className="text-[11px] font-bold text-sky-700">Tu, 25.03</span>
              </div>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                Understanding advanced curriculum modules, anti-cheat assessments, and evidence-based learning methods.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-950 bg-white/90 px-3 py-1 rounded-full w-fit shadow-2xs">
                <Clock size={12} className="text-sky-600" />
                <span>Start at 12:30</span>
              </div>
            </div>

            {/* Event Card 2: Lesson / Progress (Soft Lavender in Reference 1) */}
            <div className="bg-[#f3e8ff]/80 rounded-3xl p-4 border border-purple-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                    📚
                  </div>
                  <span className="font-extrabold text-purple-950">Module Lesson</span>
                </div>
                <span className="text-[11px] font-bold text-purple-700">We, 26.03</span>
              </div>
              <p className="text-xs text-purple-950 leading-relaxed font-medium">
                Overview of distance education delivery, progress audit streams, and certificate validation.
              </p>
            </div>

            {/* Event Card 3: Task / Assessment (Soft Yellow in Reference 1) */}
            <div className="bg-[#fff3c4]/80 rounded-3xl p-4 border border-amber-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    ⭐
                  </div>
                  <span className="font-extrabold text-amber-950">Quiz Milestone</span>
                </div>
                <span className="text-[11px] font-bold text-amber-700">Th, 27.03</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                Server-authoritative timed quiz attempt with option shuffling and tab-violation detection.
              </p>
            </div>

            {/* Event Card 4: Task Note (Mint Green in Reference 1) */}
            <div className="bg-[#d4f4dd]/80 rounded-3xl p-4 border border-emerald-200 space-y-2 shadow-2xs rotate-[-0.5deg]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-950">📌 Study Task</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Fr, 28.03</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                Collaborative peer review and study session for optimal course mastery and certificate completion.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ── Student Dashboard: Reference learning workspace ─────────────────────────
function ReferenceStudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const filtered = enrollments.filter((e) => (e.courseId?.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const featured = filtered.find((e) => e.status === 'active') || filtered[0];

  return (
    <div className="min-h-screen bg-[#dff7fa] px-2 py-4 sm:px-5 sm:py-7 text-[#171717]">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[28px] border-[6px] border-black bg-[#f8f8f6] shadow-[0_18px_40px_rgba(20,40,50,0.15)] animate-fade-in">
        <div className="grid min-h-[calc(100vh-90px)] grid-cols-1 lg:grid-cols-[54px_minmax(0,1fr)_300px]">
          <aside className="hidden bg-white py-16 lg:flex lg:flex-col lg:items-center lg:gap-3">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white" title="Connected learning path"><Compass size={14} /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-700" title="List view"><MoreHorizontal size={15} /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-700" title="Grid view"><Layers size={14} /></button>
            <div className="mt-auto flex flex-col gap-2 pb-4">
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10" title="Zoom in"><Plus size={14} /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10" title="Zoom out"><Minus size={14} /></button>
            </div>
          </aside>

          <main className="min-w-0 bg-[#f8f8f6] px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">My Learning Plan</h1><span className="text-xl">🧁</span></div>
              <div className="relative"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className="w-40 rounded-full bg-[#eeeeec] py-2.5 pl-10 pr-4 text-xs outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-black/10 sm:w-52" /></div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              <StatPill label="Total" value={enrollments.length} bg="bg-[#d6f4f7]" text="text-slate-900" />
              <StatPill label="Completed" value={completedCount} bg="bg-[#d9f6df]" text="text-emerald-950" badge="🎉" />
              <StatPill label="Upcoming" value={Math.max(enrollments.length - completedCount, 0)} bg="bg-[#fff0bd]" text="text-amber-950" />
            </div>

            {featured?.courseId && <div className="relative mb-5 overflow-hidden rounded-[26px] bg-[#e9c8f3] p-5 sm:p-7"><div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[16px] border-white/40" /><div className="relative max-w-[330px]"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-950/70">Active course</p><h2 className="text-2xl font-black leading-tight">{featured.courseId.title}</h2><p className="mt-2 text-xs leading-relaxed text-fuchsia-950/75">{featured.courseId.description || 'Learn the fundamentals through focused lessons and practice.'}</p><div className="mt-5 flex items-center gap-3"><span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold">◷ Watching 00:30</span><Link to={`/courses/${featured.courseId._id}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" title="Resume course"><Play size={17} className="ml-0.5 fill-black" /></Link></div></div></div>}

            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Your courses</h2><Link to="/courses" className="text-xs font-bold text-slate-600 hover:text-black">View all <ArrowRight size={12} className="inline" /></Link></div>
            {loading ? <div className="h-32 animate-pulse rounded-[24px] bg-slate-200" /> : filtered.length === 0 ? <div className="rounded-[24px] border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No courses yet. <Link to="/courses" className="font-bold text-black underline">Explore the catalog</Link></div> : <div className="relative space-y-3 pl-7"><div className="absolute bottom-5 left-3 top-5 border-l-2 border-dashed border-[#72c878]" />{filtered.map((enrollment, index) => { const course = enrollment.courseId; if (!course) return null; const isDone = enrollment.status === 'completed'; return <div key={enrollment._id} className="relative flex items-center gap-3"><div className={`absolute -left-7 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f8f8f6] text-[11px] font-bold shadow-sm ${isDone ? 'bg-[#7bd18a] text-white' : 'bg-white text-black'}`}>{isDone ? <Check size={13} /> : index + 1}</div><div className={`min-w-0 flex-1 rounded-[22px] p-4 ${isDone ? 'bg-[#dff6e2]' : 'bg-white'} shadow-[0_3px_12px_rgba(0,0,0,0.04)]`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-black">{course.title}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-600">{course.description || 'Learn structured concepts and complete the next lesson.'}</p></div><Link to={`/courses/${course._id}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f1ef]" title="Open course"><ArrowRight size={14} /></Link></div><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${isDone ? 'bg-white text-emerald-800' : 'bg-[#fff0bd] text-amber-900'}`}>{isDone ? 'Completed 🍃' : 'Upcoming ◷'}</span></div></div>; })}</div>}

            <div className="mt-7 flex items-center gap-2 border-t border-black/5 pt-4">{['T', 'A', 'P', 'E', 'D', 'K'].map((initial, index) => <span key={initial} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-[#f8f8f6] ${['bg-[#c8eff2]', 'bg-[#ffe59b]', 'bg-[#e7c3ef]', 'bg-[#c8efd0]', 'bg-[#ffd0b0]', 'bg-slate-200'][index]}`}>{initial}</span>)}<button className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white" title="Add collaborator"><Plus size={13} /></button></div>
          </main>

          <aside className="border-t border-black/5 bg-white px-5 py-6 sm:px-7 lg:border-l lg:border-t-0 lg:py-8"><h2 className="mb-5 text-2xl font-black">My Events <span className="text-lg">🤔</span></h2><div className="space-y-3">{[
            ['Webinar', 'Tu, 25.03', 'Understanding medical research, critical appraisal skills, and applying evidence-based guidelines in practice', 'bg-[#d7f5f6]'],
            ['Lesson', 'We, 26.03', 'Overview of healthcare delivery systems, health policy, and their impact on patient care.', 'bg-[#edc8f2]'],
            ['Task', 'Th, 27.03', 'Examination of major global health issues, including infectious diseases, non-communicable diseases, and healthcare disparities.', 'bg-[#ffefb3]'],
            ['Task', 'Fr, 28.03', 'Importance of teamwork and communication among healthcare professionals for optimal patient outcomes.', 'bg-[#c9f1cf]'],
          ].map(([type, date, copy, color]) => <div key={date} className={`rounded-[22px] ${color} p-4`}><div className="mb-3 flex items-center justify-between text-[11px] font-bold"><span>{type}</span><span>{date}</span></div><p className="text-xs font-medium leading-relaxed text-slate-800">{copy}</p>{type === 'Webinar' && <div className="mt-3 rounded-full bg-white/85 px-3 py-2 text-center text-[11px] font-bold">◷ Start at 12:30</div>}</div>)}</div></aside>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard: Soft Light Theme Console ────────────────────────────────
function AdminDashboard({ user }) {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses?status=pending'),
      api.get('/admin/users'),
    ]).then(([c, u]) => {
      setPendingCourses((c.data.courses || []).filter((x) => x.status === 'pending'));
      setUsers(u.data.users || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleReview = async (courseId, action) => {
    try {
      await api.patch(`/courses/${courseId}/review`, { action });
      setPendingCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success(`Course ${action}d successfully`);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-3 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        
        {/* Main Admin Console Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6">
          
          {/* Header + Pastel Stat Widgets */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Admin Console
                </h1>
                <span className="text-2xl">🛡️</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Platform governance, course verification, and user management</p>
            </div>

            <div className="flex items-center gap-2">
              <StatPill label="Total Users" value={users.length} bg="bg-[#d6ecff]" text="text-sky-900" />
              <StatPill label="Pending" value={pendingCourses.length} bg="bg-[#fff3c4]" text="text-amber-900" badge="⏱️" />
              <StatPill label="Students" value={users.filter((u) => u.role === 'student' && u.isActive).length} bg="bg-[#d4f4dd]" text="text-emerald-900" badge="🎉" />
            </div>
          </div>

          {/* Pending Course Submissions Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Courses Pending Review & Approval
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-[#f8fafc] rounded-3xl h-24 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : pendingCourses.length === 0 ? (
              <div className="bg-[#f0fbf4] rounded-3xl p-6 text-center border border-emerald-200/60">
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-emerald-900">All submitted courses have been verified and reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingCourses.map((c) => (
                  <div key={c._id} className="bg-[#fffdf5] rounded-3xl p-5 shadow-xs border border-amber-200/80 flex items-center justify-between gap-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3c4] text-amber-900">
                        Pending Review
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{c.title}</h4>
                      <p className="text-xs text-slate-500">Instructor: {c.instructorId?.name || 'Faculty'}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(c._id, 'approve')}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(c._id, 'reject')}
                        className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Directory Table in Light Palette */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              User Directory & Privilege Registry
            </h3>

            <div className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/80">
              <table className="w-full text-xs">
                <thead className="bg-[#f8fafc] border-b border-slate-100">
                  <tr className="text-left text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 10).map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                          u.role === 'admin' ? 'bg-[#f3e8ff] text-purple-900' :
                          u.role === 'instructor' ? 'bg-[#fff3c4] text-amber-900' :
                          'bg-[#d6ecff] text-sky-900'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${u.isActive ? 'bg-[#d4f4dd] text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ── Instructor Dashboard: Course catalog reference ────────────────────────────
function CourseCatalogReferenceDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get(user?.role === 'student' ? '/enrollments/my' : '/courses')
      .then(({ data }) => setCourses(user?.role === 'student' ? (data.enrollments || []).map((enrollment) => enrollment.courseId).filter(Boolean) : (data.courses || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const colors = ['bg-[#ffdc70]', 'bg-[#d2b1fa]', 'bg-[#aee5f8]'];
  const accents = ['bg-[#f2bd25]', 'bg-[#aa73e8]', 'bg-[#5bc6d5]'];
  const visibleCourses = courses.slice(0, 3);
  const isStudent = user?.role === 'student';
  const lessonRows = courses.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#2e2d2a] text-[#202020]">
      <div className="min-h-screen w-full overflow-hidden bg-[#f8f8f6] animate-fade-in">
        <header className="flex h-16 items-center justify-between bg-[#2e2d2a] px-5 text-white sm:px-8">
          <Link to="/dashboard" className="font-serif text-xl font-semibold italic tracking-tight">Veyro</Link>
          <nav className="hidden items-center gap-2 sm:flex"><Link to="/dashboard" className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold">My courses</Link><Link to="/courses" className="rounded-lg px-4 py-2 text-xs text-white/65 hover:bg-white/10">Browse courses</Link></nav>
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1cc68] text-xs font-bold text-slate-900">{user?.name?.[0]?.toUpperCase() || 'U'}</div><span className="hidden text-xs font-semibold sm:block">{user?.name || 'Instructor'}</span></div>
        </header>

        <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[58px_minmax(0,1fr)]">
          <aside className="hidden flex-col items-center gap-4 bg-[#2e2d2a] py-6 text-white/75 lg:flex"><button className="rounded-md p-2 text-white" title="Dashboard"><Layers size={17} /></button><button className="rounded-md bg-[#ffda55] p-2 text-slate-900" title="Courses"><BookOpen size={17} /></button><Link to={isStudent ? '/courses' : '/instructor/courses/new'} className="rounded-md p-2 hover:bg-white/10" title={isStudent ? 'Browse courses' : 'Create course'}><PlusCircle size={17} /></Link><button className="rounded-md p-2 hover:bg-white/10" title="Assignments"><CheckSquare size={17} /></button><button className="mt-auto rounded-md p-2 hover:bg-white/10" title="Settings"><Clock size={17} /></button></aside>

          <main className="bg-[#f8f8f6] p-5 sm:p-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">Welcome to <span className="font-bold text-[#ee6b4d]">Veyro</span></p><h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">My courses</h1></div><div className="flex items-center gap-2"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input placeholder="Search" className="w-36 rounded-lg border border-slate-400 bg-white py-2 pl-8 pr-3 text-xs outline-none sm:w-48" /></div><button className="rounded-lg bg-[#ff6847] p-2 text-white" title="Search courses"><Search size={15} /></button></div></div>
            <div className="mb-4 flex flex-wrap gap-2"><button className="rounded-lg bg-[#201f1d] px-3 py-1.5 text-[11px] font-bold text-white">All courses</button><span className="rounded-lg border border-slate-400 px-3 py-1.5 text-[11px]">Published</span><span className="rounded-lg border border-slate-400 px-3 py-1.5 text-[11px]">Pending</span><span className="rounded-lg border border-slate-400 px-3 py-1.5 text-[11px]">Drafts</span></div>

            {loading ? <div className="h-44 animate-pulse rounded-[22px] bg-slate-200" /> : visibleCourses.length === 0 ? <div className="rounded-[22px] border border-dashed border-slate-400 p-10 text-center text-sm">No courses yet. <Link to={isStudent ? '/courses' : '/instructor/courses/new'} className="font-bold underline">{isStudent ? 'Browse courses' : 'Create one'}</Link></div> : <div className="grid gap-3 md:grid-cols-3">{visibleCourses.map((course, index) => <div key={course._id} className={`${colors[index]} flex min-h-[185px] flex-col justify-between rounded-[20px] border-2 border-[#282724] p-4 shadow-[2px_3px_0_#282724]`}><div><div className="flex items-center justify-between"><span className={`${accents[index]} rounded-md px-2 py-1 text-[10px] font-bold`}>{course.category || course.status}</span><button className="text-lg" title="Bookmark course">▮</button></div><h2 className="mt-3 text-lg font-black leading-tight">{course.title}</h2><p className="mt-2 line-clamp-2 text-[11px] leading-relaxed">{course.description || 'Build an engaging curriculum for your learners.'}</p></div><div><div className="mb-2 flex items-center justify-between text-[10px] font-semibold"><span>Progress</span><span>{course.status}</span></div><div className="h-1.5 rounded-full bg-black/15"><div className={`${accents[index]} h-full rounded-full`} style={{ width: course.status === 'published' ? '72%' : '38%' }} /></div><Link to={isStudent ? `/courses/${course._id}` : `/instructor/courses/${course._id}/edit`} className="mt-3 block rounded-lg bg-[#ff6847] py-2 text-center text-[11px] font-bold text-white">{isStudent ? 'Continue' : 'Edit curriculum'}</Link></div></div>)}</div>}

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]"><section className="rounded-[20px] border-2 border-[#282724] bg-white p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">My next lessons</h2><Link to="/instructor/courses/new" className="text-[11px] font-bold text-[#e86b51]">Add lesson</Link></div>{lessonRows.length === 0 ? <p className="text-xs text-slate-500">Your lesson plan will appear here.</p> : <div className="divide-y divide-slate-200">{lessonRows.map((course, index) => <div key={course._id} className="flex items-center justify-between gap-3 py-2.5 text-[11px]"><div className="min-w-0"><p className="truncate font-bold">{String(index + 1).padStart(2, '0')}. {course.title}</p><p className="truncate text-[10px] text-slate-500">{course.category || 'Course curriculum'}</p></div><span className="shrink-0 text-slate-500">{22 + index * 8} min</span></div>)}</div>}</section><section className="rounded-[20px] bg-[#2e2d2a] p-5 text-white"><p className="text-[11px] text-white/70">New course matching your interests</p><span className="mt-5 inline-block rounded-md bg-[#ffda55] px-2.5 py-1 text-[10px] font-bold text-slate-900">Teaching insight</span><h2 className="mt-3 text-lg font-semibold leading-tight">Build a course your learners will remember</h2><p className="mt-3 text-[11px] leading-relaxed text-white/70">Use clear lessons, thoughtful quizzes, and a strong learning path.</p><Link to="/instructor/courses/new" className="mt-6 block rounded-lg bg-[#ff6847] py-2.5 text-center text-xs font-bold">More details</Link></section></div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Instructor Dashboard: Reference workspace ─────────────────────────────────
function ReferenceInstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((course) => course.status === 'published').length;
  const pending = courses.filter((course) => course.status === 'pending').length;
  const drafts = courses.filter((course) => course.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#dff7fa] px-2 py-4 sm:px-5 sm:py-7 text-[#171717]">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[28px] border-[6px] border-black bg-[#f8f8f6] shadow-[0_18px_40px_rgba(20,40,50,0.15)] animate-fade-in">
        <div className="grid min-h-[calc(100vh-90px)] grid-cols-1 lg:grid-cols-[54px_minmax(0,1fr)_300px]">
          <aside className="hidden bg-white py-16 lg:flex lg:flex-col lg:items-center lg:gap-3">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white" title="Studio overview"><Compass size={14} /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-700" title="Course list"><MoreHorizontal size={15} /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-slate-700" title="Course grid"><Layers size={14} /></button>
            <div className="mt-auto flex flex-col gap-2 pb-4"><button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10" title="Add course"><Plus size={14} /></button><button className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10" title="Collapse controls"><Minus size={14} /></button></div>
          </aside>

          <main className="min-w-0 bg-[#f8f8f6] px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Instructor Studio</h1><span className="text-xl">🎨</span></div><Link to="/instructor/courses/new" className="rounded-full bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800">+ Author course</Link></div>
            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3"><StatPill label="Total" value={courses.length} bg="bg-[#d6f4f7]" text="text-slate-900" /><StatPill label="Published" value={published} bg="bg-[#d9f6df]" text="text-emerald-950" badge="🎉" /><StatPill label="Pending" value={pending + drafts} bg="bg-[#fff0bd]" text="text-amber-950" /></div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Your course plan</h2><span className="text-xs font-bold text-slate-500">{drafts} drafts</span></div>
            {loading ? <div className="h-32 animate-pulse rounded-[24px] bg-slate-200" /> : courses.length === 0 ? <div className="rounded-[24px] border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No courses yet. <Link to="/instructor/courses/new" className="font-bold text-black underline">Author your first course</Link></div> : <div className="relative space-y-3 pl-7"><div className="absolute bottom-5 left-3 top-5 border-l-2 border-dashed border-[#72c878]" />{courses.map((course, index) => <div key={course._id} className="relative flex items-center gap-3"><div className={`absolute -left-7 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f8f8f6] text-[11px] font-bold shadow-sm ${course.status === 'published' ? 'bg-[#7bd18a] text-white' : 'bg-white text-black'}`}>{course.status === 'published' ? <Check size={13} /> : index + 1}</div><div className={`min-w-0 flex-1 rounded-[22px] p-4 ${course.status === 'published' ? 'bg-[#dff6e2]' : course.status === 'pending' ? 'bg-[#fff0bd]' : 'bg-white'} shadow-[0_3px_12px_rgba(0,0,0,0.04)]`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-black">{course.title}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-600">{course.description || 'Build a structured curriculum with video lessons and assessments.'}</p></div><Link to={`/instructor/courses/${course._id}/edit`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f1ef]" title="Edit curriculum"><ArrowRight size={14} /></Link></div><span className="mt-3 inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-700">{course.status}</span></div></div>)}</div>}
            <div className="mt-7 flex items-center gap-2 border-t border-black/5 pt-4">{['T', 'A', 'P', 'E', 'D', 'K'].map((initial, index) => <span key={initial} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-[#f8f8f6] ${['bg-[#c8eff2]', 'bg-[#ffe59b]', 'bg-[#e7c3ef]', 'bg-[#c8efd0]', 'bg-[#ffd0b0]', 'bg-slate-200'][index]}`}>{initial}</span>)}<span className="ml-2 text-[11px] font-bold text-slate-500">Faculty & peers</span></div>
          </main>

          <aside className="border-t border-black/5 bg-white px-5 py-6 sm:px-7 lg:border-l lg:border-t-0 lg:py-8"><h2 className="mb-5 text-2xl font-black">My Events <span className="text-lg">🤔</span></h2><div className="space-y-3">{[
            ['Webinar', 'Tu, 25.03', 'Understanding curriculum research and applying evidence-based teaching methods.', 'bg-[#d7f5f6]'],
            ['Review', 'We, 26.03', 'Review your pending course submissions and prepare the next lesson.', 'bg-[#edc8f2]'],
            ['Task', 'Th, 27.03', 'Complete quiz questions and publish the next course milestone.', 'bg-[#ffefb3]'],
            ['Task', 'Fr, 28.03', 'Plan feedback sessions and improve the learner experience.', 'bg-[#c9f1cf]'],
          ].map(([type, date, copy, color]) => <div key={date} className={`rounded-[22px] ${color} p-4`}><div className="mb-3 flex items-center justify-between text-[11px] font-bold"><span>{type}</span><span>{date}</span></div><p className="text-xs font-medium leading-relaxed text-slate-800">{copy}</p>{type === 'Webinar' && <div className="mt-3 rounded-full bg-white/85 px-3 py-2 text-center text-[11px] font-bold">◷ Start at 12:30</div>}</div>)}</div></aside>
        </div>
      </div>
    </div>
  );
}

// ── Instructor Hub: Studio & Curriculum Management ────────────────────────────
function InstructorDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === 'published').length;
  const pending = courses.filter((c) => c.status === 'pending').length;
  const drafts = courses.filter((c) => c.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-3 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/70 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Instructor Studio
                </h1>
                <span className="text-2xl">🎨</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Author video curricula, manage student quizzes, and monitor enrollments</p>
            </div>

            <div className="flex items-center gap-2">
              <StatPill label="Total" value={courses.length} bg="bg-[#d6ecff]" text="text-sky-900" />
              <StatPill label="Published" value={published} bg="bg-[#d4f4dd]" text="text-emerald-900" badge="🎉" />
              <StatPill label="Pending" value={pending} bg="bg-[#fff3c4]" text="text-amber-900" badge="⏱️" />
              <StatPill label="Drafts" value={drafts} bg="bg-[#e2e8f0]" text="text-slate-800" />
            </div>
          </div>

          {/* Action Link to Create Course */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Your Course Catalog</h3>
            <Link
              to="/instructor/courses/new"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-black transition-all active:scale-95"
            >
              <PlusCircle size={14} /> Author New Course
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#f8fafc] rounded-3xl h-28 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-dashed border-slate-200">
              <PlusCircle size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">You haven't authored any courses yet.</p>
              <Link to="/instructor/courses/new" className="mt-3 inline-block px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black transition-all">
                Create First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c._id}
                  className="bg-[#fafbff] rounded-3xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'published' ? 'bg-[#d4f4dd] text-emerald-900' :
                        c.status === 'pending' ? 'bg-[#fff3c4] text-amber-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{c.price ? `$${c.price}` : 'Free'}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {c.description || 'Full-stack course curriculum with video streaming lessons and anti-cheat assessment.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{c.category || 'General'}</span>
                    <Link
                      to={`/instructor/courses/${c._id}/edit`}
                      className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      Edit Curriculum <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'student') return <CourseCatalogReferenceDashboard />;
  if (user.role === 'instructor') return <CourseCatalogReferenceDashboard />;
  return <AdminDashboard user={user} />;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, TrendingUp, Clock, CheckCircle, PlusCircle, Star,
  ArrowRight, Search, Play, Bell, Plus, Minus, Check, MoreHorizontal,
  GraduationCap, ShieldCheck, Sparkles, LogOut, FileText, Video, Award,
  Lock, Calendar, Compass, Layers, UserCheck, X, Eye
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Shared Stat Pill Component ────────────────────────────────────────────────
const StatPill = ({ label, value, bg, text, badge }) => (
  <div className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl ${bg} min-w-[76px] transition-transform hover:scale-105 shadow-sm border border-black/5`}>
    <div className="flex items-center gap-1">
      <span className={`text-xl font-bold ${text}`}>{value}</span>
      {badge && <span className="text-xs">{badge}</span>}
    </div>
    <span className="text-[11px] font-semibold text-slate-600 tracking-tight">{label}</span>
  </div>
);

// ── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter((e) => e.status === 'active').length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const filtered = enrollments.filter((e) => {
    const title = e.courseId?.title?.toLowerCase() || '';
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    if (activeTab === 'completed') return matchesSearch && e.status === 'completed';
    if (activeTab === 'active') return matchesSearch && e.status === 'active';
    return matchesSearch;
  });

  const featuredEnrollment = enrollments.find((e) => e.status === 'active') || enrollments[0];

  return (
    <div className="w-full max-w-[1440px] mx-auto p-2 sm:p-4 lg:p-6 animate-fade-in">
      
      {/* Outer Sleek Workstation Canvas (Reference 1) */}
      <div className="bg-[#0f141c] text-white rounded-[2.5rem] p-3 sm:p-5 lg:p-6 shadow-2xl border border-white/5">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 px-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-serif italic">Veyro</span>
          </div>

          {/* Center Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold shadow-sm">
              <GraduationCap size={14} className="text-amber-300" />
              <span>Learning Plan</span>
            </button>
            <Link to="/courses" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-white text-xs font-medium transition-colors">
              <Compass size={14} /> Browse Catalog
            </Link>
            <Link to="/dashboard" className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
              <Clock size={14} />
            </Link>
            <Link to="/dashboard" className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
              <Layers size={14} />
            </Link>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-full pl-2 pr-4 py-1.5 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-xs font-bold text-slate-950 shadow-inner">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-xs font-bold text-white capitalize">{user.name}</p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Inner Light Learning Workstation Canvas */}
        <div className="mt-5 bg-[#f2f6f9] text-slate-800 rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ── LEFT & CENTER: Learning Plan Flow Canvas (8 Cols) ── */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              
              {/* Header: Title + Search + Stat Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    My Learning Plan
                  </h1>
                  <span className="text-2xl">🕰️</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Search bar */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="bg-white text-slate-800 placeholder:text-slate-400 text-xs rounded-full pl-9 pr-4 py-2.5 shadow-sm border border-slate-200/80 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all w-40 sm:w-48"
                    />
                  </div>

                  {/* Summary Stat Pills (Reference 1) */}
                  <div className="flex items-center gap-2">
                    <StatPill label="Total" value={enrollments.length} bg="bg-[#dcfce7]" text="text-emerald-800" />
                    <StatPill label="Completed" value={completed} bg="bg-[#bbf7d0]" text="text-emerald-900" badge="🎉" />
                    <StatPill label="Upcoming" value={active} bg="bg-[#e2e8f0]" text="text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Main Content Area with Left Micro-Dock & Connected Node Cards */}
              <div className="flex gap-4 sm:gap-6 items-start">
                
                {/* Left Micro-Toolbar Dock (Reference 1) */}
                <div className="hidden sm:flex flex-col items-center gap-3 bg-[#181d26] text-white p-2.5 rounded-2xl shadow-md flex-shrink-0">
                  <button className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors" title="Flow Map">
                    <Compass size={15} />
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${activeTab === 'all' ? 'bg-white/30 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="All Courses"
                  >
                    <Layers size={15} />
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${activeTab === 'active' ? 'bg-white/30 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="In Progress"
                  >
                    <Clock size={15} />
                  </button>
                  <div className="w-5 h-[1px] bg-white/10 my-1" />
                  <div className="relative">
                    <button className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center hover:bg-amber-400/30 transition-colors">
                      <Bell size={15} />
                    </button>
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-[9px] font-bold text-slate-950 w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {enrollments.length}
                    </span>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                    <Plus size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                    <Minus size={14} />
                  </button>
                </div>

                {/* Node Roadmap / Course Stream */}
                <div className="flex-1 space-y-6">
                  
                  {/* Highlight Featured Active Course (Lilac Gradient Card in Reference 1) */}
                  {featuredEnrollment && featuredEnrollment.courseId && (
                    <div className="relative bg-gradient-to-br from-[#f3d9fa] via-[#ecd4f7] to-[#e4c1f9] rounded-3xl p-6 shadow-md border border-purple-200/60 overflow-hidden group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-md">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/60 text-purple-900 text-[10px] font-bold tracking-wide uppercase">
                            Active Stream
                          </span>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            {featuredEnrollment.courseId.title}
                          </h2>
                          <p className="text-xs text-slate-700 font-medium line-clamp-2">
                            {featuredEnrollment.courseId.description || 'Continue where you left off. Watch video lessons, download guides, and attempt module quizzes.'}
                          </p>
                        </div>

                        {/* Big Play CTA Capsule */}
                        <Link
                          to={`/courses/${featuredEnrollment.courseId._id}`}
                          className="w-14 h-14 rounded-full bg-white text-purple-900 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all flex-shrink-0 group/play"
                        >
                          <Play size={22} className="fill-purple-900 ml-0.5 group-hover/play:scale-110 transition-transform" />
                        </Link>
                      </div>

                      {/* Bottom Footer Info in Featured Card */}
                      <div className="mt-5 pt-4 border-t border-purple-300/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-xs">
                          <Clock size={13} className="text-purple-700" />
                          <span className="font-semibold text-purple-950">
                            {featuredEnrollment.status === 'completed' ? '100% Completed' : 'In Progress (Watching)'}
                          </span>
                        </div>

                        {/* Instructors / Collaborator Avatars */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                              A
                            </div>
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-400 text-white text-[10px] font-bold flex items-center justify-center">
                              K
                            </div>
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                              V
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-purple-950">
                            {featuredEnrollment.courseId.instructorId?.name || 'Veyro Faculty'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Connected Course Cards Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        {activeTab === 'all' ? 'All Enrolled Modules' : activeTab === 'completed' ? 'Completed Modules' : 'In Progress Modules'}
                      </h3>
                      <Link to="/courses" className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 hover:underline">
                        Explore Catalog <ArrowRight size={12} />
                      </Link>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="bg-white rounded-3xl p-6 h-36 animate-pulse shadow-sm" />
                        ))}
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200/60">
                        <BookOpen size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600 font-semibold text-sm">No courses found matching this view.</p>
                        <Link to="/courses" className="mt-3 inline-block px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md hover:bg-black transition-all">
                          Browse Course Catalog
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map((e) => {
                          const c = e.courseId;
                          if (!c) return null;
                          const isDone = e.status === 'completed';

                          return (
                            <div
                              key={e._id}
                              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group"
                            >
                              <div>
                                {/* Status Chip + Action Icons */}
                                <div className="flex items-center justify-between mb-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                      isDone
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {isDone ? 'Completed 🍃' : 'Upcoming ⏱️'}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <Link
                                      to={`/courses/${c._id}`}
                                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                      title="View Course"
                                    >
                                      <Eye size={14} />
                                    </Link>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                      {isDone ? <Check size={12} /> : <Clock size={12} />}
                                    </span>
                                  </div>
                                </div>

                                <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                  {c.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {c.description || 'Master core subject concepts with video lectures and interactive anti-cheat assessments.'}
                                </p>
                              </div>

                              {/* Card Action Link */}
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">{c.instructorId?.name || 'Instructor'}</span>
                                <Link
                                  to={`/courses/${c._id}`}
                                  className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                                >
                                  Resume <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Collaborators & Peer Strip (Reference 1) */}
                  <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Faculty & Peers:</span>
                    {['T', 'A', 'P', 'E', 'D', 'K'].map((initial, idx) => {
                      const colors = [
                        'bg-[#c7d2fe] text-indigo-900',
                        'bg-[#fde68a] text-amber-900',
                        'bg-[#fbcfe8] text-pink-900',
                        'bg-[#fed7aa] text-orange-900',
                        'bg-[#a7f3d0] text-emerald-900',
                        'bg-[#bae6fd] text-sky-900',
                      ];
                      return (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded-full ${colors[idx % colors.length]} text-xs font-extrabold flex items-center justify-center shadow-xs border border-white`}
                        >
                          {initial}
                        </div>
                      );
                    })}
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
                      +
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* ── RIGHT: My Events 🥳 Schedule & Milestones (4 Cols) ── */}
            <div className="lg:col-span-4 bg-white/70 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-lg">My Events</h3>
                  <span className="text-lg">🥳</span>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Upcoming
                </span>
              </div>

              {/* Event Card 1: Webinar / Workshop (Soft Cyan/Blue in Reference 1) */}
              <div className="bg-[#e0f2fe] rounded-2xl p-4 border border-sky-200/80 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                      🎙️
                    </div>
                    <span className="font-bold text-sky-950">Live Q&A Workshop</span>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700">Tu, 25.03</span>
                </div>
                <p className="text-xs text-sky-900 leading-relaxed font-medium">
                  Reviewing core architectural modules, anti-cheat assessments, and real-time video milestones.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 bg-white/80 px-3 py-1 rounded-full w-fit shadow-2xs">
                  <Clock size={12} className="text-sky-600" />
                  <span>Start at 12:30</span>
                </div>
              </div>

              {/* Event Card 2: Lesson Checkpoint (Soft Lilac in Reference 1) */}
              <div className="bg-[#f3e8ff] rounded-2xl p-4 border border-purple-200/80 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                      📚
                    </div>
                    <span className="font-bold text-purple-950">Module Lesson</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700">We, 26.03</span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed font-medium">
                  Overview of full-stack distance education platform, state management, and token rotation.
                </p>
              </div>

              {/* Event Card 3: Milestone / Task (Soft Yellow in Reference 1) */}
              <div className="bg-[#fef9c3] rounded-2xl p-4 border border-amber-200/80 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ⭐
                    </div>
                    <span className="font-bold text-amber-950">Quiz Assessment</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">Th, 27.03</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Server-authoritative timed quiz with tab-switch violation monitoring and random order shuffling.
                </p>
              </div>

              {/* Event Card 4: Floating Mint Sticky Note (Bottom Right in Reference 1) */}
              <div className="bg-[#dcfce7] rounded-2xl p-4 border border-emerald-200/80 space-y-2 shadow-xs rotate-[-1deg] hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">📌 Study Task</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Fr, 28.03</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Importance of collaborative learning and peer reviews for optimal course completion outcomes.
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ── Instructor Dashboard ─────────────────────────────────────────────────────
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
    <div className="w-full max-w-[1440px] mx-auto p-2 sm:p-4 lg:p-6 animate-fade-in">
      <div className="bg-[#0f141c] text-white rounded-[2.5rem] p-3 sm:p-5 lg:p-6 shadow-2xl border border-white/5">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-serif italic">Veyro</span>
            <span className="text-xs bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full ml-1">
              Instructor Studio
            </span>
          </div>

          <Link
            to="/instructor/courses/new"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 text-xs font-bold shadow-md hover:bg-slate-200 transition-all active:scale-95"
          >
            <PlusCircle size={15} /> Author New Course
          </Link>
        </div>

        {/* Inner Light Workstation */}
        <div className="mt-5 bg-[#f2f6f9] text-slate-800 rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Curriculum Hub 🎨
              </h1>
              <p className="text-xs text-slate-500 mt-1">Manage published courses, draft lessons, and student enrollments</p>
            </div>

            <div className="flex items-center gap-2">
              <StatPill label="Total" value={courses.length} bg="bg-[#dcfce7]" text="text-emerald-800" />
              <StatPill label="Published" value={published} bg="bg-[#bbf7d0]" text="text-emerald-900" badge="🎉" />
              <StatPill label="Pending" value={pending} bg="bg-[#fef9c3]" text="text-amber-900" badge="⏱️" />
              <StatPill label="Drafts" value={drafts} bg="bg-[#e2e8f0]" text="text-slate-800" />
            </div>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
              <PlusCircle size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base">No courses created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Start sharing your expertise by authoring structured video modules and quizzes.
              </p>
              <Link to="/instructor/courses/new" className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-black transition-all inline-block">
                Create First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        c.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{c.category || 'General'}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {c.description || 'Interactive course curriculum with video streaming and anti-cheat quizzes.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {c.price ? `$${c.price}` : 'Free'}
                    </span>
                    <Link
                      to={`/instructor/courses/${c._id}/edit`}
                      className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                    >
                      Studio Edit
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

// ── Admin Dashboard ───────────────────────────────────────────────────────────
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
    <div className="w-full max-w-[1440px] mx-auto p-2 sm:p-4 lg:p-6 animate-fade-in">
      <div className="bg-[#0f141c] text-white rounded-[2.5rem] p-3 sm:p-5 lg:p-6 shadow-2xl border border-white/5">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-md">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-serif italic">Veyro</span>
            <span className="text-xs bg-rose-400/20 text-rose-300 font-bold px-2.5 py-0.5 rounded-full ml-1">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-semibold">
            <UserCheck size={14} className="text-emerald-400" />
            <span>Administrator Authorized</span>
          </div>
        </div>

        {/* Inner Light Workstation */}
        <div className="mt-5 bg-[#f2f6f9] text-slate-800 rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-inner space-y-6">
          
          {/* Header Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Platform Governance 🛡️
              </h1>
              <p className="text-xs text-slate-500 mt-1">Review course submissions and manage user privileges</p>
            </div>

            <div className="flex items-center gap-2">
              <StatPill label="Total Users" value={users.length} bg="bg-[#dcfce7]" text="text-emerald-800" />
              <StatPill label="Pending" value={pendingCourses.length} bg="bg-[#fef9c3]" text="text-amber-900" badge="⏱️" />
              <StatPill label="Students" value={users.filter((u) => u.role === 'student' && u.isActive).length} bg="bg-[#e0f2fe]" text="text-sky-900" />
            </div>
          </div>

          {/* Pending Course Submissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Pending Course Approvals
            </h3>

            {loading ? (
              <div className="bg-white rounded-2xl h-24 animate-pulse shadow-sm" />
            ) : pendingCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-200/80">
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">All submitted courses have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingCourses.map((c) => (
                  <div key={c._id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      <p className="text-xs text-slate-500">by {c.instructorId?.name || 'Instructor'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(c._id, 'approve')}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(c._id, 'reject')}
                        className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users Registry Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              User Directory
            </h3>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 10).map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-900">{u.name}</td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
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

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'student') return <StudentDashboard user={user} />;
  if (user.role === 'instructor') return <InstructorDashboard user={user} />;
  return <AdminDashboard user={user} />;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  Star,
  ArrowRight,
  Search,
  Play,
  Bell,
  Check,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Award,
  Calendar,
  Compass,
  Layers,
  Eye,
  FileCheck,
  AlertCircle,
  BarChart2,
  Loader2,
  X,
  FileText,
  Video,
  HelpCircle,
  Activity,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  ShieldAlert,
  KeyRound,
  Database,
  Download,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Metric Stat Capsule ──────────────────────────────────────────────────────
const MetricStatCard = ({ label, value, sublabel, icon: Icon, badgeColor = 'bg-[#FFF490] text-[#111111]' }) => (
  <div className="bg-white rounded-3xl border-2 border-[#111111] p-4 sm:p-5 shadow-brutal-sm flex items-center justify-between gap-3">
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/50 font-body">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-syne font-extrabold text-2xl sm:text-3xl text-[#111111]">{value}</span>
        {sublabel && <span className="text-[11px] font-semibold text-[#111111]/40">{sublabel}</span>}
      </div>
    </div>
    <div className={`w-11 h-11 rounded-2xl ${badgeColor} border-2 border-[#111111] flex items-center justify-center flex-shrink-0`}>
      <Icon size={20} />
    </div>
  </div>
);

// ── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed' | 'dropped'
  const [droppingCourseId, setDroppingCourseId] = useState(null);
  const [reEnrollingCourseId, setReEnrollingCourseId] = useState(null);

  const fetchEnrollments = () => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleDropCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to drop "${courseTitle}"? Your historical progress will be safely preserved, and you can re-enroll at any time.`)) {
      return;
    }
    setDroppingCourseId(courseId);
    try {
      await api.delete(`/courses/${courseId}/enroll`);
      toast.success(`Successfully dropped "${courseTitle}".`);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to drop course');
    } finally {
      setDroppingCourseId(null);
    }
  };

  const handleReEnroll = async (courseId, courseTitle) => {
    setReEnrollingCourseId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success(`Re-enrolled in "${courseTitle}"! Historical progress restored.`);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to re-enroll in course');
    } finally {
      setReEnrollingCourseId(null);
    }
  };

  const completedEnrollments = enrollments.filter((e) => e.status === 'completed');
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const droppedEnrollments = enrollments.filter((e) => e.status === 'dropped');

  const filtered = enrollments.filter((e) => {
    const title = e.courseId?.title?.toLowerCase() || '';
    const matchSearch = title.includes(searchQuery.toLowerCase());
    if (activeTab === 'active') return matchSearch && e.status === 'active';
    if (activeTab === 'completed') return matchSearch && e.status === 'completed';
    if (activeTab === 'dropped') return matchSearch && e.status === 'dropped';
    return matchSearch;
  });

  const featuredCourse = activeEnrollments[0] || enrollments[0];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
            <GraduationCap size={13} />
            <span>Student Learning Plan</span>
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-[#111111] tracking-tight leading-[1.05] uppercase">
            Welcome Back, {user?.name || 'Scholar'}.
          </h1>
          <p className="text-[#111111]/60 text-xs sm:text-sm mt-1.5 font-body leading-relaxed">
            Track your verified progress, resume interactive modules, and view issued completion certificates.
          </p>
        </div>

        <Link to="/courses" className="btn-sky-pill text-xs px-5 py-3">
          <Compass size={14} />
          <span>Explore New Courses</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          label="Total Enrolled"
          value={enrollments.length}
          sublabel="Curricula"
          icon={BookOpen}
          badgeColor="bg-[#d6ecff] text-sky-900"
        />
        <MetricStatCard
          label="In Progress"
          value={activeEnrollments.length}
          sublabel="Modules active"
          icon={Clock}
          badgeColor="bg-[#fff3c4] text-amber-900"
        />
        <MetricStatCard
          label="Completed"
          value={completedEnrollments.length}
          sublabel="Mastered"
          icon={CheckCircle}
          badgeColor="bg-[#d4f4dd] text-emerald-900"
        />
        <MetricStatCard
          label="Certificates"
          value={completedEnrollments.filter((e) => e.certificateCode).length}
          sublabel="Verified"
          icon={Award}
          badgeColor="bg-[#f3e8ff] text-purple-900"
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Learning Roadmap & Course Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Featured Active Stream Card */}
          {featuredCourse?.courseId && (
            <div className="bg-gradient-to-br from-[#FAF7EE] via-[#f0f8ff] to-[#e8f4fc] rounded-[2rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#111111] text-white text-[10px] font-bold tracking-wider uppercase">
                      Current Stream
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Clock size={12} className="text-[#60C5F1]" /> Server-Audited Watch Time
                    </span>
                  </div>

                  <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-snug">
                    {featuredCourse.courseId.title}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {featuredCourse.courseId.description || 'Master core subject fundamentals through video streaming and anti-cheat quizzes.'}
                  </p>
                </div>

                {/* Quick Resume Button */}
                <Link
                  to={`/courses/${featuredCourse.courseId._id}`}
                  className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-md hover:bg-[#60C5F1] hover:text-[#111111] hover:scale-105 active:scale-95 transition-all flex-shrink-0 group/btn"
                  title="Resume Course"
                >
                  <Play size={20} className="fill-current ml-0.5" />
                </Link>
              </div>

              {/* Progress Footer */}
              <div className="mt-6 pt-4 border-t border-[#111111]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[9px] font-bold">
                    {featuredCourse.courseId.instructorId?.name ? featuredCourse.courseId.instructorId.name[0].toUpperCase() : 'V'}
                  </div>
                  <span>Instructor: {featuredCourse.courseId.instructorId?.name || 'Faculty Member'}</span>
                </div>

                <Link
                  to={`/courses/${featuredCourse.courseId._id}`}
                  className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                >
                  <span>Continue Curriculum</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* Enrolled Courses Filter & List */}
          <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FAF7EE] border border-black/10">
                {[
                  { id: 'all', label: `All (${enrollments.length})` },
                  { id: 'active', label: `In Progress (${activeEnrollments.length})` },
                  { id: 'completed', label: `Completed (${completedEnrollments.length})` },
                  { id: 'dropped', label: `Dropped (${droppedEnrollments.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter courses…"
                  className="w-full bg-[#FAF7EE] text-slate-900 placeholder:text-slate-400 text-xs font-medium rounded-full pl-9 pr-4 py-2 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20 transition-all"
                />
              </div>
            </div>

            {/* Courses List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl h-24 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-[#FAF7EE] rounded-2xl p-8 text-center border border-dashed border-[#111111]/20 space-y-3">
                <BookOpen size={32} className="text-slate-400 mx-auto" />
                <p className="font-bold text-sm text-slate-800">No courses match your selection.</p>
                <p className="text-xs text-slate-500">Explore newly published curricula to begin your learning journey.</p>
                <Link to="/courses" className="btn-dark-pill text-xs px-4 py-2 mt-2">
                  <span>Browse Catalog</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((en) => {
                  const course = en.courseId;
                  if (!course) return null;
                  const isDone = en.status === 'completed';
                  const isDropped = en.status === 'dropped';
                  const isActive = en.status === 'active';

                  return (
                    <div
                      key={en._id}
                      className={`rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isDone
                          ? 'bg-[#f0fbf4] border-emerald-200 hover:border-emerald-300'
                          : isDropped
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                          : 'bg-white border-slate-200/80 hover:border-[#111111]/30 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDone ? 'bg-[#d4f4dd] text-emerald-900 border border-emerald-300' :
                            isDropped ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-[#fff3c4] text-amber-900 border border-amber-300'
                          }`}>
                            {isDone ? '✓ Completed' : isDropped ? '✕ Dropped' : '⏱ In Progress'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {course.category || 'Curriculum'}
                          </span>
                        </div>

                        <h3 className="font-syne font-bold text-slate-900 text-base leading-snug">
                          {course.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-1">
                          {course.description || 'Interactive modules, streaming video lectures, and proctored quizzes.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                        {isDone && en.certificateCode && (
                          <Link
                            to={`/verify/${en.certificateCode}`}
                            className="px-3.5 py-2 rounded-full bg-[#FFF490] border border-[#111111]/20 text-[#111111] text-xs font-bold hover:bg-[#ffe566] transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <Award size={13} />
                            <span>Certificate</span>
                          </Link>
                        )}

                        {isActive && (
                          <button
                            onClick={() => handleDropCourse(course._id, course.title)}
                            disabled={droppingCourseId === course._id}
                            className="px-3.5 py-2 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                            title="Drop course (progress preserved)"
                          >
                            {droppingCourseId === course._id ? 'Dropping...' : 'Drop Course'}
                          </button>
                        )}

                        {isDropped && (
                          <button
                            onClick={() => handleReEnroll(course._id, course.title)}
                            disabled={reEnrollingCourseId === course._id}
                            className="btn-dark-pill text-xs px-4 py-2 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                          >
                            <RotateCcw size={13} className={reEnrollingCourseId === course._id ? 'animate-spin' : ''} />
                            <span>{reEnrollingCourseId === course._id ? 'Re-enrolling...' : 'Re-enroll'}</span>
                          </button>
                        )}

                        {!isDropped && (
                          <Link
                            to={`/courses/${course._id}`}
                            className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <span>{isDone ? 'Review' : 'Continue'}</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Schedule, Verifications & Quick Insights (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Certificate Credential Verification Lookup Widget */}
          <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700" />
                <h3 className="font-syne font-bold text-slate-900 text-sm">Public Ledger Audit</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#d4f4dd] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              All completion certificates are registered on the Veyro tamper-proof verification ledger for employers and academic institutions.
            </p>

            <Link
              to="/verify/VY-DEMO-2026"
              className="w-full py-2.5 rounded-full bg-[#FAF7EE] border border-[#111111]/20 text-slate-900 text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCheck size={14} />
              <span>Test Certificate Audit</span>
            </Link>
          </div>

          {/* Academic Schedule & Milestones */}
          <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#60C5F1]" />
                <h3 className="font-syne font-bold text-slate-900 text-sm">Milestones & Study Events</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#FAF7EE] rounded-2xl p-3.5 border border-[#111111]/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-[#111111]">Anti-Cheat Proctored Quiz</span>
                  <span className="text-slate-500">Every Module</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tab-switch logging, timer enforcement, and random question order.
                </p>
              </div>

              <div className="bg-[#FAF7EE] rounded-2xl p-3.5 border border-[#111111]/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-[#111111]">90% Watch Auditing</span>
                  <span className="text-emerald-700">Required</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Server marks video lessons complete only when unique seconds watched meet the standard.
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
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
            <Layers size={13} />
            <span>Instructor Studio & Curriculum Desk</span>
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
            Author & Publish High-Caliber Curricula.
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Build video lectures, attach notes, author anti-cheat quizzes, and submit for verification.
          </p>
        </div>

        <Link to="/instructor/courses/new" className="btn-dark-pill text-xs px-5 py-3">
          <PlusCircle size={15} />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Stats Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          label="Total Curricula"
          value={courses.length}
          sublabel="Authored"
          icon={BookOpen}
          badgeColor="bg-[#d6ecff] text-sky-900"
        />
        <MetricStatCard
          label="Published"
          value={published}
          sublabel="Live to students"
          icon={CheckCircle}
          badgeColor="bg-[#d4f4dd] text-emerald-900"
        />
        <MetricStatCard
          label="Pending Review"
          value={pending}
          sublabel="Under evaluation"
          icon={Clock}
          badgeColor="bg-[#fff3c4] text-amber-900"
        />
        <MetricStatCard
          label="Drafts"
          value={drafts}
          sublabel="Work in progress"
          icon={Layers}
          badgeColor="bg-[#e2e8f0] text-slate-800"
        />
      </div>

      {/* Curriculum Manager Table */}
      <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-syne font-bold text-slate-900 text-lg">Authored Curricula</h2>
            <p className="text-xs text-slate-500">Manage modules, lessons, quizzes, and submission review statuses.</p>
          </div>

          <Link to="/instructor/courses/new" className="btn-sky-pill text-xs px-4 py-2">
            <PlusCircle size={14} />
            <span>New Course</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 rounded-2xl h-20 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-[#FAF7EE] rounded-2xl p-10 text-center border border-dashed border-[#111111]/20 space-y-3">
            <BookOpen size={36} className="text-slate-400 mx-auto" />
            <h3 className="font-syne font-bold text-slate-900 text-base">You haven't created any curricula yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by authoring your first course with structured video lessons and assessment quizzes.
            </p>
            <Link to="/instructor/courses/new" className="btn-dark-pill text-xs px-5 py-2.5 mt-2">
              <span>Author First Curriculum</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-[#111111]/30 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      course.status === 'published' ? 'bg-[#d4f4dd] text-emerald-900 border border-emerald-300' :
                      course.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold' :
                      course.status === 'under_review' || course.status === 'pending' ? 'bg-[#fff3c4] text-amber-900 border border-amber-300' :
                      course.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {course.status === 'approved' ? 'Approved • Ready to Publish' :
                       course.status === 'under_review' ? 'Under Review' :
                       course.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {course.category || 'General'}
                    </span>
                  </div>

                  <h3 className="font-syne font-bold text-slate-900 text-base leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {course.description || 'No description provided.'}
                  </p>
                  {course.status === 'rejected' && course.rejectionReason && (
                    <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      ⚠ Feedback: {course.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    to={`/courses/${course._id}`}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Preview Public Page"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/instructor/courses/${course._id}/edit?tab=analytics`}
                    className="px-3.5 py-2 rounded-full bg-[#FAF7EE] border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs"
                    title="View Course Analytics & Roster"
                  >
                    <BarChart2 size={13} />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    to={`/instructor/courses/${course._id}/edit`}
                    className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Edit Curriculum</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Admin Governance Console ─────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingCourseId, setReviewingCourseId] = useState(null);
  const [adminTab, setAdminTab] = useState('curricula'); // 'curricula' | 'users' | 'audits'

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/courses?status=pending'),
      ]);
      setUsers(uRes.data.users || []);
      setPendingCourses(cRes.data.courses || []);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      toast.success(data.message || 'User status updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
            <ShieldCheck size={13} />
            <span>Platform Governance & Administration</span>
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
            System Admin Console.
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Course accreditation approvals, append-only audit trail, and user directory administration.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#111111]/20 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setAdminTab('curricula')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'curricula'
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Clock size={13} />
            <span>Verifications ({pendingCourses.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'users'
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Users size={13} />
            <span>User Directory ({users.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('audits')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'audits'
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Activity size={13} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricStatCard
          label="Registered Users"
          value={users.length}
          sublabel="Total platform accounts"
          icon={Users}
          badgeColor="bg-[#d6ecff] text-sky-900"
        />
        <MetricStatCard
          label="Pending Verifications"
          value={pendingCourses.length}
          sublabel="Awaiting approval"
          icon={Clock}
          badgeColor="bg-[#fff3c4] text-amber-900"
        />
        <MetricStatCard
          label="Active Students"
          value={users.filter((u) => u.role === 'student' && u.isActive).length}
          sublabel="Learners enrolled"
          icon={GraduationCap}
          badgeColor="bg-[#d4f4dd] text-emerald-900"
        />
      </div>

      {/* Tab 1: Pending Course Submissions */}
      {adminTab === 'curricula' && (
        <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-syne font-bold text-slate-900 text-lg">Curricula Pending Verification</h2>
              <p className="text-xs text-slate-500">Review modules, video lessons, and anti-cheat assessment standards before granting approval.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FAF7EE] border border-[#111111]/15 text-xs font-bold text-slate-700 w-fit">
              {pendingCourses.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-50 rounded-2xl h-20 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="bg-[#f0fbf4] rounded-2xl p-8 text-center border border-emerald-200 space-y-1.5">
              <CheckCircle size={28} className="text-emerald-600 mx-auto" />
              <p className="font-bold text-xs text-emerald-900">All submitted curricula have been reviewed and published.</p>
              <p className="text-[11px] text-emerald-700">No courses currently waiting in the moderation queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Instructor</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Created</th>
                    <th className="pb-3 px-3">Submitted</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingCourses.map((c) => {
                    const createdStr = new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const submittedStr = c.submittedAt
                      ? new Date(c.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(c.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-syne font-bold text-slate-900 block max-w-xs truncate">{c.title}</span>
                          <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{c.description}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{c.instructorId?.name || 'Faculty Member'}</span>
                          <span className="text-[10px] text-slate-400 block">{c.instructorId?.email}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {c.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium">{createdStr}</td>
                        <td className="py-3 px-3 text-slate-500 font-medium">{submittedStr}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3c4] text-amber-900 border border-amber-300">
                            {c.status === 'under_review' ? 'Under Review' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setReviewingCourseId(c._id)}
                            className="btn-dark-pill text-xs px-4 py-1.5 shadow-2xs"
                          >
                            <span>Review</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Directory Table */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h2 className="font-syne font-bold text-slate-900 text-lg">User Directory</h2>
            <p className="text-xs text-slate-500">Registry of learners, instructors, and privileged administrative accounts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="pb-3 px-3">Name</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 text-slate-500">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                        u.role === 'admin' ? 'bg-[#f3e8ff] text-purple-900 border border-purple-200' :
                        u.role === 'instructor' ? 'bg-[#fff3c4] text-amber-900 border border-amber-200' :
                        'bg-[#d6ecff] text-sky-900 border border-sky-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.isActive ? 'bg-[#d4f4dd] text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#111111]/20 hover:bg-black hover:text-white transition-colors"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Audit Trail */}
      {adminTab === 'audits' && (
        <AdminAuditLogsSection />
      )}

      {/* Course Review Modal */}
      {reviewingCourseId && (
        <CourseReviewModal
          courseId={reviewingCourseId}
          onClose={() => setReviewingCourseId(null)}
          onActionSuccess={loadData}
        />
      )}

    </div>
  );
}

// ── Admin Audit Logs Section ─────────────────────────────────────────────────
function AdminAuditLogsSection() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayload, setSelectedPayload] = useState(null);

  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', targetPage);
      params.append('limit', 15);
      if (actionFilter && actionFilter !== 'ALL') params.append('action', actionFilter);
      if (roleFilter && roleFilter !== 'ALL') params.append('role', roleFilter);
      if (entityFilter && entityFilter !== 'ALL') params.append('entityType', entityFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const { data } = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error('Failed to load platform audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, roleFilter, entityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setActionFilter('ALL');
    setRoleFilter('ALL');
    setEntityFilter('ALL');
    setSearchQuery('');
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });
      const params = new URLSearchParams();
      params.append('format', format);
      if (actionFilter && actionFilter !== 'ALL') params.append('action', actionFilter);
      if (roleFilter && roleFilter !== 'ALL') params.append('role', roleFilter);
      if (entityFilter && entityFilter !== 'ALL') params.append('entityType', entityFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/admin/audit-logs/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veyro-audit-logs-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Audit logs successfully exported as ${format.toUpperCase()}`, { id: 'export-toast' });
    } catch {
      toast.error('Failed to export audit logs. Admins only.', { id: 'export-toast' });
    }
  };

  const getActionBadgeClass = (action) => {
    if (['LOGIN_SUCCESS', 'COURSE_APPROVED', 'COURSE_PUBLISHED', 'COURSE_COMPLETED', 'CERTIFICATE_ISSUED'].includes(action)) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    }
    if (['LOGIN_FAILURE', 'COURSE_REJECTED', 'COURSE_DROPPED', 'QUIZ_DELETED', 'SESSION_REVOKED'].includes(action)) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (['COURSE_CREATED', 'COURSE_UPDATED', 'COURSE_SUBMITTED', 'COURSE_RETRACTED'].includes(action)) {
      return 'bg-purple-50 text-purple-900 border-purple-200';
    }
    if (['QUIZ_CREATED', 'QUIZ_UPDATED', 'QUIZ_ATTEMPT_STARTED', 'QUIZ_ATTEMPT_SUBMITTED'].includes(action)) {
      return 'bg-amber-50 text-amber-900 border-amber-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-syne font-bold text-slate-900 text-lg">Immutable Platform Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger of authentication, course lifecycle, enrollment transitions, and assessment submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-[#FAF7EE] px-3 py-1.5 rounded-full border border-slate-200">
            {total} Total Audit Records
          </span>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
            title="Export filtered logs as CSV"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#111111] border border-[#111111]/20 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
            title="Export filtered logs as JSON"
          >
            <Download size={13} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Filters Bar */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#FAF7EE]/60 p-4 rounded-2xl border border-slate-200">
        
        {/* Action Filter */}
        <div className="sm:col-span-3 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-white text-xs font-medium rounded-xl p-2 border border-slate-200 outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">All Actions</option>
            <optgroup label="Authentication">
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="SESSION_REVOKED">SESSION_REVOKED</option>
            </optgroup>
            <optgroup label="Courses">
              <option value="COURSE_CREATED">COURSE_CREATED</option>
              <option value="COURSE_UPDATED">COURSE_UPDATED</option>
              <option value="COURSE_SUBMITTED">COURSE_SUBMITTED</option>
              <option value="COURSE_APPROVED">COURSE_APPROVED</option>
              <option value="COURSE_REJECTED">COURSE_REJECTED</option>
              <option value="COURSE_PUBLISHED">COURSE_PUBLISHED</option>
              <option value="COURSE_RETRACTED">COURSE_RETRACTED</option>
            </optgroup>
            <optgroup label="Enrollment">
              <option value="COURSE_ENROLLED">COURSE_ENROLLED</option>
              <option value="COURSE_DROPPED">COURSE_DROPPED</option>
              <option value="COURSE_COMPLETED">COURSE_COMPLETED</option>
            </optgroup>
            <optgroup label="Assessments">
              <option value="QUIZ_CREATED">QUIZ_CREATED</option>
              <option value="QUIZ_UPDATED">QUIZ_UPDATED</option>
              <option value="QUIZ_DELETED">QUIZ_DELETED</option>
              <option value="QUIZ_ATTEMPT_STARTED">QUIZ_ATTEMPT_STARTED</option>
              <option value="QUIZ_ATTEMPT_SUBMITTED">QUIZ_ATTEMPT_SUBMITTED</option>
            </optgroup>
            <optgroup label="Administration & Certs">
              <option value="CERTIFICATE_ISSUED">CERTIFICATE_ISSUED</option>
              <option value="USER_STATUS_CHANGED">USER_STATUS_CHANGED</option>
            </optgroup>
          </select>
        </div>

        {/* Role Filter */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Actor Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white text-xs font-medium rounded-xl p-2 border border-slate-200 outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
            <option value="anonymous">Anonymous</option>
          </select>
        </div>

        {/* Entity Type Filter */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Entity Type</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full bg-white text-xs font-medium rounded-xl p-2 border border-slate-200 outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">All Entities</option>
            <option value="auth">Auth</option>
            <option value="course">Course</option>
            <option value="enrollment">Enrollment</option>
            <option value="quiz">Quiz</option>
            <option value="certificate">Certificate</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Search */}
        <div className="sm:col-span-4 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Search Keyword</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, entity or ID…"
              className="w-full bg-white pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Submit / Reset */}
        <div className="sm:col-span-1 flex items-end gap-1">
          <button
            type="submit"
            className="w-full bg-[#111111] hover:bg-black text-white p-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Apply Search"
          >
            Go
          </button>
        </div>
      </form>

      {/* Audit Log Table */}
      {loading ? (
        <div className="space-y-2.5 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-slate-50 rounded-xl h-12 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-[#FAF7EE]/40 space-y-2">
          <Database size={28} className="text-slate-400 mx-auto" />
          <p className="font-syne font-bold text-sm text-slate-800">No Audit Logs Found</p>
          <p className="text-xs text-slate-500">No events matched the selected filter criteria.</p>
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-xs font-bold hover:bg-slate-50 transition-all mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Actor</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Entity</th>
                <th className="pb-3 px-3">Entity ID</th>
                <th className="pb-3 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const dateStr = new Date(log.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const actorName = log.actorId?.name || (log.actorRole === 'anonymous' ? 'Anonymous' : 'System');
                const actorEmail = log.actorId?.email || log.ipAddress || '—';

                return (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">{actorName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{actorEmail}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.actorRole === 'admin' ? 'bg-[#f3e8ff] text-purple-900 border border-purple-200' :
                        log.actorRole === 'instructor' ? 'bg-[#fff3c4] text-amber-900 border border-amber-200' :
                        log.actorRole === 'student' ? 'bg-[#d6ecff] text-sky-900 border border-sky-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] capitalize">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={log.entityId}>
                      {log.entityId || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          onClick={() => setSelectedPayload(log)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-100 text-[10px] font-bold transition-all shadow-2xs"
                        >
                          Inspect
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-600">
        <div>
          <span>Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{pages}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(page - 1)}
            disabled={page <= 1 || loading}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 rounded-xl bg-[#FAF7EE] font-bold text-slate-800 border border-slate-200">
            {page}
          </span>
          <button
            onClick={() => fetchLogs(page + 1)}
            disabled={page >= pages || loading}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Metadata Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] border-2 border-[#111111] max-w-lg w-full p-6 shadow-brutal-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-body">Audit Record Details</span>
                <h3 className="font-syne font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] border ${getActionBadgeClass(selectedPayload.action)}`}>
                    {selectedPayload.action}
                  </span>
                  <span>{selectedPayload.entityType}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Entity ID:</span>
                  <span className="text-slate-800 break-all">{selectedPayload.entityId || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">IP Address:</span>
                  <span className="text-slate-800">{selectedPayload.ipAddress || 'Internal/Local'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Sanitized Metadata Payload</span>
                <pre className="bg-[#111111] text-[#FFF490] p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed border border-black">
                  {JSON.stringify(selectedPayload.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPayload(null)}
                className="btn-dark-pill text-xs px-5 py-2"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Course Review Modal for Admins ───────────────────────────────────────────
function CourseReviewModal({ courseId, onClose, onActionSuccess }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api.get(`/courses/${courseId}`)
      .then(({ data }) => setCourseData(data))
      .catch(() => toast.error('Failed to load course details for review'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleStatusUpdate = async (status, reason) => {
    if (status === 'rejected' && (!reason || !reason.trim())) {
      toast.error('A rejection reason is required to explain what needs improvement.');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/admin/courses/${courseId}/status`, {
        status,
        reason: reason?.trim(),
      });
      toast.success(
        status === 'approved'
          ? 'Course approved successfully! Instructor can now publish.'
          : status === 'published'
          ? 'Course approved and published directly to catalog!'
          : 'Course rejected with feedback sent to instructor.'
      );
      onActionSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update course status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!courseId) return null;

  const course = courseData?.course;
  const modules = courseData?.modules || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-[2.5rem] border border-[#111111]/15 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#111111]/10 flex items-center justify-between bg-[#FAF7EE]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF490] border border-[#111111]/15 flex items-center justify-center text-[#111111]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Accreditation Review
              </span>
              <h2 className="font-syne font-bold text-lg text-slate-900 leading-tight">
                {course?.title || 'Course Verification'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#111111]/15 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={28} className="animate-spin text-slate-400 mx-auto" />
              <p className="text-slate-500 font-medium">Retrieving full curriculum hierarchy…</p>
            </div>
          ) : !course ? (
            <div className="py-12 text-center text-slate-500">Course could not be loaded.</div>
          ) : (
            <>
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7EE] p-4 rounded-2xl border border-[#111111]/10">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Instructor</span>
                  <p className="font-syne font-bold text-sm text-slate-900">{course.instructorId?.name || 'Faculty Member'}</p>
                  <p className="text-[11px] text-slate-500">{course.instructorId?.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Category & Level</span>
                  <p className="font-bold text-slate-800">{course.category || 'General'}</p>
                  <p className="text-[11px] text-slate-500">Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="font-syne font-bold text-slate-900 text-sm uppercase tracking-wider">Description</h3>
                <p className="text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Curriculum Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-syne font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Curriculum Content ({modules.length} Modules)
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} Lessons •{' '}
                    {modules.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0)} Quizzes
                  </span>
                </div>

                {modules.length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-amber-50 rounded-xl border border-amber-200">
                    ⚠ Warning: This course contains no modules.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {modules.map((mod, mi) => (
                      <div key={mod._id || mi} className="p-4 rounded-2xl border border-[#111111]/15 bg-white space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="font-syne font-bold text-slate-900 text-xs">
                            Module {mi + 1}: {mod.title}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">
                            {mod.lessons?.length || 0} lessons • {mod.quizzes?.length || 0} quizzes
                          </span>
                        </div>

                        {/* Lessons list */}
                        {mod.lessons?.length > 0 && (
                          <div className="space-y-1.5 pl-2 border-l-2 border-slate-100">
                            {mod.lessons.map((l, li) => (
                              <div key={l._id || li} className="flex items-center justify-between text-[11px] text-slate-700 py-0.5">
                                <span className="flex items-center gap-2">
                                  {l.type === 'video' ? <Video size={13} className="text-blue-500" /> : <FileText size={13} className="text-amber-500" />}
                                  <span>{l.title}</span>
                                </span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {l.type === 'video' ? `${Math.floor((l.durationSeconds || 0) / 60)}m` : l.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quizzes list */}
                        {mod.quizzes?.length > 0 && (
                          <div className="space-y-1 pl-2 border-l-2 border-amber-200">
                            {mod.quizzes.map((q, qi) => (
                              <div key={q._id || qi} className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50/60 px-2 py-1 rounded-lg">
                                <span className="flex items-center gap-1.5 font-semibold">
                                  <HelpCircle size={12} className="text-amber-600" />
                                  <span>{q.title}</span>
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Pass: {q.passingScore}% • {q.questionCount || 0} Qs • {q.timeLimitSeconds}s
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rejection input box if rejecting */}
              {rejecting && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-2 animate-fade-in">
                  <label className="text-[11px] font-bold text-rose-900 block">
                    Reason for Rejection / Modification Request (Required)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify exactly what changes are required before this course can be approved…"
                    className="w-full bg-white text-xs font-medium rounded-xl p-3 border border-rose-300 outline-none focus:border-rose-600 text-slate-900"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejecting(false)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading || !rejectionReason.trim()}
                      onClick={() => handleStatusUpdate('rejected', rejectionReason)}
                      className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#111111]/10 bg-[#FAF7EE]/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white border border-[#111111]/20 text-slate-700 text-xs font-bold hover:bg-[#FAF7EE] transition-all"
          >
            Close
          </button>

          {!rejecting && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs"
              >
                Reject Curriculum
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('approved')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
              >
                Approve (Allow Publish)
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('published')}
                disabled={actionLoading}
                className="btn-dark-pill text-xs px-5 py-2 shadow-xs"
              >
                <Sparkles size={13} />
                <span>Approve & Publish Live</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Dispatcher ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {user?.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : user?.role === 'instructor' ? (
          <InstructorDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </div>
    </div>
  );
}

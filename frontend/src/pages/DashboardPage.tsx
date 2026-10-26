import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle,
  Award,
  Compass,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  FileText,
  AlertCircle,
  Download,
  Calendar,
  Check,
  X,
  Loader2,
  Users,
  Eye,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Shield,
  UserCheck,
  UserX,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Send,
  CheckSquare,
  Sparkles,
  Bell,
  ArrowUpRight,
  GraduationCap,
  FileCheck,
  ShieldAlert,
  FileQuestion,
  Film,
  Camera,
  PlayCircle,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { getMediaUrl } from '../utils/media';
import { formatCourseTitle } from '../utils/courseFormatters';
import type { Course, Enrollment, CourseStudent, CourseAnalyticsData, QuizSubmission, Reel } from '../types/course';
import type { AuthUser } from '../types/auth';

// ── Refined Metric Card ──────────────────────────────────────────────────────
interface MetricStatCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const MetricStatCard: React.FC<MetricStatCardProps> = ({ label, value, sublabel, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-[#E7E2DA] p-5 shadow-subtle flex items-center justify-between gap-4">
    <div className="space-y-1">
      <p className="text-xs font-medium text-[#77736D] font-sans">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-sans font-bold text-2xl sm:text-3xl text-[#171717]">{value}</span>
        {sublabel && <span className="text-xs text-[#77736D]">{sublabel}</span>}
      </div>
    </div>
    <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center flex-shrink-0 text-[#202020]">
      <Icon size={18} className="text-[#171717]" />
    </div>
  </div>
);

// ── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'dropped'>('all');
  const [droppingCourseId, setDroppingCourseId] = useState<string | null>(null);
  const [reEnrollingCourseId, setReEnrollingCourseId] = useState<string | null>(null);
  const [claimingCourseId, setClaimingCourseId] = useState<string | null>(null);

  const fetchEnrollments = () => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleClaimCertificate = async (courseId: string) => {
    setClaimingCourseId(courseId);
    try {
      const { data } = await api.post(`/courses/${courseId}/complete`);
      toast.success('Congratulations! Official accredited certificate issued!');
      fetchEnrollments();
      if (data.enrollment?.certificateCode) {
        navigate(`/verify/${data.enrollment.certificateCode}`);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          'Could not claim certificate. Please ensure all video requirements and quizzes are completed.'
      );
    } finally {
      setClaimingCourseId(null);
    }
  };

  const handleDropCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to drop "${courseTitle}"? Your progress will be safely preserved.`)) {
      return;
    }
    setDroppingCourseId(courseId);
    try {
      await api.delete(`/courses/${courseId}/enroll`);
      toast.success(`Dropped "${courseTitle}".`);
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to drop course');
    } finally {
      setDroppingCourseId(null);
    }
  };

  const handleReEnroll = async (courseId: string, courseTitle: string) => {
    setReEnrollingCourseId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success(`Re-enrolled in "${courseTitle}". Progress restored.`);
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to re-enroll');
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
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal tracking-tight">
            Welcome back, {user?.name || 'Scholar'}
          </h1>
          <p className="text-sm text-[#77736D] mt-1 font-sans">
            Track your accredited curriculum progress, resume video modules, and access earned credentials.
          </p>
        </div>

        <Link to="/courses">
          <Button variant="primary" leftIcon={<Compass size={15} />}>
            Explore catalog
          </Button>
        </Link>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          label="Total enrolled"
          value={enrollments.length}
          sublabel="curricula"
          icon={BookOpen}
        />
        <MetricStatCard
          label="In progress"
          value={activeEnrollments.length}
          sublabel="active"
          icon={Clock}
        />
        <MetricStatCard
          label="Completed"
          value={completedEnrollments.length}
          sublabel="mastered"
          icon={CheckCircle}
        />
        <MetricStatCard
          label="Certificates"
          value={completedEnrollments.filter((e) => e.certificateCode).length}
          sublabel="verified"
          icon={Award}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Active Stream & Course Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Current Active Stream Hero */}
          {featuredCourse?.courseId && (
            <div className="bg-[#FAF8F4] rounded-2xl border border-[#E7E2DA] p-6 sm:p-7 relative overflow-hidden">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Active Course</Badge>
                  <span className="text-xs text-[#77736D] flex items-center gap-1">
                    <Clock size={12} className="text-[#6F8FA8]" /> Audited session
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#171717] leading-tight mb-2">
                    {formatCourseTitle(featuredCourse.courseId.title)}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#77736D] line-clamp-2 leading-relaxed">
                    {featuredCourse.courseId.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-[#77736D]">
                    <span>Curriculum progress</span>
                    <span className="font-semibold text-[#171717]">
                      {featuredCourse.progressPercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E7E2DA] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#171717] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${featuredCourse.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={`/courses/${featuredCourse.courseId._id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                      Resume curriculum
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Courses List Section with Tabs & Search */}
          <div className="bg-white rounded-2xl border border-[#E7E2DA] p-5 sm:p-6 shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E2DA]/60">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F6F2EC] p-1 rounded-xl">
                {(['all', 'active', 'completed', 'dropped'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-white text-[#171717] shadow-2xs'
                        : 'text-[#77736D] hover:text-[#171717]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Field */}
              <div className="w-full sm:w-56">
                <Input
                  placeholder="Filter courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={14} />}
                  className="py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Courses Roster */}
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-serif text-lg text-[#171717]">No courses found</h3>
                <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                  {searchQuery
                    ? 'No enrolled curriculum matches your filter query.'
                    : 'You have not enrolled in any courses in this category yet.'}
                </p>
                <Link to="/courses" className="inline-block pt-1">
                  <Button variant="secondary" size="sm">
                    Browse course catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E7E2DA]/60">
                {filtered.map((en) => {
                  const course = en.courseId;
                  if (!course) return null;
                  return (
                    <div
                      key={en._id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              en.status === 'completed'
                                ? 'published'
                                : en.status === 'active'
                                ? 'neutral'
                                : 'draft'
                            }
                          >
                            {en.status}
                          </Badge>
                          <span className="text-xs text-[#77736D]">{course.category || 'General'}</span>
                        </div>
                        <Link
                          to={`/courses/${course._id}`}
                          className="font-sans font-semibold text-[#171717] hover:text-[#6F8FA8] transition-colors block text-base"
                        >
                          {formatCourseTitle(course.title)}
                        </Link>
                        <div className="flex items-center gap-4 text-xs text-[#77736D]">
                          <span>Progress: {en.progressPercentage || 0}%</span>
                          {en.certificateCode ? (
                            <span className="text-[#556943] flex items-center gap-1 font-medium">
                              <Award size={12} /> Certificate ready
                            </span>
                          ) : en.isEligibleForCertificate ? (
                            <span className="text-[#556943] flex items-center gap-1 font-medium">
                              <Award size={12} /> Eligible for Certificate
                            </span>
                          ) : (en.progressPercentage || 0) >= 100 && (en.quizzesPassed || 0) < (en.totalQuizzes || 0) ? (
                            <span className="text-amber-600 flex items-center gap-1 font-medium">
                              <HelpCircle size={12} /> Assessment Required
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {en.status === 'dropped' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReEnroll(course._id, course.title)}
                            disabled={reEnrollingCourseId === course._id}
                            leftIcon={<RotateCcw size={13} />}
                          >
                            Re-enroll
                          </Button>
                        ) : (
                          <>
                            {en.certificateCode ? (
                              <Link to={`/verify/${en.certificateCode}`}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  leftIcon={<ShieldCheck size={13} className="text-[#556943]" />}
                                >
                                  Verify
                                </Button>
                              </Link>
                            ) : en.isEligibleForCertificate ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleClaimCertificate(course._id)}
                                disabled={claimingCourseId === course._id}
                                leftIcon={<Award size={13} />}
                              >
                                {claimingCourseId === course._id ? 'Issuing...' : 'Claim Certificate'}
                              </Button>
                            ) : (en.progressPercentage || 0) >= 100 && (en.quizzesPassed || 0) < (en.totalQuizzes || 0) ? (
                              <Link to={`/courses/${course._id}`}>
                                <Button variant="outline" size="sm" leftIcon={<HelpCircle size={13} />}>
                                  Take Quiz
                                </Button>
                              </Link>
                            ) : null}

                            <Link to={`/courses/${course._id}`}>
                              <Button variant="secondary" size="sm">
                                View
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleDropCourse(course._id, course.title)}
                              disabled={droppingCourseId === course._id}
                              className="text-xs text-[#77736D] hover:text-[#BE123C] px-2 py-1 transition-colors cursor-pointer"
                            >
                              Drop
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Secondary Panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Certificate Audit Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#777B61]" />
                <CardTitle className="text-base">Verified Credentials</CardTitle>
              </div>
              <CardDescription>
                Accredited certificates issued upon 90% video attendance and passed assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedEnrollments.length === 0 ? (
                <p className="text-xs text-[#77736D]">
                  Complete a curriculum to generate an immutable, cryptographic certificate.
                </p>
              ) : (
                <div className="space-y-3">
                  {completedEnrollments.map((e) => (
                    <div
                      key={e._id}
                      className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-[#171717] truncate">{formatCourseTitle(e.courseId?.title)}</p>
                        <p className="text-[#77736D] font-mono text-[11px] mt-0.5">{e.certificateCode}</p>
                      </div>
                      <Badge variant="published">Verified</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Learning Reels Feed Feature */}
          <div className="bg-gradient-to-br from-[#171717] to-[#2B2B2B] text-white rounded-2xl p-5 border border-[#3E3E3E] space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white flex items-center gap-1">
                <Sparkles size={11} className="text-[#A3B899]" /> LearnVerse Reels
              </span>
              <Film size={16} className="text-white/60" />
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-white">Micro-Learning Feed</h4>
              <p className="text-xs text-white/70 leading-relaxed mt-1">
                Revise core concepts from your curriculum in bite-sized vertical video reels with interactive knowledge checks.
              </p>
            </div>
            <Link to="/reels" className="block pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white text-[#171717] hover:bg-[#FAF8F4] border-white font-semibold flex items-center justify-center gap-1.5"
              >
                <PlayCircle size={14} /> Open Reels Feed
              </Button>
            </Link>
          </div>

          {/* Academic Milestone Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Guidelines</CardTitle>
              <CardDescription>
                Requirements for automatic module validation and completion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-xs text-[#77736D]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                  <span>Watch time is securely audited on server updates (90% minimum).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                  <span>Quizzes feature client-side tab monitoring and automated submission.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                  <span>Dropping a course preserves your historical progress indefinitely.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Instructor Dashboard ─────────────────────────────────────────────────────
function InstructorDashboard({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curricula' | 'roster' | 'analytics' | 'assessments' | 'notifications' | 'reels'>('curricula');

  // Filters for Curricula tab
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'approved' | 'under_review' | 'draft' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Roster Tab state
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState<string>('');
  const [rosterStudents, setRosterStudents] = useState<CourseStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<string>('all');

  // Analytics Tab state
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<CourseAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Assessments Tab state
  const [selectedCourseForAssessments, setSelectedCourseForAssessments] = useState<string>('');
  const [courseModulesWithQuizzes, setCourseModulesWithQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [quizSubmissionsLoading, setQuizSubmissionsLoading] = useState(false);

  // Learning Reels Tab state
  const [selectedCourseForReels, setSelectedCourseForReels] = useState<string>('');
  const [courseReels, setCourseReels] = useState<Reel[]>([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [generatingReels, setGeneratingReels] = useState(false);
  const [previewReel, setPreviewReel] = useState<Reel | null>(null);

  // Exam Integrity Review Modal state
  const [reviewingSubmission, setReviewingSubmission] = useState<QuizSubmission | null>(null);
  const [reviewStatusInput, setReviewStatusInput] = useState<'pending_review' | 'cleared' | 'flagged' | 'verified'>('pending_review');
  const [instructorNotesInput, setInstructorNotesInput] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Notifications Tab state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');

  // Modals state
  const [rejectionModalCourse, setRejectionModalCourse] = useState<Course | null>(null);
  const [confirmSubmitModalCourse, setConfirmSubmitModalCourse] = useState<Course | null>(null);
  const [confirmDeleteModalCourse, setConfirmDeleteModalCourse] = useState<Course | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    api.get('/courses?studio=true')
      .then(({ data }) => {
        const all: Course[] = data.courses || [];
        const myCourses = all.filter((c) => {
          const instructor = typeof c.instructorId === 'object' ? c.instructorId?._id : c.instructorId;
          return instructor === user._id;
        });
        setCourses(myCourses);
        // Set default selected courses for secondary tabs if available
        if (myCourses.length > 0) {
          if (!selectedCourseForRoster) setSelectedCourseForRoster(myCourses[0]._id);
          if (!selectedCourseForAnalytics) setSelectedCourseForAnalytics(myCourses[0]._id);
          if (!selectedCourseForAssessments) setSelectedCourseForAssessments(myCourses[0]._id);
          if (!selectedCourseForReels) setSelectedCourseForReels(myCourses[0]._id);
        }
      })
      .catch(() => toast.error('Failed to load courses.'))
      .finally(() => setLoading(false));
  };

  const fetchNotifications = () => {
    setNotificationsLoading(true);
    api.get('/notifications')
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setNotificationsLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, []);

  // Fetch Roster when selected course changes or tab activates
  useEffect(() => {
    if (activeTab === 'roster' && selectedCourseForRoster) {
      setRosterLoading(true);
      api.get(`/courses/${selectedCourseForRoster}/analytics`)
        .then(({ data }) => {
          setRosterStudents(data.analytics?.students || []);
        })
        .catch(() => {
          // Fallback to /courses/:id/students
          api.get(`/courses/${selectedCourseForRoster}/students`)
            .then(({ data }) => {
              const mapped = (data.students || []).map((s: any) => ({
                _id: s.studentId?._id || s._id,
                name: s.studentId?.name || 'Enrolled Student',
                email: s.studentId?.email || '',
                enrolledAt: s.enrolledAt,
                status: s.status || 'active',
                progressPercent: s.progressPercentage || 0,
                lessonsCompleted: 0,
                certificateCode: s.certificateCode,
              }));
              setRosterStudents(mapped);
            })
            .catch(() => setRosterStudents([]));
        })
        .finally(() => setRosterLoading(false));
    }
  }, [selectedCourseForRoster, activeTab]);

  // Fetch Analytics when selected course changes or tab activates
  useEffect(() => {
    if (activeTab === 'analytics' && selectedCourseForAnalytics) {
      setAnalyticsLoading(true);
      api.get(`/courses/${selectedCourseForAnalytics}/analytics`)
        .then(({ data }) => {
          setAnalyticsData(data.analytics || null);
        })
        .catch((err: any) => {
          toast.error(err.response?.data?.error || 'Failed to load course analytics.');
          setAnalyticsData(null);
        })
        .finally(() => setAnalyticsLoading(false));
    }
  }, [selectedCourseForAnalytics, activeTab]);

  // Fetch Course Quizzes when selected course for assessments changes
  useEffect(() => {
    if (activeTab === 'assessments' && selectedCourseForAssessments) {
      api.get(`/courses/${selectedCourseForAssessments}`)
        .then(({ data }) => {
          const modules = data.modules || [];
          setCourseModulesWithQuizzes(modules);
          // Find first module with quiz
          const moduleWithQuiz = modules.find((m: any) => m.quiz);
          if (moduleWithQuiz && moduleWithQuiz.quiz) {
            setSelectedQuiz(moduleWithQuiz.quiz);
            loadQuizSubmissions(moduleWithQuiz.quiz._id);
          } else {
            setSelectedQuiz(null);
            setQuizSubmissions([]);
          }
        })
        .catch(() => {
          setCourseModulesWithQuizzes([]);
          setSelectedQuiz(null);
          setQuizSubmissions([]);
        });
    }
  }, [selectedCourseForAssessments, activeTab]);

  // Fetch Reels when selected course changes or tab activates
  useEffect(() => {
    if (activeTab === 'reels' && selectedCourseForReels) {
      loadCourseReels(selectedCourseForReels);
    }
  }, [selectedCourseForReels, activeTab]);

  const loadCourseReels = (courseId: string) => {
    setReelsLoading(true);
    api.get(`/reels/courses/${courseId}`)
      .then(({ data }) => {
        setCourseReels(data.reels || []);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.error || 'Failed to load reels');
        setCourseReels([]);
      })
      .finally(() => setReelsLoading(false));
  };

  const handleGenerateReels = async (courseId: string) => {
    setGeneratingReels(true);
    try {
      const { data } = await api.post(`/reels/courses/${courseId}/generate`);
      toast.success(data.message || 'AI Reels generated from curriculum!');
      loadCourseReels(courseId);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate reels');
    } finally {
      setGeneratingReels(false);
    }
  };

  const handleTogglePublishReel = async (reelId: string, currentPublished: boolean) => {
    try {
      const { data } = await api.patch(`/reels/${reelId}`, { isPublished: !currentPublished });
      toast.success(data.reel?.isPublished ? 'Reel published to feed' : 'Reel unpublished to draft');
      setCourseReels((prev) => prev.map((r) => (r._id === reelId ? data.reel : r)));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update reel');
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    if (!window.confirm('Delete this learning reel?')) return;
    try {
      await api.delete(`/reels/${reelId}`);
      toast.success('Reel deleted');
      setCourseReels((prev) => prev.filter((r) => r._id !== reelId));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete reel');
    }
  };

  const openReviewModal = (sub: QuizSubmission) => {
    setReviewingSubmission(sub);
    setReviewStatusInput(sub.reviewStatus || 'pending_review');
    setInstructorNotesInput(sub.instructorNotes || '');
  };

  const handleSaveReview = async () => {
    if (!reviewingSubmission) return;
    setIsSavingReview(true);
    try {
      const { data } = await api.patch(`/quizzes/attempts/${reviewingSubmission._id}/review`, {
        reviewStatus: reviewStatusInput,
        instructorNotes: instructorNotesInput,
      });
      toast.success('Integrity review updated successfully');
      setQuizSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === reviewingSubmission._id
            ? {
                ...sub,
                reviewStatus: data.attempt?.reviewStatus || reviewStatusInput,
                instructorNotes: data.attempt?.instructorNotes || instructorNotesInput,
              }
            : sub
        )
      );
      setReviewingSubmission(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save review');
    } finally {
      setIsSavingReview(false);
    }
  };

  const loadQuizSubmissions = (quizId: string) => {
    setQuizSubmissionsLoading(true);
    api.get(`/quizzes/${quizId}/submissions`)
      .then(({ data }) => {
        setQuizSubmissions(data.submissions || []);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.error || 'Failed to load quiz submissions.');
        setQuizSubmissions([]);
      })
      .finally(() => setQuizSubmissionsLoading(false));
  };

  const handleRetractCourse = async (courseId: string) => {
    if (!window.confirm('Retract this course submission back to draft? It will be removed from the review queue.')) return;
    try {
      await api.post(`/courses/${courseId}/retract`);
      toast.success('Course retracted to draft.');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to retract course');
    }
  };

  const handleSubmitCourse = async (courseId: string) => {
    setIsActionLoading(true);
    try {
      await api.post(`/courses/${courseId}/submit`);
      toast.success('Course submitted for administrative review.');
      setConfirmSubmitModalCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit course for review');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    setIsActionLoading(true);
    try {
      await api.post(`/courses/${courseId}/publish`);
      toast.success('Course successfully published to catalog!');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Publishing failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateRevision = async (courseId: string) => {
    if (!window.confirm('Create a new draft revision of this published course? Active learners will continue uninterrupted on the published version until your revision is approved.')) return;
    try {
      const { data } = await api.post(`/courses/${courseId}/revision`);
      toast.success(data.message || 'Draft revision created.');
      navigate(`/instructor/courses/${data.revisionCourse._id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create revision');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsActionLoading(true);
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted.');
      setConfirmDeleteModalCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete course');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark notification read');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all notifications read');
    }
  };

  const handleExportRosterCSV = () => {
    if (filteredRosterStudents.length === 0) {
      toast.error('No students to export.');
      return;
    }
    const currentCourse = courses.find((c) => c._id === selectedCourseForRoster);
    const headers = ['Student Name', 'Email', 'Enrollment Status', 'Progress (%)', 'Lessons Completed', 'Quiz Avg (%)', 'Enrolled Date', 'Certificate Code'];
    const rows = filteredRosterStudents.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      s.status || 'active',
      s.progressPercent ?? 0,
      s.lessonsCompleted ?? 0,
      s.quizAverage !== undefined ? s.quizAverage : 'N/A',
      s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A',
      s.certificateCode || 'None',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roster-${currentCourse?.title?.replace(/\s+/g, '_') || 'course'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roster CSV downloaded.');
  };

  // Metrics calculation
  const published = courses.filter((c) => c.status === 'published').length;
  const approved = courses.filter((c) => c.status === 'approved').length;
  const pending = courses.filter((c) => c.status === 'under_review').length;
  const drafts = courses.filter((c) => c.status === 'draft').length;
  const rejected = courses.filter((c) => c.status === 'rejected').length;
  const totalEnrolled = courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0);
  const latestDraft = courses.find((c) => c.status === 'draft');

  // Filtered Curricula
  const filteredCourses = courses.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Roster Students
  const filteredRosterStudents = rosterStudents.filter((s) => {
    const matchesStatus = rosterStatusFilter === 'all' || s.status === rosterStatusFilter;
    const matchesSearch = rosterSearch.trim() === '' ||
      s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(rosterSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ── Studio Header & Navigation ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E2DA] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal tracking-tight">
              Instructor Studio
            </h1>
            <Badge variant="published" className="text-[11px] uppercase tracking-wider font-semibold">
              Faculty Workspace
            </Badge>
          </div>
          <p className="text-sm text-[#77736D] mt-1.5 font-sans">
            Author modular curricula, manage media assets, supervise cohort progress, and review assessment metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {latestDraft && (
            <Link to={`/instructor/courses/${latestDraft._id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={<FileText size={14} />}>
                Resume draft: {latestDraft.title.length > 20 ? `${latestDraft.title.slice(0, 20)}...` : latestDraft.title}
              </Button>
            </Link>
          )}
          <Link to="/instructor/courses/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle size={15} />}>
              Create curriculum
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Real Key Metrics Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricStatCard label="Total Authored" value={courses.length} icon={BookOpen} />
        <MetricStatCard label="Published Live" value={published} icon={CheckCircle} />
        <MetricStatCard label="Under Review" value={pending} icon={Clock} />
        <MetricStatCard label="Draft Revisions" value={drafts} icon={Layers} />
        <MetricStatCard label="Enrolled Learners" value={totalEnrolled} icon={Users} />
        <MetricStatCard label="Needs Attention" value={rejected} icon={AlertTriangle} />
      </div>

      {/* ── Studio Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-[#E7E2DA] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('curricula')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'curricula'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <BookOpen size={15} />
          <span>Authored Curricula</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-[#F6F2EC] rounded-full text-[#77736D]">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'roster'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <Users size={15} />
          <span>Learner Roster & Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <BarChart3 size={15} />
          <span>Performance & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'assessments'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <CheckSquare size={15} />
          <span>Quizzes & Submissions</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <Bell size={15} />
          <span>Teaching Alerts</span>
          {unreadCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 bg-[#BE123C] text-white rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'reels'
              ? 'border-[#171717] text-[#171717]'
              : 'border-transparent text-[#77736D] hover:text-[#171717]'
          }`}
        >
          <Film size={15} />
          <span>Learning Reels Studio</span>
        </button>
      </div>

      {/* ── TAB 1: AUTHORED CURRICULA & LIFECYCLE ────────────────────────── */}
      {activeTab === 'curricula' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Curriculum Management</CardTitle>
                  <CardDescription>
                    Track review workflows, update course materials, and manage versioned releases.
                  </CardDescription>
                </div>
                <Link to="/instructor/courses/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle size={14} />}>
                    New course
                  </Button>
                </Link>
              </div>

              {/* Status and Search Controls */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-[#E7E2DA]/60 mt-3">
                <div className="flex items-center gap-1.5 bg-[#F6F2EC] p-1 rounded-xl overflow-x-auto">
                  {(
                    [
                      { key: 'all', label: 'All Curricula', count: courses.length },
                      { key: 'published', label: 'Published', count: published },
                      { key: 'approved', label: 'Approved', count: approved },
                      { key: 'under_review', label: 'Under Review', count: pending },
                      { key: 'draft', label: 'Drafts', count: drafts },
                      { key: 'rejected', label: 'Needs Revisions', count: rejected },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStatusFilter(t.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === t.key
                          ? 'bg-white text-[#171717] shadow-2xs'
                          : 'text-[#77736D] hover:text-[#171717]'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">({t.count})</span>
                    </button>
                  ))}
                </div>

                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search by title, tag, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search size={14} />}
                    className="py-1.5 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                  <p className="text-xs text-[#77736D]">Loading authored curricula...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-serif text-lg text-[#171717]">No curricula match criteria</h3>
                  <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No courses matched your current filter and search query.'
                      : 'You have not authored any courses yet. Launch your first course to begin teaching.'}
                  </p>
                  <Link to="/instructor/courses/new" className="inline-block pt-1">
                    <Button variant="secondary" size="sm">
                      Create your first curriculum
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E2DA]/70">
                  {filteredCourses.map((c) => (
                    <div
                      key={c._id}
                      className="py-4.5 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF8F4]/40 transition-colors p-2 rounded-xl"
                    >
                      {/* Left: Thumbnail & Course Meta */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {c.thumbnail ? (
                          <img
                            src={getMediaUrl(c.thumbnail)}
                            alt={c.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#E7E2DA] flex-shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.thumbnail-fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center flex-shrink-0 text-[#A99B8A] ${
                            c.thumbnail ? 'hidden thumbnail-fallback' : ''
                          }`}
                        >
                          <BookOpen size={24} />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-[#77736D] uppercase tracking-wider">
                              {c.category}
                            </span>
                            <span className="text-[#E7E2DA]">•</span>
                            <span className="text-[11px] text-[#77736D] font-mono">
                              v{c.version || 1}.0
                            </span>
                            {c.level && (
                              <>
                                <span className="text-[#E7E2DA]">•</span>
                                <span className="text-[11px] text-[#77736D]">{c.level}</span>
                              </>
                            )}
                            <Badge
                              variant={
                                c.status === 'published'
                                  ? 'published'
                                  : c.status === 'under_review'
                                  ? 'pending'
                                  : c.status === 'rejected'
                                  ? 'rejected'
                                  : 'draft'
                              }
                              className="text-[10px]"
                            >
                              {c.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#171717] line-clamp-1">
                            {c.title}
                          </h3>

                          <p className="text-xs text-[#77736D] line-clamp-1 max-w-xl">
                            {c.description}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-[#77736D]">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{c.studentsEnrolled || 0} enrolled</span>
                            </span>
                            <span>•</span>
                            <span>Updated {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'recently'}</span>
                          </div>

                          {/* Rejection notice banner if status is rejected */}
                          {c.status === 'rejected' && c.rejectionReason && (
                            <div className="mt-2 p-2.5 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-start gap-2 text-xs text-[#BE123C]">
                              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-[#BE123C]" />
                              <div>
                                <span className="font-semibold">Review feedback: </span>
                                <span>{c.rejectionReason}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Lifecycle & Builder Actions */}
                      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap justify-end pt-2 lg:pt-0">
                        <Link to={`/courses/${c._id}`} target="_blank">
                          <Button variant="ghost" size="sm" leftIcon={<Eye size={13} />}>
                            Preview
                          </Button>
                        </Link>

                        <Link to={`/instructor/courses/${c._id}/edit`}>
                          <Button variant="secondary" size="sm" leftIcon={<FileText size={13} />}>
                            Curriculum Editor
                          </Button>
                        </Link>

                        {c.status === 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Check size={13} />}
                            onClick={() => handlePublishCourse(c._id)}
                            className="bg-[#556943] hover:bg-[#435334] text-white"
                          >
                            Publish
                          </Button>
                        )}

                        {c.status === 'draft' && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Send size={13} />}
                            onClick={() => setConfirmSubmitModalCourse(c)}
                          >
                            Submit
                          </Button>
                        )}

                        {c.status === 'rejected' && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Send size={13} />}
                            onClick={() => setConfirmSubmitModalCourse(c)}
                          >
                            Resubmit
                          </Button>
                        )}

                        {c.status === 'under_review' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RotateCcw size={13} />}
                            onClick={() => handleRetractCourse(c._id)}
                          >
                            Retract
                          </Button>
                        )}

                        {c.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RefreshCw size={13} />}
                            onClick={() => handleCreateRevision(c._id)}
                          >
                            New Revision
                          </Button>
                        )}

                        {(c.status === 'draft' || c.status === 'rejected') && (
                          <button
                            onClick={() => setConfirmDeleteModalCourse(c)}
                            title="Delete draft course"
                            className="p-2 text-[#77736D] hover:text-[#BE123C] hover:bg-[#FFF1F2] rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: LEARNER ROSTER & PROGRESS ────────────────────────────── */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Student Roster & Cohort Progress</CardTitle>
                  <CardDescription>
                    Monitor learner engagement, milestone completions, and issued credentials across your curricula.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    onClick={handleExportRosterCSV}
                    disabled={filteredRosterStudents.length === 0}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Course Selector and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-[#E7E2DA]/60 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#77736D] mb-1">
                    Select Curriculum
                  </label>
                  <select
                    value={selectedCourseForRoster}
                    onChange={(e) => setSelectedCourseForRoster(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.studentsEnrolled || 0} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#77736D] mb-1">
                    Search Student
                  </label>
                  <Input
                    placeholder="Search name or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    leftIcon={<Search size={14} />}
                    className="py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#77736D] mb-1">
                    Enrollment Status
                  </label>
                  <select
                    value={rosterStatusFilter}
                    onChange={(e) => setRosterStatusFilter(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active learners</option>
                    <option value="completed">Completed students</option>
                    <option value="dropped">Dropped students</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {rosterLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                  <p className="text-xs text-[#77736D]">Loading cohort roster...</p>
                </div>
              ) : filteredRosterStudents.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                    <Users size={20} />
                  </div>
                  <h3 className="font-serif text-lg text-[#171717]">No enrolled students found</h3>
                  <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                    {rosterSearch || rosterStatusFilter !== 'all'
                      ? 'No students match your filter criteria.'
                      : 'No students have enrolled in this curriculum yet. As learners join, their progress will appear here in real time.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#E7E2DA] text-[#77736D] font-semibold">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Enrolled Date</th>
                        <th className="pb-3 font-medium">Curriculum Progress</th>
                        <th className="pb-3 font-medium">Lessons Completed</th>
                        <th className="pb-3 font-medium">Assessment Avg</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2DA]/60">
                      {filteredRosterStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                {s.name ? s.name.charAt(0) : 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-[#171717]">{s.name}</p>
                                <p className="text-[11px] text-[#77736D]">{s.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 text-[#77736D]">
                            {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-3.5 min-w-[140px] pr-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-[#77736D]">
                                <span>{s.progressPercent || 0}%</span>
                              </div>
                              <div className="w-full bg-[#E7E2DA] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    s.progressPercent === 100
                                      ? 'bg-[#15803D]'
                                      : 'bg-[#171717]'
                                  }`}
                                  style={{ width: `${s.progressPercent || 0}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 text-[#171717] font-semibold">
                            {s.lessonsCompleted || 0}
                          </td>

                          <td className="py-3.5 text-[#77736D]">
                            {s.quizAverage !== undefined ? (
                              <span className="font-semibold text-[#171717]">{s.quizAverage}%</span>
                            ) : (
                              <span className="text-[#A99B8A]">N/A</span>
                            )}
                          </td>

                          <td className="py-3.5">
                            <Badge
                              variant={
                                s.status === 'completed'
                                  ? 'published'
                                  : s.status === 'active'
                                  ? 'pending'
                                  : 'draft'
                              }
                            >
                              {s.status}
                            </Badge>
                          </td>

                          <td className="py-3.5 text-right font-mono text-[11px]">
                            {s.certificateCode ? (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(s.certificateCode!);
                                  toast.success('Certificate code copied');
                                }}
                                className="inline-flex items-center gap-1 text-[#171717] hover:text-[#777B61] bg-[#F6F2EC] px-2 py-1 rounded border border-[#E7E2DA] transition-colors cursor-pointer"
                                title="Click to copy certificate code"
                              >
                                <Award size={12} className="text-[#777B61]" />
                                <span>{s.certificateCode}</span>
                                <Copy size={10} className="text-[#A99B8A]" />
                              </button>
                            ) : (
                              <span className="text-[#A99B8A]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 3: COURSE ANALYTICS & INSIGHTS ──────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Curriculum Analytics & Metrics</CardTitle>
                  <CardDescription>
                    Real completion rates, assessment scoring distributions, and milestone metrics.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-72">
                  <select
                    value={selectedCourseForAnalytics}
                    onChange={(e) => setSelectedCourseForAnalytics(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {analyticsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                  <p className="text-xs text-[#77736D]">Computing real curriculum metrics...</p>
                </div>
              ) : !analyticsData ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-sm text-[#77736D]">Select a curriculum to view analytics.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <MetricStatCard
                      label="Enrolled Students"
                      value={analyticsData.metrics.totalEnrolled}
                      icon={Users}
                    />
                    <MetricStatCard
                      label="Active In-Flight"
                      value={analyticsData.metrics.activeLearners}
                      icon={Activity}
                    />
                    <MetricStatCard
                      label="Completion Rate"
                      value={`${analyticsData.metrics.completionRate}%`}
                      icon={Award}
                    />
                    <MetricStatCard
                      label="Avg Progress"
                      value={`${analyticsData.metrics.avgCourseProgress}%`}
                      icon={TrendingUp}
                    />
                    <MetricStatCard
                      label="Avg Assessment"
                      value={analyticsData.metrics.avgQuizScore ? `${analyticsData.metrics.avgQuizScore}%` : 'N/A'}
                      icon={CheckSquare}
                    />
                  </div>

                  {/* Progress Distribution Visualizer */}
                  <div className="bg-[#FAF8F4] border border-[#E7E2DA] rounded-2xl p-5 space-y-4">
                    <h3 className="font-serif text-base text-[#171717] font-semibold">
                      Student Progress Distribution
                    </h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { label: '0% – 25% (Getting Started)', min: 0, max: 25, color: 'bg-zinc-400' },
                        { label: '26% – 50% (Underway)', min: 26, max: 50, color: 'bg-amber-500' },
                        { label: '51% – 75% (Advanced)', min: 51, max: 75, color: 'bg-blue-600' },
                        { label: '76% – 100% (Completed / Finalizing)', min: 76, max: 100, color: 'bg-[#15803D]' },
                      ].map((tier) => {
                        const count = analyticsData.students.filter(
                          (s) => s.progressPercent >= tier.min && s.progressPercent <= tier.max
                        ).length;
                        const pct = analyticsData.metrics.totalEnrolled > 0
                          ? Math.round((count / analyticsData.metrics.totalEnrolled) * 100)
                          : 0;
                        return (
                          <div key={tier.label} className="space-y-1">
                            <div className="flex justify-between text-[#77736D]">
                              <span>{tier.label}</span>
                              <span className="font-semibold text-[#171717]">
                                {count} students ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#E7E2DA] rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${tier.color} transition-all duration-300`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modules & Assessments Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-base text-[#171717] font-semibold">
                      Curriculum Structure & Milestones
                    </h3>
                    <div className="divide-y divide-[#E7E2DA] border border-[#E7E2DA] rounded-2xl bg-white overflow-hidden text-xs">
                      {analyticsData.moduleProgress.map((m, idx) => (
                        <div key={m.moduleId} className="p-4 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-[#77736D] tracking-wider">
                              Module {idx + 1}
                            </span>
                            <p className="font-semibold text-[#171717] text-sm">{m.title}</p>
                            <p className="text-[#77736D]">{m.lessonsCount} lessons attached</p>
                          </div>
                          <div className="text-right">
                            {m.quiz ? (
                              <div className="space-y-0.5">
                                <Badge variant="published" className="text-[10px]">
                                  Assessment Enabled
                                </Badge>
                                <p className="text-[11px] text-[#77736D]">
                                  Passing score: {m.quiz.passingScore}%
                                </p>
                              </div>
                            ) : (
                              <Badge variant="draft" className="text-[10px]">
                                No Quiz Attached
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 4: ASSESSMENTS & SUBMISSIONS ────────────────────────────── */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Assessment & Quiz Performance</CardTitle>
                  <CardDescription>
                    Review student examination attempts, passing rates, and anti-cheat tab violation telemetry.
                  </CardDescription>
                </div>

                <div className="w-full sm:w-72">
                  <select
                    value={selectedCourseForAssessments}
                    onChange={(e) => setSelectedCourseForAssessments(e.target.value)}
                    className="w-full bg-[#FAF8F4] border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Module Quiz Selector pills */}
              <div className="pt-4 border-t border-[#E7E2DA]/60 mt-3 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-[#77736D] font-semibold flex-shrink-0">
                  Select Quiz:
                </span>
                {courseModulesWithQuizzes.filter((m) => m.quiz).length === 0 ? (
                  <span className="text-xs text-[#77736D] italic">
                    No quizzes attached to any module in this curriculum.
                  </span>
                ) : (
                  courseModulesWithQuizzes
                    .filter((m) => m.quiz)
                    .map((m) => (
                      <button
                        key={m.quiz._id}
                        onClick={() => {
                          setSelectedQuiz(m.quiz);
                          loadQuizSubmissions(m.quiz._id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedQuiz?._id === m.quiz._id
                            ? 'bg-[#171717] text-white shadow-2xs'
                            : 'bg-[#F6F2EC] text-[#77736D] hover:text-[#171717]'
                        }`}
                      >
                        {m.quiz.title || m.title}
                      </button>
                    ))
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!selectedQuiz ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                    <CheckSquare size={20} />
                  </div>
                  <h3 className="font-serif text-lg text-[#171717]">No assessment selected</h3>
                  <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                    Add assessments to your course modules using the Curriculum Editor to review learner attempts.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quiz Configuration Summary Bar */}
                  <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-[#171717] text-sm">{selectedQuiz.title}</p>
                      <p className="text-[#77736D] mt-0.5">
                        {selectedQuiz.questions?.length || 0} questions configured
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[#77736D]">
                      <div>
                        <span className="font-semibold text-[#171717]">{selectedQuiz.passingScore || 70}%</span> passing benchmark
                      </div>
                      <span>•</span>
                      <div>
                        <span className="font-semibold text-[#171717]">
                          {selectedQuiz.timeLimitSeconds ? `${Math.round(selectedQuiz.timeLimitSeconds / 60)} min` : 'Untimed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submissions Table */}
                  {quizSubmissionsLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3">
                      <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                      <p className="text-xs text-[#77736D]">Loading student submissions...</p>
                    </div>
                  ) : quizSubmissions.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <p className="font-serif text-base text-[#171717]">No student attempts yet</p>
                      <p className="text-xs text-[#77736D]">
                        As enrolled students take this assessment, their scored attempts and anti-cheat telemetry will be recorded here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-[#E7E2DA] text-[#77736D] font-semibold">
                            <th className="pb-3 font-medium">Student</th>
                            <th className="pb-3 font-medium">Score</th>
                            <th className="pb-3 font-medium">Proctoring Mode</th>
                            <th className="pb-3 font-medium">Integrity Signals</th>
                            <th className="pb-3 font-medium">Review Status</th>
                            <th className="pb-3 font-medium">Mode</th>
                            <th className="pb-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E2DA]/60">
                          {quizSubmissions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                              <td className="py-3.5 pr-4">
                                <p className="font-semibold text-[#171717]">{sub.student?.name || 'Student'}</p>
                                <p className="text-[11px] text-[#77736D]">{sub.student?.email || ''}</p>
                              </td>

                              <td className="py-3.5 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#171717]">{sub.score}%</span>
                                  <Badge variant={sub.passed ? 'published' : 'rejected'}>
                                    {sub.passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                </div>
                              </td>

                              <td className="py-3.5 pr-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {sub.isProctored ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF8F4] border border-[#E7E2DA] text-[#171717]">
                                      <Shield size={10} className="text-[#6F8FA8]" /> Proctored
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-[#77736D]">Standard</span>
                                  )}
                                  {sub.requireCamera && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F6F2EC] text-[#171717]">
                                      <Camera size={10} /> Cam
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 pr-4">
                                <div className="space-y-1">
                                  {sub.tabViolations > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[#BE123C] font-semibold">
                                      <ShieldAlert size={12} />
                                      <span>{sub.tabViolations} tab exit{sub.tabViolations > 1 ? 's' : ''}</span>
                                    </span>
                                  ) : null}
                                  {(sub.cameraViolations || 0) > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[#BE123C] font-semibold ml-2">
                                      <Camera size={12} />
                                      <span>{sub.cameraViolations} cam issue{(sub.cameraViolations || 0) > 1 ? 's' : ''}</span>
                                    </span>
                                  ) : null}
                                  {sub.tabViolations === 0 && (!sub.cameraViolations || sub.cameraViolations === 0) && (
                                    <span className="text-[#15803D] font-semibold flex items-center gap-1">
                                      <ShieldCheck size={12} /> Clean session
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 pr-4">
                                <Badge
                                  variant={
                                    sub.reviewStatus === 'cleared'
                                      ? 'published'
                                      : sub.reviewStatus === 'flagged'
                                      ? 'rejected'
                                      : sub.reviewStatus === 'verified'
                                      ? 'neutral'
                                      : 'pending'
                                  }
                                >
                                  {sub.reviewStatus === 'cleared'
                                    ? 'Cleared'
                                    : sub.reviewStatus === 'flagged'
                                    ? 'Flagged'
                                    : sub.reviewStatus === 'verified'
                                    ? 'Verified'
                                    : 'Pending Review'}
                                </Badge>
                              </td>

                              <td className="py-3.5 pr-4 text-[#77736D]">
                                {sub.autoSubmitted ? (
                                  <span className="text-amber-700 font-medium text-[11px]">
                                    Auto: {sub.autoSubmitReason || 'Policy'}
                                  </span>
                                ) : (
                                  <span className="text-[11px]">Normal</span>
                                )}
                              </td>

                              <td className="py-3.5 text-right">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openReviewModal(sub)}
                                  leftIcon={<Eye size={12} />}
                                >
                                  Audit & Review
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 5: TEACHING NOTIFICATIONS & FEEDBACK ────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Teaching Alerts & Editorial Notifications</CardTitle>
                  <CardDescription>
                    Administrative curriculum review feedback, student milestone completions, and lifecycle alerts.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMarkAllNotificationsRead}
                      leftIcon={<Check size={14} />}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#E7E2DA]/60 mt-3">
                <button
                  onClick={() => setNotificationFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    notificationFilter === 'all'
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F6F2EC] text-[#77736D] hover:text-[#171717]'
                  }`}
                >
                  All Alerts ({notifications.length})
                </button>
                <button
                  onClick={() => setNotificationFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    notificationFilter === 'unread'
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F6F2EC] text-[#77736D] hover:text-[#171717]'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {notificationsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                  <p className="text-xs text-[#77736D]">Fetching teaching notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                    <Bell size={20} />
                  </div>
                  <h3 className="font-serif text-lg text-[#171717]">No alerts right now</h3>
                  <p className="text-xs text-[#77736D]">
                    {notificationFilter === 'unread'
                      ? 'You have caught up with all unread teaching alerts.'
                      : 'You do not have any teaching notifications yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((n) => {
                    const isRejected = n.type === 'COURSE_REJECTED';
                    const isApproved = n.type === 'COURSE_APPROVED';
                    return (
                      <div
                        key={n._id}
                        className={`p-4 rounded-xl border transition-all ${
                          !n.read
                            ? 'bg-white border-[#171717]/20 shadow-subtle'
                            : 'bg-[#FAF8F4]/60 border-[#E7E2DA]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  isApproved
                                    ? 'published'
                                    : isRejected
                                    ? 'rejected'
                                    : 'draft'
                                }
                                className="text-[10px]"
                              >
                                {n.type.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-[11px] text-[#77736D]">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <p className="font-semibold text-sm text-[#171717]">{n.title}</p>
                            <p className="text-xs text-[#77736D] leading-relaxed">{n.message}</p>

                            {/* Rejection reason callout */}
                            {isRejected && n.metadata?.rejectionReason && (
                              <div className="mt-2.5 p-3 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] text-xs text-[#BE123C] space-y-1">
                                <p className="font-semibold">Administrator Feedback:</p>
                                <p>{n.metadata.rejectionReason}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!n.read && (
                              <button
                                onClick={() => handleMarkNotificationRead(n._id)}
                                className="text-xs text-[#77736D] hover:text-[#171717] px-2 py-1 rounded bg-[#F6F2EC] hover:bg-[#E7E2DA] transition-colors cursor-pointer"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 6: LEARNING REELS STUDIO ─────────────────────────────────── */}
      {activeTab === 'reels' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">AI Learning Reels Studio</CardTitle>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F6F2EC] px-2 py-0.5 rounded text-[#171717] border border-[#E7E2DA]">
                      LearnVerse Engine
                    </span>
                  </div>
                  <CardDescription>
                    Generate vertical micro-learning reels from course lessons. AI segments core concepts, generates scripts and captions, highlights takeaways, and adds quick knowledge checks.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-full sm:w-64">
                    <select
                      value={selectedCourseForReels}
                      onChange={(e) => setSelectedCourseForReels(e.target.value)}
                      className="w-full bg-[#FAF8F4] border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                    >
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateReels(selectedCourseForReels)}
                    isLoading={generatingReels}
                    disabled={!selectedCourseForReels}
                    leftIcon={<Sparkles size={14} />}
                  >
                    Generate AI Reels from Lessons
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
                <MetricStatCard label="Total Reels" value={courseReels.length} icon={Film} />
                <MetricStatCard
                  label="Published"
                  value={courseReels.filter((r) => r.isPublished).length}
                  icon={CheckCircle}
                />
                <MetricStatCard
                  label="Student Views"
                  value={courseReels.reduce((acc, r) => acc + (r.viewsCount || 0), 0)}
                  icon={Eye}
                />
                <MetricStatCard
                  label="Completions"
                  value={courseReels.reduce((acc, r) => acc + (r.completionsCount || 0), 0)}
                  icon={Award}
                />
              </div>

              {reelsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
                  <p className="text-xs text-[#77736D]">Loading learning reels...</p>
                </div>
              ) : courseReels.length === 0 ? (
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#A99B8A]">
                    <Film size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#171717]">No learning reels generated yet</h3>
                    <p className="text-xs text-[#77736D] mt-1 leading-relaxed">
                      Transform curriculum lessons into bite-sized vertical video clips with automatic speech narration, timed captions, and retention quizzes.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateReels(selectedCourseForReels)}
                    isLoading={generatingReels}
                    disabled={!selectedCourseForReels}
                    leftIcon={<Sparkles size={14} />}
                  >
                    Generate AI Reels Now
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseReels.map((reel) => (
                    <div
                      key={reel._id}
                      className="bg-[#FAF8F4] border border-[#E7E2DA] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#171717]/30 transition-all shadow-2xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={reel.isPublished ? 'published' : 'draft'}>
                            {reel.isPublished ? 'Published Live' : 'Draft'}
                          </Badge>
                          <span className="text-[11px] font-mono text-[#77736D] bg-[#F6F2EC] px-2 py-0.5 rounded border border-[#E7E2DA]">
                            {reel.durationSeconds || 45}s duration
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                            Concept: {reel.concept}
                          </p>
                          <h4 className="font-serif text-base text-[#171717] font-medium leading-snug line-clamp-2 mt-0.5">
                            {reel.title}
                          </h4>
                        </div>

                        <p className="text-xs text-[#77736D] line-clamp-3 leading-relaxed">
                          {reel.script?.hook || reel.script?.coreExplanation || 'AI-generated micro-learning script.'}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-[#77736D] pt-1">
                          <span className="flex items-center gap-1">
                            <Eye size={12} className="text-[#6F8FA8]" /> {reel.viewsCount || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={12} className="text-[#556943]" /> {reel.completionsCount || 0} completions
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E7E2DA]/80">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewReel(reel)}
                          leftIcon={<Eye size={12} />}
                        >
                          Preview
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant={reel.isPublished ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleTogglePublishReel(reel._id, !!reel.isPublished)}
                          >
                            {reel.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>

                          <button
                            onClick={() => handleDeleteReel(reel._id)}
                            className="p-1.5 rounded-lg text-[#77736D] hover:text-[#BE123C] hover:bg-[#F6F2EC] transition-colors cursor-pointer"
                            title="Delete reel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────── */}

      {/* Submit for Review Confirmation Modal */}
      {confirmSubmitModalCourse && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmSubmitModalCourse(null)}
          title="Submit Curriculum for Review"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <p className="text-[#77736D] leading-relaxed">
              You are submitting <strong className="text-[#171717]">"{confirmSubmitModalCourse.title}"</strong> for administrative moderation.
            </p>
            <div className="p-3 bg-[#FAF8F4] border border-[#E7E2DA] rounded-xl space-y-2 text-[#77736D]">
              <p className="font-semibold text-[#171717]">Pre-submission verification checklist:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>At least one curriculum module milestone is created</li>
                <li>All attached video lessons and documents are accessible</li>
                <li>Any attached quizzes include valid questions and passing scores</li>
              </ul>
            </div>
            <p className="text-[#77736D]">
              Once submitted, the course will transition to <span className="font-semibold text-[#171717]">Under Review</span> and cannot be edited until approved or retracted back to draft.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmSubmitModalCourse(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isActionLoading}
                onClick={() => handleSubmitCourse(confirmSubmitModalCourse._id)}
              >
                Confirm submission
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Course Confirmation Modal */}
      {confirmDeleteModalCourse && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDeleteModalCourse(null)}
          title="Delete Draft Course"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans">
            <p className="text-[#77736D]">
              Are you sure you want to permanently delete <strong className="text-[#171717]">"{confirmDeleteModalCourse.title}"</strong>?
            </p>
            <p className="text-[#BE123C] font-semibold">
              This action cannot be undone. All modules, lessons, and quizzes in this draft will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteModalCourse(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#BE123C] hover:bg-[#9F1239] text-white"
                isLoading={isActionLoading}
                onClick={() => handleDeleteCourse(confirmDeleteModalCourse._id)}
              >
                Permanently delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Exam Integrity Telemetry & Attempt Audit Modal */}
      {reviewingSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setReviewingSubmission(null)}
          title="Exam Integrity & Proctoring Telemetry Audit"
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs font-sans max-h-[75vh] overflow-y-auto pr-1">
            {/* Student & Session Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF8F4] border border-[#E7E2DA] rounded-xl">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#77736D]">Student</p>
                <p className="font-semibold text-[#171717] text-sm mt-0.5">
                  {reviewingSubmission.student?.name || 'Student'}
                </p>
                <p className="text-[#77736D] text-[11px]">{reviewingSubmission.student?.email}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[#77736D]">Assessment Performance</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-[#171717] text-sm">{reviewingSubmission.score}%</span>
                  <Badge variant={reviewingSubmission.passed ? 'published' : 'rejected'}>
                    {reviewingSubmission.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
                <p className="text-[#77736D] text-[11px] mt-0.5">
                  {reviewingSubmission.autoSubmitted
                    ? `Auto-submitted (${reviewingSubmission.autoSubmitReason || 'Threshold'})`
                    : 'Submitted normally'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[#77736D]">Session Timing</p>
                <p className="text-[#171717] mt-0.5">
                  Started: {reviewingSubmission.startedAt ? new Date(reviewingSubmission.startedAt).toLocaleTimeString() : 'N/A'}
                </p>
                <p className="text-[#77736D] text-[11px]">
                  Submitted: {reviewingSubmission.submittedAt ? new Date(reviewingSubmission.submittedAt).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#E7E2DA] text-center">
                <p className="text-[11px] text-[#77736D]">Tab / Focus Exits</p>
                <p className={`font-bold text-lg mt-0.5 ${reviewingSubmission.tabViolations > 0 ? 'text-[#BE123C]' : 'text-[#15803D]'}`}>
                  {reviewingSubmission.tabViolations || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E7E2DA] text-center">
                <p className="text-[11px] text-[#77736D]">Camera Violations</p>
                <p className={`font-bold text-lg mt-0.5 ${(reviewingSubmission.cameraViolations || 0) > 0 ? 'text-[#BE123C]' : 'text-[#15803D]'}`}>
                  {reviewingSubmission.cameraViolations || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E7E2DA] text-center">
                <p className="text-[11px] text-[#77736D]">Total Telemetry Events</p>
                <p className="font-bold text-lg text-[#171717] mt-0.5">
                  {reviewingSubmission.integrityEvents?.length || 0}
                </p>
              </div>
            </div>

            {/* Audit Event Timeline */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="font-serif text-sm font-semibold text-[#171717] flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-[#A99B8A]" /> Timestamped Integrity Event Timeline
                </p>
                <span className="text-[10px] text-[#77736D]">Server-audited chronological log</span>
              </div>

              {!reviewingSubmission.integrityEvents || reviewingSubmission.integrityEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-center text-[#77736D]">
                  <ShieldCheck size={20} className="mx-auto text-[#15803D] mb-1.5" />
                  <p className="font-semibold text-[#171717]">Clean Assessment Session</p>
                  <p className="text-[11px] mt-0.5">
                    No focus-loss or camera anomalies were recorded during this proctored attempt.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E2DA] border border-[#E7E2DA] rounded-xl bg-white overflow-hidden max-h-52 overflow-y-auto">
                  {reviewingSubmission.integrityEvents.map((evt, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-[#FAF8F4]/50">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                              evt.severity === 'violation'
                                ? 'bg-red-100 text-red-800'
                                : evt.severity === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {evt.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-[#77736D] font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[#171717] text-[11px] mt-1">{evt.description}</p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          evt.severity === 'violation'
                            ? 'text-red-700 bg-red-50'
                            : evt.severity === 'warning'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-zinc-600 bg-zinc-50'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructor Review & Verdict */}
            <div className="p-4 bg-[#FAF8F4] border border-[#E7E2DA] rounded-xl space-y-4">
              <p className="font-serif text-sm font-semibold text-[#171717]">Instructor Review & Verdict</p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#77736D] block">
                  Official Integrity Review Status
                </label>
                <select
                  value={reviewStatusInput}
                  onChange={(e) => setReviewStatusInput(e.target.value as any)}
                  className="w-full bg-white border border-[#E7E2DA] rounded-lg px-3 py-2 text-xs text-[#171717] outline-none focus:border-[#171717]"
                >
                  <option value="pending_review">Pending Review (Under investigation)</option>
                  <option value="cleared">Cleared (Benign anomalies / Approved)</option>
                  <option value="flagged">Flagged (Confirmed Misconduct / Disqualified)</option>
                  <option value="verified">Verified (Manually proctored & certified)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#77736D] block">
                  Instructor Audit Notes & Justification
                </label>
                <textarea
                  value={instructorNotesInput}
                  onChange={(e) => setInstructorNotesInput(e.target.value)}
                  placeholder="Record justification for review decision (e.g. verified brief tab switch was accidental window refocus)..."
                  rows={3}
                  className="w-full bg-white border border-[#E7E2DA] rounded-lg p-2.5 text-xs text-[#171717] outline-none focus:border-[#171717] resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewingSubmission(null)}
                disabled={isSavingReview}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSavingReview}
                onClick={handleSaveReview}
                leftIcon={<ShieldCheck size={14} />}
              >
                Save Decision & Notes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reel Preview Modal */}
      {previewReel && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewReel(null)}
          title={`Preview Reel: ${previewReel.title}`}
          maxWidth="md"
        >
          <div className="space-y-5 text-xs font-sans max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3.5 bg-[#FAF8F4] border border-[#E7E2DA] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Concept: {previewReel.concept}
                </span>
                <span className="font-mono text-[11px] text-[#77736D]">{previewReel.durationSeconds || 45}s</span>
              </div>
              <h3 className="font-serif text-base text-[#171717] font-semibold">{previewReel.title}</h3>
            </div>

            {/* Script Breakdown */}
            <div className="space-y-3">
              <p className="font-serif text-sm font-semibold text-[#171717]">AI Script Structure</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-[#E7E2DA]">
                  <p className="text-[10px] uppercase font-bold text-[#77736D]">Hook (0s - 5s)</p>
                  <p className="text-[#171717] mt-0.5">{previewReel.script?.hook}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E7E2DA]">
                  <p className="text-[10px] uppercase font-bold text-[#77736D]">Core Concept (5s - 30s)</p>
                  <p className="text-[#171717] mt-0.5">{previewReel.script?.coreExplanation}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E7E2DA]">
                  <p className="text-[10px] uppercase font-bold text-[#77736D]">Real-World Application (30s - 45s)</p>
                  <p className="text-[#171717] mt-0.5">{previewReel.script?.practicalApplication}</p>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            {previewReel.takeaways && previewReel.takeaways.length > 0 && (
              <div className="space-y-2">
                <p className="font-serif text-sm font-semibold text-[#171717]">Key Takeaways</p>
                <ul className="space-y-1.5 bg-[#FAF8F4] border border-[#E7E2DA] rounded-xl p-3">
                  {previewReel.takeaways.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#171717]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#556943] mt-1.5 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive Quick Knowledge Check */}
            {previewReel.quickQuestion && (
              <div className="space-y-2.5 p-3.5 bg-white border border-[#E7E2DA] rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736D]">
                  Interactive Knowledge Check
                </p>
                <p className="font-semibold text-[#171717] text-sm">{previewReel.quickQuestion.question}</p>
                <div className="space-y-1.5 pt-1">
                  {previewReel.quickQuestion.options?.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        idx === previewReel.quickQuestion?.correctIndex
                          ? 'bg-[#556943]/10 border-[#556943] text-[#556943] font-semibold'
                          : 'bg-[#FAF8F4] border-[#E7E2DA] text-[#77736D]'
                      }`}
                    >
                      <span>{opt}</span>
                      {idx === previewReel.quickQuestion?.correctIndex && (
                        <Check size={14} className="text-[#556943]" />
                      )}
                    </div>
                  ))}
                </div>
                {previewReel.quickQuestion.explanation && (
                  <p className="text-[11px] text-[#77736D] italic pt-1">
                    Explanation: {previewReel.quickQuestion.explanation}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-[#E7E2DA]">
              <Button variant="outline" size="sm" onClick={() => setPreviewReel(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Admin Dashboard Interfaces ───────────────────────────────────────────────
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  createdAt: string;
}

interface AdminCertificate {
  _id: string;
  certificateCode: string;
  completedAt: string;
  studentId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; title: string; category?: string; level?: string };
}

interface AdminTestimonial {
  _id: string;
  name: string;
  occupation: string;
  testimonial: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: { name: string; email: string };
}

interface AdminAuditLog {
  _id: string;
  action: string;
  actorRole: string;
  entityType: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
  actorId?: { _id: string; name: string; email: string };
}

interface PlatformMetrics {
  users?: { total: number; students: number; instructors: number; admins: number };
  courses?: { total: number; pending: number; published: number };
  certificates?: { totalIssued: number };
  testimonials?: { pending: number; total: number };
  auditLogs?: { total: number };
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ user }: { user: AuthUser }) {
  const [activeSection, setActiveSection] = useState<
    'moderation' | 'users' | 'certificates' | 'testimonials' | 'audit'
  >('moderation');

  // Platform Metrics
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);

  // 1. Course Moderation State
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<
    'under_review' | 'all' | 'published' | 'rejected' | 'audit_fixtures'
  >('under_review');
  const [courseSearch, setCourseSearch] = useState('');
  const [reviewCourse, setReviewCourse] = useState<Course | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 2. User Directory State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // 3. Certificate Ledger State
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certSearch, setCertSearch] = useState('');
  const [copiedCertCode, setCopiedCertCode] = useState<string | null>(null);
  const [inspectCert, setInspectCert] = useState<any | null>(null);
  const [isVerifyingCert, setIsVerifyingCert] = useState(false);

  // 4. Testimonials Moderation State
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isNewTestimonialModalOpen, setIsNewTestimonialModalOpen] = useState(false);
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialOccupation, setNewTestimonialOccupation] = useState('');
  const [newTestimonialText, setNewTestimonialText] = useState('');
  const [newTestimonialRating, setNewTestimonialRating] = useState(5);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);

  // 5. Platform Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Metrics
  const fetchMetrics = () => {
    api.get('/admin/metrics')
      .then(({ data }) => setMetrics(data.metrics))
      .catch(() => {});
  };

  // Fetch Courses
  const fetchCourses = () => {
    setCoursesLoading(true);
    api.get('/courses?limit=100')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  };

  // Fetch Users
  const fetchUsers = () => {
    setUsersLoading(true);
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load user directory'))
      .finally(() => setUsersLoading(false));
  };

  // Fetch Certificates
  const fetchCertificates = () => {
    setCertsLoading(true);
    api.get('/admin/certificates')
      .then(({ data }) => setCertificates(data.certificates || []))
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load certificate ledger'))
      .finally(() => setCertsLoading(false));
  };

  // Fetch Testimonials
  const fetchTestimonials = () => {
    setTestimonialsLoading(true);
    api.get('/admin/testimonials')
      .then(({ data }) => setTestimonials(data.testimonials || []))
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load testimonials queue'))
      .finally(() => setTestimonialsLoading(false));
  };

  // Fetch Audit Logs
  const fetchAuditLogs = (page = auditPage) => {
    setAuditLoading(true);
    const params: any = { page, limit: 12 };
    if (auditActionFilter !== 'ALL') params.action = auditActionFilter;
    if (auditRoleFilter !== 'ALL') params.role = auditRoleFilter;
    if (auditSearch.trim()) params.search = auditSearch.trim();

    api.get('/admin/audit-logs', { params })
      .then(({ data }) => {
        setAuditLogs(data.logs || []);
        setAuditTotalPages(data.pages || 1);
        setAuditTotal(data.total || 0);
        setAuditPage(data.page || 1);
      })
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load audit logs'))
      .finally(() => setAuditLoading(false));
  };

  // Initial load
  useEffect(() => {
    fetchMetrics();
    fetchCourses();
  }, []);

  // Section lazy-loading
  useEffect(() => {
    if (activeSection === 'users' && users.length === 0) fetchUsers();
    if (activeSection === 'certificates' && certificates.length === 0) fetchCertificates();
    if (activeSection === 'testimonials') fetchTestimonials();
    if (activeSection === 'audit') fetchAuditLogs(1);
  }, [activeSection]);

  // Handle Course Approval
  const handleApproveCourse = async (courseId: string) => {
    setIsActionLoading(true);
    try {
      await api.post(`/admin/courses/${courseId}/approve`, { action: 'publish' });
      toast.success('Course approved and published to catalog.');
      setReviewCourse(null);
      fetchCourses();
      fetchMetrics();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Course approval failed';
      toast.error(errMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Course Rejection
  const handleRejectCourse = async (courseId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason for the author.');
      return;
    }
    setIsActionLoading(true);
    try {
      await api.post(`/admin/courses/${courseId}/reject`, { reason: rejectReason.trim(), action: 'reject' });
      toast.success('Course rejected and instructor notified.');
      setReviewCourse(null);
      setRejectReason('');
      fetchCourses();
      fetchMetrics();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Rejection failed';
      toast.error(errMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle User Toggle Status
  const handleToggleUser = async (targetUser: AdminUser) => {
    const actionText = targetUser.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} user "${targetUser.name}"?`)) return;

    setTogglingUserId(targetUser._id);
    try {
      await api.patch(`/admin/users/${targetUser._id}/toggle`);
      toast.success(`User ${targetUser.name} has been ${targetUser.isActive ? 'deactivated' : 'activated'}.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  // Handle Copy Certificate Code
  const handleCopyCertCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCertCode(code);
    toast.success('Certificate verification code copied to clipboard');
    setTimeout(() => setCopiedCertCode(null), 2500);
  };

  // Handle Verify Certificate Credential
  const handleInspectCert = async (code: string) => {
    setIsVerifyingCert(true);
    try {
      const { data } = await api.get(`/verify/${code}`);
      setInspectCert(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Unable to verify certificate hash');
    } finally {
      setIsVerifyingCert(false);
    }
  };

  // Handle Testimonial Status Review
  const handleReviewTestimonial = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/testimonials/${id}/status`, { status });
      toast.success(status === 'approved' ? 'Testimonial approved & live on showcase!' : 'Testimonial rejected.');
      fetchTestimonials();
      fetchMetrics();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update testimonial status');
    }
  };

  // Handle Testimonial Deletion
  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (!window.confirm(`Delete review from "${name}" permanently?`)) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      toast.success('Testimonial deleted.');
      fetchTestimonials();
      fetchMetrics();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete testimonial');
    }
  };

  // Handle Admin Direct Testimonial Creation
  const handleCreateOfficialTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialName.trim() || !newTestimonialText.trim()) {
      toast.error('Name and review content are required.');
      return;
    }
    setIsCreatingTestimonial(true);
    try {
      await api.post('/admin/testimonials', {
        name: newTestimonialName.trim(),
        occupation: newTestimonialOccupation.trim() || 'Veyro Learner',
        testimonial: newTestimonialText.trim(),
        rating: newTestimonialRating,
        status: 'approved',
      });
      toast.success('Official testimonial created & published live!');
      setIsNewTestimonialModalOpen(false);
      setNewTestimonialName('');
      setNewTestimonialOccupation('');
      setNewTestimonialText('');
      setNewTestimonialRating(5);
      fetchTestimonials();
      fetchMetrics();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to publish testimonial');
    } finally {
      setIsCreatingTestimonial(false);
    }
  };

  // Handle Audit Log Export
  const handleExportAuditLogs = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const response = await api.get(`/admin/audit-logs/export?format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `veyro-audit-logs-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Audit logs successfully exported as ${format.toUpperCase()}.`);
    } catch (err) {
      toast.error('Failed to export audit logs');
    } finally {
      setIsExporting(false);
    }
  };

  const isFixtureCourse = (c: Course) => {
    if ((c as any).isTestFixture) return true;
    if (c.tags?.some((t: string) => ['test', 'audit', 'fixture', 'automated-test', 'live-test'].includes(t.toLowerCase()))) return true;
    if (/^(?:\[(?:live\s+)?(?:audit\s+)?test\]|audit\s+curriculum|test\s+(?:cascade|curriculum)|(?:audit|test)\b.*\b\d{6,})/i.test(c.title)) return true;
    return false;
  };

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const isFix = isFixtureCourse(c);
    let matchStatus = false;
    if (courseFilter === 'audit_fixtures') {
      matchStatus = isFix;
    } else if (isFix) {
      matchStatus = false;
    } else if (courseFilter === 'all') {
      matchStatus = true;
    } else if (courseFilter === 'under_review') {
      matchStatus = c.status === 'under_review' || c.status === 'pending';
    } else {
      matchStatus = c.status === courseFilter;
    }

    const matchSearch =
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // Filtered Certificates
  const filteredCerts = certificates.filter((cert) => {
    const s = certSearch.toLowerCase();
    const student = cert.studentId?.name?.toLowerCase() || '';
    const email = cert.studentId?.email?.toLowerCase() || '';
    const title = cert.courseId?.title?.toLowerCase() || '';
    const code = (cert.certificateCode || '').toLowerCase();
    return student.includes(s) || email.includes(s) || title.includes(s) || code.includes(s);
  });

  // Filtered Testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (testimonialFilter === 'all') return true;
    return t.status === testimonialFilter;
  });

  const pendingCoursesCount = courses.filter(
    (c) => (c.status === 'under_review' || c.status === 'pending') && !isFixtureCourse(c)
  ).length;
  const pendingTestimonialsCount = testimonials.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#171717] text-white">
              <Shield size={12} />
              Role-Restricted Console
            </span>
            <span className="text-xs text-[#77736D] font-mono">System v2.4</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-sm text-[#77736D] mt-1 font-sans max-w-2xl">
            Supervise curriculum accreditation, regulate student & instructor roles, audit cryptographic certificate ledgers, and moderate learner testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle size={14} className="text-emerald-600" />
            Security Guardrails Active
          </div>
        </div>
      </div>

      {/* ── Key Operational Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricStatCard
          label="Course queue"
          value={metrics?.courses?.pending ?? pendingCoursesCount}
          sublabel="pending review"
          icon={Clock}
        />
        <MetricStatCard
          label="Total users"
          value={metrics?.users?.total ?? users.length}
          sublabel="students & instructors"
          icon={Users}
        />
        <MetricStatCard
          label="Certificates"
          value={metrics?.certificates?.totalIssued ?? certificates.length}
          sublabel="cryptographically issued"
          icon={Award}
        />
        <MetricStatCard
          label="Reviews queue"
          value={metrics?.testimonials?.pending ?? pendingTestimonialsCount}
          sublabel="awaiting moderation"
          icon={MessageSquare}
        />
        <MetricStatCard
          label="Audit events"
          value={metrics?.auditLogs?.total ?? auditTotal}
          sublabel="immutable trail"
          icon={ShieldCheck}
        />
      </div>

      {/* ── Main Tabbed Navigation Bar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E7E2DA] p-1.5 shadow-subtle flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveSection('moderation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'moderation'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
          }`}
        >
          <BookOpen size={16} />
          <span>Curriculum Moderation</span>
          {pendingCoursesCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                activeSection === 'moderation' ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingCoursesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'users'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
          }`}
        >
          <Users size={16} />
          <span>User Directory & Roles</span>
          {users.length > 0 && (
            <span className="text-[11px] opacity-75 font-mono">({users.length})</span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('certificates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'certificates'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
          }`}
        >
          <Award size={16} />
          <span>Certificate Ledger</span>
          {certificates.length > 0 && (
            <span className="text-[11px] opacity-75 font-mono">({certificates.length})</span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('testimonials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'testimonials'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
          }`}
        >
          <Star size={16} />
          <span>Testimonials Moderation</span>
          {pendingTestimonialsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                activeSection === 'testimonials'
                  ? 'bg-amber-400 text-black'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingTestimonialsCount} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'audit'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Platform Audit Logs</span>
        </button>
      </div>

      {/* ── SECTION 1: Curriculum Moderation Queue ──────────────────── */}
      {activeSection === 'moderation' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Curriculum Moderation Queue</CardTitle>
                <CardDescription>
                  Review instructor submissions, evaluate syllabus integrity, and issue publication decisions.
                </CardDescription>
              </div>

              {/* Sub-filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 bg-[#F6F2EC] p-1 rounded-xl">
                  {(['under_review', 'all', 'published', 'rejected', 'audit_fixtures'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCourseFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        courseFilter === tab
                          ? 'bg-white text-[#171717] shadow-2xs'
                          : 'text-[#77736D] hover:text-[#171717]'
                      }`}
                    >
                      {tab === 'audit_fixtures' ? 'Audit Fixtures' : tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-48">
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    leftIcon={<Search size={14} />}
                    className="py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#77736D]">
                  <CheckCircle size={22} className="text-[#556943]" />
                </div>
                <h3 className="font-serif text-lg text-[#171717]">Moderation Queue Clear</h3>
                <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                  {courseFilter === 'under_review'
                    ? 'No instructor submissions are currently awaiting review.'
                    : courseFilter === 'audit_fixtures'
                    ? 'No internal test or audit fixtures found.'
                    : 'No courses match your selected filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E7E2DA]/60">
                {filteredCourses.map((c) => {
                  const instructorName =
                    typeof c.instructorId === 'object' && c.instructorId
                      ? c.instructorId.name
                      : 'Unknown Instructor';
                  const instructorEmail =
                    typeof c.instructorId === 'object' && c.instructorId
                      ? c.instructorId.email
                      : '';
                  return (
                    <div
                      key={c._id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              c.status === 'published'
                                ? 'published'
                                : c.status === 'under_review'
                                ? 'pending'
                                : c.status === 'rejected'
                                ? 'rejected'
                                : 'draft'
                            }
                          >
                            {c.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-[#77736D]">{c.category}</span>
                          <span className="text-xs text-[#77736D]">• Level: {c.level || 'All Levels'}</span>
                          {c.version && (
                            <span className="text-[11px] font-mono bg-[#F6F2EC] px-1.5 py-0.2 rounded border border-[#E7E2DA]">
                              v{c.version}
                            </span>
                          )}
                          {isFixtureCourse(c) && (
                            <span className="text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                              Audit Fixture
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-sans font-semibold text-base text-[#171717]">{c.title}</h3>
                          <p className="text-xs text-[#77736D] line-clamp-1 mt-0.5">{c.description}</p>
                        </div>

                        <div className="text-xs text-[#77736D]">
                          Instructor: <span className="font-medium text-[#171717]">{instructorName}</span>
                          {instructorEmail && <span className="text-[#A99B8A] ml-1">({instructorEmail})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/courses/${c._id}`}>
                          <Button variant="secondary" size="sm" leftIcon={<Eye size={13} />}>
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setReviewCourse(c)}
                        >
                          Evaluate & Decide
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 2: User Directory & Role Management ─────────────── */}
      {activeSection === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>User Directory & Role Administration</CardTitle>
                <CardDescription>
                  Manage active learners, certified instructors, and system administrators. Toggle account access states.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 bg-[#F6F2EC] p-1 rounded-xl">
                  {(['all', 'student', 'instructor', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-white text-[#171717] shadow-2xs'
                          : 'text-[#77736D] hover:text-[#171717]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-52">
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    leftIcon={<Search size={14} />}
                    className="py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-[#77736D] text-center py-8">
                No users match the search and role filter criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[#E7E2DA] text-xs font-semibold text-[#77736D]">
                      <th className="pb-3 font-medium">User Profile</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Account Status</th>
                      <th className="pb-3 font-medium">Joined Date</th>
                      <th className="pb-3 font-medium text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]/60">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#171717]">{u.name}</p>
                              <p className="text-xs text-[#77736D]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'neutral'
                                : u.role === 'instructor'
                                ? 'olive'
                                : 'blue'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3.5">
                          <Badge variant={u.isActive ? 'published' : 'rejected'}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-xs text-[#77736D]">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          {u._id === user._id ? (
                            <span className="text-xs text-[#77736D] italic">Current Session</span>
                          ) : (
                            <Button
                              variant={u.isActive ? 'outline' : 'primary'}
                              size="sm"
                              isLoading={togglingUserId === u._id}
                              onClick={() => handleToggleUser(u)}
                              leftIcon={u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 3: Certificate Audit Ledger ─────────────────────── */}
      {activeSection === 'certificates' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Certificate Verification Ledger</CardTitle>
                <CardDescription>
                  Cryptographic verification trail for all student course accreditations issued upon 90% attendance and passed assessments.
                </CardDescription>
              </div>

              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search code, student, course..."
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  leftIcon={<Search size={14} />}
                  className="py-1.5 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {certsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : filteredCerts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#77736D]">
                  <Award size={22} className="text-[#A99B8A]" />
                </div>
                <h3 className="font-serif text-lg text-[#171717]">No Issued Certificates</h3>
                <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                  {certSearch
                    ? 'No certificate entries matched your search query.'
                    : 'No student has completed all lessons & assessment milestones to claim a verified certificate yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[#E7E2DA] text-xs font-semibold text-[#77736D]">
                      <th className="pb-3 font-medium">Verification Code</th>
                      <th className="pb-3 font-medium">Certified Scholar</th>
                      <th className="pb-3 font-medium">Curriculum</th>
                      <th className="pb-3 font-medium">Date Issued</th>
                      <th className="pb-3 font-medium text-right">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]/60">
                    {filteredCerts.map((cert) => (
                      <tr key={cert._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                        <td className="py-3.5 pr-4 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#171717]">{cert.certificateCode}</span>
                            <button
                              onClick={() => handleCopyCertCode(cert.certificateCode)}
                              className="p-1 rounded hover:bg-[#F6F2EC] text-[#77736D] hover:text-[#171717] transition-colors cursor-pointer"
                              title="Copy Verification Code"
                            >
                              {copiedCertCode === cert.certificateCode ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <p className="font-semibold text-[#171717]">{cert.studentId?.name || 'Scholar'}</p>
                          <p className="text-xs text-[#77736D]">{cert.studentId?.email}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-medium text-[#171717]">{cert.courseId?.title}</p>
                          <span className="text-xs text-[#77736D]">{cert.courseId?.category || 'General'}</span>
                        </td>
                        <td className="py-3.5 text-xs text-[#77736D]">
                          {cert.completedAt
                            ? new Date(cert.completedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleInspectCert(cert.certificateCode)}
                            leftIcon={<ShieldCheck size={13} />}
                          >
                            Verify Credential
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 4: Testimonials Moderation Queue ─────────────────── */}
      {activeSection === 'testimonials' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Learner Testimonials Moderation</CardTitle>
                <CardDescription>
                  Review community testimonials submitted from the landing page. Approved reviews appear immediately in the live showcase.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-[#F6F2EC] p-1 rounded-xl">
                  {(['pending', 'all', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTestimonialFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        testimonialFilter === tab
                          ? 'bg-white text-[#171717] shadow-2xs'
                          : 'text-[#77736D] hover:text-[#171717]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle size={14} />}
                  onClick={() => setIsNewTestimonialModalOpen(true)}
                >
                  Add official review
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {testimonialsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#77736D]">
                  <MessageSquare size={22} className="text-[#A99B8A]" />
                </div>
                <h3 className="font-serif text-lg text-[#171717]">No Reviews In Queue</h3>
                <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                  {testimonialFilter === 'pending'
                    ? 'All community submissions have been evaluated. No pending reviews.'
                    : 'No testimonials found matching this filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTestimonials.map((t) => (
                  <div
                    key={t._id}
                    className="p-5 rounded-2xl bg-white border border-[#E7E2DA] shadow-subtle flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#171717] leading-tight">{t.name}</p>
                            <p className="text-xs text-[#77736D]">{t.occupation}</p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            t.status === 'approved'
                              ? 'published'
                              : t.status === 'pending'
                              ? 'pending'
                              : 'rejected'
                          }
                        >
                          {t.status === 'approved'
                            ? 'Approved & Live'
                            : t.status === 'pending'
                            ? 'Pending Review'
                            : 'Rejected'}
                        </Badge>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(t.rating || 5)].map((_, idx) => (
                          <Star key={idx} size={12} className="fill-amber-400 text-amber-500" />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-xs sm:text-sm text-[#333333] leading-relaxed italic">
                        &quot;{t.testimonial}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E7E2DA]/80">
                      <span className="text-[11px] text-[#77736D]">
                        Submitted:{' '}
                        {new Date(t.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {t.status !== 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReviewTestimonial(t._id, 'approved')}
                            leftIcon={<Check size={13} />}
                          >
                            Approve
                          </Button>
                        )}
                        {t.status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewTestimonial(t._id, 'rejected')}
                            leftIcon={<X size={13} />}
                          >
                            Reject
                          </Button>
                        )}
                        <button
                          onClick={() => handleDeleteTestimonial(t._id, t.name)}
                          className="p-1.5 rounded-lg text-[#77736D] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 5: Platform Audit Logs ──────────────────────────── */}
      {activeSection === 'audit' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Platform Audit Ledger & Telemetry</CardTitle>
                <CardDescription>
                  Immutable, append-only security and operational trail recording critical state-changing actions across the LMS.
                </CardDescription>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportAuditLogs('csv')}
                  isLoading={isExporting}
                  leftIcon={<Download size={13} />}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAuditLogs('json')}
                  isLoading={isExporting}
                  leftIcon={<FileText size={13} />}
                >
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Audit Log Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="w-full sm:w-56">
                <Input
                  placeholder="Search logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  leftIcon={<Search size={14} />}
                  className="py-1.5 text-xs"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E7E2DA] rounded-lg px-2.5 py-1.5 text-xs outline-none text-[#171717]"
              >
                <option value="ALL">All Actions</option>
                <option value="COURSE_APPROVED">Course Approved</option>
                <option value="COURSE_REJECTED">Course Rejected</option>
                <option value="COURSE_PUBLISHED">Course Published</option>
                <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
                <option value="USER_STATUS_CHANGED">User Status Changed</option>
                <option value="TESTIMONIAL_MODERATED">Testimonial Moderated</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
              </select>

              <select
                value={auditRoleFilter}
                onChange={(e) => setAuditRoleFilter(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E7E2DA] rounded-lg px-2.5 py-1.5 text-xs outline-none text-[#171717]"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
                <option value="system">System</option>
              </select>

              <Button variant="secondary" size="sm" onClick={() => fetchAuditLogs(1)}>
                Apply filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-[#77736D] text-center py-8">
                No audit trail records matched the specified filter criteria.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#E7E2DA] text-[#77736D] font-semibold">
                        <th className="pb-3 font-medium">Timestamp</th>
                        <th className="pb-3 font-medium">Actor</th>
                        <th className="pb-3 font-medium">Action Performed</th>
                        <th className="pb-3 font-medium">Entity</th>
                        <th className="pb-3 font-medium">Client Telemetry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2DA]/60">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                          <td className="py-3 font-mono text-[#77736D] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-[#171717]">
                              {log.actorId?.name || log.actorRole}
                            </span>
                            <Badge variant="neutral" className="ml-1.5 text-[10px]">
                              {log.actorRole}
                            </Badge>
                          </td>
                          <td className="py-3 font-semibold text-[#171717]">
                            <span className="font-mono bg-[#F6F2EC] px-1.5 py-0.5 rounded border border-[#E7E2DA]">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 text-[#77736D]">
                            <span className="capitalize font-medium text-[#171717]">{log.entityType}</span>
                            {log.entityId && (
                              <span className="font-mono text-[11px] block text-[#A99B8A] truncate max-w-[140px]">
                                {log.entityId}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-[#77736D] font-mono text-[11px]">
                            {log.ipAddress || 'Internal Network'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E7E2DA]">
                  <p className="text-xs text-[#77736D]">
                    Showing page <span className="font-semibold text-[#171717]">{auditPage}</span> of{' '}
                    <span className="font-semibold text-[#171717]">{auditTotalPages}</span> (
                    {auditTotal} total events)
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditPage <= 1}
                      onClick={() => fetchAuditLogs(auditPage - 1)}
                      leftIcon={<ChevronLeft size={13} />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditPage >= auditTotalPages}
                      onClick={() => fetchAuditLogs(auditPage + 1)}
                      rightIcon={<ChevronRight size={13} />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── MODAL: Course Review & Evaluation ───────────────────────── */}
      {reviewCourse && (
        <Modal
          isOpen={true}
          onClose={() => setReviewCourse(null)}
          title={`Accreditation Review: ${reviewCourse.title}`}
          description="Evaluate the curriculum completeness, duration, and assessment criteria."
        >
          <div className="space-y-4 text-sm font-sans">
            <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#77736D]">Category:</span>
                <span className="font-semibold text-[#171717]">{reviewCourse.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Level:</span>
                <span className="font-semibold text-[#171717]">{reviewCourse.level || 'All Levels'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Version:</span>
                <span className="font-semibold text-[#171717]">v{reviewCourse.version || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736D]">Current Status:</span>
                <Badge variant="pending">{reviewCourse.status}</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#77736D] uppercase">Description</p>
              <p className="text-[#202020] mt-1 text-xs leading-relaxed">{reviewCourse.description}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-[#202020]">
                Deficiencies / Feedback (required if rejecting)
              </label>
              <Input
                placeholder="State specific syllabus, lesson, or assessment deficiencies..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E2DA]">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRejectCourse(reviewCourse._id)}
                isLoading={isActionLoading}
              >
                Reject submission
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApproveCourse(reviewCourse._id)}
                isLoading={isActionLoading}
              >
                Approve & publish
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Certificate Cryptographic Verification ───────────── */}
      {inspectCert && (
        <Modal
          isOpen={true}
          onClose={() => setInspectCert(null)}
          title="Cryptographic Credential Audit"
          description="Authoritative proof validated by Veyro Certificate Verification Engine."
        >
          <div className="space-y-4 font-sans text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <ShieldCheck size={28} className="text-emerald-600 mx-auto" />
              <h3 className="font-serif text-lg font-medium text-emerald-900">
                Verified Authentic Credential
              </h3>
              <p className="text-xs text-emerald-700 font-mono">
                SHA-256 Validated Signature
              </p>
            </div>

            <div className="space-y-2.5 divide-y divide-[#E7E2DA]/60 text-xs">
              <div className="pt-2 flex justify-between">
                <span className="text-[#77736D]">Accredited Student:</span>
                <span className="font-semibold text-[#171717]">{inspectCert.student?.name}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#77736D]">Student Email:</span>
                <span className="font-semibold text-[#171717]">{inspectCert.student?.email}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#77736D]">Mastered Curriculum:</span>
                <span className="font-semibold text-[#171717]">{inspectCert.course?.title}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#77736D]">Completion Timestamp:</span>
                <span className="font-semibold text-[#171717]">
                  {inspectCert.completedAt ? new Date(inspectCert.completedAt).toUTCString() : 'Recorded'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E2DA] flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setInspectCert(null)}>
                Close audit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Create Official Curated Testimonial ───────────────── */}
      {isNewTestimonialModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewTestimonialModalOpen(false)}
          title="Add Official Testimonial"
          description="Directly publish an accredited student or instructor testimonial to the verified showcase."
        >
          <form onSubmit={handleCreateOfficialTestimonial} className="space-y-4 font-sans text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <Input
                placeholder="e.g. Samuel K. Vance"
                value={newTestimonialName}
                onChange={(e) => setNewTestimonialName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Role / Track
              </label>
              <Input
                placeholder="e.g. Graduate — Cloud Systems & Distributed Architecture"
                value={newTestimonialOccupation}
                onChange={(e) => setNewTestimonialOccupation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewTestimonialRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={18}
                      className={
                        newTestimonialRating >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-zinc-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Review Content <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write the verified testimonial quote..."
                value={newTestimonialText}
                onChange={(e) => setNewTestimonialText(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#E7E2DA] focus:border-[#171717] focus:bg-white rounded-lg p-2.5 text-xs outline-none transition-all text-[#171717] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsNewTestimonialModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isCreatingTestimonial}
              >
                Publish directly
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : user.role === 'instructor' ? (
          <InstructorDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </div>
    </div>
  );
}

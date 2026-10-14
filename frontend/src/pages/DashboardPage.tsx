import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import type { Course, Enrollment } from '../types/course';
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
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'dropped'>('all');
  const [droppingCourseId, setDroppingCourseId] = useState<string | null>(null);
  const [reEnrollingCourseId, setReEnrollingCourseId] = useState<string | null>(null);

  const fetchEnrollments = () => {
    api.get('/enrollments/my')
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

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
                    {featuredCourse.courseId.title}
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
                          {course.title}
                        </Link>
                        <div className="flex items-center gap-4 text-xs text-[#77736D]">
                          <span>Progress: {en.progressPercentage || 0}%</span>
                          {en.certificateCode && (
                            <span className="text-[#556943] flex items-center gap-1 font-medium">
                              <Award size={12} /> Certificate ready
                            </span>
                          )}
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
                        <p className="font-semibold text-[#171717] truncate">{e.courseId?.title}</p>
                        <p className="text-[#77736D] font-mono text-[11px] mt-0.5">{e.certificateCode}</p>
                      </div>
                      {e.certificateCode && (
                        <Link to={`/verify/${e.certificateCode}`}>
                          <Button variant="secondary" size="sm">
                            Verify
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    api.get('/courses')
      .then(({ data }) => {
        const all: Course[] = data.courses || [];
        const myCourses = all.filter((c) => {
          const instructor = typeof c.instructorId === 'object' ? c.instructorId?._id : c.instructorId;
          return instructor === user._id;
        });
        setCourses(myCourses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRetractCourse = async (courseId: string) => {
    if (!window.confirm('Retract this course back to draft?')) return;
    try {
      await api.post(`/courses/${courseId}/retract`);
      toast.success('Course retracted to draft.');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to retract course');
    }
  };

  const handleSubmitCourse = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/submit`);
      toast.success('Course submitted for administrative review.');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit course');
    }
  };

  const published = courses.filter((c) => c.status === 'published').length;
  const pending = courses.filter((c) => c.status === 'under_review').length;
  const drafts = courses.filter((c) => c.status === 'draft').length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal">
            Instructor Studio
          </h1>
          <p className="text-sm text-[#77736D] mt-1 font-sans">
            Author modular curricula, manage lesson media, and monitor learner cohorts.
          </p>
        </div>
        <Link to="/instructor/courses/new">
          <Button variant="primary" leftIcon={<PlusCircle size={15} />}>
            Create curriculum
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard label="Total curricula" value={courses.length} icon={BookOpen} />
        <MetricStatCard label="Published" value={published} icon={CheckCircle} />
        <MetricStatCard label="Under review" value={pending} icon={Clock} />
        <MetricStatCard label="Drafts" value={drafts} icon={Layers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authored Curricula</CardTitle>
          <CardDescription>
            Manage course lifecycle states, draft revisions, and review approvals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-[#77736D]">You have not authored any curricula yet.</p>
              <Link to="/instructor/courses/new">
                <Button variant="secondary" size="sm">
                  Create your first course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead>
                  <tr className="border-b border-[#E7E2DA] text-xs font-semibold text-[#77736D]">
                    <th className="pb-3 font-medium">Curriculum</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]/60">
                  {courses.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-[#171717]">{c.title}</p>
                        <p className="text-xs text-[#77736D] truncate max-w-xs">{c.description}</p>
                      </td>
                      <td className="py-3.5 text-xs text-[#77736D]">{c.category}</td>
                      <td className="py-3.5">
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
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <Link to={`/instructor/courses/${c._id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {c.status === 'draft' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSubmitCourse(c._id)}
                          >
                            Submit
                          </Button>
                        )}
                        {c.status === 'under_review' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetractCourse(c._id)}
                          >
                            Retract
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
    </div>
  );
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ user }: { user: AuthUser }) {
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewCourse, setReviewCourse] = useState<Course | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchPending = () => {
    api.get('/courses')
      .then(({ data }) => {
        const all: Course[] = data.courses || [];
        setPendingCourses(all.filter((c) => c.status === 'under_review'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (courseId: string) => {
    try {
      await api.post(`/admin/courses/${courseId}/approve`);
      toast.success('Course approved and published.');
      setReviewCourse(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async (courseId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason for the author.');
      return;
    }
    setIsRejecting(true);
    try {
      await api.post(`/admin/courses/${courseId}/reject`, { reason: rejectReason });
      toast.success('Course rejected and author notified.');
      setReviewCourse(null);
      setRejectReason('');
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Rejection failed');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal">
          Administration Console
        </h1>
        <p className="text-sm text-[#77736D] mt-1 font-sans">
          Review instructor course submissions, audit platform compliance, and regulate accreditation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricStatCard label="Pending review" value={pendingCourses.length} icon={Clock} />
        <MetricStatCard label="Administrator" value={user.name} icon={ShieldCheck} />
        <MetricStatCard label="Security status" value="Active" icon={CheckCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum Moderation Queue</CardTitle>
          <CardDescription>
            Submissions requiring review before publication to the student course catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#A99B8A]" />
            </div>
          ) : pendingCourses.length === 0 ? (
            <p className="text-sm text-[#77736D] text-center py-8">
              The moderation queue is currently clear. No pending submissions.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E2DA]/60">
              {pendingCourses.map((c) => (
                <div key={c._id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171717]">{c.title}</p>
                    <p className="text-xs text-[#77736D]">
                      Category: {c.category} • Level: {c.level || 'All'}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setReviewCourse(c)}>
                    Evaluate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {reviewCourse && (
        <Modal
          isOpen={true}
          onClose={() => setReviewCourse(null)}
          title={`Review: ${reviewCourse.title}`}
          description="Evaluate the curriculum structure, lesson duration, and assessment criteria."
        >
          <div className="space-y-4 text-sm font-sans">
            <div>
              <p className="text-xs font-semibold text-[#77736D] uppercase">Description</p>
              <p className="text-[#202020] mt-1">{reviewCourse.description}</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-[#202020]">
                Rejection reason (required only if rejecting)
              </label>
              <Input
                placeholder="State specific deficiencies..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E2DA]">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(reviewCourse._id)}
                isLoading={isRejecting}
              >
                Reject submission
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(reviewCourse._id)}
              >
                Approve & publish
              </Button>
            </div>
          </div>
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

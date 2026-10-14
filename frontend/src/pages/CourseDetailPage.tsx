import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  FileText,
  AlignLeft,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Award,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import type { Course, Module, Enrollment, CourseProgress, LessonType } from '../types/course';

const lessonTypeIcon: Record<LessonType, React.ComponentType<{ size?: number; className?: string }>> = {
  video: Play,
  pdf: FileText,
  text: AlignLeft,
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<CourseProgress>({ percentage: 0, completed: 0, total: 0 });
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [latestRevision, setLatestRevision] = useState<Course | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
        setModules(data.modules || []);
        setLatestRevision(data.latestRevision || null);
        if (data.modules?.length > 0) {
          setOpenModules({ [data.modules[0]._id]: true });
        }

        if (user?.role === 'student') {
          try {
            const { data: enData } = await api.get('/enrollments/my');
            const found = (enData.enrollments || []).find(
              (e: any) => e.courseId?._id === id || e.courseId === id
            );
            setEnrollment(found || null);
            if (found) {
              const { data: prog } = await api.get(`/courses/${id}/progress`);
              setProgress(prog);
            }
          } catch {}
        }
      } catch (err) {
        toast.error('Course not found');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, user?.role]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Successfully enrolled in curriculum!');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (mid: string) =>
    setOpenModules((prev) => ({ ...prev, [mid]: !prev[mid] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = !!enrollment;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const firstLesson = modules[0]?.lessons?.[0];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-8 sm:py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
        
        {/* Breadcrumb Back Link */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to catalog</span>
        </Link>

        {/* Revision Banner if applicable */}
        {latestRevision && (
          <div className="bg-white border border-[#E7E2DA] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#E7E2DA] flex items-center justify-center flex-shrink-0 text-[#171717] mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="font-sans font-semibold text-sm text-[#171717]">
                  A new version of this curriculum is available (v{latestRevision.version || 2})
                </p>
                <p className="text-xs text-[#77736D]">
                  Your current enrollment and progress remain completely intact. You can view the new version anytime.
                </p>
              </div>
            </div>
            <Link to={`/courses/${latestRevision._id}`}>
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={13} />}>
                View new version
              </Button>
            </Link>
          </div>
        )}

        {/* Main 2-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Details & Curriculum Structure (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6 sm:p-8 space-y-4 shadow-subtle">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{course.category || 'Curriculum'}</Badge>
                {course.level && <Badge variant="draft">{course.level}</Badge>}
                <Badge variant="verified" icon={<ShieldCheck size={12} />}>
                  Proctor verified
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#171717] font-normal leading-tight tracking-tight">
                {course.title}
              </h1>

              <p className="text-sm text-[#77736D] leading-relaxed">
                {course.description}
              </p>

              <div className="pt-4 border-t border-[#E7E2DA]/60 flex flex-wrap items-center gap-6 text-xs text-[#77736D]">
                <span>{modules.length} modules</span>
                <span>{totalLessons} lessons</span>
                <span>Server-audited watch accreditation</span>
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="font-serif text-2xl text-[#171717] font-normal">Syllabus & Modules</h2>
                <span className="text-xs text-[#77736D]">
                  {modules.length} modules • {totalLessons} lessons
                </span>
              </div>

              {modules.length === 0 ? (
                <Card>
                  <p className="text-xs text-[#77736D] py-4 text-center">
                    Curriculum outline is currently in authoring stage.
                  </p>
                </Card>
              ) : (
                modules.map((mod, idx) => {
                  const isOpen = !!openModules[mod._id];
                  return (
                    <div
                      key={mod._id}
                      className="bg-white rounded-xl border border-[#E7E2DA] overflow-hidden shadow-subtle"
                    >
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#FAF8F4] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-[#A99B8A] w-5">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <span className="font-sans font-semibold text-sm text-[#171717]">
                            {mod.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#77736D]">
                          <span className="text-xs">{mod.lessons?.length || 0} lessons</span>
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#E7E2DA]/60 bg-[#FAF8F4]/40 divide-y divide-[#E7E2DA]/60">
                          {mod.lessons?.map((les) => {
                            const Icon = lessonTypeIcon[les.type] || AlignLeft;
                            return (
                              <div
                                key={les._id}
                                className="px-5 py-3 flex items-center justify-between text-xs font-sans"
                              >
                                <div className="flex items-center gap-2.5 text-[#202020]">
                                  <Icon size={14} className="text-[#6F8FA8]" />
                                  <span>{les.title}</span>
                                </div>
                                {isEnrolled ? (
                                  <Link to={`/lessons/${les._id}`}>
                                    <Button variant="secondary" size="sm">
                                      Start
                                    </Button>
                                  </Link>
                                ) : (
                                  <Lock size={13} className="text-[#A99B8A]" />
                                )}
                              </div>
                            );
                          })}

                          {/* Module Quiz */}
                          {mod.quiz && (
                            <div className="px-5 py-3 flex items-center justify-between text-xs font-sans bg-[#FAF8F4]">
                              <div className="flex items-center gap-2.5 text-[#202020]">
                                <HelpCircle size={14} className="text-[#777B61]" />
                                <span className="font-medium">{mod.quiz.title || 'Module Assessment'}</span>
                              </div>
                              {isEnrolled ? (
                                <Link to={`/quiz/${mod.quiz._id}`}>
                                  <Button variant="outline" size="sm">
                                    Take Quiz
                                  </Button>
                                </Link>
                              ) : (
                                <Lock size={13} className="text-[#A99B8A]" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Action Card & Verification Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#77736D] uppercase font-sans">Enrollment</span>
                  <Badge variant={isEnrolled ? 'published' : 'neutral'}>
                    {isEnrolled ? 'Enrolled' : 'Open Access'}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {isEnrolled ? 'Resume Your Learning' : 'Start Curriculum'}
                </CardTitle>
                <CardDescription>
                  {isEnrolled
                    ? `You are currently ${progress.percentage}% through this curriculum.`
                    : 'Enroll to stream video lessons, complete assessments, and earn an accredited certificate.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#77736D]">
                        <span>Completion progress</span>
                        <span className="font-semibold text-[#171717]">{progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#E7E2DA] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#171717] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {firstLesson && (
                      <Link to={`/lessons/${firstLesson._id}`} className="block">
                        <Button variant="primary" className="w-full" rightIcon={<ArrowRight size={14} />}>
                          Continue learning
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleEnroll}
                    isLoading={enrolling}
                  >
                    Enroll in curriculum
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Accreditation details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#777B61]" />
                  <CardTitle className="text-base">Accreditation Standards</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-xs text-[#77736D]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                    <span>90% video watch verification required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                    <span>Passing grade on all module assessments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 flex-shrink-0" />
                    <span>Cryptographic hash verification code issued upon completion.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

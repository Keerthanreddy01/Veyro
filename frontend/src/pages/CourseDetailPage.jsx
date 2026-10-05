import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Play,
  FileText,
  AlignLeft,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Award,
  Clock,
  Users,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Check,
  ArrowRight,
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const lessonTypeIcon = { video: Play, pdf: FileText, text: AlignLeft };
const LessonIcon = ({ type }) => {
  const Icon = lessonTypeIcon[type] || AlignLeft;
  return <Icon size={14} />;
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, completed: 0, total: 0 });
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [latestRevision, setLatestRevision] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
        setModules(data.modules || []);
        setLatestRevision(data.latestRevision || null);
        if (data.modules?.length > 0) setOpenModules({ [data.modules[0]._id]: true });

        if (user?.role === 'student') {
          try {
            const { data: enData } = await api.get('/enrollments/my');
            const found = enData.enrollments.find((e) => e.courseId?._id === id || e.courseId === id);
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
  }, [id]);

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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (mid) => setOpenModules((prev) => ({ ...prev, [mid]: !prev[mid] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] p-6 lg:p-12 flex justify-center">
        <div className="w-full max-w-7xl bg-white rounded-[2.5rem] h-96 animate-pulse border border-[#111111]/10" />
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = !!enrollment;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const firstLesson = modules[0]?.lessons?.[0];

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Course Catalog</span>
        </Link>

        {/* Revision Alert Banner */}
        {latestRevision && (
          <div className="bg-white border-2 border-[#111111] rounded-3xl p-5 shadow-brutal-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF490] border-2 border-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={20} className="text-[#111111]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-syne font-bold text-sm sm:text-base text-[#111111]">
                  A new version of this course is available (v{latestRevision.version || 2})
                </p>
                <p className="text-xs text-slate-600 font-body leading-relaxed">
                  Your current enrollment and progress remain completely intact. You can view and explore the latest version anytime.
                </p>
              </div>
            </div>
            <Link
              to={`/courses/${latestRevision._id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-2xs flex-shrink-0"
            >
              <span>View New Version</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Course Overview, Curriculum & Verification details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Header Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#111111]/15 p-6 sm:p-10 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111] bg-[#FFF490] border border-[#111111]/20 px-3 py-1 rounded-full">
                  {course.category || 'Curriculum'}
                </span>
                {course.level && (
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {course.level} Level
                  </span>
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-[#d4f4dd] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>Proctor Verified</span>
                </span>
              </div>

              <h1 className="font-syne font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.08]">
                {course.title}
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {course.description}
              </p>

              {/* Instructor & Meta Bar */}
              <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                    {course.instructorId?.name ? course.instructorId.name[0].toUpperCase() : 'V'}
                  </div>
                  <span className="font-bold text-slate-900">{course.instructorId?.name || 'Veyro Faculty'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#60C5F1]" />
                  <span>{totalLessons} lessons</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#60C5F1]" />
                  <span>{modules.length} modular milestones</span>
                </div>
              </div>
            </div>

            {/* Enrolled Learner Progress Banner (if enrolled) */}
            {isEnrolled && (
              <div className="bg-[#f0fbf4] rounded-[2rem] border border-emerald-200 p-6 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span>Your Learning Progress</span>
                  </span>
                  <span className="text-emerald-800 font-mono text-sm">{progress.percentage}%</span>
                </div>

                <div className="w-full bg-emerald-200/70 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-emerald-900">
                  <span>{progress.completed} of {progress.total} lessons verified</span>
                  {progress.percentage >= 100 && (
                    <span className="font-bold text-emerald-800">🎉 Course Completed!</span>
                  )}
                </div>
              </div>
            )}

            {/* Curriculum Accordion Modules */}
            <div className="bg-white rounded-[2.5rem] border border-[#111111]/15 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-syne font-bold text-slate-900 text-xl">Curriculum Modules & Lessons</h2>
                <span className="text-xs font-bold text-slate-500">{totalLessons} Total Lessons</span>
              </div>

              <div className="space-y-3">
                {modules.map((mod, mi) => (
                  <div
                    key={mod._id}
                    className="rounded-2xl border border-[#111111]/15 overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FAF7EE] transition-colors text-left bg-white"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-xs font-syne">
                          {mi + 1}
                        </div>
                        <div>
                          <p className="font-syne font-bold text-slate-900 text-sm sm:text-base">{mod.title}</p>
                          <p className="text-slate-400 text-xs font-medium">{mod.lessons?.length || 0} lessons</p>
                        </div>
                      </div>
                      <div className="text-slate-500">
                        {openModules[mod._id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </button>

                    {openModules[mod._id] && (
                      <div className="border-t border-[#111111]/10 bg-[#FAF7EE]/50 divide-y divide-slate-100">
                        {(mod.lessons || []).map((lesson) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between px-5 py-3.5 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-slate-500">
                                <LessonIcon type={lesson.type} />
                              </div>
                              <span className="text-slate-800 text-xs sm:text-sm font-semibold">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-[#d4f4dd] px-2 py-0.5 rounded-full border border-emerald-300">
                                  Preview Available
                                </span>
                              )}
                            </div>

                            <div>
                              {isEnrolled || lesson.isPreview ? (
                                <Link
                                  to={`/lessons/${lesson._id}`}
                                  className="px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#60C5F1] hover:text-[#111111] transition-colors shadow-2xs"
                                >
                                  {lesson.type === 'video' ? 'Watch' : 'Read'}
                                </Link>
                              ) : (
                                <div className="text-slate-400 flex items-center gap-1 text-xs font-semibold" title="Enroll to unlock">
                                  <Lock size={13} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Quizzes under module */}
                        {(mod.quizzes || []).map((quiz) => (
                          <div
                            key={quiz._id}
                            className="flex items-center justify-between px-5 py-3.5 hover:bg-white transition-colors bg-[#FFF490]/15"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-amber-700">
                                <HelpCircle size={15} />
                              </div>
                              <div>
                                <span className="text-slate-900 text-xs sm:text-sm font-bold block">{quiz.title}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  Proctored Assessment • {quiz.questionCount || 0} Questions • Passing: {quiz.passingScore}%
                                </span>
                              </div>
                            </div>

                            <div>
                              {isEnrolled ? (
                                <Link
                                  to={`/quiz/${quiz._id}`}
                                  className="px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#60C5F1] hover:text-[#111111] transition-colors shadow-2xs flex items-center gap-1"
                                >
                                  <span>Take Quiz</span>
                                  <ChevronRight size={13} />
                                </Link>
                              ) : (
                                <div className="text-slate-400 flex items-center gap-1 text-xs font-semibold" title="Enroll to unlock">
                                  <Lock size={13} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Action & Enrollment Card (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] border border-[#111111]/15 p-6 shadow-xs sticky top-24 space-y-6">
              
              {/* Thumbnail Container */}
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-[#FAF7EE] to-[#e8f4fc] border border-[#111111]/10 flex items-center justify-center overflow-hidden relative shadow-inner">
                {course.thumbnail ? (
                  <img src={`/static/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-2">
                    <BookOpen size={36} className="text-[#60C5F1] mx-auto" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block font-syne">
                      Veyro Academy
                    </span>
                  </div>
                )}
              </div>

              {/* Price / Enrollment Status */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-syne font-extrabold text-3xl text-slate-900">
                    {course.price ? `$${course.price}` : 'Free'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-[#d4f4dd] px-2.5 py-1 rounded-full">
                    Verified Access
                  </span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-900 bg-[#d4f4dd] px-4 py-2 rounded-full text-xs font-bold">
                      <CheckCircle size={15} />
                      <span>You are enrolled in this course</span>
                    </div>

                    {firstLesson && (
                      <Link
                        to={`/lessons/${firstLesson._id}`}
                        className="btn-dark-pill w-full py-3.5 text-xs shadow-md"
                      >
                        <Play size={14} />
                        <span>{progress.completed > 0 ? 'Continue Curriculum' : 'Start Learning'}</span>
                      </Link>
                    )}

                    {enrollment?.status === 'completed' && enrollment?.certificateCode && (
                      <Link
                        to={`/verify/${enrollment.certificateCode}`}
                        className="w-full py-3 rounded-full bg-[#FFF490] border border-[#111111]/20 text-[#111111] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#ffe566] transition-colors"
                      >
                        <Award size={16} />
                        <span>View Verified Certificate</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div>
                    {user ? (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="btn-sky-pill w-full py-3.5 text-xs shadow-md disabled:opacity-50"
                      >
                        <span>{enrolling ? 'Enrolling in Curriculum…' : 'Enroll in Curriculum'}</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/courses/${id}` } }}
                        className="btn-dark-pill w-full py-3.5 text-xs shadow-md"
                      >
                        <span>Sign In to Enroll</span>
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Value Props */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Server-authoritative 90% watch verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Anti-cheat tab-monitored assessment quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Cryptographic public ledger credential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Full lifetime curriculum access</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

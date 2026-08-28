import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Play, FileText, AlignLeft, CheckCircle, Lock, ChevronDown, ChevronRight, Award, Clock, Users, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const lessonTypeIcon = { video: Play, pdf: FileText, text: AlignLeft };
const LessonIcon = ({ type }) => { const Icon = lessonTypeIcon[type] || AlignLeft; return <Icon size={14} />; };

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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
        setModules(data.modules || []);
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
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Enrolled successfully!');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  const toggleModule = (mid) => setOpenModules((prev) => ({ ...prev, [mid]: !prev[mid] }));

  if (loading) return <div className="max-w-7xl mx-auto p-8"><div className="bg-white rounded-3xl h-96 animate-pulse shadow-sm" /></div>;
  if (!course) return null;

  const isEnrolled = !!enrollment;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Course Catalog
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Course details & Curriculum */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & metadata card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-950 bg-[#d6ecff] px-3 py-1 rounded-full">
                  {course.category || 'Curriculum'}
                </span>
                {course.level && (
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed">
                {course.description}
              </p>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" /> {course.instructorId?.name || 'Veyro Faculty'}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-slate-400" /> {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" /> {modules.length} modules
                </span>
              </div>
            </div>

            {/* Progress Card (if enrolled) */}
            {isEnrolled && (
              <div className="bg-[#f0fbf4] rounded-3xl p-5 border border-emerald-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-950">Your Learning Progress</span>
                  <span className="text-emerald-800">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-emerald-900 text-xs font-medium">
                  {progress.completed} of {progress.total} lessons completed
                </p>
              </div>
            )}

            {/* Curriculum Modules */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900">Course Curriculum</h2>
              
              <div className="space-y-3">
                {modules.map((mod) => (
                  <div key={mod._id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{mod.title}</p>
                          <p className="text-slate-400 text-xs">{mod.lessons?.length || 0} lessons</p>
                        </div>
                      </div>
                      {openModules[mod._id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </button>

                    {openModules[mod._id] && (
                      <div className="border-t border-slate-100 bg-[#fbfcfd] divide-y divide-slate-100">
                        {(mod.lessons || []).map((lesson) => (
                          <div key={lesson._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="text-slate-400"><LessonIcon type={lesson.type} /></div>
                              <span className="text-slate-800 text-xs font-semibold">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-[#d4f4dd] px-2 py-0.5 rounded-full">
                                  Preview
                                </span>
                              )}
                            </div>
                            {isEnrolled || lesson.isPreview ? (
                              <Link
                                to={`/lessons/${lesson._id}`}
                                className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
                              >
                                {lesson.type === 'video' ? 'Watch' : 'Read'}
                              </Link>
                            ) : (
                              <Lock size={14} className="text-slate-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Enrollment Action Sticky Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 sticky top-24 space-y-5">
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-[#e0e7ff] to-[#f3e8ff] flex items-center justify-center overflow-hidden shadow-inner">
                {course.thumbnail ? (
                  <img src={`/static/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={44} className="text-indigo-600/50" />
                )}
              </div>

              {user?.role === 'student' && (
                isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-800 bg-[#d4f4dd] px-3 py-1.5 rounded-full text-xs font-bold justify-center">
                      <CheckCircle size={15} /> You are enrolled in this course
                    </div>
                    {modules[0]?.lessons?.[0] && (
                      <Link
                        to={`/lessons/${modules[0].lessons[0]._id}`}
                        className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <Play size={14} /> {progress.completed > 0 ? 'Continue Learning' : 'Start Learning'}
                      </Link>
                    )}
                    {enrollment?.status === 'completed' && enrollment?.certificateCode && (
                      <Link
                        to={`/verify/${enrollment.certificateCode}`}
                        className="flex items-center justify-center gap-2 text-amber-700 bg-[#fff3c4] py-2 rounded-full text-xs font-bold hover:bg-amber-200 transition-colors"
                      >
                        <Award size={15} /> View Certificate
                      </Link>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {enrolling ? 'Enrolling…' : 'Enroll Free'}
                  </button>
                )
              )}

              {!user && (
                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center shadow-md transition-all"
                >
                  Log in to Enroll
                </Link>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500 font-medium">
                <div className="flex justify-between"><span>Curriculum Modules</span><span className="font-bold text-slate-900">{modules.length}</span></div>
                <div className="flex justify-between"><span>Total Lessons</span><span className="font-bold text-slate-900">{totalLessons}</span></div>
                <div className="flex justify-between"><span>Certificate</span><span className="font-bold text-emerald-700">Included on completion</span></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

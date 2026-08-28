import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Play, FileText, AlignLeft, CheckCircle, Lock, ChevronDown, ChevronRight, Award, Clock, Users } from 'lucide-react';
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

  if (loading) return <div className="page-container"><div className="card h-96 animate-pulse" /></div>;
  if (!course) return null;

  const isEnrolled = !!enrollment;
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Course info */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <span className="badge-published mb-3 inline-block">{course.category}</span>
            <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>
            <p className="text-slate-400 leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Users size={14} /> {course.instructorId?.name}</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {modules.length} modules</span>
            </div>
          </div>

          {/* Progress bar for enrolled students */}
          {isEnrolled && (
            <div className="card p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">Your Progress</span>
                <span className="text-brand-400 font-semibold">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div className="bg-brand-gradient h-2 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
              </div>
              <p className="text-slate-400 text-xs mt-2">{progress.completed} / {progress.total} lessons completed</p>
            </div>
          )}

          {/* Curriculum */}
          <h2 className="text-xl font-semibold text-white mb-4">Course Curriculum</h2>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div key={mod._id} className="card overflow-hidden">
                <button onClick={() => toggleModule(mod._id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-600/20">
                      <BookOpen size={16} className="text-brand-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{mod.title}</p>
                      <p className="text-slate-400 text-xs">{mod.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  {openModules[mod._id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>

                {openModules[mod._id] && (
                  <div className="border-t border-white/5">
                    {(mod.lessons || []).map((lesson) => (
                      <div key={lesson._id} className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400"><LessonIcon type={lesson.type} /></div>
                          <span className="text-slate-300 text-sm">{lesson.title}</span>
                          {lesson.isPreview && <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">Preview</span>}
                        </div>
                        {isEnrolled || lesson.isPreview ? (
                          <Link to={`/lessons/${lesson._id}`} className="text-brand-400 hover:text-brand-300 text-xs font-medium">
                            {lesson.type === 'video' ? 'Watch' : 'Read'}
                          </Link>
                        ) : <Lock size={14} className="text-slate-600" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Enrollment card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="w-full h-48 rounded-xl bg-brand-gradient/20 flex items-center justify-center overflow-hidden mb-5">
              {course.thumbnail
                ? <img src={`/static/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                : <BookOpen size={48} className="text-brand-400/50" />}
            </div>

            {user?.role === 'student' && (
              isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium justify-center">
                    <CheckCircle size={18} /> Enrolled
                  </div>
                  {modules[0]?.lessons?.[0] && (
                    <Link to={`/lessons/${modules[0].lessons[0]._id}`} className="btn-primary w-full flex items-center justify-center gap-2">
                      <Play size={16} /> {progress.completed > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Link>
                  )}
                  {enrollment?.status === 'completed' && enrollment?.certificateCode && (
                    <Link to={`/verify/${enrollment.certificateCode}`}
                      className="flex items-center justify-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors">
                      <Award size={16} /> View Certificate
                    </Link>
                  )}
                </div>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full py-3 text-base">
                  {enrolling ? 'Enrolling…' : 'Enroll Free'}
                </button>
              )
            )}

            {!user && (
              <Link to="/login" className="btn-primary w-full flex items-center justify-center py-3 text-base">
                Login to Enroll
              </Link>
            )}

            <div className="mt-5 space-y-2.5 text-sm text-slate-400">
              <div className="flex justify-between"><span>Modules</span><span className="text-white">{modules.length}</span></div>
              <div className="flex justify-between"><span>Lessons</span><span className="text-white">{totalLessons}</span></div>
              <div className="flex justify-between"><span>Instructor</span><span className="text-white">{course.instructorId?.name}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Save,
  Send,
  Loader2,
  BookOpen,
  FileText,
  Play,
  AlignLeft,
  ArrowLeft,
  ShieldCheck,
  Plus,
  HelpCircle,
  Clock,
  Pencil,
  BarChart2,
  Users,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Search,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lessonTypes = [
  { value: 'video', label: 'Video Lecture', icon: Play },
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'text', label: 'Rich Text Article', icon: AlignLeft },
];

export default function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newModule, setNewModule] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [lessonForms, setLessonForms] = useState({});
  const [activeTab, setActiveTab] = useState({}); // { [moduleId]: 'lesson' | 'quiz' }
  const [quizForms, setQuizForms] = useState({});
  const [editingQuizId, setEditingQuizId] = useState({}); // { [moduleId]: quizId | null }

  const load = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setModules(data.modules || []);
      if (data.modules?.length > 0) setOpen({ [data.modules[0]._id]: true });
    } catch {
      toast.error('Course not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addModule = async () => {
    if (!newModule.trim()) return;
    try {
      const { data } = await api.post(`/courses/${id}/modules`, { title: newModule });
      setModules((m) => [...m, { ...data.module, lessons: [], quizzes: [] }]);
      setNewModule('');
      setAddingModule(false);
      toast.success('Module milestone added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add module');
    }
  };

  const deleteModule = async (mid) => {
    if (!confirm('Are you sure you want to delete this module and all its attached lessons and quizzes?')) return;
    try {
      await api.delete(`/modules/${mid}`);
      setModules((m) => m.filter((x) => x._id !== mid));
      toast.success('Module deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const addLesson = async (moduleId) => {
    const form = lessonForms[moduleId] || {};
    if (!form.title?.trim() || !form.type) {
      toast.error('Title and lesson type are required');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('type', form.type);
      if (form.type === 'text') fd.append('textContent', form.textContent || '');
      if (form.durationSeconds) fd.append('durationSeconds', form.durationSeconds);
      if (form.file) fd.append('file', form.file);

      const { data } = await api.post(`/modules/${moduleId}/lessons`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId ? { ...mod, lessons: [...(mod.lessons || []), data.lesson] } : mod
        )
      );
      setLessonForms((f) => ({ ...f, [moduleId]: {} }));
      toast.success('Lesson attached to module');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add lesson');
    }
  };

  const startEditQuiz = async (moduleId, quizId) => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      const q = data.quiz;
      setQuizForms((f) => ({
        ...f,
        [moduleId]: {
          title: q.title,
          timeLimitSeconds: q.timeLimitSeconds,
          passingScore: q.passingScore,
          maxAttempts: q.maxAttempts || 3,
          questions: (q.questions || []).map((qn) => ({
            questionText: qn.questionText,
            options: qn.options || ['', ''],
            correctOptionIndex: qn.correctOptionIndex ?? 0,
          })),
        },
      }));
      setEditingQuizId((prev) => ({ ...prev, [moduleId]: quizId }));
      setActiveTab((prev) => ({ ...prev, [moduleId]: 'quiz' }));
      toast.success('Loaded quiz into editor');
    } catch (err) {
      toast.error('Failed to load quiz details for editing');
    }
  };

  const deleteQuiz = async (moduleId, quizId, quizTitle) => {
    if (!confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId
            ? { ...mod, quizzes: (mod.quizzes || []).filter((q) => q._id !== quizId) }
            : mod
        )
      );
      if (editingQuizId[moduleId] === quizId) {
        setEditingQuizId((prev) => ({ ...prev, [moduleId]: null }));
        setQuizForms((f) => ({ ...f, [moduleId]: undefined }));
      }
      toast.success('Quiz deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete quiz');
    }
  };

  const saveQuiz = async (moduleId) => {
    const qf = quizForms[moduleId] || {};
    const title = qf.title?.trim();
    if (!title) {
      toast.error('Quiz title is required');
      return;
    }
    const questions = qf.questions || [
      { questionText: '', options: ['', ''], correctOptionIndex: 0 },
    ];
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty`);
        return;
      }
      const validOptions = (questions[i].options || []).filter((o) => o.trim());
      if (validOptions.length < 2) {
        toast.error(`Question ${i + 1} requires at least 2 valid options`);
        return;
      }
    }

    const payload = {
      title,
      timeLimitSeconds: Number(qf.timeLimitSeconds) || 180,
      passingScore: Number(qf.passingScore) || 60,
      maxAttempts: Number(qf.maxAttempts) || 3,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        options: q.options.filter((o) => o.trim()),
        correctOptionIndex: Number(q.correctOptionIndex) || 0,
        points: 1,
      })),
    };

    const isEditing = editingQuizId[moduleId];
    try {
      if (isEditing) {
        const { data } = await api.put(`/quizzes/${isEditing}`, payload);
        setModules((m) =>
          m.map((mod) =>
            mod._id === moduleId
              ? {
                  ...mod,
                  quizzes: (mod.quizzes || []).map((q) =>
                    q._id === isEditing ? { ...q, ...data.quiz } : q
                  ),
                }
              : mod
          )
        );
        setEditingQuizId((prev) => ({ ...prev, [moduleId]: null }));
        setQuizForms((f) => ({ ...f, [moduleId]: undefined }));
        toast.success('Assessment quiz updated successfully!');
      } else {
        const { data } = await api.post(`/modules/${moduleId}/quizzes`, payload);
        setModules((m) =>
          m.map((mod) =>
            mod._id === moduleId
              ? { ...mod, quizzes: [...(mod.quizzes || []), data.quiz] }
              : mod
          )
        );
        setQuizForms((f) => ({ ...f, [moduleId]: undefined }));
        toast.success('Proctored quiz attached to module!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save quiz');
    }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId ? { ...mod, lessons: mod.lessons.filter((l) => l._id !== lessonId) } : mod
        )
      );
      toast.success('Lesson removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const submitForReview = async () => {
    setSaving(true);
    try {
      const { data } = await api.post(`/courses/${id}/submit`);
      toast.success('Curriculum submitted for administrative review!');
      setCourse(data.course);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit curriculum');
    } finally {
      setSaving(false);
    }
  };

  const publishCourse = async () => {
    setSaving(true);
    try {
      const { data } = await api.post(`/courses/${id}/publish`);
      toast.success('Course published to the public catalog!');
      setCourse(data.course);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish course');
    } finally {
      setSaving(false);
    }
  };

  const retractSubmission = async () => {
    if (!window.confirm('Are you sure you want to retract your submission? The course will return to draft status so you can continue editing.')) {
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post(`/courses/${id}/retract`);
      toast.success('Curriculum submission retracted back to draft.');
      setCourse(data.course);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to retract submission');
    } finally {
      setSaving(false);
    }
  };

  const createRevision = async () => {
    if (!window.confirm('Create a new draft revision? Active learners will continue accessing the published curriculum uninterrupted while you prepare updates in this revision.')) {
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post(`/courses/${id}/revision`);
      toast.success(data.message || 'Draft revision created!');
      if (data.revision?._id) {
        navigate(`/instructor/courses/${data.revision._id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create course revision');
    } finally {
      setSaving(false);
    }
  };

  // Analytics State
  const [pageTab, setPageTab] = useState(
    new URLSearchParams(window.location.search).get('tab') || 'studio'
  );
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [rosterFilter, setRosterFilter] = useState('all');
  const [rosterSearch, setRosterSearch] = useState('');

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const { data } = await api.get(`/courses/${id}/analytics`);
      setAnalytics(data.analytics);
    } catch (err) {
      if (err.response?.status === 403) {
        setAnalyticsError('Access denied. You can only view analytics for your own courses.');
      } else {
        setAnalyticsError(err.response?.data?.error || 'Failed to load course analytics.');
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (pageTab === 'analytics') {
      loadAnalytics();
    }
  }, [pageTab, id]);

  const setLF = (mid, k, v) => setLessonForms((f) => ({ ...f, [mid]: { ...(f[mid] || {}), [k]: v } }));

  const getQF = (mid) =>
    quizForms[mid] || {
      title: '',
      timeLimitSeconds: 180,
      passingScore: 60,
      maxAttempts: 3,
      questions: [
        { questionText: '', options: ['', '', ''], correctOptionIndex: 0 },
      ],
    };

  const setQF = (mid, updater) => {
    setQuizForms((prev) => {
      const current = getQF(mid);
      return { ...prev, [mid]: updater(current) };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] p-6 lg:p-12 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] h-96 animate-pulse border border-[#111111]/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 p-4 sm:p-6 lg:p-8 animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Instructor Studio</span>
            </Link>
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {course?.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                course?.status === 'published' ? 'bg-[#d4f4dd] text-emerald-900 border border-emerald-300' :
                course?.status === 'approved' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold' :
                course?.status === 'under_review' || course?.status === 'pending' ? 'bg-[#fff3c4] text-amber-900 border border-amber-300' :
                course?.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                'bg-slate-100 text-slate-700'
              }`}>
                {course?.status === 'approved' ? 'Approved • Ready to Publish' :
                 course?.status === 'under_review' ? 'Under Review' :
                 course?.status}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{course?.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(course?.status === 'draft' || course?.status === 'rejected') && (
              <button
                onClick={submitForReview}
                disabled={saving}
                className="btn-dark-pill text-xs px-5 py-2.5 shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{course?.status === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification'}</span>
              </button>
            )}

            {course?.status === 'approved' && (
              <button
                onClick={publishCourse}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Publish Course Live</span>
              </button>
            )}

            {(course?.status === 'under_review' || course?.status === 'pending') && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-4 py-2 text-xs font-bold text-[#111111]">
                  <Clock size={14} />
                  <span>Under Review</span>
                </span>
                <button
                  onClick={retractSubmission}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                  title="Retract submission back to draft"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <span>Retract Submission</span>}
                </button>
              </div>
            )}

            {course?.status === 'published' && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#d4f4dd] border border-emerald-300 rounded-full px-4 py-2 text-xs font-bold text-emerald-900">
                  <CheckCircle size={14} />
                  <span>Published • v{course?.version || 1}</span>
                </span>
                <button
                  onClick={createRevision}
                  disabled={saving}
                  className="btn-dark-pill text-xs px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Create draft revision while active learners continue using the current published version"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />}
                  <span>Create Draft Revision</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Callout Banners */}
        {course?.status === 'approved' && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-0.5">
              <p className="text-emerald-950 font-bold font-syne text-sm flex items-center gap-1.5">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Accreditation Approved!</span>
              </p>
              <p className="text-emerald-800">
                This curriculum has been verified by the administration. You can now publish it to make it available for student enrollment.
              </p>
            </div>
            <button
              onClick={publishCourse}
              disabled={saving}
              className="btn-dark-pill text-xs px-5 py-2 flex-shrink-0"
            >
              <Sparkles size={13} />
              <span>Publish to Catalog</span>
            </button>
          </div>
        )}

        {course?.status === 'rejected' && course?.rejectionReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 text-xs space-y-1.5 animate-fade-in">
            <p className="text-rose-950 font-bold font-syne text-sm flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-rose-600" />
              <span>Accreditation Rejection Feedback</span>
            </p>
            <p className="text-rose-800 bg-white p-3 rounded-xl border border-rose-200">
              {course.rejectionReason}
            </p>
            <p className="text-slate-500 text-[11px] pt-1">
              Please address the items above by updating your lessons or assessment quizzes, then click &ldquo;Resubmit for Verification&rdquo;.
            </p>
          </div>
        )}

        {/* Studio / Analytics Tabs */}
        <div className="flex border-b border-[#111111]/15 gap-4 pt-2">
          <button
            onClick={() => setPageTab('studio')}
            className={`pb-3 text-xs font-bold font-syne uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
              pageTab === 'studio'
                ? 'border-[#111111] text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <BookOpen size={14} />
            <span>Curriculum Studio</span>
          </button>
          <button
            onClick={() => setPageTab('analytics')}
            className={`pb-3 text-xs font-bold font-syne uppercase tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
              pageTab === 'analytics'
                ? 'border-[#111111] text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <BarChart2 size={14} />
            <span>Course Analytics & Learners</span>
            {analytics?.metrics?.totalEnrolled > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FFF490] text-[#111111] text-[10px] font-bold">
                {analytics.metrics.totalEnrolled}
              </span>
            )}
          </button>
        </div>

        {/* Active Tab Content: Studio vs Analytics */}
        {pageTab === 'analytics' ? (
          <CourseAnalyticsView
            analytics={analytics}
            loading={analyticsLoading}
            error={analyticsError}
            onRetry={loadAnalytics}
            rosterFilter={rosterFilter}
            setRosterFilter={setRosterFilter}
            rosterSearch={rosterSearch}
            setRosterSearch={setRosterSearch}
          />
        ) : (
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-slate-900 text-lg">Curriculum Modules & Lessons</h2>
            <button
              onClick={() => setAddingModule(true)}
              className="btn-sky-pill text-xs px-4 py-2"
            >
              <Plus size={14} />
              <span>Add Module</span>
            </button>
          </div>

          {/* New Module Form Card */}
          {addingModule && (
            <div className="bg-white rounded-2xl p-5 border border-[#111111]/20 shadow-xs space-y-3 animate-slide-up">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                New Module Milestone Title
              </label>
              <input
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                placeholder="e.g. Module 1: Foundations & Architecture Setup"
                className="w-full bg-[#FAF7EE] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddingModule(false)}
                  className="px-4 py-2 rounded-full bg-white border border-[#111111]/20 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addModule}
                  className="btn-dark-pill text-xs px-4 py-2"
                >
                  Save Module
                </button>
              </div>
            </div>
          )}

          {/* Module Cards Accordion */}
          {modules.length === 0 && !addingModule ? (
            <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-[#111111]/20 space-y-3">
              <BookOpen size={36} className="text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No modules added yet.</p>
              <p className="text-xs text-slate-500">Add modules to organize your video lessons and quizzes.</p>
            </div>
          ) : (
            modules.map((mod, mi) => (
              <div key={mod._id} className="bg-white rounded-[2rem] border border-[#111111]/15 overflow-hidden shadow-xs">
                
                {/* Module Bar */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#FAF7EE] transition-colors"
                  onClick={() => setOpen((o) => ({ ...o, [mod._id]: !o[mod._id] }))}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#111111] text-white font-syne font-bold text-xs flex items-center justify-center">
                      {mi + 1}
                    </span>
                    <span className="font-syne font-bold text-slate-900 text-base">{mod.title}</span>
                    <span className="text-slate-400 text-xs font-semibold">({mod.lessons?.length || 0} lessons)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(mod._id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="text-slate-500">
                      {open[mod._id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                </div>

                {/* Module Lessons Content */}
                {open[mod._id] && (
                  <div className="border-t border-[#111111]/10 p-5 bg-[#FAF7EE]/50 space-y-4">
                    
                    {/* Lesson Items */}
                    {(mod.lessons || []).map((l) => (
                      <div
                        key={l._id}
                        className="flex items-center justify-between bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-900">
                          {l.type === 'video' && <Play size={14} className="text-[#60C5F1]" />}
                          {l.type === 'pdf' && <FileText size={14} className="text-amber-600" />}
                          {l.type === 'text' && <AlignLeft size={14} className="text-emerald-600" />}
                          <span>{l.title}</span>
                          {l.durationSeconds > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({Math.floor(l.durationSeconds / 60)}m {l.durationSeconds % 60}s)
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deleteLesson(mod._id, l._id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Module Quizzes */}
                    {(mod.quizzes || []).map((q) => (
                      <div
                        key={q._id}
                        className="flex items-center justify-between bg-[#FFF490]/25 rounded-2xl p-3.5 shadow-2xs border border-[#111111]/15"
                      >
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
                          <HelpCircle size={15} className="text-amber-800" />
                          <span>{q.title}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            ({q.questionCount || q.questions?.length || 0} Questions • Limit: {q.timeLimitSeconds}s • Pass: {q.passingScore}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditQuiz(mod._id, q._id)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#111111]/15 text-slate-700 hover:text-black hover:bg-[#FAF7EE] transition-colors flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                            title="Edit Assessment Quiz"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuiz(mod._id, q._id, q.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Assessment Quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Section Switcher Tabs: Lesson vs Quiz */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveTab((prev) => ({ ...prev, [mod._id]: 'lesson' }))}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                          (activeTab[mod._id] || 'lesson') === 'lesson'
                            ? 'bg-[#111111] text-white'
                            : 'bg-white text-slate-600 border border-[#111111]/15 hover:bg-[#FAF7EE]'
                        }`}
                      >
                        + Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab[mod._id] !== 'quiz') {
                            setActiveTab((prev) => ({ ...prev, [mod._id]: 'quiz' }));
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                          activeTab[mod._id] === 'quiz'
                            ? 'bg-[#111111] text-white'
                            : 'bg-white text-slate-600 border border-[#111111]/15 hover:bg-[#FAF7EE]'
                        }`}
                      >
                        {editingQuizId[mod._id] ? 'Edit Assessment Quiz' : '+ Add Assessment Quiz'}
                      </button>
                    </div>

                    {/* Form: Add Lesson */}
                    {(activeTab[mod._id] || 'lesson') === 'lesson' ? (
                      <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 font-syne">
                          Attach Lesson to this Module
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <input
                              value={lessonForms[mod._id]?.title || ''}
                              onChange={(e) => setLF(mod._id, 'title', e.target.value)}
                              placeholder="Lesson Title"
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <select
                              value={lessonForms[mod._id]?.type || 'video'}
                              onChange={(e) => setLF(mod._id, 'type', e.target.value)}
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            >
                              {lessonTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              placeholder="Duration (sec)"
                              value={lessonForms[mod._id]?.durationSeconds || ''}
                              onChange={(e) => setLF(mod._id, 'durationSeconds', e.target.value)}
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* File upload or text content */}
                        {lessonForms[mod._id]?.type === 'text' ? (
                          <textarea
                            rows={3}
                            value={lessonForms[mod._id]?.textContent || ''}
                            onChange={(e) => setLF(mod._id, 'textContent', e.target.value)}
                            placeholder="Write lesson text or article content…"
                            className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                          />
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept={lessonForms[mod._id]?.type === 'pdf' ? '.pdf' : 'video/*'}
                              onChange={(e) => setLF(mod._id, 'file', e.target.files[0])}
                              className="text-xs text-slate-500"
                            />
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => addLesson(mod._id)}
                            className="btn-dark-pill text-xs px-4 py-2"
                          >
                            <Plus size={13} />
                            <span>Attach Lesson</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Form: Add / Edit Quiz */
                      <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 font-syne">
                              {editingQuizId[mod._id] ? 'Edit Assessment Quiz' : 'Create Module Assessment Quiz'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Enforces server-authoritative timer, tab-switch monitoring, and randomized question order.
                            </p>
                          </div>
                          {editingQuizId[mod._id] && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuizId((prev) => ({ ...prev, [mod._id]: null }));
                                setActiveForm((prev) => ({ ...prev, [mod._id]: null }));
                              }}
                              className="text-xs text-slate-500 hover:text-black font-semibold underline"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                              Quiz Title
                            </label>
                            <input
                              value={getQF(mod._id).title}
                              onChange={(e) =>
                                setQF(mod._id, (f) => ({ ...f, title: e.target.value }))
                              }
                              placeholder="e.g. Milestone Comprehension Exam"
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                              Time Limit (sec)
                            </label>
                            <input
                              type="number"
                              min={30}
                              value={getQF(mod._id).timeLimitSeconds}
                              onChange={(e) =>
                                setQF(mod._id, (f) => ({
                                  ...f,
                                  timeLimitSeconds: Number(e.target.value),
                                }))
                              }
                              placeholder="300"
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                              Passing Score (%)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={getQF(mod._id).passingScore}
                              onChange={(e) =>
                                setQF(mod._id, (f) => ({
                                  ...f,
                                  passingScore: Number(e.target.value),
                                }))
                              }
                              placeholder="60"
                              className="w-full bg-[#FAF7EE] text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-3 pt-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Assessment Questions & Options
                          </p>

                          {getQF(mod._id).questions.map((q, qi) => (
                            <div
                              key={qi}
                              className="p-3.5 rounded-xl bg-[#FAF7EE] border border-[#111111]/10 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-syne font-bold text-xs text-slate-800">
                                  Question {qi + 1}
                                </span>
                                {getQF(mod._id).questions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQF(mod._id, (f) => ({
                                        ...f,
                                        questions: f.questions.filter((_, idx) => idx !== qi),
                                      }))
                                    }
                                    className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                                  >
                                    Remove Question
                                  </button>
                                )}
                              </div>

                              <input
                                value={q.questionText}
                                onChange={(e) =>
                                  setQF(mod._id, (f) => {
                                    const updated = [...f.questions];
                                    updated[qi] = { ...updated[qi], questionText: e.target.value };
                                    return { ...f, questions: updated };
                                  })
                                }
                                placeholder="Enter question statement…"
                                className="w-full bg-white text-xs font-medium rounded-xl p-2.5 border border-[#111111]/15 outline-none"
                              />

                              {/* Options */}
                              <div className="space-y-1.5 pl-2 border-l-2 border-[#111111]/20">
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  Select the radio button next to the correct answer:
                                </span>
                                {q.options.map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct_${mod._id}_${qi}`}
                                      checked={q.correctOptionIndex === oi}
                                      onChange={() =>
                                        setQF(mod._id, (f) => {
                                          const updated = [...f.questions];
                                          updated[qi] = { ...updated[qi], correctOptionIndex: oi };
                                          return { ...f, questions: updated };
                                        })
                                      }
                                      className="accent-[#111111] cursor-pointer"
                                      title="Mark as correct answer"
                                    />
                                    <input
                                      value={opt}
                                      onChange={(e) =>
                                        setQF(mod._id, (f) => {
                                          const updated = [...f.questions];
                                          const newOpts = [...updated[qi].options];
                                          newOpts[oi] = e.target.value;
                                          updated[qi] = { ...updated[qi], options: newOpts };
                                          return { ...f, questions: updated };
                                        })
                                      }
                                      placeholder={`Option ${oi + 1}`}
                                      className="flex-1 bg-white text-xs font-medium rounded-lg p-2 border border-[#111111]/15 outline-none"
                                    />
                                  </div>
                                ))}

                                {q.options.length < 5 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQF(mod._id, (f) => {
                                        const updated = [...f.questions];
                                        updated[qi] = {
                                          ...updated[qi],
                                          options: [...updated[qi].options, ''],
                                        };
                                        return { ...f, questions: updated };
                                      })
                                    }
                                    className="text-[10px] font-bold text-slate-700 hover:text-black mt-1"
                                  >
                                    + Add Option
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setQF(mod._id, (f) => ({
                                ...f,
                                questions: [
                                  ...f.questions,
                                  { questionText: '', options: ['', '', ''], correctOptionIndex: 0 },
                                ],
                              }))
                            }
                            className="w-full py-2 rounded-xl border border-dashed border-[#111111]/30 text-xs font-bold text-slate-700 hover:bg-[#FAF7EE] transition-colors"
                          >
                            + Add Another Question
                          </button>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => saveQuiz(mod._id)}
                            className="btn-dark-pill text-xs px-5 py-2.5"
                          >
                            <ShieldCheck size={14} />
                            <span>{editingQuizId[mod._id] ? 'Update Assessment Quiz' : 'Save & Publish Quiz'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))
          )}
        </div>
        )}

      </div>
    </div>
  );
}

// ── Course Analytics & Student Roster View ──────────────────────────────────
function CourseAnalyticsView({
  analytics,
  loading,
  error,
  onRetry,
  rosterFilter,
  setRosterFilter,
  rosterSearch,
  setRosterSearch,
}) {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-44 bg-white rounded-2xl border border-slate-200" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
        <AlertTriangle size={32} className="text-rose-600 mx-auto" />
        <h3 className="font-syne font-bold text-slate-900 text-base">Failed to Load Course Analytics</h3>
        <p className="text-xs text-rose-700 max-w-sm mx-auto">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-dark-pill text-xs px-5 py-2 mx-auto inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  if (!analytics) return null;

  const { metrics, moduleProgress, students } = analytics;

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (rosterFilter === 'active' && s.status !== 'active') return false;
    if (rosterFilter === 'completed' && s.status !== 'completed') return false;
    if (rosterFilter === 'dropped' && s.status !== 'dropped') return false;
    if (rosterSearch) {
      const q = rosterSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Stat Capsules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Enrolled</span>
          <p className="font-syne font-extrabold text-2xl text-slate-900">{metrics.totalEnrolled}</p>
          <span className="text-[10px] text-slate-400 font-semibold block">Students</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Learners</span>
          <p className="font-syne font-extrabold text-2xl text-sky-700">{metrics.activeLearners}</p>
          <span className="text-[10px] text-slate-400 font-semibold block">In Progress</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Completed</span>
          <p className="font-syne font-extrabold text-2xl text-emerald-800">{metrics.completedStudents}</p>
          <span className="text-[10px] text-slate-400 font-semibold block">Graduated</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Completion Rate</span>
          <p className="font-syne font-extrabold text-2xl text-slate-900">{metrics.completionRate}%</p>
          <span className="text-[10px] text-slate-400 font-semibold block">Target: 60%+</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Avg Progress</span>
          <p className="font-syne font-extrabold text-2xl text-slate-900">{metrics.avgCourseProgress}%</p>
          <span className="text-[10px] text-slate-400 font-semibold block">Across cohort</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#111111]/15 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Avg Quiz Score</span>
          <p className="font-syne font-extrabold text-2xl text-amber-700">{metrics.avgQuizScore}%</p>
          <span className="text-[10px] text-slate-400 font-semibold block">Assessment avg</span>
        </div>
      </div>

      {/* Module Progress Breakdown */}
      <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-syne font-bold text-slate-900 text-base">Module-Level Cohort Progress</h3>
            <p className="text-xs text-slate-500">Average student completion rates across each curriculum milestone.</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">{moduleProgress.length} Modules</span>
        </div>

        {moduleProgress.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No modules created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moduleProgress.map((mod, i) => (
              <div key={mod.moduleId || i} className="p-3.5 rounded-xl border border-slate-100 bg-[#FAF7EE]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-syne font-bold text-slate-800 line-clamp-1">
                    {i + 1}. {mod.title}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{mod.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#111111] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${mod.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">{mod.lessonCount} lessons</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-[2rem] border border-[#111111]/15 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-syne font-bold text-slate-900 text-base">Enrolled Student Roster</h3>
            <p className="text-xs text-slate-500">Track individual learner progress, test scores, and completion status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex bg-[#FAF7EE] p-1 rounded-xl border border-[#111111]/10 text-xs">
              {['all', 'active', 'completed', 'dropped'].map((f) => (
                <button
                  key={f}
                  onClick={() => setRosterFilter(f)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                    rosterFilter === f
                      ? 'bg-white shadow-2xs text-[#111111]'
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search student…"
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none bg-slate-50/50 focus:bg-white w-40 sm:w-48"
              />
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-[#FAF7EE]/50">
            <Users size={32} className="text-slate-400 mx-auto" />
            <p className="font-syne font-bold text-sm text-slate-800">No Students Enrolled Yet</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Once your course is published, learners who enroll will appear here with detailed progress and quiz tracking.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No students match the current filter or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Enrolled</th>
                  <th className="pb-3 px-3">Progress</th>
                  <th className="pb-3 px-3">Lessons</th>
                  <th className="pb-3 px-3">Quizzes</th>
                  <th className="pb-3 px-3">Quiz Avg</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const enrollDateStr = st.enrolledAt
                    ? new Date(st.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';
                  const activityDateStr = st.lastActivity
                    ? new Date(st.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';
                  const isComplete = st.status === 'completed';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-syne font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[10px] text-slate-400 block">{st.email}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{enrollDateStr}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 w-8">{st.progressPercent}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#111111] h-1.5 rounded-full"
                              style={{ width: `${st.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{st.lessonsCompleted}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{st.quizzesAttempted}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold font-mono ${st.quizAverage >= 70 ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {st.quizzesAttempted > 0 ? `${st.quizAverage}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isComplete ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          st.status === 'active' ? 'bg-[#d6ecff] text-sky-900 border border-sky-300' :
                          st.status === 'dropped' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {st.status === 'completed' ? 'Completed' : st.status === 'active' ? 'Active' : st.status === 'dropped' ? 'Dropped' : st.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-medium">{activityDateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

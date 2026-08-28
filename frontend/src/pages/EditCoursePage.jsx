import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, Upload, Save, Send, Loader2, BookOpen, FileText, Play, AlignLeft, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lessonTypes = [
  { value: 'video', label: 'Video', icon: Play },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'text', label: 'Text', icon: AlignLeft },
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

  const load = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setModules(data.modules || []);
      if (data.modules?.length > 0) setOpen({ [data.modules[0]._id]: true });
    } catch { toast.error('Course not found'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const addModule = async () => {
    if (!newModule.trim()) return;
    try {
      const { data } = await api.post(`/courses/${id}/modules`, { title: newModule });
      setModules((m) => [...m, { ...data.module, lessons: [] }]);
      setNewModule('');
      setAddingModule(false);
      toast.success('Module added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const deleteModule = async (mid) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/modules/${mid}`);
      setModules((m) => m.filter((x) => x._id !== mid));
      toast.success('Module deleted');
    } catch { toast.error('Delete failed'); }
  };

  const addLesson = async (moduleId) => {
    const form = lessonForms[moduleId] || {};
    if (!form.title?.trim() || !form.type) { toast.error('Title and type required'); return; }
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('type', form.type);
      if (form.type === 'text') fd.append('textContent', form.textContent || '');
      if (form.durationSeconds) fd.append('durationSeconds', form.durationSeconds);
      if (form.file) fd.append('file', form.file);

      const { data } = await api.post(`/modules/${moduleId}/lessons`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModules((m) => m.map((mod) =>
        mod._id === moduleId ? { ...mod, lessons: [...(mod.lessons || []), data.lesson] } : mod
      ));
      setLessonForms((f) => ({ ...f, [moduleId]: {} }));
      toast.success('Lesson added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      setModules((m) => m.map((mod) =>
        mod._id === moduleId ? { ...mod, lessons: mod.lessons.filter((l) => l._id !== lessonId) } : mod
      ));
      toast.success('Lesson deleted');
    } catch { toast.error('Delete failed'); }
  };

  const submitForReview = async () => {
    setSaving(true);
    try {
      await api.patch(`/courses/${id}/submit`);
      toast.success('Submitted for admin review!');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const setLF = (mid, k, v) => setLessonForms((f) => ({ ...f, [mid]: { ...(f[mid] || {}), [k]: v } }));

  if (loading) return <div className="max-w-4xl mx-auto p-8"><div className="bg-white rounded-3xl h-64 animate-pulse shadow-sm" /></div>;

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Studio
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{course?.title}</h1>
            <span className={`mt-1.5 inline-block text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
              course?.status === 'published' ? 'bg-[#d4f4dd] text-emerald-900' :
              course?.status === 'pending' ? 'bg-[#fff3c4] text-amber-900' :
              course?.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
              'bg-slate-200 text-slate-700'
            }`}>
              {course?.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(course?.status === 'draft' || course?.status === 'rejected') && (
              <button
                onClick={submitForReview}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit Curriculum for Review</span>
              </button>
            )}
          </div>
        </div>

        {course?.status === 'rejected' && course?.rejectionReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs">
            <p className="text-rose-800 font-bold">Admin Feedback on Rejection:</p>
            <p className="text-rose-700 mt-1">{course.rejectionReason}</p>
          </div>
        )}

        {/* Modules list */}
        <div className="space-y-4">
          {modules.map((mod, mi) => (
            <div key={mod._id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setOpen((o) => ({ ...o, [mod._id]: !o[mod._id] }))}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                    {mi + 1}
                  </span>
                  <BookOpen size={16} className="text-indigo-600" />
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">{mod.title}</span>
                  <span className="text-slate-400 text-xs font-medium">({mod.lessons?.length || 0} lessons)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteModule(mod._id); }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 size={15} />
                  </button>
                  {open[mod._id] ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </div>

              {open[mod._id] && (
                <div className="border-t border-slate-100 p-5 bg-[#fbfcfd] space-y-4">
                  {/* Existing lessons */}
                  {(mod.lessons || []).map((l) => (
                    <div key={l._id} className="flex items-center justify-between bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-100">
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                        {l.type === 'video' && <Play size={13} className="text-indigo-600" />}
                        {l.type === 'pdf' && <FileText size={13} className="text-amber-600" />}
                        {l.type === 'text' && <AlignLeft size={13} className="text-emerald-600" />}
                        <span>{l.title}</span>
                      </div>
                      <button
                        onClick={() => deleteLesson(mod._id, l._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Add lesson form */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-3 shadow-2xs">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">+ Add Module Lesson</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={lessonForms[mod._id]?.title || ''}
                        onChange={(e) => setLF(mod._id, 'title', e.target.value)}
                        className="w-full bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-xs font-medium rounded-xl p-3 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                        placeholder="Lesson title"
                      />
                      <select
                        value={lessonForms[mod._id]?.type || ''}
                        onChange={(e) => setLF(mod._id, 'type', e.target.value)}
                        className="w-full bg-[#f8fafc] text-slate-800 text-xs font-medium rounded-xl p-3 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                      >
                        <option value="">Choose lesson type…</option>
                        {lessonTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    {lessonForms[mod._id]?.type === 'text' && (
                      <textarea
                        value={lessonForms[mod._id]?.textContent || ''}
                        onChange={(e) => setLF(mod._id, 'textContent', e.target.value)}
                        rows={3}
                        className="w-full bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-xs font-medium rounded-xl p-3 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 resize-none"
                        placeholder="Lesson content text…"
                      />
                    )}

                    {(lessonForms[mod._id]?.type === 'video' || lessonForms[mod._id]?.type === 'pdf') && (
                      <div className="flex items-center gap-3">
                        <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                          <Upload size={13} /> {lessonForms[mod._id]?.file ? lessonForms[mod._id].file.name : 'Upload File'}
                          <input
                            type="file"
                            className="hidden"
                            accept={lessonForms[mod._id]?.type === 'video' ? 'video/*' : '.pdf'}
                            onChange={(e) => setLF(mod._id, 'file', e.target.files[0])}
                          />
                        </label>
                        {lessonForms[mod._id]?.type === 'video' && (
                          <input
                            type="number"
                            value={lessonForms[mod._id]?.durationSeconds || ''}
                            onChange={(e) => setLF(mod._id, 'durationSeconds', e.target.value)}
                            className="w-32 bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-xs font-medium rounded-xl p-2 border border-slate-200 outline-none"
                            placeholder="Duration (secs)"
                          />
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => addLesson(mod._id)}
                      className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <PlusCircle size={13} /> Add to Module
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add module */}
        {addingModule ? (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex gap-3">
            <input
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              className="flex-1 bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-xs font-medium rounded-2xl p-3 border border-slate-200 outline-none focus:bg-white"
              placeholder="Module title (e.g. Module 1: Core Fundamentals)…"
              onKeyDown={(e) => e.key === 'Enter' && addModule()}
              autoFocus
            />
            <button onClick={addModule} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold">Add</button>
            <button onClick={() => setAddingModule(false)} className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingModule(true)}
            className="w-full bg-white rounded-3xl p-5 shadow-2xs flex items-center justify-center gap-2 text-slate-600 hover:text-slate-950 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all text-xs font-bold"
          >
            <PlusCircle size={16} /> Add New Curriculum Module
          </button>
        )}

      </div>
    </div>
  );
}

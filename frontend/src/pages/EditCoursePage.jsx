import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, Upload, Save, Send, Loader2, BookOpen, FileText, Play, AlignLeft, HelpCircle } from 'lucide-react';
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

  if (loading) return <div className="page-container"><div className="card h-64 animate-pulse" /></div>;

  const statusColors = { draft: 'badge-draft', pending: 'badge-pending', published: 'badge-published', rejected: 'badge-rejected' };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{course?.title}</h1>
          <span className={`${statusColors[course?.status]} mt-1 inline-block`}>{course?.status}</span>
        </div>
        <div className="flex gap-3">
          {(course?.status === 'draft' || course?.status === 'rejected') && (
            <button onClick={submitForReview} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit for Review
            </button>
          )}
        </div>
      </div>

      {course?.status === 'rejected' && course?.rejectionReason && (
        <div className="mb-6 bg-red-900/20 border border-red-700/30 rounded-xl p-4">
          <p className="text-red-400 font-medium text-sm">Rejection reason:</p>
          <p className="text-red-300 text-sm mt-1">{course.rejectionReason}</p>
        </div>
      )}

      {/* Modules list */}
      <div className="space-y-4">
        {modules.map((mod, mi) => (
          <div key={mod._id} className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/3"
              onClick={() => setOpen((o) => ({ ...o, [mod._id]: !o[mod._id] }))}>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-6 text-center">{mi + 1}</span>
                <BookOpen size={16} className="text-brand-400" />
                <span className="font-semibold text-white">{mod.title}</span>
                <span className="text-slate-400 text-xs">({mod.lessons?.length || 0} lessons)</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); deleteModule(mod._id); }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                  <Trash2 size={15} />
                </button>
                {open[mod._id] ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </div>
            </div>

            {open[mod._id] && (
              <div className="border-t border-white/5 p-4 space-y-3">
                {/* Existing lessons */}
                {(mod.lessons || []).map((l) => (
                  <div key={l._id} className="flex items-center justify-between bg-dark-800/60 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      {l.type === 'video' && <Play size={13} className="text-blue-400" />}
                      {l.type === 'pdf' && <FileText size={13} className="text-red-400" />}
                      {l.type === 'text' && <AlignLeft size={13} className="text-green-400" />}
                      <span className="text-slate-300">{l.title}</span>
                    </div>
                    <button onClick={() => deleteLesson(mod._id, l._id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Add lesson form */}
                <div className="bg-dark-900/60 rounded-xl p-4 border border-white/5 space-y-3">
                  <p className="text-sm font-medium text-slate-300">+ Add Lesson</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={lessonForms[mod._id]?.title || ''} onChange={(e) => setLF(mod._id, 'title', e.target.value)}
                      className="input text-sm" placeholder="Lesson title" />
                    <select value={lessonForms[mod._id]?.type || ''} onChange={(e) => setLF(mod._id, 'type', e.target.value)} className="input text-sm">
                      <option value="">Type…</option>
                      {lessonTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {lessonForms[mod._id]?.type === 'text' && (
                    <textarea value={lessonForms[mod._id]?.textContent || ''} onChange={(e) => setLF(mod._id, 'textContent', e.target.value)}
                      rows={4} className="input text-sm resize-none" placeholder="Lesson content (HTML or plain text)…" />
                  )}
                  {(lessonForms[mod._id]?.type === 'video' || lessonForms[mod._id]?.type === 'pdf') && (
                    <div className="flex items-center gap-3">
                      <label className="btn-secondary text-xs cursor-pointer flex items-center gap-2">
                        <Upload size={14} /> {lessonForms[mod._id]?.file ? lessonForms[mod._id].file.name : 'Upload File'}
                        <input type="file" className="hidden"
                          accept={lessonForms[mod._id]?.type === 'video' ? 'video/*' : '.pdf'}
                          onChange={(e) => setLF(mod._id, 'file', e.target.files[0])} />
                      </label>
                      {lessonForms[mod._id]?.type === 'video' && (
                        <input type="number" value={lessonForms[mod._id]?.durationSeconds || ''}
                          onChange={(e) => setLF(mod._id, 'durationSeconds', e.target.value)}
                          className="input text-sm w-36" placeholder="Duration (secs)" />
                      )}
                    </div>
                  )}

                  <button onClick={() => addLesson(mod._id)} className="btn-primary text-sm flex items-center gap-2">
                    <PlusCircle size={15} /> Add Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add module */}
      {addingModule ? (
        <div className="card p-4 mt-4 flex gap-3">
          <input value={newModule} onChange={(e) => setNewModule(e.target.value)}
            className="input flex-1 text-sm" placeholder="Module title…"
            onKeyDown={(e) => e.key === 'Enter' && addModule()} autoFocus />
          <button onClick={addModule} className="btn-primary text-sm">Add</button>
          <button onClick={() => setAddingModule(false)} className="btn-secondary text-sm">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAddingModule(true)}
          className="mt-4 w-full card p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:border-brand-600/40 border-2 border-dashed border-white/10 transition-all text-sm">
          <PlusCircle size={18} /> Add Module
        </button>
      )}
    </div>
  );
}

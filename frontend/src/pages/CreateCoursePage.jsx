import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Tag, AlignLeft, Loader2, ImagePlus, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categories = ['General', 'Programming', 'Mathematics', 'Science', 'Business', 'Design', 'Language', 'Engineering', 'Medicine', 'Arts'];

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'General', tags: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      if (thumbnail) fd.append('thumbnail', thumbnail);

      const { data } = await api.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Course created as draft!');
      navigate(`/instructor/courses/${data.course._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create course');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Back to Studio
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
          <p className="text-slate-500 text-xs mt-1">Fill in the curriculum metadata. You can author video modules and quizzes in the next step.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thumbnail */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-3">Course Banner Thumbnail</label>
            <div className="flex items-center gap-5">
              <div className="w-40 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={28} className="text-slate-400" />
                )}
              </div>
              <div>
                <label htmlFor="thumb" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                  <Upload size={14} /> Choose Image
                </label>
                <input id="thumb" type="file" accept="image/*" onChange={handleImg} className="hidden" />
                <p className="text-slate-400 text-[11px] mt-2">JPG, PNG or WebP · Up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-4">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Course Title *</label>
              <input
                value={form.title}
                onChange={setF('title')}
                className="w-full bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
                placeholder="e.g. Full-Stack Modern Web Engineering"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Description *</label>
              <textarea
                value={form.description}
                onChange={setF('description')}
                rows={4}
                className="w-full bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                placeholder="Describe key learning outcomes and prerequisites…"
                required
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={setF('category')}
                  className="w-full bg-[#f8fafc] text-slate-800 text-sm font-medium rounded-2xl p-3.5 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={setF('tags')}
                  className="w-full bg-[#f8fafc] text-slate-800 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
                  placeholder="react, node, fullstack"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><BookOpen size={16} /> Create Curriculum</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Tag, AlignLeft, Loader2, ImagePlus } from 'lucide-react';
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
    <div className="page-container max-w-3xl animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
      <p className="text-slate-400 mb-8">Fill in the details below. You can add modules and lessons after saving.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail */}
        <div className="card p-6">
          <label className="label">Course Thumbnail</label>
          <div className="mt-2 flex items-center gap-5">
            <div className="w-40 h-28 rounded-xl bg-dark-800 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> :
                <ImagePlus size={28} className="text-slate-600" />}
            </div>
            <div>
              <label htmlFor="thumb" className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                <Upload size={16} /> Choose Image
              </label>
              <input id="thumb" type="file" accept="image/*" onChange={handleImg} className="hidden" />
              <p className="text-slate-500 text-xs mt-2">JPG, PNG or WebP · Max 10MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Course Title *</label>
            <input value={form.title} onChange={setF('title')} className="input"
              placeholder="e.g. Complete Python Bootcamp" required maxLength={200} />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={setF('description')} rows={5}
              className="input resize-none" placeholder="Describe what students will learn…" required maxLength={2000} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={setF('category')} className="input">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input value={form.tags} onChange={setF('tags')} className="input" placeholder="python, beginner, web" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : <><BookOpen size={18} /> Create Course</>}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, BookOpen, Tag, AlignLeft, Loader2, ImagePlus, ArrowLeft, Sparkles, Layers } from 'lucide-react';
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
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description required');
      return;
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 p-4 sm:p-6 lg:p-8 animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation & Headline */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back to Studio</span>
          </button>
          
          <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
            <Layers size={13} />
            <span>Curriculum Builder</span>
          </div>

          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
            Create New Course.
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Fill in the course metadata. You will add video lectures, reading materials, and quizzes in the studio editor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Thumbnail Dropzone */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-[#111111]/15">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3 font-syne">
              Course Banner Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-48 h-32 rounded-2xl bg-[#FAF7EE] border-2 border-dashed border-[#111111]/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                {preview ? (
                  <img src={preview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 space-y-1">
                    <ImagePlus size={28} className="mx-auto text-slate-400" />
                    <span className="text-[10px] font-bold block">No image</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <label
                  htmlFor="thumb"
                  className="px-4 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-black transition-colors shadow-2xs"
                >
                  <Upload size={14} />
                  <span>Choose Thumbnail</span>
                </label>
                <input id="thumb" type="file" accept="image/*" onChange={handleImg} className="hidden" />
                <p className="text-slate-400 text-[11px]">Recommended: JPG, PNG or WebP · 16:9 ratio</p>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-[#111111]/15 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 font-syne">
                Course Title *
              </label>
              <input
                value={form.title}
                onChange={setF('title')}
                className="w-full bg-[#FAF7EE] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20 transition-all"
                placeholder="e.g. Modern Full-Stack Systems Architecture"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 font-syne">
                Description & Outcomes *
              </label>
              <textarea
                value={form.description}
                onChange={setF('description')}
                rows={4}
                className="w-full bg-[#FAF7EE] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20 transition-all resize-none"
                placeholder="Explain the core competencies, modules, and target skill mastery…"
                required
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 font-syne">
                  Curriculum Category
                </label>
                <select
                  value={form.category}
                  onChange={setF('category')}
                  className="w-full bg-[#FAF7EE] text-slate-900 text-sm font-medium rounded-2xl p-3.5 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20 transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 font-syne">
                  Tags (comma-separated)
                </label>
                <input
                  value={form.tags}
                  onChange={setF('tags')}
                  className="w-full bg-[#FAF7EE] text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-2xl p-3.5 border border-[#111111]/15 outline-none focus:bg-white focus:ring-2 focus:ring-[#111111]/20 transition-all"
                  placeholder="react, cloud, typescript"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-full bg-white border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-[#FAF7EE] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-dark-pill flex-1 py-3.5 text-xs shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-300" />
                  <span>Saving Draft…</span>
                </>
              ) : (
                <>
                  <BookOpen size={16} />
                  <span>Create Curriculum & Add Modules</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

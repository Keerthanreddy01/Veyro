import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, ArrowLeft, ImagePlus, Loader2, BookOpen } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const categories = [
  'General',
  'Programming',
  'Mathematics',
  'Science',
  'Business',
  'Design',
  'Language',
  'Engineering',
  'Medicine',
  'Arts',
] as const;

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'General', tags: '' });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const { data } = await api.post('/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Curriculum draft created!');
      navigate(`/instructor/courses/${data.course._id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-8 sm:py-12 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        
        {/* Navigation Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Instructor Studio</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-normal">Create Curriculum</CardTitle>
            <CardDescription>
              Draft a new course syllabus. You can add video lessons, reading documents, and proctored quizzes once created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                  Curriculum Title
                </label>
                <Input
                  placeholder="e.g. Advanced Cryptographic Verification & Audit"
                  value={form.title}
                  onChange={setF('title')}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full bg-white text-[#202020] placeholder:text-[#A99B8A] text-sm rounded-xl border border-[#E7E2DA] p-3 outline-none focus:border-[#6F8FA8] focus:ring-2 focus:ring-[#6F8FA8]/15 min-h-[120px]"
                  placeholder="Outline course learning outcomes, prerequisites, and syllabus..."
                  value={form.description}
                  onChange={setF('description')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full bg-white text-[#202020] text-sm rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#6F8FA8]"
                    value={form.category}
                    onChange={setF('category')}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    placeholder="crypto, security, audit"
                    value={form.tags}
                    onChange={setF('tags')}
                  />
                </div>
              </div>

              {/* Cover Art Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-[#202020]">
                  Cover Artwork (Optional)
                </label>
                <div className="border border-dashed border-[#E7E2DA] rounded-xl p-4 text-center hover:bg-[#FAF8F4] transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImg}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {preview ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-[#E7E2DA]"
                      />
                      <span className="text-xs text-[#77736D]">Change uploaded image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-[#77736D]">
                      <ImagePlus size={20} className="text-[#A99B8A]" />
                      <span>Upload cover thumbnail</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E7E2DA]/60">
                <Link to="/dashboard">
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button variant="primary" type="submit" isLoading={loading}>
                  Save draft & continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

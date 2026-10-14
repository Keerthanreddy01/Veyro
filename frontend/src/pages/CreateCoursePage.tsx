import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, ArrowLeft, ImagePlus, Loader2, BookOpen, Layers, CheckCircle } from 'lucide-react';
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
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    level: 'beginner',
    targetGrade: 'All Grades',
    price: '0',
    tags: '',
    learningObjectives: '',
    prerequisites: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setF = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Curriculum title is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Course description is required');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('level', form.level);
      fd.append('targetGrade', form.targetGrade || 'All Grades');
      fd.append('price', form.price || '0');
      fd.append(
        'tags',
        JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean))
      );
      if (form.learningObjectives.trim()) {
        fd.append(
          'learningObjectives',
          JSON.stringify(form.learningObjectives.split('\n').map((t) => t.trim()).filter(Boolean))
        );
      }
      if (form.prerequisites.trim()) {
        fd.append(
          'prerequisites',
          JSON.stringify(form.prerequisites.split('\n').map((t) => t.trim()).filter(Boolean))
        );
      }
      if (thumbnail) fd.append('thumbnail', thumbnail);

      const { data } = await api.post('/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Curriculum draft created! Configure your modules and lessons next.');
      navigate(`/instructor/courses/${data.course._id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create course draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-8 sm:py-12 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        {/* Navigation Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Instructor Workspace</span>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736D] bg-[#F6F2EC] px-2 py-0.5 rounded border border-[#E7E2DA]">
                Step 1 of 2: Curriculum Overview
              </span>
            </div>
            <CardTitle className="text-2xl font-serif font-normal">Author New Curriculum</CardTitle>
            <CardDescription>
              Define your course title, target learning level, prerequisites, and syllabus summary. You can attach video modules, PDF resources, and proctored assessment quizzes in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                  Curriculum Title <span className="text-rose-600">*</span>
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
                  Description & Syllabus Overview <span className="text-rose-600">*</span>
                </label>
                <textarea
                  className="w-full bg-[#FAF9F6] focus:bg-white text-[#202020] placeholder:text-[#A99B8A] text-sm rounded-xl border border-[#E7E2DA] focus:border-[#171717] p-3 outline-none transition-all min-h-[110px] resize-none"
                  placeholder="Outline the course objectives, scope, and key topics covered..."
                  value={form.description}
                  onChange={setF('description')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full bg-[#FAF9F6] text-[#202020] text-sm rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717]"
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
                    Proficiency Level
                  </label>
                  <select
                    className="w-full bg-[#FAF9F6] text-[#202020] text-sm rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717]"
                    value={form.level}
                    onChange={setF('level')}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Target Grade / Class
                  </label>
                  <select
                    className="w-full bg-[#FAF9F6] text-[#202020] text-sm rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717]"
                    value={form.targetGrade}
                    onChange={setF('targetGrade')}
                  >
                    <option value="All Grades">All Grades (Open Enrollment)</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Professional">Professional / Lifelong</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <Input
                    placeholder="crypto, security, audit"
                    value={form.tags}
                    onChange={setF('tags')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Learning Objectives (one per line)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#FAF9F6] focus:bg-white text-[#202020] placeholder:text-[#A99B8A] text-xs rounded-xl border border-[#E7E2DA] focus:border-[#171717] p-2.5 outline-none transition-all resize-none"
                    placeholder="Understand cryptographic hashing&#10;Implement SHA-256 certificate proofs&#10;Pass proctored examination"
                    value={form.learningObjectives}
                    onChange={setF('learningObjectives')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202020] mb-1.5">
                    Prerequisites (one per line)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#FAF9F6] focus:bg-white text-[#202020] placeholder:text-[#A99B8A] text-xs rounded-xl border border-[#E7E2DA] focus:border-[#171717] p-2.5 outline-none transition-all resize-none"
                    placeholder="Basic understanding of web security&#10;Familiarity with distributed systems"
                    value={form.prerequisites}
                    onChange={setF('prerequisites')}
                  />
                </div>
              </div>

              {/* Cover Art Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-[#202020]">
                  Course Cover Artwork (Optional)
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
                        className="w-20 h-14 object-cover rounded-lg border border-[#E7E2DA]"
                      />
                      <div className="text-left text-xs">
                        <p className="font-semibold text-[#171717]">Thumbnail selected</p>
                        <p className="text-[#77736D]">Click to choose a different file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-[#77736D]">
                      <ImagePlus size={22} className="text-[#A99B8A]" />
                      <span className="font-medium text-[#171717]">Click to upload course cover image</span>
                      <span className="text-[11px] text-[#A99B8A]">PNG, JPG, or WebP up to 5MB</span>
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
                  Save draft & build curriculum
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

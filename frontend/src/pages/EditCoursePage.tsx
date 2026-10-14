import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Play,
  FileText,
  AlignLeft,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Clock,
  Pencil,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import type { Course, Module, Lesson, LessonType } from '../types/course';

const lessonTypes: Array<{ value: LessonType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { value: 'video', label: 'Video Lecture', icon: Play },
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'text', label: 'Article / Notes', icon: AlignLeft },
];

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newModule, setNewModule] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [lessonForms, setLessonForms] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'lesson' | 'quiz'>>({});
  const [quizForms, setQuizForms] = useState<Record<string, any>>({});
  const [editingQuizId, setEditingQuizId] = useState<Record<string, string | null>>({});

  const load = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setModules(data.modules || []);
      if (data.modules?.length > 0) {
        setOpen({ [data.modules[0]._id]: true });
      }
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add module');
    }
  };

  const deleteModule = async (mid: string) => {
    if (!confirm('Are you sure you want to delete this module and attached lessons?')) return;
    try {
      await api.delete(`/modules/${mid}`);
      setModules((m) => m.filter((x) => x._id !== mid));
      toast.success('Module deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const addLesson = async (moduleId: string) => {
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add lesson');
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId
            ? { ...mod, lessons: mod.lessons.filter((l: any) => l._id !== lessonId) }
            : mod
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
      await api.post(`/courses/${id}/submit`);
      toast.success('Curriculum submitted for administrative review!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-8 sm:py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Instructor Studio</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                course.status === 'published'
                  ? 'published'
                  : course.status === 'under_review'
                  ? 'pending'
                  : 'draft'
              }
            >
              {course.status.replace('_', ' ')}
            </Badge>

            {course.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={submitForReview}
                isLoading={saving}
              >
                Submit for review
              </Button>
            )}
          </div>
        </div>

        {/* Course Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif font-normal">{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-xs text-[#77736D]">
              <span>Category: <strong className="text-[#171717]">{course.category}</strong></span>
              <span>Level: <strong className="text-[#171717]">{course.level || 'All'}</strong></span>
              <span>Modules: <strong className="text-[#171717]">{modules.length}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Modules & Lessons Curriculum Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#171717]">Curriculum Structure</h2>
            {!addingModule && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingModule(true)}
                leftIcon={<PlusCircle size={14} />}
              >
                Add module
              </Button>
            )}
          </div>

          {/* New Module Input Form */}
          {addingModule && (
            <Card className="p-4 space-y-3">
              <Input
                placeholder="Module title (e.g. Unit 1: Foundational Cryptographic Hash Functions)"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setAddingModule(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={addModule}>
                  Save module
                </Button>
              </div>
            </Card>
          )}

          {/* Modules List */}
          {modules.map((mod, idx) => {
            const isOpen = !!open[mod._id];
            const lForm = lessonForms[mod._id] || {};

            return (
              <div
                key={mod._id}
                className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-subtle"
              >
                {/* Module Bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F4]/50 transition-colors">
                  <button
                    onClick={() => setOpen((prev) => ({ ...prev, [mod._id]: !prev[mod._id] }))}
                    className="flex items-center gap-3 text-left cursor-pointer flex-1"
                  >
                    <span className="text-xs font-semibold text-[#A99B8A] w-5">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="font-sans font-semibold text-sm text-[#171717]">{mod.title}</span>
                    <span className="text-xs text-[#77736D]">
                      ({mod.lessons?.length || 0} lessons)
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteModule(mod._id)}
                      className="p-1.5 text-[#77736D] hover:text-[#BE123C] rounded-lg hover:bg-[#FFF1F0] transition-colors"
                      title="Delete module"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => setOpen((prev) => ({ ...prev, [mod._id]: !prev[mod._id] }))}
                      className="p-1.5 text-[#77736D] hover:text-[#171717]"
                    >
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>

                {/* Module Drawer */}
                {isOpen && (
                  <div className="p-5 border-t border-[#E7E2DA]/60 bg-[#FAF8F4]/30 space-y-4">
                    {/* Attached Lessons */}
                    <div className="space-y-2">
                      {(mod.lessons || []).map((les: Lesson) => (
                        <div
                          key={les._id}
                          className="p-3 rounded-xl bg-white border border-[#E7E2DA] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 text-[#202020]">
                            <span className="font-semibold">{les.title}</span>
                            <Badge variant="neutral">{les.type}</Badge>
                          </div>
                          <button
                            onClick={() => deleteLesson(mod._id, les._id)}
                            className="text-[#77736D] hover:text-[#BE123C] p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Lesson Form */}
                    <div className="p-4 rounded-xl bg-white border border-[#E7E2DA] space-y-3">
                      <p className="text-xs font-semibold text-[#171717]">Attach New Lesson</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Lesson title"
                          value={lForm.title || ''}
                          onChange={(e) =>
                            setLessonForms((f) => ({
                              ...f,
                              [mod._id]: { ...lForm, title: e.target.value },
                            }))
                          }
                        />
                        <select
                          className="w-full bg-white text-[#202020] text-xs rounded-xl border border-[#E7E2DA] px-3 py-2 outline-none focus:border-[#6F8FA8]"
                          value={lForm.type || 'video'}
                          onChange={(e) =>
                            setLessonForms((f) => ({
                              ...f,
                              [mod._id]: { ...lForm, type: e.target.value },
                            }))
                          }
                        >
                          {lessonTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {lForm.type === 'video' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            placeholder="Duration in seconds (e.g. 360)"
                            type="number"
                            value={lForm.durationSeconds || ''}
                            onChange={(e) =>
                              setLessonForms((f) => ({
                                ...f,
                                [mod._id]: { ...lForm, durationSeconds: e.target.value },
                              }))
                            }
                          />
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              setLessonForms((f) => ({
                                ...f,
                                [mod._id]: { ...lForm, file: e.target.files?.[0] },
                              }))
                            }
                            className="text-xs text-[#77736D] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#F6F2EC] file:text-[#171717]"
                          />
                        </div>
                      )}

                      {lForm.type === 'pdf' && (
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            setLessonForms((f) => ({
                              ...f,
                              [mod._id]: { ...lForm, file: e.target.files?.[0] },
                            }))
                          }
                          className="text-xs text-[#77736D] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#F6F2EC] file:text-[#171717]"
                        />
                      )}

                      {lForm.type === 'text' && (
                        <textarea
                          placeholder="Article text content..."
                          className="w-full bg-white text-xs rounded-xl border border-[#E7E2DA] p-3 outline-none focus:border-[#6F8FA8]"
                          value={lForm.textContent || ''}
                          onChange={(e) =>
                            setLessonForms((f) => ({
                              ...f,
                              [mod._id]: { ...lForm, textContent: e.target.value },
                            }))
                          }
                        />
                      )}

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => addLesson(mod._id)}
                        >
                          Attach lesson
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

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
  AlertTriangle,
  RotateCcw,
  Eye,
  Settings,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { validateVideoUrl } from '../utils/videoUrl';
import type { Course, Module, Lesson, LessonType, Quiz, QuizQuestion } from '../types/course';

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
  const [submitting, setSubmitting] = useState(false);
  const [retracting, setRetracting] = useState(false);
  const [creatingRevision, setCreatingRevision] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Module creation/edit
  const [newModule, setNewModule] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Lesson creation/edit
  const [lessonForms, setLessonForms] = useState<Record<string, any>>({});
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingLessonFile, setEditingLessonFile] = useState<File | null>(null);
  const [submittingModuleId, setSubmittingModuleId] = useState<string | null>(null);
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

  // Helper to format seconds nicely
  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} sec`;
    if (s === 0) return `${m} min`;
    return `${m} min ${s} sec`;
  };

  // YouTube duration detection state for lesson creation forms (keyed by moduleId)
  const [ytDetectionCreate, setYtDetectionCreate] = useState<
    Record<string, { loading: boolean; duration?: number; formatted?: string; error?: string; url?: string }>
  >({});

  // YouTube duration detection state for editing modal
  const [ytDetectionEdit, setYtDetectionEdit] = useState<{
    loading: boolean;
    duration?: number;
    formatted?: string;
    error?: string;
    url?: string;
  }>({ loading: false });

  const detectYouTubeDurationForModule = async (moduleId: string, rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setYtDetectionCreate((prev) => ({
        ...prev,
        [moduleId]: { loading: false, url: '' },
      }));
      return;
    }

    const val = validateVideoUrl(trimmed);
    if (!val.valid || val.provider !== 'youtube' || !val.videoId) {
      setYtDetectionCreate((prev) => ({
        ...prev,
        [moduleId]: { loading: false, url: trimmed },
      }));
      return;
    }

    setYtDetectionCreate((prev) => ({
      ...prev,
      [moduleId]: { loading: true, url: trimmed },
    }));

    try {
      const { data } = await api.post('/lessons/detect-youtube-duration', { url: trimmed });
      setYtDetectionCreate((prev) => ({
        ...prev,
        [moduleId]: {
          loading: false,
          duration: data.durationSeconds,
          formatted: data.formattedDuration,
          url: trimmed,
        },
      }));
    } catch (err: any) {
      setYtDetectionCreate((prev) => ({
        ...prev,
        [moduleId]: {
          loading: false,
          error: err.response?.data?.error || 'Could not verify YouTube video duration. Please ensure the video is public.',
          url: trimmed,
        },
      }));
    }
  };

  const detectYouTubeDurationForEdit = async (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setYtDetectionEdit({ loading: false, url: '' });
      return;
    }

    const val = validateVideoUrl(trimmed);
    if (!val.valid || val.provider !== 'youtube' || !val.videoId) {
      setYtDetectionEdit({ loading: false, url: trimmed });
      return;
    }

    setYtDetectionEdit({ loading: true, url: trimmed });

    try {
      const { data } = await api.post('/lessons/detect-youtube-duration', { url: trimmed });
      setYtDetectionEdit({
        loading: false,
        duration: data.durationSeconds,
        formatted: data.formattedDuration,
        url: trimmed,
      });
    } catch (err: any) {
      setYtDetectionEdit({
        loading: false,
        error: err.response?.data?.error || 'Could not verify YouTube video duration. Please ensure the video is public.',
        url: trimmed,
      });
    }
  };

  const openEditLesson = (les: Lesson) => {
    const vUrl = les.videoUrl || les.contentUrl || '';
    setEditingLesson({
      ...les,
      videoUrl: vUrl,
      contentUrl: vUrl,
    });
    setEditingLessonFile(null);
    if (les.type === 'video') {
      const val = validateVideoUrl(vUrl);
      if (val.valid && val.provider === 'youtube') {
        if (les.durationSeconds && les.durationSeconds > 0) {
          setYtDetectionEdit({
            loading: false,
            duration: les.durationSeconds,
            formatted: formatDuration(les.durationSeconds),
            url: vUrl,
          });
        } else {
          detectYouTubeDurationForEdit(vUrl);
        }
      } else {
        setYtDetectionEdit({ loading: false, url: '' });
      }
    } else {
      setYtDetectionEdit({ loading: false, url: '' });
    }
  };

  // Active sub-tab inside module ('lessons' | 'quiz')
  const [moduleTab, setModuleTab] = useState<Record<string, 'lessons' | 'quiz'>>({});

  // Quiz Editor State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTargetModuleId, setQuizTargetModuleId] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(300);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(3);
  const [quizIsProctored, setQuizIsProctored] = useState(false);
  const [quizRequireCamera, setQuizRequireCamera] = useState(false);
  const [quizMaxTabViolations, setQuizMaxTabViolations] = useState(3);
  const [quizRandomizeQuestions, setQuizRandomizeQuestions] = useState(true);
  const [quizRandomizeOptions, setQuizRandomizeOptions] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      timeLimitSeconds: 60,
    },
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Quiz Preview Modal
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  // Course Details Settings Modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState('beginner');
  const [editCourseTargetGrade, setEditCourseTargetGrade] = useState('All Grades');
  const [editCourseTags, setEditCourseTags] = useState('');
  const [editThumbnail, setEditThumbnail] = useState<File | null>(null);
  const [savingCourseDetails, setSavingCourseDetails] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data.course);
      setModules(data.modules || []);
      if (data.modules?.length > 0) {
        setOpen({ [data.modules[0]._id]: true });
      }
      setEditCourseTitle(data.course.title || '');
      setEditCourseDesc(data.course.description || '');
      setEditCourseCategory(data.course.category || 'General');
      setEditCourseLevel(data.course.level || 'beginner');
      setEditCourseTargetGrade(data.course.targetGrade || 'All Grades');
      setEditCourseTags(Array.isArray(data.course.tags) ? data.course.tags.join(', ') : '');
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

  // ── Module Handlers ────────────────────────────────────────────────────────
  const addModule = async () => {
    if (!newModule.trim()) return;
    try {
      const { data } = await api.post(`/courses/${id}/modules`, { title: newModule.trim() });
      setModules((m) => [...m, { ...data.module, lessons: [], quizzes: [] }]);
      setOpen((prev) => ({ ...prev, [data.module._id]: true }));
      setNewModule('');
      setAddingModule(false);
      toast.success('Module milestone created');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add module');
    }
  };

  const saveModuleTitle = async (mid: string) => {
    if (!editingModuleTitle.trim()) return;
    try {
      await api.put(`/modules/${mid}`, { title: editingModuleTitle.trim() });
      setModules((m) => m.map((mod) => (mod._id === mid ? { ...mod, title: editingModuleTitle.trim() } : mod)));
      setEditingModuleId(null);
      toast.success('Module title updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update module');
    }
  };

  const deleteModule = async (mid: string) => {
    if (!confirm('Are you sure you want to delete this module and all attached lessons/quizzes?')) return;
    try {
      await api.delete(`/modules/${mid}`);
      setModules((m) => m.filter((x) => x._id !== mid));
      toast.success('Module deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  // ── Lesson Handlers ────────────────────────────────────────────────────────
  const addLesson = async (moduleId: string) => {
    if (submittingModuleId) return; // Prevent duplicate concurrent submissions
    const form = lessonForms[moduleId] || {};
    if (!form.title?.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    const type = form.type || 'video';

    if (type === 'video') {
      const vUrl = (form.videoUrl || form.contentUrl || '').trim();
      if (!vUrl) {
        toast.error('Please enter a video URL');
        return;
      }
      const val = validateVideoUrl(vUrl);
      if (!val.valid) {
        toast.error(val.error || 'Invalid video URL. Supported: YouTube or direct HTTPS MP4 link.');
        return;
      }
      if (val.provider === 'youtube') {
        const detect = ytDetectionCreate[moduleId];
        if (detect?.loading) {
          toast.error('Please wait while YouTube duration is being detected.');
          return;
        }
        if (!detect?.duration || detect.duration <= 0 || detect.error) {
          toast.error(detect?.error || 'Cannot add lesson: YouTube video duration could not be verified.');
          return;
        }
      }
    }

    if (type === 'pdf' && !form.file) {
      toast.error('Please select a PDF document to upload');
      return;
    }
    if (type === 'pdf' && form.file && form.file.size > 20 * 1024 * 1024) {
      toast.error('PDF file exceeds 20MB limit');
      return;
    }

    try {
      setSubmittingModuleId(moduleId);

      let payload: any;
      let headers: any = {};

      if (type === 'pdf' && form.file) {
        const fd = new FormData();
        fd.append('title', form.title.trim());
        fd.append('type', type);
        if (form.isPreview !== undefined) fd.append('isPreview', String(form.isPreview));
        fd.append('file', form.file);
        payload = fd;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        const vUrl = (form.videoUrl || form.contentUrl || '').trim();
        const val = validateVideoUrl(vUrl);
        const isYt = val.valid && val.provider === 'youtube';
        const verifiedDuration = isYt ? ytDetectionCreate[moduleId]?.duration : (form.durationSeconds ? Number(form.durationSeconds) : 0);

        payload = {
          title: form.title.trim(),
          type,
          videoUrl: type === 'video' ? vUrl : undefined,
          contentUrl: type === 'video' ? vUrl : undefined,
          textContent: type === 'text' ? form.textContent || '' : undefined,
          durationSeconds: verifiedDuration,
          isPreview: Boolean(form.isPreview),
        };
      }

      const { data } = await api.post(`/modules/${moduleId}/lessons`, payload, { headers });
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId ? { ...mod, lessons: [...(mod.lessons || []), data.lesson] } : mod
        )
      );
      setLessonForms((f) => ({ ...f, [moduleId]: {} }));
      setYtDetectionCreate((prev) => {
        const nextState = { ...prev };
        delete nextState[moduleId];
        return nextState;
      });
      toast.success('Lesson attached to module successfully');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to add lesson';
      toast.error(errorMsg);
    } finally {
      setSubmittingModuleId(null);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || isUpdatingLesson) return;

    const vUrl = (editingLesson.videoUrl || editingLesson.contentUrl || '').trim();
    if (editingLesson.type === 'video') {
      if (!vUrl) {
        toast.error('Video URL cannot be empty');
        return;
      }
      const val = validateVideoUrl(vUrl);
      if (!val.valid) {
        toast.error(val.error || 'Invalid video URL. Supported: YouTube or direct HTTPS MP4 link.');
        return;
      }
      if (val.provider === 'youtube') {
        if (ytDetectionEdit.loading) {
          toast.error('Please wait while YouTube duration is being detected.');
          return;
        }
        if (!ytDetectionEdit.duration || ytDetectionEdit.duration <= 0 || ytDetectionEdit.error) {
          toast.error(ytDetectionEdit.error || 'Cannot update lesson: YouTube video duration could not be verified.');
          return;
        }
      }
    }

    try {
      setIsUpdatingLesson(true);

      let payload: any;
      let headers: any = {};

      if (editingLesson.type === 'pdf' && editingLessonFile) {
        const fd = new FormData();
        fd.append('title', editingLesson.title.trim());
        if (editingLesson.isPreview !== undefined) fd.append('isPreview', String(editingLesson.isPreview));
        fd.append('file', editingLessonFile);
        payload = fd;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        const val = validateVideoUrl(vUrl);
        const isYt = val.valid && val.provider === 'youtube';
        const verifiedDuration = isYt ? ytDetectionEdit.duration : (editingLesson.durationSeconds ? Number(editingLesson.durationSeconds) : 0);

        payload = {
          title: editingLesson.title.trim(),
          contentUrl: editingLesson.type === 'video' ? vUrl : editingLesson.contentUrl?.trim(),
          videoUrl: editingLesson.type === 'video' ? vUrl : undefined,
          textContent: editingLesson.textContent || '',
          durationSeconds: verifiedDuration,
          isPreview: Boolean(editingLesson.isPreview),
        };
      }

      const { data } = await api.put(`/lessons/${editingLesson._id}`, payload, { headers });
      setModules((prev) =>
        prev.map((mod) => ({
          ...mod,
          lessons: (mod.lessons || []).map((l: Lesson) => (l._id === data.lesson._id ? data.lesson : l)),
        }))
      );
      setEditingLesson(null);
      setEditingLessonFile(null);
      toast.success('Lesson updated successfully');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update lesson';
      toast.error(errorMsg);
    } finally {
      setIsUpdatingLesson(false);
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
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

  // ── Quiz Handlers ──────────────────────────────────────────────────────────
  const openQuizEditor = (moduleId: string, quizToEdit?: Quiz) => {
    setQuizTargetModuleId(moduleId);
    if (quizToEdit) {
      setEditingQuiz(quizToEdit);
      setQuizTitle(quizToEdit.title || '');
      setQuizTimeLimit(quizToEdit.timeLimitSeconds || 300);
      setQuizPassingScore(quizToEdit.passingScore || 70);
      setQuizMaxAttempts(quizToEdit.maxAttempts || 3);
      setQuizIsProctored(!!quizToEdit.isProctored);
      setQuizRequireCamera(!!quizToEdit.requireCamera);
      setQuizMaxTabViolations(quizToEdit.maxTabViolations || 3);
      setQuizRandomizeQuestions(quizToEdit.randomizeQuestions ?? true);
      setQuizRandomizeOptions(quizToEdit.randomizeOptions ?? true);
      setQuizQuestions(
        quizToEdit.questions && quizToEdit.questions.length > 0
          ? quizToEdit.questions.map((q) => ({
              _id: q._id,
              questionText: q.questionText,
              options: [...q.options],
              correctOptionIndex: q.correctOptionIndex ?? 0,
              timeLimitSeconds: q.timeLimitSeconds || 60,
            }))
          : [
              {
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                timeLimitSeconds: 60,
              },
            ]
      );
    } else {
      setEditingQuiz(null);
      setQuizTitle('Unit Assessment');
      setQuizTimeLimit(300);
      setQuizPassingScore(70);
      setQuizMaxAttempts(3);
      setQuizIsProctored(false);
      setQuizRequireCamera(false);
      setQuizMaxTabViolations(3);
      setQuizRandomizeQuestions(true);
      setQuizRandomizeOptions(true);
      setQuizQuestions([
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          timeLimitSeconds: 60,
        },
      ]);
    }
    setQuizModalOpen(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} must have question text`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1} must have all 4 answer options filled`);
        return;
      }
    }

    setSavingQuiz(true);
    try {
      const payload = {
        title: quizTitle.trim(),
        timeLimitSeconds: Number(quizTimeLimit),
        passingScore: Number(quizPassingScore),
        maxAttempts: Number(quizMaxAttempts),
        isProctored: quizIsProctored || quizRequireCamera,
        requireCamera: quizRequireCamera,
        maxTabViolations: Number(quizMaxTabViolations),
        randomizeQuestions: quizRandomizeQuestions,
        randomizeOptions: quizRandomizeOptions,
        questions: quizQuestions,
      };

      if (editingQuiz) {
        const { data } = await api.put(`/quizzes/${editingQuiz._id}`, payload);
        setModules((m) =>
          m.map((mod) =>
            mod._id === quizTargetModuleId
              ? {
                  ...mod,
                  quizzes: (mod.quizzes || []).map((q: any) => (q._id === data.quiz._id ? data.quiz : q)),
                  quiz: data.quiz,
                }
              : mod
          )
        );
        toast.success('Assessment configuration updated');
      } else {
        const { data } = await api.post(`/modules/${quizTargetModuleId}/quizzes`, payload);
        setModules((m) =>
          m.map((mod) =>
            mod._id === quizTargetModuleId
              ? {
                  ...mod,
                  quizzes: [...(mod.quizzes || []), data.quiz],
                  quiz: data.quiz,
                }
              : mod
          )
        );
        toast.success('Assessment quiz attached to module');
      }
      setQuizModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (moduleId: string, quizId: string) => {
    if (!confirm('Are you sure you want to delete this module quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setModules((m) =>
        m.map((mod) =>
          mod._id === moduleId
            ? {
                ...mod,
                quizzes: (mod.quizzes || []).filter((q: any) => q._id !== quizId),
                quiz: null,
              }
            : mod
        )
      );
      toast.success('Quiz deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete quiz');
    }
  };

  // ── Course Lifecycle Handlers ──────────────────────────────────────────────
  const submitForReview = async () => {
    if (modules.length === 0) {
      toast.error('Please add at least one module before submitting for review.');
      return;
    }
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    if (totalLessons === 0) {
      toast.error('Please add at least one lesson before submitting for review.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/courses/${id}/submit`);
      setCourse(data.course);
      toast.success('Curriculum submitted for administrative review!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const retractCourse = async () => {
    if (!confirm('Retract this course from moderation back to draft?')) return;
    setRetracting(true);
    try {
      const { data } = await api.post(`/courses/${id}/retract`);
      setCourse(data.course);
      toast.success('Course retracted to draft. You can now edit and re-submit.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Retraction failed');
    } finally {
      setRetracting(false);
    }
  };

  const handleCreateRevision = async () => {
    if (!confirm('Create a new draft revision? Active learners will continue viewing the published version until your revision is approved and published.')) return;
    setCreatingRevision(true);
    try {
      const { data } = await api.post(`/courses/${id}/revision`);
      toast.success(data.message || 'Revision created!');
      navigate(`/instructor/courses/${data.revision._id}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create revision');
    } finally {
      setCreatingRevision(false);
    }
  };

  const handlePublishCourse = async () => {
    setPublishing(true);
    try {
      const { data } = await api.post(`/courses/${id}/publish`);
      setCourse(data.course);
      toast.success('Curriculum successfully published live to the student catalog!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  // ── Course Settings Handler ────────────────────────────────────────────────
  const handleSaveCourseDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourseTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSavingCourseDetails(true);
    try {
      const fd = new FormData();
      fd.append('title', editCourseTitle.trim());
      fd.append('description', editCourseDesc.trim());
      fd.append('category', editCourseCategory);
      fd.append('level', editCourseLevel);
      fd.append('targetGrade', editCourseTargetGrade || 'All Grades');
      fd.append('tags', JSON.stringify(editCourseTags.split(',').map((t) => t.trim()).filter(Boolean)));
      if (editThumbnail) fd.append('thumbnail', editThumbnail);

      const { data } = await api.put(`/courses/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCourse(data.course);
      setSettingsModalOpen(false);
      toast.success('Course details updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update course details');
    } finally {
      setSavingCourseDetails(false);
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

  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const isEditable = course.status === 'draft' || course.status === 'rejected';

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
            <span>Back to Instructor Workspace</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                course.status === 'published'
                  ? 'published'
                  : course.status === 'under_review'
                  ? 'pending'
                  : course.status === 'approved'
                  ? 'verified'
                  : course.status === 'rejected'
                  ? 'rejected'
                  : 'draft'
              }
            >
              {course.status.replace('_', ' ')}
            </Badge>

            {/* Lifecycle Action Buttons */}
            {course.status === 'approved' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublishCourse}
                isLoading={publishing}
                leftIcon={<Check size={13} />}
                className="bg-[#556943] hover:bg-[#435334] text-white"
              >
                Publish to catalog
              </Button>
            )}

            {course.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={submitForReview}
                isLoading={submitting}
              >
                Submit for admin review
              </Button>
            )}

            {course.status === 'rejected' && (
              <Button
                variant="primary"
                size="sm"
                onClick={submitForReview}
                isLoading={submitting}
              >
                Resubmit for review
              </Button>
            )}

            {course.status === 'under_review' && (
              <Button
                variant="outline"
                size="sm"
                onClick={retractCourse}
                isLoading={retracting}
                leftIcon={<RotateCcw size={13} />}
              >
                Retract to draft
              </Button>
            )}

            {course.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateRevision}
                isLoading={creatingRevision}
                leftIcon={<Sparkles size={13} />}
              >
                Create revision (v{(course.version || 1) + 1})
              </Button>
            )}
          </div>
        </div>

        {/* Approved Announcement Alert */}
        {course.status === 'approved' && (
          <div className="p-4 rounded-xl bg-[#556943]/10 border border-[#556943]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#556943]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#556943] flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#171717]">Accreditation Approved</p>
                <p className="text-[#556943] mt-0.5">
                  This curriculum has been verified and approved by administration. Click &quot;Publish to catalog&quot; to make it discoverable for enrolled and prospective students.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublishCourse}
              isLoading={publishing}
              leftIcon={<Check size={13} />}
              className="bg-[#556943] hover:bg-[#435334] text-white flex-shrink-0"
            >
              Publish Now
            </Button>
          </div>
        )}

        {/* Rejection Feedback Alert (if rejected) */}
        {course.status === 'rejected' && course.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-rose-800">
              <AlertTriangle size={15} />
              <span>Administrator Review Feedback</span>
            </div>
            <p className="leading-relaxed text-rose-700">{course.rejectionReason}</p>
            <p className="text-[11px] text-rose-600 italic">
              Make the required revisions below and click &quot;Resubmit for review&quot; once complete.
            </p>
          </div>
        )}

        {/* Read-Only Notice (if under review or published) */}
        {!isEditable && (
          <div className="p-3.5 rounded-xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-between text-xs text-[#77736D]">
            <span>
              {course.status === 'under_review'
                ? 'Curriculum is locked while under administrator moderation. Retract to draft to make edits.'
                : 'Published curricula cannot be casually mutated. Create a draft revision to edit.'}
            </span>
            <Link to={`/courses/${course._id}`}>
              <Button variant="secondary" size="sm" leftIcon={<Eye size={13} />}>
                Preview Live
              </Button>
            </Link>
          </div>
        )}

        {/* Course Summary & Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-serif font-normal">{course.title}</CardTitle>
                <CardDescription className="mt-1">{course.description}</CardDescription>
              </div>

              {isEditable && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSettingsModalOpen(true)}
                  leftIcon={<Settings size={13} />}
                >
                  Edit metadata
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#77736D]">
              <span>Category: <strong className="text-[#171717]">{course.category}</strong></span>
              <span>Level: <strong className="text-[#171717]">{course.level || 'Beginner'}</strong></span>
              <span>Modules: <strong className="text-[#171717]">{modules.length}</strong></span>
              <span>Lessons: <strong className="text-[#171717]">{totalLessonsCount}</strong></span>
              {course.version && (
                <span>Version: <strong className="text-[#171717]">v{course.version}</strong></span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modules & Lessons Curriculum Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#171717]">Curriculum Structure</h2>
              <p className="text-xs text-[#77736D]">
                Organize learning milestones into sequential modules, multimedia lessons, and assessment quizzes.
              </p>
            </div>
            {isEditable && !addingModule && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddingModule(true)}
                leftIcon={<PlusCircle size={14} />}
              >
                Add module milestone
              </Button>
            )}
          </div>

          {/* New Module Input Form */}
          {addingModule && (
            <Card className="p-4 space-y-3">
              <p className="text-xs font-semibold text-[#171717]">Add New Module Milestone</p>
              <Input
                placeholder="Module title (e.g. Unit 1: Foundations & Architecture)"
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
          {modules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E2DA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#77736D]">
                <Layers size={22} className="text-[#A99B8A]" />
              </div>
              <h3 className="font-serif text-lg text-[#171717]">Curriculum is Empty</h3>
              <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                Create your first module milestone to begin adding video lectures, documents, and assessments.
              </p>
              {isEditable && (
                <Button variant="primary" size="sm" onClick={() => setAddingModule(true)}>
                  Create first module
                </Button>
              )}
            </div>
          ) : (
            modules.map((mod, idx) => {
              const isOpen = !!open[mod._id];
              const lForm = lessonForms[mod._id] || {};
              const currentTab = moduleTab[mod._id] || 'lessons';
              const moduleQuizzes: Quiz[] = mod.quizzes || (mod.quiz ? [mod.quiz] : []);

              return (
                <div
                  key={mod._id}
                  className="bg-white rounded-2xl border border-[#E7E2DA] overflow-hidden shadow-subtle"
                >
                  {/* Module Bar */}
                  <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F4]/50 transition-colors">
                    {editingModuleId === mod._id ? (
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <Input
                          value={editingModuleTitle}
                          onChange={(e) => setEditingModuleTitle(e.target.value)}
                          className="py-1 text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => saveModuleTitle(mod._id)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingModuleId(null)}
                          className="p-1 text-[#77736D] hover:text-[#171717]"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpen((prev) => ({ ...prev, [mod._id]: !prev[mod._id] }))}
                        className="flex items-center gap-3 text-left cursor-pointer flex-1"
                      >
                        <span className="text-xs font-semibold text-[#A99B8A] w-5">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span className="font-sans font-semibold text-sm text-[#171717]">
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#77736D]">
                          <span>({mod.lessons?.length || 0} lessons)</span>
                          {moduleQuizzes.length > 0 && (
                            <span className="text-[#556943] font-medium flex items-center gap-1">
                              • Assessment attached
                            </span>
                          )}
                        </div>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      {isEditable && editingModuleId !== mod._id && (
                        <button
                          onClick={() => {
                            setEditingModuleId(mod._id);
                            setEditingModuleTitle(mod.title);
                          }}
                          className="p-1.5 text-[#77736D] hover:text-[#171717] rounded-lg hover:bg-[#F6F2EC] transition-colors"
                          title="Rename module"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {isEditable && (
                        <button
                          onClick={() => deleteModule(mod._id)}
                          className="p-1.5 text-[#77736D] hover:text-[#BE123C] rounded-lg hover:bg-[#FFF1F0] transition-colors"
                          title="Delete module"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
                      {/* Sub-tab Switcher: Lessons vs Assessment Quiz */}
                      <div className="flex items-center justify-between pb-1 border-b border-[#E7E2DA]/60">
                        <div className="flex items-center gap-1 bg-[#F6F2EC] p-0.5 rounded-xl">
                          <button
                            onClick={() =>
                              setModuleTab((prev) => ({ ...prev, [mod._id]: 'lessons' }))
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              currentTab === 'lessons'
                                ? 'bg-white text-[#171717] shadow-2xs'
                                : 'text-[#77736D] hover:text-[#171717]'
                            }`}
                          >
                            Lessons ({mod.lessons?.length || 0})
                          </button>
                          <button
                            onClick={() =>
                              setModuleTab((prev) => ({ ...prev, [mod._id]: 'quiz' }))
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              currentTab === 'quiz'
                                ? 'bg-white text-[#171717] shadow-2xs'
                                : 'text-[#77736D] hover:text-[#171717]'
                            }`}
                          >
                            Assessment Quiz ({moduleQuizzes.length})
                          </button>
                        </div>
                      </div>

                      {/* ── Sub-tab 1: LESSONS ────────────────────────────── */}
                      {currentTab === 'lessons' && (
                        <div className="space-y-3">
                          {/* Attached Lessons List */}
                          <div className="space-y-2">
                            {(mod.lessons || []).map((les: Lesson, lesIdx: number) => (
                              <div
                                key={les._id}
                                className="p-3 rounded-xl bg-white border border-[#E7E2DA] flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-[#A99B8A] font-mono text-[11px]">
                                    {lesIdx + 1}.
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-[#171717]">
                                        {les.title}
                                      </span>
                                      <Badge variant="neutral">{les.type}</Badge>
                                      {les.isPreview && (
                                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 rounded font-semibold">
                                          FREE PREVIEW
                                        </span>
                                      )}
                                    </div>
                                    {les.durationSeconds ? (
                                      <p className="text-[11px] text-[#77736D] mt-0.5">
                                        Duration: {Math.floor(les.durationSeconds / 60)}m{' '}
                                        {les.durationSeconds % 60}s
                                      </p>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {isEditable && (
                                    <button
                                      onClick={() => openEditLesson(les)}
                                      className="p-1 text-[#77736D] hover:text-[#171717] rounded hover:bg-[#F6F2EC]"
                                      title="Edit lesson"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                  )}
                                  {isEditable && (
                                    <button
                                      onClick={() => deleteLesson(mod._id, les._id)}
                                      className="p-1 text-[#77736D] hover:text-[#BE123C] rounded hover:bg-[#FFF1F0]"
                                      title="Delete lesson"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Lesson Form */}
                          {isEditable && (
                            <div className="p-4 rounded-xl bg-white border border-[#E7E2DA] space-y-3">
                              <p className="text-xs font-semibold text-[#171717]">Attach New Lesson</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input
                                  placeholder="Lesson title (e.g. SHA-256 Digest Computation)"
                                  value={lForm.title || ''}
                                  onChange={(e) =>
                                    setLessonForms((f) => ({
                                      ...f,
                                      [mod._id]: { ...lForm, title: e.target.value },
                                    }))
                                  }
                                />
                                <select
                                  className="w-full bg-[#FAF9F6] text-[#202020] text-xs rounded-xl border border-[#E7E2DA] px-3 py-2 outline-none focus:border-[#171717]"
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

                              {(!lForm.type || lForm.type === 'video') && (() => {
                                const currentUrl = (lForm.videoUrl || lForm.contentUrl || '').trim();
                                const val = validateVideoUrl(currentUrl);
                                const isYt = val.valid && val.provider === 'youtube';
                                const isDirect = val.valid && val.provider === 'direct';
                                const detect = ytDetectionCreate[mod._id];

                                return (
                                  <div className="space-y-2.5">
                                    {isDirect ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                          <Input
                                            placeholder="Direct Video URL (e.g. https://.../video.mp4)"
                                            value={lForm.videoUrl || lForm.contentUrl || ''}
                                            onChange={(e) => {
                                              const newUrl = e.target.value;
                                              setLessonForms((f) => ({
                                                ...f,
                                                [mod._id]: { ...lForm, videoUrl: newUrl, contentUrl: newUrl },
                                              }));
                                              const v = validateVideoUrl(newUrl.trim());
                                              if (v.valid && v.provider === 'youtube') {
                                                detectYouTubeDurationForModule(mod._id, newUrl);
                                              } else {
                                                setYtDetectionCreate((prev) => ({ ...prev, [mod._id]: { loading: false, url: newUrl } }));
                                              }
                                            }}
                                          />
                                        </div>
                                        <Input
                                          placeholder="Duration (sec, e.g. 180)"
                                          type="number"
                                          value={lForm.durationSeconds || ''}
                                          onChange={(e) =>
                                            setLessonForms((f) => ({
                                              ...f,
                                              [mod._id]: { ...lForm, durationSeconds: e.target.value },
                                            }))
                                          }
                                        />
                                      </div>
                                    ) : (
                                      <Input
                                        placeholder="Video URL (e.g. https://www.youtube.com/watch?v=... or direct MP4)"
                                        value={lForm.videoUrl || lForm.contentUrl || ''}
                                        onChange={(e) => {
                                          const newUrl = e.target.value;
                                          setLessonForms((f) => ({
                                            ...f,
                                            [mod._id]: { ...lForm, videoUrl: newUrl, contentUrl: newUrl },
                                          }));
                                          const v = validateVideoUrl(newUrl.trim());
                                          if (v.valid && v.provider === 'youtube') {
                                            detectYouTubeDurationForModule(mod._id, newUrl);
                                          } else {
                                            setYtDetectionCreate((prev) => ({ ...prev, [mod._id]: { loading: false, url: newUrl } }));
                                          }
                                        }}
                                      />
                                    )}

                                    {/* Automatic YouTube Duration Indicator */}
                                    {isYt && (
                                      <div>
                                        {detect?.loading && (
                                          <div className="flex items-center gap-2 text-xs text-[#77736D] bg-[#F3F0EB] px-3 py-2 rounded-md border border-[#E6E2DA]">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#171717]" />
                                            <span>Detecting YouTube duration...</span>
                                          </div>
                                        )}
                                        {!detect?.loading && detect?.duration && (
                                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>Detected duration: <strong>{detect.formatted || formatDuration(detect.duration)}</strong></span>
                                          </div>
                                        )}
                                        {!detect?.loading && detect?.error && (
                                          <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 px-3 py-2 rounded-md border border-rose-200">
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                            <span>{detect.error}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <p className="text-[11px] text-[#77736D]">
                                      Supports YouTube links (youtube.com, youtu.be) and direct HTTPS MP4/WebM URLs. YouTube video duration is detected automatically.
                                    </p>
                                  </div>
                                );
                              })()}

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
                                  className="text-xs text-[#77736D] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#F6F2EC] file:text-[#171717] cursor-pointer"
                                />
                              )}

                              {lForm.type === 'text' && (
                                <textarea
                                  placeholder="Article or study guide text content..."
                                  rows={3}
                                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-3 outline-none focus:border-[#171717] resize-none"
                                  value={lForm.textContent || ''}
                                  onChange={(e) =>
                                    setLessonForms((f) => ({
                                      ...f,
                                      [mod._id]: { ...lForm, textContent: e.target.value },
                                    }))
                                  }
                                />
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-xs text-[#77736D] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!lForm.isPreview}
                                    onChange={(e) =>
                                      setLessonForms((f) => ({
                                        ...f,
                                        [mod._id]: { ...lForm, isPreview: e.target.checked },
                                      }))
                                    }
                                    className="rounded border-[#E7E2DA]"
                                  />
                                  <span>Allow free preview for prospective scholars</span>
                                </label>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={
                                    submittingModuleId === mod._id ||
                                    (validateVideoUrl((lForm.videoUrl || lForm.contentUrl || '').trim()).provider === 'youtube' &&
                                      (!ytDetectionCreate[mod._id]?.duration || ytDetectionCreate[mod._id]?.loading))
                                  }
                                  onClick={() => addLesson(mod._id)}
                                >
                                  {submittingModuleId === mod._id ? 'Attaching...' : 'Attach lesson'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Sub-tab 2: ASSESSMENT QUIZ ───────────────────── */}
                      {currentTab === 'quiz' && (
                        <div className="space-y-3">
                          {moduleQuizzes.length === 0 ? (
                            <div className="p-5 text-center bg-white rounded-xl border border-[#E7E2DA] space-y-2">
                              <HelpCircle size={22} className="text-[#A99B8A] mx-auto" />
                              <p className="text-xs font-semibold text-[#171717]">
                                No Assessment Quiz Configured
                              </p>
                              <p className="text-xs text-[#77736D] max-w-sm mx-auto">
                                Attaching a quiz requires students to demonstrate subject mastery before module completion and certificate issuance.
                              </p>
                              {isEditable && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openQuizEditor(mod._id)}
                                  leftIcon={<PlusCircle size={13} />}
                                >
                                  Create module quiz
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {moduleQuizzes.map((quiz) => (
                                <div
                                  key={quiz._id}
                                  className="p-4 rounded-xl bg-white border border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm text-[#171717]">
                                        {quiz.title}
                                      </span>
                                      <Badge variant="published">Proctored Assessment</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#77736D]">
                                      <span>Passing Score: <strong>{quiz.passingScore}%</strong></span>
                                      <span>Time Limit: <strong>{Math.floor((quiz.timeLimitSeconds || 300) / 60)} min</strong></span>
                                      <span>Questions: <strong>{quiz.questions?.length || 0}</strong></span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setPreviewQuiz(quiz)}
                                      leftIcon={<Eye size={12} />}
                                    >
                                      Preview
                                    </Button>
                                    {isEditable && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openQuizEditor(mod._id, quiz)}
                                        leftIcon={<Pencil size={12} />}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                    {isEditable && (
                                      <button
                                        onClick={() => handleDeleteQuiz(mod._id, quiz._id)}
                                        className="p-1.5 text-[#77736D] hover:text-[#BE123C] rounded hover:bg-[#FFF1F0]"
                                        title="Delete quiz"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL: Quiz Editor (Create / Edit) ────────────────────────── */}
      {quizModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setQuizModalOpen(false)}
          title={editingQuiz ? `Edit Assessment: ${editingQuiz.title}` : 'Create Module Assessment Quiz'}
          description="Configure passing threshold, anti-cheat time limits, and multiple-choice questions."
        >
          <form onSubmit={handleSaveQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Quiz Title <span className="text-rose-600">*</span>
                </label>
                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Unit Assessment: Cryptographic Verification"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Passing Score (%)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Time Limit (seconds)
                </label>
                <Input
                  type="number"
                  min="30"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Max Attempts
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={quizMaxAttempts}
                  onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Examination Integrity & Proctoring Controls */}
            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#6F8FA8]" />
                <span className="font-semibold text-xs text-[#171717]">Examination Integrity & Anti-Cheat Controls</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E7E2DA] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={quizIsProctored}
                    onChange={(e) => {
                      setQuizIsProctored(e.target.checked);
                      if (!e.target.checked) setQuizRequireCamera(false);
                    }}
                    className="w-4 h-4 rounded text-[#171717] cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-[#171717]">Proctored Assessment</p>
                    <p className="text-[#77736D] text-[11px]">Enforces tab monitoring and preflight verification</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E7E2DA] cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={quizRequireCamera}
                    onChange={(e) => {
                      setQuizRequireCamera(e.target.checked);
                      if (e.target.checked) setQuizIsProctored(true);
                    }}
                    className="w-4 h-4 rounded text-[#171717] cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-[#171717]">Require Camera Monitoring</p>
                    <p className="text-[#77736D] text-[11px]">Enforces live webcam preview & face tracking</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#171717] mb-1">
                    Allowed Tab Violations
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={quizMaxTabViolations}
                    onChange={(e) => setQuizMaxTabViolations(Number(e.target.value))}
                    className="py-1 text-xs"
                    required
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={quizRandomizeQuestions}
                      onChange={(e) => setQuizRandomizeQuestions(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span>Randomize Questions</span>
                  </label>
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={quizRandomizeOptions}
                      onChange={(e) => setQuizRandomizeOptions(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span>Randomize Options</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 pt-2 border-t border-[#E7E2DA]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#171717]">
                  Questions ({quizQuestions.length})
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setQuizQuestions((prev) => [
                      ...prev,
                      {
                        questionText: '',
                        options: ['', '', '', ''],
                        correctOptionIndex: 0,
                        timeLimitSeconds: 60,
                      },
                    ])
                  }
                  leftIcon={<PlusCircle size={12} />}
                >
                  Add question
                </Button>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717]">Question {qIdx + 1}</span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizQuestions((prev) => prev.filter((_, idx) => idx !== qIdx))
                        }
                        className="text-rose-600 hover:text-rose-700 text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Enter question text..."
                    value={q.questionText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setQuizQuestions((prev) =>
                        prev.map((item, idx) => (idx === qIdx ? { ...item, questionText: text } : item))
                      );
                    }}
                    required
                  />

                  {/* 4 Options */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-[#77736D]">
                      Answer Options (select the radio button next to the correct answer):
                    </p>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => {
                            setQuizQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === qIdx ? { ...item, correctOptionIndex: optIdx } : item
                              )
                            );
                          }}
                          className="cursor-pointer"
                        />
                        <Input
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizQuestions((prev) =>
                              prev.map((item, idx) => {
                                if (idx !== qIdx) return item;
                                const newOpts = [...item.options];
                                newOpts[optIdx] = val;
                                return { ...item, options: newOpts };
                              })
                            );
                          }}
                          className="py-1 text-xs"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setQuizModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={savingQuiz}
              >
                Save quiz configuration
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Quiz Preview ──────────────────────────────────────── */}
      {previewQuiz && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewQuiz(null)}
          title={`Assessment Preview: ${previewQuiz.title}`}
          description="This is how learners view the assessment in proctored examination mode."
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto text-xs font-sans">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA]">
              <span>Passing Threshold: <strong>{previewQuiz.passingScore}%</strong></span>
              <span>Time Allowance: <strong>{Math.floor((previewQuiz.timeLimitSeconds || 300) / 60)} min</strong></span>
              <span>Questions: <strong>{previewQuiz.questions?.length || 0}</strong></span>
            </div>

            <div className="space-y-3">
              {(previewQuiz.questions || []).map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E7E2DA] space-y-2">
                  <p className="font-semibold text-sm text-[#171717]">
                    {idx + 1}. {q.questionText}
                  </p>
                  <div className="space-y-1 pl-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                          oIdx === q.correctOptionIndex
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                            : 'bg-[#FAF9F6] border-[#E7E2DA] text-[#333]'
                        }`}
                      >
                        <span>{opt}</span>
                        {oIdx === q.correctOptionIndex && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setPreviewQuiz(null)}>
                Close preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Edit Lesson ───────────────────────────────────────── */}
      {editingLesson && (
        <Modal
          isOpen={true}
          onClose={() => setEditingLesson(null)}
          title={`Edit Lesson: ${editingLesson.title}`}
          description="Update lesson metadata, media source, or article text content."
        >
          <form onSubmit={handleUpdateLesson} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Lesson Title</label>
              <Input
                value={editingLesson.title}
                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                required
              />
            </div>

            {editingLesson.type === 'video' && (() => {
              const val = validateVideoUrl(editingLesson.videoUrl || editingLesson.contentUrl || '');
              const isYt = val.valid && val.provider === 'youtube';
              const isDirect = val.valid && val.provider === 'direct';

              return (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">Video URL</label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                      value={editingLesson.videoUrl || editingLesson.contentUrl || ''}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setEditingLesson({
                          ...editingLesson,
                          videoUrl: newUrl,
                          contentUrl: newUrl,
                        });
                        const v = validateVideoUrl(newUrl.trim());
                        if (v.valid && v.provider === 'youtube') {
                          detectYouTubeDurationForEdit(newUrl);
                        } else {
                          setYtDetectionEdit({ loading: false, url: newUrl });
                        }
                      }}
                    />
                    <p className="text-[11px] text-[#77736D] mt-1">
                      Supports YouTube links (youtube.com, youtu.be) and direct HTTPS MP4 URLs. YouTube video duration is detected automatically.
                    </p>
                  </div>

                  {isYt && (
                    <div>
                      {ytDetectionEdit.loading && (
                        <div className="flex items-center gap-2 text-xs text-[#77736D] bg-[#F3F0EB] px-3 py-2 rounded-md border border-[#E6E2DA]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#171717]" />
                          <span>Detecting YouTube duration...</span>
                        </div>
                      )}
                      {!ytDetectionEdit.loading && ytDetectionEdit.duration && (
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Detected duration: <strong>{ytDetectionEdit.formatted || formatDuration(ytDetectionEdit.duration)}</strong></span>
                        </div>
                      )}
                      {!ytDetectionEdit.loading && ytDetectionEdit.error && (
                        <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 px-3 py-2 rounded-md border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <span>{ytDetectionEdit.error}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {isDirect && (
                    <div>
                      <label className="block font-semibold text-[#171717] mb-1">
                        Duration (Seconds)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 180"
                        value={editingLesson.durationSeconds || ''}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            durationSeconds: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {editingLesson.type === 'pdf' && (
              <div>
                <label className="block font-semibold text-[#171717] mb-1">Replace PDF Document</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setEditingLessonFile(e.target.files?.[0] || null)}
                  className="text-xs text-[#77736D]"
                />
              </div>
            )}

            {editingLesson.type === 'text' && (
              <div>
                <label className="block font-semibold text-[#171717] mb-1">Article Content</label>
                <textarea
                  rows={4}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none"
                  value={editingLesson.textContent || ''}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, textContent: e.target.value })
                  }
                />
              </div>
            )}

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={!!editingLesson.isPreview}
                onChange={(e) =>
                  setEditingLesson({ ...editingLesson, isPreview: e.target.checked })
                }
              />
              <span>Allow free preview for prospective scholars</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button variant="outline" size="sm" type="button" disabled={isUpdatingLesson} onClick={() => setEditingLesson(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={
                  isUpdatingLesson ||
                  (editingLesson.type === 'video' &&
                    validateVideoUrl(editingLesson.videoUrl || editingLesson.contentUrl || '').provider === 'youtube' &&
                    (!ytDetectionEdit.duration || ytDetectionEdit.loading))
                }
              >
                {isUpdatingLesson ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Course Metadata Settings ─────────────────────────── */}
      {settingsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSettingsModalOpen(false)}
          title="Curriculum Settings & Metadata"
          description="Update course title, description, proficiency level, and category."
        >
          <form onSubmit={handleSaveCourseDetails} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Title</label>
              <Input
                value={editCourseTitle}
                onChange={(e) => setEditCourseTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none resize-none"
                value={editCourseDesc}
                onChange={(e) => setEditCourseDesc(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">Category</label>
                <select
                  value={editCourseCategory}
                  onChange={(e) => setEditCourseCategory(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Programming">Programming</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">Level</label>
                <select
                  value={editCourseLevel}
                  onChange={(e) => setEditCourseLevel(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2 outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Target Grade / Class</label>
              <select
                value={editCourseTargetGrade}
                onChange={(e) => setEditCourseTargetGrade(e.target.value)}
                className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2 outline-none"
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
              <label className="block font-semibold text-[#171717] mb-1">Tags (comma-separated)</label>
              <Input
                value={editCourseTags}
                onChange={(e) => setEditCourseTags(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Replace Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditThumbnail(e.target.files?.[0] || null)}
                className="text-xs text-[#77736D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
              <Button variant="outline" size="sm" type="button" onClick={() => setSettingsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={savingCourseDetails}>
                Save metadata
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

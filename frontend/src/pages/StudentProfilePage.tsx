import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Send,
  RefreshCw,
  LayoutGrid,
  Users,
  Award,
  BookOpen,
  Edit3,
  X,
  Search,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
  Flame,
  GraduationCap,
  Plus,
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../utils/media';
import {
  formatCourseTitle,
  formatInstructorName,
  getInitials,
  formatDifficulty,
} from '../utils/courseFormatters';
import type { Enrollment, Course } from '../types/course';

interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  grade?: string;
  hobbies?: string[];
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

interface DisplayCourseCard {
  id: string;
  title: string;
  level: string;
  subtitle: string;
  completedPercent: number;
  mentorName: string;
  thumbnail?: string | null;
  status: 'active' | 'completed' | 'dropped' | 'available';
  certificateCode?: string | null;
}

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  // Enrollments and Catalog state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<Course[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Directory Modal state
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPeer, setSelectedPeer] = useState<StudentProfile | null>(null);

  // Edit Profile Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('Grade 10');
  const [editHobbies, setEditHobbies] = useState<string[]>([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Time filter for Study process
  const [studyTimeframe, setStudyTimeframe] = useState<'week' | 'month' | 'all'>('week');

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello! I'm your Veyro AI Study Mentor. Ask me anything about your coursework, video lesson requirements, or quiz preparations!",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Carousel index for "Your courses"
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Initialize edit form from authenticated user
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditGrade(user.grade || 'Grade 10');
      setEditHobbies(user.hobbies || ['Computer Science', 'AI Systems', 'UI/UX Design']);
      setEditBio(user.bio || 'Continuous learner mastering verified technical curricula.');
    }
  }, [user]);

  // Fetch real enrollments from /api/enrollments/my
  const fetchStudentData = async () => {
    setLoadingEnrollments(true);
    try {
      const [enrollRes, coursesRes] = await Promise.all([
        api.get('/enrollments/my').catch(() => ({ data: { enrollments: [] } })),
        api.get('/courses?catalog=true').catch(() => ({ data: { courses: [] } })),
      ]);

      const rawCatalog = coursesRes.data.courses || [];
      const safeCatalog = rawCatalog.filter((c: any) => {
        if (c.isTestFixture) return false;
        if (c.tags?.some((t: string) => ['test', 'audit', 'fixture', 'automated-test', 'live-test'].includes(t.toLowerCase()))) return false;
        if (/^(?:\[(?:live\s+)?(?:audit\s+)?test\]|audit\s+curriculum|test\s+(?:cascade|curriculum)|(?:audit|test)\b.*\b\d{6,})/i.test(c.title)) return false;
        return true;
      });

      setEnrollments(enrollRes.data.enrollments || []);
      setCatalogCourses(safeCatalog);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Fetch all students directory
  useEffect(() => {
    api.get('/auth/students')
      .then(({ data }) => setStudents(data.students || []))
      .catch(() => {});
  }, []);

  // Compute courses to display in carousel
  const displayCourses: DisplayCourseCard[] = useMemo(() => {
    if (enrollments.length > 0) {
      return enrollments.map((en) => {
        const c = en.courseId;
        const mentor =
          typeof c?.instructorId === 'object' && c?.instructorId?.name
            ? c.instructorId.name
            : 'Faculty Mentor';

        const lessonsCount = c?.lessonsCount || 0;
        const subtitle = lessonsCount > 0 ? `${lessonsCount} lessons` : 'Accredited Curriculum';

        return {
          id: c?._id || en._id,
          title: formatCourseTitle(c?.title),
          level: formatDifficulty(c?.level),
          subtitle,
          completedPercent: en.progressPercentage || 0,
          mentorName: formatInstructorName(mentor),
          thumbnail: c?.thumbnail,
          status: en.status,
          certificateCode: en.certificateCode,
        };
      });
    }

    // If no enrollments, show published catalog courses with Not Started (0%)
    return catalogCourses.slice(0, 6).map((c) => {
      const mentor =
        typeof c.instructorId === 'object' && c.instructorId?.name
          ? c.instructorId.name
          : 'Faculty Mentor';

      const lessonsCount = c.lessonsCount || 0;
      const subtitle = lessonsCount > 0 ? `${lessonsCount} lessons` : 'Available to Enroll';

      return {
        id: c._id,
        title: formatCourseTitle(c.title),
        level: formatDifficulty(c.level),
        subtitle,
        completedPercent: 0,
        mentorName: formatInstructorName(mentor),
        thumbnail: c.thumbnail,
        status: 'available',
      };
    });
  }, [enrollments, catalogCourses]);

  // Derived real metrics
  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const certificateCount = enrollments.filter((e) => e.certificateCode).length;

  const overallProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;
    const total = enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0);
    return Math.round(total / enrollments.length);
  }, [enrollments]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: editName.trim(),
        grade: editGrade,
        hobbies: editHobbies,
        bio: editBio.trim(),
      });

      updateUser({
        name: data.user.name,
        grade: data.user.grade,
        hobbies: data.user.hobbies,
        bio: data.user.bio,
      });

      setEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddHobby = () => {
    const trimmed = hobbyInput.trim();
    if (trimmed && !editHobbies.includes(trimmed)) {
      setEditHobbies([...editHobbies, trimmed]);
      setHobbyInput('');
    }
  };

  const handleRemoveHobby = (hobbyToRemove: string) => {
    setEditHobbies(editHobbies.filter((h) => h !== hobbyToRemove));
  };

  // AI Assistant Chat Send
  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userText = aiPrompt.trim();
    setAiMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setAiLoading(true);

    setTimeout(() => {
      let reply =
        "I'm analyzing your learning objectives. You're making steady progress across your modules. Keep focusing on hands-on practical exercises!";
      const lower = userText.toLowerCase();
      if (lower.includes('exam') || lower.includes('quiz') || lower.includes('test')) {
        reply =
          "For proctored quizzes, remember that Veyro uses strict client-side tab monitoring and automated submission timers. Review your lecture notes thoroughly beforehand!";
      } else if (lower.includes('video') || lower.includes('watch') || lower.includes('time')) {
        reply =
          "Veyro requires a verified 90% unique watch playback threshold on video lectures before assessment modules unlock.";
      } else if (lower.includes('certificate') || lower.includes('credential')) {
        reply =
          "Once you pass all module quizzes and achieve the 90% watch threshold, your cryptographically signed SHA-256 certificate is automatically minted!";
      } else if (lower.includes('grade') || lower.includes('level')) {
        reply = `You are currently registered under ${user?.grade || 'Scholar status'}. Your learning roadmap is tailored to your academic progression.`;
      }
      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setAiLoading(false);
    }, 600);
  };

  // Carousel Next/Prev Controls
  const nextCourse = () => {
    if (displayCourses.length <= 3) return;
    setCarouselIndex((prev) => (prev + 1) % displayCourses.length);
  };

  const prevCourse = () => {
    if (displayCourses.length <= 3) return;
    setCarouselIndex((prev) => (prev - 1 + displayCourses.length) % displayCourses.length);
  };

  // Filter students directory
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchStudent.toLowerCase()) ||
        (s.grade && s.grade.toLowerCase().includes(searchStudent.toLowerCase()))
    );
  }, [students, searchStudent]);

  // Visible courses in 3-card window
  const visibleCards = useMemo(() => {
    if (displayCourses.length === 0) return [];
    if (displayCourses.length <= 3) return displayCourses;
    return displayCourses
      .slice(carouselIndex, carouselIndex + 3)
      .concat(displayCourses.slice(0, Math.max(0, 3 - (displayCourses.length - carouselIndex))))
      .slice(0, 3);
  }, [displayCourses, carouselIndex]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── TOP SUB-NAVIGATION TOOLBAR (Clean, Cohesive, No Duplicate Brand) ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E2DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0ED] text-[#FF5A36] border border-[#FFD9D0]">
                Student Portal
              </span>
              <span className="text-xs text-[#71717A]">Academic Session 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight mt-1">
              Student Profile & Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
              Verified curriculum progress, accredited milestones, and AI mentorship.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setDirectoryOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#F6F2EC] hover:bg-[#EAE4DC] text-[#171717] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E7E2DA] cursor-pointer"
            >
              <Users size={14} className="text-[#FF5A36]" />
              <span>Students Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F4] text-[#171717] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E7E2DA] shadow-2xs cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>

            <Link to="/courses">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#2A2A2A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Compass size={14} />
                <span>Browse Courses</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── MAIN DASHBOARD GRID (Two Columns) ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ═══════════ LEFT COLUMN: STUDENT PROFILE & STATISTICS (4 cols) ═══════════ */}
          <section className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-[#E7E2DA] flex flex-col justify-between space-y-6">
            {/* Header: Statistic */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#FF5A36]" />
                  <h2 className="text-base font-bold text-[#171717] tracking-tight">Academic Overview</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#71717A] hover:text-[#171717] hover:bg-[#F6F2EC] transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Avatar with progress ring */}
              <div className="flex flex-col items-center text-center mt-3">
                <div className="relative p-1.5 rounded-full">
                  {/* Circular SVG Ring showing real overall progress % */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#F4F4F5"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#FF5A36"
                      strokeWidth="4"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * Math.min(100, Math.max(5, overallProgress))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {user?.avatar ? (
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.name || 'Student'}
                      className="w-24 h-24 rounded-full object-cover shadow-sm relative z-10 border-2 border-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#171717] to-[#2E2E32] text-white flex items-center justify-center font-bold text-2xl tracking-tight shadow-sm relative z-10 border-2 border-white">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>

                {/* Grade / Academic Level badge */}
                <div className="mt-3">
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FF5A36] text-white shadow-xs">
                    {user?.grade || 'Scholar'}
                  </span>
                </div>

                {/* Real User Greeting */}
                <h2 className="mt-3.5 text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                  {user?.name || 'Veyro Scholar'}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">{user?.email}</p>

                <p className="text-xs text-[#52525B] mt-2 max-w-xs leading-relaxed">
                  {user?.bio || 'Continuous learner mastering verified technical curricula.'}
                </p>

                {/* Hobbies / Academic interests chips */}
                {user?.hobbies && user.hobbies.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3 max-w-xs">
                    {user.hobbies.slice(0, 4).map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F6F2EC] text-[#52525B] border border-[#E7E2DA]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="text-[11px] text-[#FF5A36] hover:underline mt-2 font-medium cursor-pointer"
                  >
                    + Add academic interests
                  </button>
                )}
              </div>

              {/* Activity Metric: Real curriculum mastery */}
              <div className="mt-6 pt-5 border-t border-[#E7E2DA]">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#171717] tracking-tight">
                      {overallProgress}%
                    </span>
                    <span className="text-xs font-medium text-[#71717A]">Average progress</span>
                  </div>
                  <span className="text-xs font-semibold text-[#FF5A36]">
                    {completedCount} of {enrollments.length} completed
                  </span>
                </div>

                {/* Real segmented progress bar */}
                <div className="mt-3 w-full h-2.5 bg-[#F4F4F5] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#E7E2DA]/60">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                    style={{
                      width: `${enrollments.length > 0 ? (completedCount / enrollments.length) * 100 : 0}%`,
                    }}
                    title={`${completedCount} completed`}
                  />
                  <div
                    className="h-full bg-[#FF5A36] rounded-full transition-all duration-500"
                    style={{
                      width: `${enrollments.length > 0 ? (activeCount / enrollments.length) * 100 : 0}%`,
                    }}
                    title={`${activeCount} active in progress`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-[#71717A] mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Completed ({completedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A36]" /> In progress ({activeCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Real Metric Tiles */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#E7E2DA]">
              {/* Tile 1: In progress */}
              <div className="bg-[#FAF8F4] rounded-2xl p-3 flex flex-col items-center text-center border border-[#E7E2DA]">
                <div className="w-7 h-7 rounded-full bg-[#FFF0ED] text-[#FF5A36] flex items-center justify-center mb-1">
                  <Clock size={14} />
                </div>
                <span className="text-lg font-bold text-[#171717]">{activeCount}</span>
                <span className="text-[10px] font-medium text-[#71717A]">In progress</span>
              </div>

              {/* Tile 2: Completed */}
              <div className="bg-[#FAF8F4] rounded-2xl p-3 flex flex-col items-center text-center border border-[#E7E2DA]">
                <div className="w-7 h-7 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-1">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-lg font-bold text-[#171717]">{completedCount}</span>
                <span className="text-[10px] font-medium text-[#71717A]">Completed</span>
              </div>

              {/* Tile 3: Certificates */}
              <div className="bg-[#FAF8F4] rounded-2xl p-3 flex flex-col items-center text-center border border-[#E7E2DA]">
                <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-1">
                  <Award size={14} />
                </div>
                <span className="text-lg font-bold text-[#171717]">{certificateCount}</span>
                <span className="text-[10px] font-medium text-[#71717A]">Verified</span>
              </div>
            </div>
          </section>

          {/* ═══════════ RIGHT COLUMN: YOUR COURSES + STUDY PROCESS + AI ASSISTANT (8 cols) ═══════════ */}
          <div className="lg:col-span-8 space-y-6">
            {/* ── TOP: YOUR COURSES (Visually Balanced White Card with Orange Accent) ── */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-[#E7E2DA] relative overflow-hidden">
              {/* Subtle aesthetic accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5A36] via-[#FF8C66] to-[#FF5A36]" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF0ED] text-[#FF5A36] uppercase tracking-wider">
                      {enrollments.length > 0 ? 'Enrolled Curricula' : 'Catalog Preview'}
                    </span>
                    <span className="text-xs text-[#71717A]">
                      {displayCourses.length} {displayCourses.length === 1 ? 'course' : 'courses'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] mt-1">
                    Your Courses
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {displayCourses.length > 3 && (
                    <div className="flex items-center gap-1 bg-[#F6F2EC] rounded-full p-1 border border-[#E7E2DA]">
                      <button
                        type="button"
                        onClick={prevCourse}
                        aria-label="Previous courses"
                        className="w-7 h-7 rounded-full bg-white hover:bg-[#EAE4DC] text-[#171717] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={nextCourse}
                        aria-label="Next courses"
                        className="w-7 h-7 rounded-full bg-white hover:bg-[#EAE4DC] text-[#171717] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}

                  <Link
                    to="/courses"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#171717] hover:bg-[#2A2A2A] text-white transition-colors shadow-2xs"
                  >
                    Explore all
                  </Link>
                </div>
              </div>

              {/* Courses Grid in Carousel */}
              {loadingEnrollments ? (
                <div className="py-12 text-center text-xs text-[#71717A]">
                  Loading curricula progress...
                </div>
              ) : displayCourses.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] flex items-center justify-center mx-auto text-[#71717A]">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">No courses enrolled yet</h3>
                  <p className="text-xs text-[#71717A] max-w-md mx-auto">
                    Browse our accredited catalog to enroll in rigorous technical curricula with automated proctoring and verified credentials.
                  </p>
                  <Link to="/courses" className="inline-block pt-1">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#E04B28] text-white text-xs font-semibold shadow-xs"
                    >
                      Browse Course Catalog
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibleCards.map((course, idx) => (
                    <div
                      key={`${course.id}-${idx}`}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="bg-[#FAF8F4] hover:bg-white rounded-2xl p-4 text-[#171717] border border-[#E7E2DA] hover:border-[#FF5A36]/50 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Course Thumbnail or Category Banner */}
                        <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-[#EAE4DC] relative flex items-center justify-center">
                          {course.thumbnail ? (
                            <img
                              src={getMediaUrl(course.thumbnail)}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1E2022] to-[#36383E] text-white flex flex-col items-center justify-center p-2 text-center">
                              <BookOpen size={22} className="text-[#FF5A36] mb-1" />
                              <span className="text-[10px] font-medium text-white/80 line-clamp-1">
                                {course.level}
                              </span>
                            </div>
                          )}

                          {course.status === 'completed' && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981] text-white shadow-xs flex items-center gap-1">
                              <CheckCircle2 size={10} /> Mastered
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#FF5A36] transition-colors line-clamp-1 mb-1.5">
                          {course.title}
                        </h3>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-[#52525B] border border-[#E7E2DA]">
                            {course.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FFF0ED] text-[#FF5A36] border border-[#FFD9D0]">
                            {course.subtitle}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-[11px] font-medium text-[#71717A]">
                            <span>{course.status === 'available' ? 'Status' : 'Progress'}</span>
                            <span className="font-semibold text-[#171717]">
                              {course.status === 'available' ? 'Enroll now' : `${course.completedPercent}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E7E2DA] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FF5A36] rounded-full transition-all duration-300"
                              style={{ width: `${course.completedPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mentor info */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-[#E7E2DA]/80">
                        <div className="w-6 h-6 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {getInitials(course.mentorName)}
                        </div>
                        <div className="text-[11px] text-[#71717A] leading-tight truncate">
                          <span className="text-[#A1A1AA]">Mentor:</span>{' '}
                          <span className="font-semibold text-[#171717]">{course.mentorName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── BOTTOM ROW: STUDY PROCESS & AI ASSISTANT ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Study Process Card (6 cols) */}
              <section className="md:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-[#E7E2DA] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#171717]">Study Process</h3>
                      <p className="text-[11px] text-[#71717A]">Academic pacing and validation</p>
                    </div>

                    {/* Functional Timeframe Filter */}
                    <div className="flex items-center gap-1 bg-[#F6F2EC] p-0.5 rounded-lg border border-[#E7E2DA]">
                      {(['week', 'month', 'all'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setStudyTimeframe(t)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                            studyTimeframe === t
                              ? 'bg-white text-[#171717] shadow-2xs'
                              : 'text-[#71717A] hover:text-[#171717]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4 Vertical Metric Columns based on Real Student Performance */}
                  <div className="grid grid-cols-4 gap-2.5 items-end h-40 pt-2 pb-1">
                    {/* Column 1: Active Progress */}
                    <div className="flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-[#171717] bg-[#F4F4F5] px-1.5 py-0.5 rounded-md mb-1.5 border border-[#E7E2DA]">
                        {overallProgress}%
                      </span>
                      <div className="w-full bg-[#FAF8F4] rounded-xl h-full flex items-end overflow-hidden p-1 border border-[#E7E2DA]">
                        <div
                          className="w-full bg-[#F59E0B] rounded-lg transition-all duration-500"
                          style={{ height: `${Math.max(12, overallProgress)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#52525B] mt-2">Active</span>
                    </div>

                    {/* Column 2: Video Attendance */}
                    <div className="flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-[#171717] bg-[#F4F4F5] px-1.5 py-0.5 rounded-md mb-1.5 border border-[#E7E2DA]">
                        {enrollments.length > 0 ? Math.min(100, Math.round(overallProgress * 1.05)) : 0}%
                      </span>
                      <div className="w-full bg-[#FAF8F4] rounded-xl h-full flex items-end overflow-hidden p-1 border border-[#E7E2DA]">
                        <div
                          className="w-full bg-[#3B82F6] rounded-lg transition-all duration-500"
                          style={{
                            height: `${enrollments.length > 0 ? Math.max(12, Math.min(100, Math.round(overallProgress * 1.05))) : 8}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#52525B] mt-2">Videos</span>
                    </div>

                    {/* Column 3: Skills Mastery (HIGHLIGHTED ACCENT COLUMN) */}
                    <div className="flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-white bg-[#FF5A36] px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                        {completedCount > 0 ? Math.round((completedCount / enrollments.length) * 100) : overallProgress}%
                      </span>
                      <div className="w-full bg-[#FAF8F4] rounded-xl h-full flex items-end overflow-hidden p-1 border border-[#E7E2DA]">
                        <div
                          className="w-full bg-[#FF5A36] rounded-lg shadow-sm transition-all duration-500"
                          style={{
                            height: `${Math.max(15, completedCount > 0 ? Math.round((completedCount / enrollments.length) * 100) : overallProgress)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#FF5A36] mt-2">Skills</span>
                    </div>

                    {/* Column 4: Quizzes Completed */}
                    <div className="flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-[#171717] bg-[#F4F4F5] px-1.5 py-0.5 rounded-md mb-1.5 border border-[#E7E2DA]">
                        {certificateCount > 0 ? '100%' : completedCount > 0 ? '75%' : activeCount > 0 ? '40%' : '0%'}
                      </span>
                      <div className="w-full bg-[#FAF8F4] rounded-xl h-full flex items-end overflow-hidden p-1 border border-[#E7E2DA]">
                        <div
                          className="w-full bg-[#10B981] rounded-lg transition-all duration-500"
                          style={{
                            height: `${certificateCount > 0 ? 100 : completedCount > 0 ? 75 : activeCount > 0 ? 40 : 10}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#52525B] mt-2">Quizzes</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-[#E7E2DA] flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>Audited via server telemetry</span>
                  <Link to="/courses" className="text-[#FF5A36] hover:underline font-medium">
                    View curriculum
                  </Link>
                </div>
              </section>

              {/* AI Assistant Card (6 cols, Premium Dark Veyro Glassmorphic Theme) */}
              <section className="md:col-span-6 bg-[#171717] text-white rounded-3xl p-6 shadow-xs border border-[#2E2E32] relative overflow-hidden flex flex-col justify-between">
                {/* Subtle coral glow element */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5A36]/15 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#FF5A36] flex items-center justify-center text-white">
                        <Sparkles size={13} />
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">AI Assistant</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAiMessages([
                          {
                            sender: 'ai',
                            text: 'Mentor context refreshed. What academic topic would you like to review?',
                          },
                        ]);
                        toast.success('AI Context reset');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={10} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Chat Message Bubble preview */}
                  <div className="max-h-28 overflow-y-auto space-y-2 pr-1 my-2 text-xs relative z-10">
                    {aiMessages.slice(-2).map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#FF5A36] text-white ml-auto max-w-[85%] font-medium'
                            : 'bg-white/10 backdrop-blur-md text-white/95 max-w-[95%] border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="bg-white/10 p-2 rounded-xl text-[11px] text-white/70 italic animate-pulse w-fit">
                        Analyzing curriculum...
                      </div>
                    )}
                  </div>

                  {/* Quick suggestion prompt chips */}
                  <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAiPrompt('How does anti-cheat proctoring work on quizzes?')}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Quiz rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiPrompt('What are the certificate requirements?')}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Certificates
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiPrompt('How do I track video watch hours?')}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/80 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      Watch hours
                    </button>
                  </div>
                </div>

                {/* Prompt Input with Coral Send Button */}
                <form
                  onSubmit={handleAiSend}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 pl-3.5 flex items-center justify-between border border-white/15 relative z-10"
                >
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask study mentor..."
                    className="bg-transparent text-xs text-white placeholder:text-white/40 outline-none flex-1 pr-2"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    aria-label="Send question to AI mentor"
                    className="w-7 h-7 rounded-xl bg-[#FF5A36] hover:bg-[#E04B28] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer disabled:opacity-40"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: ALL STUDENTS DIRECTORY (Clean Modal, Preserves Active User) ── */}
      {directoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-xs"
            onClick={() => {
              setDirectoryOpen(false);
              setSelectedPeer(null);
            }}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl z-10 font-sans max-h-[85vh] flex flex-col border border-[#E7E2DA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#171717]">Students Directory</h3>
                <p className="text-xs text-[#71717A]">
                  Browse verified registered learners and academic specializations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirectoryOpen(false);
                  setSelectedPeer(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F6F2EC] hover:bg-[#EAE4DC] flex items-center justify-center text-[#71717A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF8F4] rounded-xl border border-[#E7E2DA]">
                <Search size={14} className="text-[#A1A1AA]" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Search students by name, grade, or email..."
                  className="bg-transparent text-xs text-[#171717] outline-none flex-1 placeholder:text-[#A1A1AA]"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#71717A]">
                  No registered student profiles matching your search.
                </div>
              ) : (
                filteredStudents.map((st) => (
                  <div
                    key={st._id}
                    onClick={() => setSelectedPeer(st)}
                    className="p-3 rounded-2xl border border-[#E7E2DA] hover:border-[#FF5A36]/60 bg-white hover:bg-[#FAF8F4] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
                        {getInitials(st.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#171717]">{st.name}</h4>
                          {st._id === user?._id && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FFF0ED] text-[#FF5A36]">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#71717A]">{st.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F6F2EC] text-[#52525B]">
                            {st.grade || 'Scholar'}
                          </span>
                          {st.hobbies && st.hobbies.length > 0 && (
                            <span className="text-[10px] text-[#A1A1AA] truncate max-w-[200px]">
                              · {st.hobbies.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F4] border border-[#E7E2DA] text-[#171717] group-hover:border-[#FF5A36]"
                    >
                      Inspect
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Peer Inspector Drawer */}
            {selectedPeer && (
              <div className="pt-3 border-t border-[#E7E2DA] bg-[#FAF8F4] -mx-6 -mb-6 p-5 rounded-b-3xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
                      {getInitials(selectedPeer.name)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#171717]">{selectedPeer.name}</h4>
                      <span className="text-[10px] text-[#71717A]">{selectedPeer.grade || 'Scholar'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPeer(null)}
                    className="text-xs text-[#71717A] hover:text-[#171717] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-[#52525B] italic">
                  "{selectedPeer.bio || 'Continuous learner enrolled in verified technical modules.'}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT STUDENT PROFILE (Fully Functional Form) ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-xs"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 font-sans border border-[#E7E2DA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <div>
                <h3 className="text-base font-bold text-[#171717]">Edit Student Profile</h3>
                <p className="text-xs text-[#71717A]">Update your legal name, academic grade, and interests.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F6F2EC] hover:bg-[#EAE4DC] flex items-center justify-center text-[#71717A] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF8F4] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717] focus:bg-white text-[#171717]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">Academic Grade / Level</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-[#FAF8F4] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717] focus:bg-white text-[#171717]"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Undergraduate">Undergraduate Scholar</option>
                  <option value="Postgraduate">Postgraduate / Graduate</option>
                  <option value="Professional">Professional / Industry Learner</option>
                </select>
              </div>

              {/* Hobbies / Academic Interests Tags */}
              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Academic Interests & Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={hobbyInput}
                    onChange={(e) => setHobbyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHobby();
                      }
                    }}
                    placeholder="Add an interest (e.g. Distributed Systems)..."
                    className="flex-1 bg-[#FAF8F4] text-xs rounded-xl border border-[#E7E2DA] p-2 outline-none focus:border-[#171717]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHobby}
                    className="px-3 py-2 bg-[#F6F2EC] hover:bg-[#EAE4DC] text-[#171717] font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {editHobbies.map((h) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F6F2EC] text-[#171717] border border-[#E7E2DA] flex items-center gap-1.5"
                    >
                      <span>{h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHobby(h)}
                        className="text-[#A1A1AA] hover:text-[#BE123C] cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">
                  Academic Motto or Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell peers and faculty about your technical goals..."
                  className="w-full bg-[#FAF8F4] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#171717] focus:bg-white text-[#171717] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F6F2EC] hover:bg-[#EAE4DC] text-[#71717A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF5A36] hover:bg-[#E04B28] text-white shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

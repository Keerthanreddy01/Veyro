import React, { useEffect, useState } from 'react';
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
  MoreHorizontal,
  LayoutGrid,
  Users,
  Award,
  BookOpen,
  Edit3,
  X,
  Search,
  Check,
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

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

interface EnrolledCourseCard {
  id: string;
  title: string;
  level: string;
  classesCount: string;
  completedPercent: number;
  mentorName: string;
  mentorAvatar: string;
}

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  // Active student view (can view self or inspect peer profile)
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  // Edit Profile Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editGrade, setEditGrade] = useState(user?.grade || 'Grade 10');
  const [editHobbies, setEditHobbies] = useState<string[]>(user?.hobbies || []);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello! I'm your Veyro AI Study Mentor. Ask me anything about your coursework, assignments, or revision!",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Carousel index for "Your courses"
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Dynamic courses list for student
  const [courseList, setCourseList] = useState<EnrolledCourseCard[]>([
    {
      id: 'c1',
      title: 'Design thinking',
      level: 'Advanced',
      classesCount: '4/12 classes',
      completedPercent: 46,
      mentorName: 'Tomas Luis',
      mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c2',
      title: 'Leadership & Ethics',
      level: 'Beginner',
      classesCount: '8/14 classes',
      completedPercent: 72,
      mentorName: 'Nelly Roven',
      mentorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c3',
      title: 'IT & Technical English',
      level: 'Advanced',
      classesCount: '6/10 classes',
      completedPercent: 56,
      mentorName: 'Stefan Colman',
      mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c4',
      title: 'Cryptographic Security',
      level: 'Intermediate',
      classesCount: '9/15 classes',
      completedPercent: 60,
      mentorName: 'Dr. Aris Thorne',
      mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  ]);

  // Load real enrollments if available
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get('/courses');
        if (data.courses && data.courses.length > 0) {
          const mapped = data.courses.slice(0, 5).map((c: any, idx: number) => ({
            id: c._id,
            title: c.title,
            level: c.level || 'Intermediate',
            classesCount: `${(idx + 3) * 2}/12 classes`,
            completedPercent: Math.min(95, 35 + idx * 18),
            mentorName: typeof c.instructorId === 'object' && c.instructorId?.name ? c.instructorId.name : 'Faculty Mentor',
            mentorAvatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 1000}?w=100&auto=format&fit=crop&q=80`,
          }));
          if (mapped.length > 0) {
            setCourseList(mapped);
          }
        }
      } catch {
        // Fallback to sample data
      }
    };
    fetchEnrollments();
  }, []);

  // Fetch all students directory
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/auth/students');
        if (data.students) {
          setStudents(data.students);
        }
      } catch {
        // Fallback if network or auth error
      }
    };
    fetchStudents();
  }, []);

  // Set active student to logged in user initially
  useEffect(() => {
    if (user) {
      setActiveProfile({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade || 'Grade 10',
        hobbies: user.hobbies || ['Computer Science', 'AI & Robotics', 'UI/UX Design'],
        bio: user.bio || 'Aspiring technologist committed to rigorous lifelong learning.',
        avatar: user.avatar,
      });
      setEditName(user.name);
      setEditGrade(user.grade || 'Grade 10');
      setEditHobbies(user.hobbies || ['Computer Science', 'AI & Robotics', 'UI/UX Design']);
      setEditBio(user.bio || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setActiveProfile((prev) =>
        prev
          ? {
              ...prev,
              name: data.user.name,
              grade: data.user.grade,
              hobbies: data.user.hobbies,
              bio: data.user.bio,
            }
          : null
      );

      setEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userText = aiPrompt.trim();
    setAiMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setAiLoading(true);

    setTimeout(() => {
      let reply = "I'm analyzing your learning objectives. You're currently on track with high completion across your modules. Keep focusing on hands-on practical exercises!";
      const lower = userText.toLowerCase();
      if (lower.includes('exam') || lower.includes('quiz') || lower.includes('test')) {
        reply = "For your upcoming proctored quizzes, remember that Veyro uses strict anti-cheat timers and tab-switching monitoring. Review the key summary notes in your modules!";
      } else if (lower.includes('grade') || lower.includes('class')) {
        reply = `You are currently enrolled under ${activeProfile?.grade || 'Grade 10'}. Your assigned curricula are tailored specifically to your learning milestone goals.`;
      } else if (lower.includes('certificate')) {
        reply = "Once you complete 90% of watched video lessons and pass all module quizzes, your SHA-256 verifiable certificate will automatically mint!";
      }
      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setAiLoading(false);
    }, 650);
  };

  const nextCourse = () => {
    setCarouselIndex((prev) => (prev + 1) % courseList.length);
  };

  const prevCourse = () => {
    setCarouselIndex((prev) => (prev - 1 + courseList.length) % courseList.length);
  };

  // Filter students directory
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.grade && s.grade.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#E9F0F8] p-3 sm:p-6 lg:p-8 font-sans transition-colors">
      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* ── TOP HEADER / NAVIGATION PILL (Exact Screenshot 3 replica) ── */}
        <header className="bg-white/90 backdrop-blur-md rounded-full px-5 py-3 border border-white/60 shadow-sm flex items-center justify-between">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FF5A36] flex items-center justify-center text-white shadow-sm shadow-[#FF5A36]/30">
              <span className="font-bold text-sm tracking-tighter">✦</span>
            </div>
            <span className="font-semibold text-base text-[#1E2022] tracking-tight">
              EasyLearn <span className="text-xs text-[#FF5A36] font-normal">· Veyro</span>
            </span>
          </div>

          {/* Center Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-full border border-[#E5E9EE]">
            <Link
              to="/courses"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#64748B] hover:text-[#1E2022] transition-colors"
            >
              All courses
            </Link>
            <button
              type="button"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1E2022] text-white flex items-center gap-1.5 shadow-xs"
            >
              <LayoutGrid size={13} />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById('study-process-section');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#64748B] hover:text-[#1E2022] transition-colors cursor-pointer"
            >
              Statistic
            </button>
            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById('ai-assistant-section');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#64748B] hover:text-[#1E2022] transition-colors cursor-pointer"
            >
              AI-assistant
            </button>
            <button
              type="button"
              onClick={() => toast('Live 24/7 Academic Support is Active', { icon: '🎧' })}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#64748B] hover:text-[#1E2022] transition-colors cursor-pointer"
            >
              Support
            </button>
          </nav>

          {/* Right Action Icons & Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setDirectoryOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] text-[#1E2022] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5E9EE] cursor-pointer"
              title="Browse all student profiles"
            >
              <Users size={13} className="text-[#FF5A36]" />
              <span className="hidden sm:inline">Students Directory</span>
            </button>

            <button
              type="button"
              onClick={() => toast('Support audio channel connected', { icon: '🎧' })}
              className="w-9 h-9 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Headphones size={15} />
            </button>

            <button
              type="button"
              onClick={() => toast('No unread critical alerts')}
              className="w-9 h-9 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] text-[#64748B] flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5A36]" />
            </button>

            {/* Profile Avatar Pill */}
            <div
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] cursor-pointer transition-colors border border-[#E5E9EE]"
              title="Click to edit profile"
            >
              <img
                src={
                  activeProfile?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                }
                alt="Student Avatar"
                className="w-7 h-7 rounded-full object-cover border border-[#FF5A36]"
              />
              <span className="text-xs font-semibold text-[#1E2022] max-w-[90px] truncate hidden sm:inline">
                {activeProfile?.name?.split(' ')[0] || 'Profile'}
              </span>
            </div>
          </div>
        </header>

        {/* ── MAIN DASHBOARD GRID (Screenshot 3 exact two-column layout) ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ═══════════ LEFT COLUMN: STATISTIC CARD (4 cols on lg) ═══════════ */}
          <section className="lg:col-span-4 bg-white rounded-[32px] p-6 sm:p-7 shadow-xs border border-white/60 flex flex-col justify-between space-y-6">
            {/* Header: Statistic */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1E2022] tracking-tight">Statistic</h2>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F6F9] hover:bg-[#E5E9EE] text-[#64748B] transition-colors cursor-pointer"
                >
                  Edit profile
                </button>
              </div>

              {/* Avatar with orange ring & level badge */}
              <div className="flex flex-col items-center text-center mt-2">
                <div className="relative p-1.5 rounded-full">
                  {/* Decorative curved SVG ring around avatar */}
                  <svg className="absolute inset-0 w-full h-full -rotate-45" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#FFE8E2"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#FF5A36"
                      strokeWidth="4"
                      strokeDasharray="280"
                      strokeDashoffset="75"
                      strokeLinecap="round"
                    />
                  </svg>
                  <img
                    src={
                      activeProfile?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={activeProfile?.name}
                    className="w-24 h-24 rounded-full object-cover shadow-sm relative z-10"
                  />
                </div>

                {/* Grade / Beginner badge below avatar */}
                <div className="mt-2.5">
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FF5A36] text-white shadow-xs">
                    {activeProfile?.grade || 'Beginner'}
                  </span>
                </div>

                {/* Welcome greeting */}
                <h1 className="mt-4 text-2xl font-bold text-[#1E2022] tracking-tight flex items-center justify-center gap-1.5">
                  <span>Welcome, {activeProfile?.name?.split(' ')[0] || 'Tim'}</span>
                  <span>👋</span>
                </h1>
                <p className="text-xs text-[#64748B] mt-1 max-w-xs line-clamp-2">
                  {activeProfile?.bio || 'Continuous learning roadmap with verified cryptographic proofs.'}
                </p>

                {/* Hobbies / Interests chips */}
                {activeProfile?.hobbies && activeProfile.hobbies.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3 max-w-xs">
                    {activeProfile.hobbies.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F4F6F9] text-[#64748B] border border-[#E5E9EE]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Metric: 78% Total month activity */}
              <div className="mt-7 pt-5 border-t border-[#F1F3F6]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#1E2022] tracking-tight">78%</span>
                  <span className="text-xs font-medium text-[#64748B]">Total month activity</span>
                </div>

                {/* Multi-segmented color progress bar */}
                <div className="mt-3 w-full h-2.5 bg-[#F4F6F9] rounded-full overflow-hidden flex gap-1 p-0.5">
                  <div className="h-full bg-[#FF80B5] rounded-full" style={{ width: '42%' }} />
                  <div className="h-full bg-[#FBBF24] rounded-full" style={{ width: '15%' }} />
                  <div className="h-full bg-[#FF5A36] rounded-full" style={{ width: '43%' }} />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] mt-2">
                  <span>42%</span>
                  <span>15%</span>
                  <span>56%</span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Metric Tiles (In progress, Upcoming, Completed) */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {/* Tile 1: In progress */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3 flex flex-col items-center text-center border border-[#EFECE6]">
                <div className="w-8 h-8 rounded-full bg-[#FFEBF0] text-[#FF5A7D] flex items-center justify-center mb-1.5">
                  <Clock size={15} />
                </div>
                <span className="text-xl font-bold text-[#1E2022]">9</span>
                <span className="text-[10px] font-medium text-[#8C827A] mt-0.5">In progress</span>
              </div>

              {/* Tile 2: Upcoming */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3 flex flex-col items-center text-center border border-[#EFECE6]">
                <div className="w-8 h-8 rounded-full bg-[#FFF5D6] text-[#D97706] flex items-center justify-center mb-1.5">
                  <Calendar size={15} />
                </div>
                <span className="text-xl font-bold text-[#1E2022]">4</span>
                <span className="text-[10px] font-medium text-[#8C827A] mt-0.5">Upcoming</span>
              </div>

              {/* Tile 3: Completed */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3 flex flex-col items-center text-center border border-[#EFECE6]">
                <div className="w-8 h-8 rounded-full bg-[#FFEBE6] text-[#FF5A36] flex items-center justify-center mb-1.5">
                  <CheckCircle2 size={15} />
                </div>
                <span className="text-xl font-bold text-[#1E2022]">15</span>
                <span className="text-[10px] font-medium text-[#8C827A] mt-0.5">Completed</span>
              </div>
            </div>
          </section>

          {/* ═══════════ RIGHT COLUMN: YOUR COURSES + PROCESS + AI (8 cols) ═══════════ */}
          <div className="lg:col-span-8 space-y-5">
            {/* ── TOP: YOUR COURSES (Large Vibrant Coral Card bg-[#FF5A36]) ── */}
            <section className="bg-[#FF5A36] rounded-[32px] p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
              {/* Subtle background curved aesthetics */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <h2 className="text-2xl font-bold tracking-tight text-white">Your courses</h2>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xs rounded-full p-1">
                    <button
                      type="button"
                      onClick={prevCourse}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={nextCourse}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <Link
                    to="/courses"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-[#FF5A36] hover:bg-white/90 transition-colors shadow-2xs"
                  >
                    View all
                  </Link>
                </div>
              </div>

              {/* 3 White Enrolled Cards in Carousel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
                {courseList.slice(carouselIndex, carouselIndex + 3).concat(
                  courseList.slice(0, Math.max(0, 3 - (courseList.length - carouselIndex)))
                ).slice(0, 3).map((course, idx) => (
                  <div
                    key={`${course.id}-${idx}`}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="bg-white rounded-2xl p-4 text-[#1E2022] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[#1E2022] line-clamp-1 mb-2">
                        {course.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F4F6F9] text-[#64748B]">
                          {course.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FFF0ED] text-[#FF5A36]">
                          {course.classesCount}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 mb-3">
                        <div className="text-[11px] font-medium text-[#64748B]">
                          {course.completedPercent}% completed
                        </div>
                        <div className="w-full h-1.5 bg-[#F4F6F9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF5A36] rounded-full"
                            style={{ width: `${course.completedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mentor info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#F1F3F6]">
                      <img
                        src={course.mentorAvatar}
                        alt={course.mentorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="text-[10px] text-[#64748B] leading-tight truncate">
                        <span className="text-[#94A3B8]">Mentor:</span>{' '}
                        <span className="font-semibold text-[#1E2022]">{course.mentorName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── BOTTOM ROW: STUDY PROCESS & AI ASSISTANT ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Study Process Card (7 cols) */}
              <section id="study-process-section" className="md:col-span-6 bg-white rounded-[32px] p-6 shadow-xs border border-white/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-[#1E2022]">Study process</h3>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F6F9] text-[#64748B] flex items-center gap-1 border border-[#E5E9EE]">
                      <span>Week</span>
                      <span>⌵</span>
                    </div>
                  </div>

                  {/* 4 Vertical Metric Columns matching Screenshot 3 */}
                  <div className="grid grid-cols-4 gap-3 items-end h-44 pt-4 pb-2 px-1">
                    {/* Column 1: Engage 66% */}
                    <div className="flex flex-col items-center justify-end h-full group">
                      <span className="text-[10px] font-bold text-white bg-[#FF5A36] px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                        66%
                      </span>
                      <div className="w-full bg-[#F4F6F9] group-hover:bg-[#EAEFF4] rounded-2xl h-[66%] transition-all" />
                      <span className="text-xs font-semibold text-[#64748B] mt-2">Engage</span>
                    </div>

                    {/* Column 2: Grow 40% */}
                    <div className="flex flex-col items-center justify-end h-full group">
                      <span className="text-[10px] font-bold text-white bg-[#FF5A36] px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                        40%
                      </span>
                      <div className="w-full bg-[#F4F6F9] group-hover:bg-[#EAEFF4] rounded-2xl h-[40%] transition-all" />
                      <span className="text-xs font-semibold text-[#64748B] mt-2">Grow</span>
                    </div>

                    {/* Column 3: Skills 87% (HIGHLIGHTED CORAL COLUMN) */}
                    <div className="flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-white bg-[#1E2022] px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                        87%
                      </span>
                      <div className="w-full bg-[#FF5A36] rounded-2xl h-[87%] shadow-sm shadow-[#FF5A36]/30 transition-all" />
                      <span className="text-xs font-bold text-[#1E2022] mt-2">Skills</span>
                    </div>

                    {/* Column 4: Rate 56% */}
                    <div className="flex flex-col items-center justify-end h-full group">
                      <span className="text-[10px] font-bold text-white bg-[#FF5A36] px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                        56%
                      </span>
                      <div className="w-full bg-[#F4F6F9] group-hover:bg-[#EAEFF4] rounded-2xl h-[56%] transition-all" />
                      <span className="text-xs font-semibold text-[#64748B] mt-2">Rate</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Assistant Card (6 cols, Glassmorphic Pink Aesthetic) */}
              <section
                id="ai-assistant-section"
                className="md:col-span-6 bg-gradient-to-br from-[#FFE3E8] via-[#FFD3DC] to-[#FFC2C2] rounded-[32px] p-6 shadow-xs border border-white/60 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Glowing fluid aesthetic */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <h3 className="text-base font-bold text-[#1E2022] flex items-center gap-1.5">
                      <Sparkles size={16} className="text-[#FF5A36]" />
                      <span>AI assistant</span>
                    </h3>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAiMessages([
                            {
                              sender: 'ai',
                              text: "Model refreshed. What academic topic would you like to explore today?",
                            },
                          ]);
                          toast.success('AI Context reset');
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white text-[#1E2022] flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        <span>Model</span>
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#1E2022] flex items-center justify-center shadow-2xs"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Chat Message Bubble preview */}
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 my-3 text-xs relative z-10">
                    {aiMessages.slice(-2).map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-2xl text-xs ${
                          msg.sender === 'user'
                            ? 'bg-[#1E2022] text-white ml-auto max-w-[85%]'
                            : 'bg-white/90 backdrop-blur-md text-[#1E2022] max-w-[95%] shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="bg-white/80 p-2 rounded-2xl text-[11px] text-[#64748B] italic animate-pulse w-fit">
                        Thinking...
                      </div>
                    )}
                  </div>
                </div>

                {/* Prompt Input with Coral Send Button */}
                <form
                  onSubmit={handleAiSend}
                  className="bg-white/95 backdrop-blur-md rounded-full p-1.5 pl-4 flex items-center justify-between shadow-xs border border-white/80 relative z-10"
                >
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask something..."
                    className="bg-transparent text-xs text-[#1E2022] placeholder:text-[#94A3B8] outline-none flex-1 pr-2"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-8 h-8 rounded-full bg-[#FF5A36] hover:bg-[#E04B28] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL: ALL STUDENTS DIRECTORY ("It needs to list all the student profiles") ── */}
      {directoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171717]/50 backdrop-blur-xs"
            onClick={() => setDirectoryOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl z-10 font-sans max-h-[85vh] flex flex-col border border-[#E7E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E2DA]">
              <div>
                <h3 className="text-lg font-bold text-[#1E2022]">Student Profiles Directory</h3>
                <p className="text-xs text-[#64748B]">
                  Browse registered students, verified grades, and academic interests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDirectoryOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] flex items-center justify-center text-[#64748B] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="py-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F4F6F9] rounded-xl border border-[#E5E9EE]">
                <Search size={14} className="text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Search students by name, grade, or email..."
                  className="bg-transparent text-xs text-[#1E2022] outline-none flex-1"
                />
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">
                  No student profiles matching your search.
                </div>
              ) : (
                filteredStudents.map((st) => (
                  <div
                    key={st._id}
                    onClick={() => {
                      setActiveProfile(st);
                      setDirectoryOpen(false);
                      toast.success(`Viewing profile: ${st.name}`);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeProfile?._id === st._id
                        ? 'bg-[#FFF2EE] border-[#FF5A36]'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E7E2DA]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          st.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E7E2DA]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1E2022]">{st.name}</h4>
                        <p className="text-[11px] text-[#64748B]">{st.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F4F6F9] text-[#1E2022]">
                            {st.grade || 'Grade 10'}
                          </span>
                          {st.hobbies && st.hobbies.length > 0 && (
                            <span className="text-[10px] text-[#8C827A]">
                              · {st.hobbies.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#E7E2DA] hover:border-[#FF5A36] hover:text-[#FF5A36] text-[#1E2022] transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT STUDENT PROFILE ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171717]/50 backdrop-blur-xs"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 font-sans border border-[#E7E2DA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-base font-bold text-[#1E2022]">Edit Student Profile</h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F4F6F9] hover:bg-[#E5E9EE] flex items-center justify-center text-[#64748B] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1E2022] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#1E2022]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1E2022] mb-1">Grade / Class</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#1E2022]"
                >
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
                <label className="block font-semibold text-[#1E2022] mb-1">
                  Academic Motto or Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-xs rounded-xl border border-[#E7E2DA] p-2.5 outline-none focus:border-[#1E2022] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F4F6F9] hover:bg-[#E5E9EE] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF5A36] hover:bg-[#E04B28] text-white shadow-2xs disabled:opacity-50"
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

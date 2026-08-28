import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Clock, CheckCircle, PlusCircle, Star, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  </div>
);

// ── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(({ data }) => setEnrollments(data.enrollments)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = enrollments.filter((e) => e.status === 'active').length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Good day, <span className="text-brand-400">{user.name.split(' ')[0]}</span> 👋</h1>
        <p className="text-slate-400 mt-1">Track your learning progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Enrolled" value={enrollments.length} color="bg-brand-600" />
        <StatCard icon={TrendingUp} label="In Progress" value={active} color="bg-purple-600" />
        <StatCard icon={CheckCircle} label="Completed" value={completed} color="bg-emerald-600" />
        <StatCard icon={Star} label="Certificates" value={completed} color="bg-amber-600" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">My Courses</h2>
        <Link to="/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">Browse more <ArrowRight size={14} /></Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-40 animate-pulse" />)}</div>
      ) : enrollments.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary">Explore Courses</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((e) => {
            const course = e.courseId;
            if (!course) return null;
            return (
              <Link key={e._id} to={`/courses/${course._id}`} className="card p-5 hover:border-brand-600/40 transition-all group">
                <div className="w-full h-32 rounded-xl bg-brand-gradient/20 mb-4 flex items-center justify-center overflow-hidden">
                  {course.thumbnail
                    ? <img src={`/static/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                    : <BookOpen size={32} className="text-brand-400" />}
                </div>
                <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2">{course.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{course.instructorId?.name}</p>
                <span className={`mt-3 inline-block text-xs px-2.5 py-1 rounded-full font-medium
                  ${e.status === 'completed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-brand-900/50 text-brand-400'}`}>
                  {e.status === 'completed' ? '✓ Completed' : 'In Progress'}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Instructor Dashboard ─────────────────────────────────────────────────────
function InstructorDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.courses)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === 'published').length;
  const pending = courses.filter((c) => c.status === 'pending').length;
  const drafts = courses.filter((c) => c.status === 'draft').length;

  const statusBadge = (status) => ({
    draft: 'badge-draft', pending: 'badge-pending',
    published: 'badge-published', rejected: 'badge-rejected',
  }[status] || 'badge-draft');

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Instructor Hub</h1>
          <p className="text-slate-400 mt-1">Manage your courses</p>
        </div>
        <Link to="/instructor/courses/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} /> New Course
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Total" value={courses.length} color="bg-brand-600" />
        <StatCard icon={CheckCircle} label="Published" value={published} color="bg-emerald-600" />
        <StatCard icon={Clock} label="Pending" value={pending} color="bg-amber-600" />
        <StatCard icon={TrendingUp} label="Drafts" value={drafts} color="bg-slate-600" />
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">Your Courses</h2>
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <PlusCircle size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">You haven't created any courses yet.</p>
          <Link to="/instructor/courses/new" className="btn-primary">Create First Course</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c._id} className="card p-4 flex items-center justify-between hover:border-brand-600/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {c.thumbnail ? <img src={`/static/${c.thumbnail}`} className="w-full h-full object-cover" alt="" /> : <BookOpen size={20} className="text-brand-400" />}
                </div>
                <div>
                  <p className="font-semibold text-white">{c.title}</p>
                  <p className="text-slate-400 text-sm">{c.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={statusBadge(c.status)}>{c.status}</span>
                <Link to={`/instructor/courses/${c._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses?status=pending'),
      api.get('/admin/users'),
    ]).then(([c, u]) => {
      setPendingCourses(c.data.courses.filter((x) => x.status === 'pending'));
      setUsers(u.data.users);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleReview = async (courseId, action) => {
    try {
      await api.patch(`/courses/${courseId}/review`, { action });
      setPendingCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success(`Course ${action}d`);
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Console</h1>
        <p className="text-slate-400 mt-1">Platform management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={users.length} color="bg-brand-600" />
        <StatCard icon={Clock} label="Pending Review" value={pendingCourses.length} color="bg-amber-600" />
        <StatCard icon={CheckCircle} label="Active Students" value={users.filter((u) => u.role === 'student' && u.isActive).length} color="bg-emerald-600" />
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">Courses Pending Review</h2>
      {loading ? <div className="card h-32 animate-pulse mb-8" /> :
        pendingCourses.length === 0 ? (
          <div className="card p-8 text-center mb-8">
            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-400">No courses pending review</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {pendingCourses.map((c) => (
              <div key={c._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{c.title}</p>
                  <p className="text-slate-400 text-sm">by {c.instructorId?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReview(c._id, 'approve')} className="btn-primary text-xs py-1.5 px-3">Approve</button>
                  <button onClick={() => handleReview(c._id, 'reject')} className="btn-danger text-xs py-1.5 px-3">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

      <h2 className="text-xl font-semibold text-white mb-4">Recent Users</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr className="text-left text-slate-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 10).map((u) => (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3"><span className="badge bg-brand-900/50 text-brand-400 capitalize">{u.role}</span></td>
                <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'student') return <StudentDashboard user={user} />;
  if (user.role === 'instructor') return <InstructorDashboard user={user} />;
  return <AdminDashboard user={user} />;
}

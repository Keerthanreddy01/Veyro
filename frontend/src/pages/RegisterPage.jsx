import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Loader2, GraduationCap, Briefcase } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const roles = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Enroll & learn from courses' },
  { value: 'instructor', label: 'Instructor', icon: Briefcase, desc: 'Create & publish courses' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPwd, setShowPwd] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-hero-gradient">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 mt-1">Join the Veyro community</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input value={form.name} onChange={set('name')} className="input" placeholder="Keerthi Sharma" required autoFocus />
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className="input pr-12" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, label, icon: Icon, desc }) => (
                  <button key={value} type="button" onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${form.role === value
                        ? 'border-brand-500 bg-brand-600/10 text-white'
                        : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20'}`}>
                    <Icon size={22} />
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-xs opacity-70 text-center">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

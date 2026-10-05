import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, GraduationCap, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthArtBanner from '../components/AuthArtBanner';
import toast from 'react-hot-toast';

const roles = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Enroll & earn verified certifications' },
  { value: 'instructor', label: 'Instructor', icon: Briefcase, desc: 'Author video curricula & quizzes' },
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
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Account created! Welcome to Veyro, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF7EE] overflow-hidden selection:bg-[#FFF490] selection:text-[#111111]">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-bl from-[#60C5F1]/20 via-[#FFF490]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#FFF490]/25 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Editorial Card */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-[2.5rem] shadow-xl border border-[#111111]/15 p-4 sm:p-6 lg:p-7 transition-all duration-300 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left: Impressionist Fine-Art Banner */}
          <div className="hidden lg:block lg:col-span-5 h-full">
            <AuthArtBanner caption="Veyro Academic Portal" />
          </div>

          {/* Right: Editorial Form Section */}
          <div className="lg:col-span-7 flex flex-col justify-between p-2 sm:p-6 lg:p-4">
            
            <div>
              {/* Top Navigation Back Link */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors mb-5 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Home</span>
              </Link>

              {/* Eyebrow & Headline */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 bg-[#FFF490] border border-[#111111]/20 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-2">
                  <Sparkles size={12} />
                  <span>Join the Academy</span>
                </div>
                <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#111111] tracking-tight leading-tight uppercase">
                  Create Your Veyro Account.
                </h1>
                <p className="text-[#111111]/55 text-xs mt-1.5 font-body leading-relaxed">
                  Start learning accredited courses with verified progress tracking.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 max-w-md">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    className="w-full bg-[#FAF7EE] hover:bg-[#f5f1e5] focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl py-2.5 px-4 text-sm font-medium border border-[#111111]/15 outline-none transition-all focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
                    placeholder="Keerthan Reddy"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="w-full bg-[#FAF7EE] hover:bg-[#f5f1e5] focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl py-2.5 px-4 text-sm font-medium border border-[#111111]/15 outline-none transition-all focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      className="w-full bg-[#FAF7EE] hover:bg-[#f5f1e5] focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl py-2.5 px-4 pr-12 text-sm font-medium border border-[#111111]/15 outline-none transition-all focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(({ value, label, icon: Icon, desc }) => {
                      const selected = form.role === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, role: value }))}
                          className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                            selected
                              ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                              : 'bg-[#FAF7EE] hover:bg-[#f5f1e5] text-slate-800 border-[#111111]/15'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon size={15} className={selected ? 'text-[#60C5F1]' : 'text-slate-600'} />
                            <span className="font-bold text-xs">{label}</span>
                          </div>
                          <span className={`text-[10px] leading-tight ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 animate-fade-in flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-dark-pill w-full py-3.5 text-xs shadow-md mt-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-slate-300" />
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Bottom Brand Mark & Tagline */}
            <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-syne font-extrabold text-lg tracking-tight text-[#111111] lowercase">
                  veyro<span className="text-[#60C5F1]">.</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Verified Mastery & Accredited Learning.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

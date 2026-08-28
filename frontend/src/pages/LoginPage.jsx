import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthArtBanner from '../components/AuthArtBanner';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#e9ebe4] overflow-hidden">
      {/* Ambient Impressionist Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.3),rgba(101,163,13,0.15),transparent_70%)]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-lime-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Editorial Card */}
      <div className="relative w-full max-w-4xl bg-[#fcfbf9] text-slate-900 rounded-[2.5rem] shadow-2xl border border-black/5 p-3 sm:p-5 lg:p-6 transition-all duration-300 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left: Impressionist Fine-Art Banner */}
          <div className="hidden lg:block lg:col-span-5 h-full">
            <AuthArtBanner caption="Veyro Knowledge Canvas" />
          </div>

          {/* Right: Editorial Form Section */}
          <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-8 lg:p-6">
            
            {/* Top Navigation */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </Link>

              {/* Eyebrow & Headline */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Login to</p>
                <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
                  Where Knowledge <br className="hidden sm:inline" />
                  <span className="italic font-normal">Comes Alive</span>
                </h1>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="sr-only">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f1f1ed] hover:bg-[#eaeae5] focus:bg-white text-slate-800 placeholder:text-slate-400 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:shadow-sm"
                    placeholder="Enter email"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="sr-only">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f1f1ed] hover:bg-[#eaeae5] focus:bg-white text-slate-800 placeholder:text-slate-400 rounded-2xl py-3.5 px-4 pr-12 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:shadow-sm"
                      placeholder="Enter password"
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

                {/* Error Banner */}
                {error && (
                  <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200/80 rounded-2xl px-4 py-3 animate-fade-in flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#18181b] hover:bg-black text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-slate-300" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>

                {/* Sign Up Switch */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Don’t have an account?{' '}
                    <Link to="/register" className="text-slate-900 font-semibold hover:underline underline-offset-4">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Bottom Brand Mark & Tagline */}
            <div className="pt-8 border-t border-slate-200/60 mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Sparkles size={13} />
                </div>
                <span className="font-bold text-slate-900 tracking-tight text-base">veyro</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Shared Knowledge for a Curious Mind.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

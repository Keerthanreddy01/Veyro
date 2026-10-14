import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden selection:bg-[#E5D8C8] selection:text-[#171717] font-sans">
      {/* Background with Saturated Pointillist Grain & Soft Blur */}
      <div className="absolute inset-0 -z-10 overflow-hidden select-none">
        <img
          src="/login-bg-wide.png"
          alt="Atmospheric Landscape Background"
          className="w-full h-full object-cover scale-[1.05] filter blur-[6px] brightness-[0.98] contrast-[1.08] saturate-[1.12]"
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Dual-Layer Film Grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '160px 160px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise2)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '120px 120px',
          }}
        />
      </div>

      {/* Centered Split Card */}
      <div className="w-full max-w-[940px] h-auto lg:h-[min(calc(100vh-64px),580px)] bg-[#FAF8F4] rounded-[32px] border border-white/60 shadow-elevated p-4 sm:p-5 flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch overflow-hidden relative z-10 animate-slide-up">
        
        {/* Left Artwork Panel */}
        <div
          id="login-image-container"
          aria-label="Artwork display area"
          className="hidden lg:flex lg:w-[48%] flex-shrink-0 h-full rounded-[24px] overflow-hidden bg-[#ECE8E1] shadow-2xs"
        >
          <img
            src="/login-card-art.png"
            alt="Where Knowledge Comes Alive"
            className="w-full h-full object-cover rounded-[24px]"
          />
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-[52%] flex flex-col justify-between py-2 sm:py-3 pr-2 lg:pr-6 font-sans">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736D] hover:text-[#171717] transition-colors mb-5 sm:mb-6 w-fit"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Link>

            <div className="mb-6 sm:mb-7">
              <div className="text-sm font-medium text-[#77736D] mb-1 font-sans">
                Login to
              </div>
              <h1 className="font-serif text-[40px] sm:text-[46px] lg:text-[50px] font-normal leading-[1.03] text-[#171717] tracking-[-0.025em]">
                Where Knowledge<br />
                Comes Alive
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 max-w-[380px]">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#EFECE6] hover:bg-[#EAE6DF] focus:bg-white text-[#171717] placeholder:text-[#A99B8A] rounded-xl px-4 py-3 text-sm border-0 outline-none transition-all focus:ring-2 focus:ring-[#6F8FA8]/30 font-sans"
                  placeholder="Enter email"
                  required
                  autoFocus
                />
              </div>

              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#EFECE6] hover:bg-[#EAE6DF] focus:bg-white text-[#171717] placeholder:text-[#A99B8A] rounded-xl px-4 py-3 pr-10 text-sm border-0 outline-none transition-all focus:ring-2 focus:ring-[#6F8FA8]/30 font-sans"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A99B8A] hover:text-[#171717] transition-colors p-1 cursor-pointer"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="pt-0.5 text-xs text-[#77736D]">
                Don’t have an account?{' '}
                <Link
                  to="/register"
                  className="text-[#171717] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ml-0.5"
                >
                  Sign up
                </Link>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#171717] text-white hover:bg-[#2A2A2A] active:scale-[0.99] text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50 font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-zinc-400" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Lockup */}
          <div className="pt-4 flex items-center gap-3 text-[#171717] select-none font-sans">
            <div className="flex items-center gap-1.5">
              <svg width="26" height="22" viewBox="0 0 32 26" fill="currentColor">
                <path d="M7 2a11 11 0 0 0-4 22h3a11 11 0 0 0 1-22H7z" fill="#171717" />
                <circle cx="21" cy="13" r="10" fill="#171717" />
              </svg>
              <span className="font-sans font-bold text-lg tracking-tight text-[#171717] lowercase">
                veyro
              </span>
            </div>
            <div className="text-[10px] leading-tight text-[#77736D] pl-1 font-sans">
              Shared Knowledge for an<br />Accredited Technical Future.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  GraduationCap,
  Compass,
  Menu,
  X,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = user
    ? user.role === 'instructor'
      ? [
          { to: '/dashboard', label: 'Instructor Studio', icon: Layers },
          { to: '/courses', label: 'Explore Catalog', icon: Compass },
          { to: '/instructor/courses/new', label: 'Create Curriculum', icon: PlusCircle },
        ]
      : [
          { to: '/dashboard', label: 'Learning Roadmap', icon: GraduationCap },
          { to: '/courses', label: 'Browse Courses', icon: Compass },
        ]
    : [
        { to: '/courses', label: 'Explore Catalog', icon: Compass },
        { to: '/verify/VY-DEMO-2026', label: 'Verify Credential', icon: ShieldCheck },
      ];

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-[#111111] bg-[#FAF7EE]/95 backdrop-blur-md text-[#111111] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-1.5 group select-none" aria-label="Veyro home">
            <span className="font-syne font-extrabold text-2xl sm:text-[1.7rem] tracking-tight text-[#111111] lowercase transition-transform group-hover:scale-[1.02]">
              veyro<span className="text-[#60C5F1]">.</span>
            </span>
          </Link>

          {/* Center Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-[#111111]/15 bg-white/80 p-1.5 shadow-2xs backdrop-blur-sm">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to !== '/courses' ? true : location.pathname === to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-180 font-body ${
                    active
                      ? 'bg-[#111111] text-white shadow-brutal-sm'
                      : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#111111]/8'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#60C5F1]' : 'text-slate-500'} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: User Profile Chip / Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 rounded-full border border-[#111111]/15 bg-white px-2.5 py-1 shadow-2xs hover:border-[#111111]/30 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-extrabold font-syne shadow-inner">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight pr-1">
                    <p className="font-bold text-[#111111] max-w-[110px] truncate font-body">{user.name}</p>
                    <p className="text-[9px] font-bold text-[#111111]/50 uppercase tracking-widest font-body">{user.role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full hover:bg-rose-50 transition-colors"
                  title="Sign out of account"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-black hover:bg-black/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-sky-pill py-2 px-4.5 text-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu right side */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-800 hover:bg-white/80 border border-black/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#111111]/10 bg-[#FAF7EE] px-4 py-4 space-y-2 animate-slide-up shadow-lg">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-800 hover:bg-white transition-colors"
            >
              <Icon size={16} className="text-[#60C5F1]" />
              <span>{label}</span>
            </Link>
          ))}

          {user ? (
            <div className="pt-2 border-t border-black/10 space-y-2">
              <div className="px-4 py-1 text-xs text-slate-500 font-semibold">
                Signed in as <span className="text-slate-900 font-bold">{user.name}</span> ({user.role})
              </div>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-black/10">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-full bg-white border border-[#111111]/20 text-slate-900 shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-full bg-[#111111] text-white shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}


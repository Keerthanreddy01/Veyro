import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, GraduationCap, Compass, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if ((location.pathname === '/dashboard' || location.pathname === '/courses') && (user?.role === 'instructor' || user?.role === 'student')) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navLinks = user ? [
    { to: '/dashboard', label: 'Learning Plan', icon: GraduationCap },
    { to: '/courses', label: 'Browse Courses', icon: Compass },
  ] : [
    { to: '/courses', label: 'Explore Courses', icon: Compass },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8f8f6] text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Veyro home">
            <span className="font-serif text-2xl font-semibold italic tracking-tight text-slate-900">Veyro</span>
          </Link>

          {/* Center Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-amber-500' : 'text-slate-500'} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Auth Profile / Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-2 pr-3.5 py-1 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-xs font-extrabold text-white shadow-inner">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-black shadow-xs transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-slate-100 text-slate-800">
                Log in
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-slate-900 text-white">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

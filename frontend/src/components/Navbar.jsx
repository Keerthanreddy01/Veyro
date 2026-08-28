import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
  ] : [
    { to: '/courses', label: 'Browse Courses', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-brand-gradient shadow-glow group-hover:shadow-glow-lg transition-all">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Veyro</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${location.pathname.startsWith(to)
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white leading-none">{user.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-400 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-dark-800 px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <Icon size={15} /> {label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

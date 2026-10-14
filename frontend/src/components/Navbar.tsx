import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  Layers,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
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
          { to: '/courses', label: 'Browse Courses', icon: Compass },
          { to: '/instructor/courses/new', label: 'Create Course', icon: PlusCircle },
        ]
      : [
          { to: '/dashboard', label: 'Learning Roadmap', icon: GraduationCap },
          { to: '/courses', label: 'Browse Courses', icon: Compass },
        ]
    : [
        { to: '/courses', label: 'Browse Courses', icon: Compass },
      ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Veyro Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group select-none" aria-label="Veyro home">
              <span className="font-sans font-bold text-xl tracking-tight text-[#171717] lowercase">
                veyro<span className="text-[#6F8FA8]">.</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to !== '/courses' ? true : location.pathname === to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors font-sans ${
                      active
                        ? 'bg-[#F6F2EC] text-[#171717] font-semibold'
                        : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Notifications, Profile, Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />

                <div className="h-4 w-px bg-[#E7E2DA] mx-1" />

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF8F4] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-semibold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left font-sans">
                    <p className="text-xs font-semibold text-[#171717] leading-none max-w-[120px] truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[#77736D] capitalize leading-tight mt-0.5">
                      {user.role}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#77736D] hover:text-[#BE123C] rounded-lg hover:bg-[#FFF1F0] transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-sans">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#202020] hover:text-[#171717] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-[#171717] hover:bg-[#2A2A2A] text-white rounded-lg shadow-2xs transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-[#202020] hover:bg-[#FAF8F4] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E2DA] bg-white px-4 py-4 space-y-3 font-sans animate-slide-up">
          <div className="space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active ? 'bg-[#F6F2EC] text-[#171717]' : 'text-[#77736D] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E7E2DA]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-semibold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">{user.name}</p>
                    <p className="text-xs text-[#77736D] capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#BE123C] hover:bg-[#FFF1F0] rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 text-center text-sm font-medium border border-[#E7E2DA] rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 text-center text-sm font-medium bg-[#171717] text-white rounded-lg"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

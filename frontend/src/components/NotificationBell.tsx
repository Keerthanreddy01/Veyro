import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Award,
  RefreshCw,
  Layers,
  Info,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/notifications?limit=20');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll periodically every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Could not mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Could not mark all as read');
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read) {
      handleMarkAsRead(n._id);
    }
    setIsOpen(false);

    // Entity-based navigation
    if (n.entityType === 'Course' && n.entityId) {
      navigate(`/courses/${n.entityId}`);
    } else if (n.entityType === 'Certificate' && n.entityId) {
      navigate(`/verify/${n.entityId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COURSE_APPROVED':
        return <Sparkles size={16} className="text-emerald-600" />;
      case 'COURSE_REJECTED':
        return <AlertCircle size={16} className="text-rose-600" />;
      case 'COURSE_SUBMITTED':
        return <Layers size={16} className="text-amber-600" />;
      case 'COURSE_ENROLLED':
        return <GraduationCap size={16} className="text-sky-600" />;
      case 'COURSE_COMPLETED':
      case 'CERTIFICATE_ISSUED':
        return <Award size={16} className="text-purple-600" />;
      case 'COURSE_REVISION_AVAILABLE':
        return <RefreshCw size={16} className="text-indigo-600" />;
      default:
        return <Info size={16} className="text-slate-600" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-full border border-[#111111]/15 bg-white text-[#111111] hover:bg-[#FAF7EE] hover:border-[#111111]/30 transition-all shadow-2xs"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={16} className="text-[#111111]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[1.125rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border-2 border-[#111111] bg-white shadow-[6px_6px_0px_#111111] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#111111] bg-[#FAF7EE] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-syne text-sm font-extrabold text-[#111111]">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#60C5F1] px-2 py-0.5 text-[10px] font-extrabold text-[#111111] border border-[#111111]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-black hover:underline"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#111111]/10">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400">
                <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#60C5F1]" />
                Checking for updates...
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-xs font-bold text-rose-600 mb-2">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="text-xs font-extrabold text-[#111111] underline hover:text-slate-600"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF7EE] border border-[#111111]/15">
                  <Bell size={18} className="text-slate-400" />
                </div>
                <p className="font-syne text-xs font-bold text-[#111111]">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No notifications at this time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    n.read ? 'bg-white hover:bg-slate-50/80' : 'bg-[#FAF7EE]/60 hover:bg-[#FAF7EE]'
                  }`}
                >
                  {/* Icon badge */}
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#111111]/15 bg-white shadow-2xs">
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs truncate ${n.read ? 'font-bold text-[#111111]/80' : 'font-extrabold text-[#111111]'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#60C5F1]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-body">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  {/* Mark as read button */}
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:text-black hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#111111]/10 bg-[#FAF7EE]/40 px-4 py-2 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Veyro Real-time Dispatch
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

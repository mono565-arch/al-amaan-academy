import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLiveCollection } from '../hooks/useLiveCollection';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { cn } from '../lib/utils';
import type { AppNotification } from '../types';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/settings', label: 'Website Settings' },
  { to: '/admin/founder-teachers', label: 'Founder & Teachers' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/achievements', label: 'Achievements' },
  { to: '/admin/gallery', label: 'Gallery & Videos' },
  { to: '/admin/admissions', label: 'Admission Applications' },
  { to: '/admin/feedback', label: 'Feedback & Complaints' },
  { to: '/admin/notifications', label: 'Notifications', badge: true },
  { to: '/admin/change-password', label: 'Change Password' },
] as const;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const { items: notifications } = useLiveCollection<AppNotification>('notifications', { orderField: 'createdAt', direction: 'desc', limit: 100 });
  const unread = notifications.filter((n) => !n.read).length;

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-navy-dark text-slate-100 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-6 lg:py-6">
          <div>
            <p className="font-bold text-white">{settings.academyName}</p>
            <p className="text-xs text-slate-400">Admin panel</p>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary px-3 py-1.5 text-xs lg:mt-4 lg:w-full">
            Log out
          </button>
        </div>

        <nav aria-label="Admin" className="overflow-x-auto px-2 pb-3 lg:overflow-visible lg:px-3">
          <ul className="flex gap-1 whitespace-nowrap lg:flex-col">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm transition',
                      isActive ? 'bg-white/15 font-semibold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <span>{link.label}</span>
                  {'badge' in link && link.badge && unread > 0 && (
                    <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy" aria-label={`${unread} unread`}>
                      {unread}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <p className="hidden px-6 pb-6 pt-4 text-xs text-slate-400 lg:block">Signed in as {user?.email}</p>
      </aside>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
}

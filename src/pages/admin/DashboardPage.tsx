import { Link } from 'react-router-dom';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { PageTitle, EmptyState, LoadingBlock } from '../../components/common';
import { formatDateTime } from '../../lib/utils';
import type { Achievement, AcademyEvent, AppNotification, Admission, FeedbackItem, Person } from '../../types';

function StatCard({ label, value, to }: { label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="card block transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-navy">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const admissions = useLiveCollection<Admission>('admissions', { orderField: 'createdAt', direction: 'desc' });
  const feedback = useLiveCollection<FeedbackItem>('feedback', { orderField: 'createdAt', direction: 'desc' });
  const events = useLiveCollection<AcademyEvent>('events');
  const achievements = useLiveCollection<Achievement>('achievements');
  const team = useLiveCollection<Person>('teachers');
  const notifications = useLiveCollection<AppNotification>('notifications', { orderField: 'createdAt', direction: 'desc', limit: 8 });

  const loading = admissions.loading || feedback.loading || events.loading;

  const stats = [
    { label: 'Total admission applications', value: admissions.items.length, to: '/admin/admissions' },
    { label: 'New applications', value: admissions.items.filter((a) => a.status === 'New').length, to: '/admin/admissions' },
    { label: 'Unread feedback & complaints', value: feedback.items.filter((f) => !f.read).length, to: '/admin/feedback' },
    { label: 'Published events', value: events.items.filter((e) => e.published).length, to: '/admin/events' },
    { label: 'Achievements', value: achievements.items.length, to: '/admin/achievements' },
    { label: 'Teachers & team members', value: team.items.length, to: '/admin/founder-teachers' },
  ];

  return (
    <div className="space-y-8">
      <PageTitle title="Dashboard" text="Live counts from your Firestore data." />

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Recent activity</h2>
          <Link to="/admin/notifications" className="text-sm font-medium text-navy hover:underline">All notifications</Link>
        </div>
        {notifications.loading ? (
          <LoadingBlock />
        ) : notifications.items.length === 0 ? (
          <EmptyState title="No activity yet" text="New applications and feedback will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.items.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
                <span className="text-xs text-slate-500">{formatDateTime(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

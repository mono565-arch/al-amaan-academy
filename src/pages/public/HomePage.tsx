import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { splitEvents } from '../../lib/utils';
import { EmptyState, LoadingBlock, SectionHeading } from '../../components/common';
import { AchievementCard, EventCard, GalleryGrid, PersonCard } from '../../components/Cards';
import { VideoBox } from '../../components/MediaView';
import type { AcademyEvent, Achievement, GalleryItem, Person } from '../../types';

export default function HomePage() {
  const { settings } = useSiteSettings();
  const founders = useLiveCollection<Person>('founder', { publishedOnly: true });
  const events = useLiveCollection<AcademyEvent>('events', { publishedOnly: true });
  const achievements = useLiveCollection<Achievement>('achievements', { publishedOnly: true });
  const gallery = useLiveCollection<GalleryItem>('gallery', { publishedOnly: true });

  const upcoming = useMemo(() => splitEvents(events.items).upcoming.slice(0, 3), [events.items]);
  const videoPreview = useMemo(() => gallery.items.find((g) => g.mediaType === 'video'), [gallery.items]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #c9a227 0, transparent 40%)' }} aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">{settings.tagline}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{settings.welcomeMessage}</h1>
          {settings.introduction && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">{settings.introduction.slice(0, 260)}{settings.introduction.length > 260 ? '…' : ''}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/admissions" className="inline-flex items-center rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy shadow hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Apply for admission
            </Link>
            <Link to="/about" className="inline-flex items-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Learn about us
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        {/* Mission & vision */}
        {(settings.mission || settings.vision) && (
          <section aria-labelledby="mv-heading" className="grid gap-6 md:grid-cols-2">
            <h2 id="mv-heading" className="sr-only">Mission and vision</h2>
            {settings.mission && (
              <article className="card border-t-4 border-t-navy">
                <h3 className="text-lg font-semibold text-navy">Our mission</h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{settings.mission}</p>
              </article>
            )}
            {settings.vision && (
              <article className="card border-t-4 border-t-gold">
                <h3 className="text-lg font-semibold text-navy">Our vision</h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{settings.vision}</p>
              </article>
            )}
          </section>
        )}

        {/* Founder preview */}
        <section aria-labelledby="founder-heading">
          <SectionHeading id="founder-heading" eyebrow="Leadership" title="Meet our founder" />
          {founders.loading ? <LoadingBlock /> : founders.items[0] ? (
            <PersonCard person={founders.items[0]} />
          ) : (
            <EmptyState title="Founder profile coming soon" />
          )}
          <p className="mt-6"><Link to="/about" className="font-semibold text-navy hover:underline">Meet the full team →</Link></p>
        </section>

        {/* Events preview */}
        <section aria-labelledby="events-heading">
          <SectionHeading id="events-heading" eyebrow="What's happening" title="Upcoming events" />
          {events.loading ? <LoadingBlock /> : upcoming.length ? (
            <div className="grid gap-6 md:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState title="No upcoming events right now" text="Check back soon for new announcements." />
          )}
        </section>

        {/* Achievements preview */}
        <section aria-labelledby="ach-heading">
          <SectionHeading id="ach-heading" eyebrow="Pride" title="Recent achievements" />
          {achievements.loading ? <LoadingBlock /> : achievements.items.length ? (
            <div className="grid gap-6 md:grid-cols-3">{achievements.items.slice(0, 3).map((a) => <AchievementCard key={a.id} item={a} />)}</div>
          ) : (
            <EmptyState title="No achievements published yet" />
          )}
        </section>

        {/* Gallery & video preview */}
        <section aria-labelledby="gallery-heading">
          <SectionHeading id="gallery-heading" eyebrow="Gallery" title="Life at Al Amaan" />
          {gallery.loading ? <LoadingBlock /> : gallery.items.length ? (
            <GalleryGrid items={gallery.items.slice(0, 6)} />
          ) : (
            <EmptyState title="No photos published yet" />
          )}
          {videoPreview && (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-navy">Featured video</h3>
                <VideoBox url={videoPreview.url} title={videoPreview.title || 'Featured video'} />
              </div>
            </div>
          )}
        </section>

        {/* Calls to action */}
        <section className="grid gap-6 md:grid-cols-2">
          <article className="card flex flex-col justify-between gap-6 border-l-4 border-l-navy">
            <div>
              <h2 className="text-xl font-bold text-navy">Admissions are open</h2>
              <p className="mt-2 text-slate-600">Submit an application online. Our admissions office will contact the parent or guardian.</p>
            </div>
            <Link to="/admissions" className="btn-primary self-start">Start an application</Link>
          </article>
          <article className="card flex flex-col justify-between gap-6 border-l-4 border-l-gold">
            <div>
              <h2 className="text-xl font-bold text-navy">Your voice matters</h2>
              <p className="mt-2 text-slate-600">Share feedback or raise a concern. You may submit anonymously.</p>
            </div>
            <Link to="/feedback" className="btn-secondary self-start">Share feedback</Link>
          </article>
        </section>
      </div>
    </div>
  );
}

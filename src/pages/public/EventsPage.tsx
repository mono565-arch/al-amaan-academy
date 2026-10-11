import { useMemo } from 'react';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { splitEvents } from '../../lib/utils';
import { EmptyState, LoadingBlock, SectionHeading } from '../../components/common';
import { AchievementCard, EventCard, GalleryGrid } from '../../components/Cards';
import type { AcademyEvent, Achievement, GalleryItem } from '../../types';

export default function EventsPage() {
  const events = useLiveCollection<AcademyEvent>('events', { publishedOnly: true });
  const achievements = useLiveCollection<Achievement>('achievements', { publishedOnly: true });
  const gallery = useLiveCollection<GalleryItem>('gallery', { publishedOnly: true });
  const { upcoming, past } = useMemo(() => splitEvents(events.items), [events.items]);

  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
      <section aria-labelledby="upcoming-heading">
        <SectionHeading id="upcoming-heading" eyebrow="Calendar" title="Upcoming events" />
        {events.loading ? <LoadingBlock /> : upcoming.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
        ) : (
          <EmptyState title="No upcoming events" text="New events will be listed here as they are announced." />
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading">
          <SectionHeading id="past-heading" eyebrow="Archive" title="Past events" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{past.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      <section aria-labelledby="ach-heading">
        <SectionHeading id="ach-heading" eyebrow="Pride" title="Achievements" />
        {achievements.loading ? <LoadingBlock /> : achievements.items.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{achievements.items.map((a) => <AchievementCard key={a.id} item={a} />)}</div>
        ) : (
          <EmptyState title="No achievements published yet" />
        )}
      </section>

      <section aria-labelledby="gallery-heading">
        <SectionHeading id="gallery-heading" eyebrow="Media" title="Gallery and videos" />
        {gallery.loading ? <LoadingBlock /> : gallery.items.length ? (
          <GalleryGrid items={gallery.items} />
        ) : (
          <EmptyState title="No media published yet" />
        )}
      </section>
    </div>
  );
}

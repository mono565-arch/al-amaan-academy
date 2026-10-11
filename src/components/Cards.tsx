import type { AcademyEvent, Achievement, GalleryItem, Person } from '../types';
import { formatDateTime } from '../lib/utils';
import { ImageBox, VideoBox } from './MediaView';

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="card flex flex-col gap-5 sm:flex-row">
      <ImageBox src={person.photoUrl} alt={`Photo of ${person.name}`} ratioClass="aspect-square h-40 w-40 shrink-0 rounded-xl" />
      <div className="min-w-0 space-y-2">
        <h3 className="text-lg font-semibold text-navy">{person.name}</h3>
        {person.position && <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">{person.position}</p>}
        {person.qualifications && <Labelled label="Qualifications" text={person.qualifications} />}
        {person.experience && <Labelled label="Experience" text={person.experience} />}
        {person.bio && <p className="text-sm leading-relaxed text-slate-600">{person.bio}</p>}
        {person.additionalInfo && <Labelled label="More" text={person.additionalInfo} />}
      </div>
    </article>
  );
}

function Labelled({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-sm text-slate-600">
      <span className="font-semibold text-slate-800">{label}: </span>
      <span className="whitespace-pre-line">{text}</span>
    </p>
  );
}

export function EventCard({ event }: { event: AcademyEvent }) {
  return (
    <article className="card flex flex-col gap-4">
      {event.videoUrl ? (
        <VideoBox url={event.videoUrl} title={event.title} />
      ) : event.imageUrl ? (
        <ImageBox src={event.imageUrl} alt={event.title} />
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-medium text-amber-700">{formatDateTime(event.eventDate)}</p>
        <h3 className="text-lg font-semibold text-navy">{event.title}</h3>
        {event.location && <p className="text-sm text-slate-500">📍 {event.location}</p>}
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{event.description}</p>
      </div>
    </article>
  );
}

export function AchievementCard({ item }: { item: Achievement }) {
  return (
    <article className="card flex flex-col gap-4">
      {item.imageUrl && <ImageBox src={item.imageUrl} alt={item.title} />}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-amber-700">{item.year}</p>
        <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
        {item.description && <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.description}</p>}
      </div>
    </article>
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <figure key={item.id} className="card overflow-hidden p-0">
          {item.mediaType === 'video' ? (
            <div className="p-3">
              <VideoBox url={item.url} title={item.title || 'Academy video'} />
            </div>
          ) : (
            <ImageBox src={item.url} alt={item.title || 'Academy photo'} ratioClass="aspect-[4/3]" />
          )}
          {(item.title || item.caption) && (
            <figcaption className="space-y-1 p-4">
              {item.title && <p className="font-semibold text-navy">{item.title}</p>}
              {item.caption && <p className="text-sm text-slate-600">{item.caption}</p>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

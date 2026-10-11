import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { EmptyState, LoadingBlock, SectionHeading } from '../../components/common';
import { PersonCard } from '../../components/Cards';
import type { Person } from '../../types';

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const founders = useLiveCollection<Person>('founder', { publishedOnly: true });
  const teachers = useLiveCollection<Person>('teachers', { publishedOnly: true });

  const profile = [
    { title: 'Introduction', body: settings.introduction },
    { title: 'Our history', body: settings.history },
    { title: 'Mission', body: settings.mission },
    { title: 'Vision', body: settings.vision },
    { title: 'Educational approach', body: settings.educationalApproach },
  ].filter((s) => s.body.trim());

  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
      <section aria-labelledby="profile-heading">
        <SectionHeading id="profile-heading" eyebrow="About" title={`About ${settings.academyName}`} />
        {profile.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {profile.map((s) => (
              <article key={s.title} className="card">
                <h3 className="text-lg font-semibold text-navy">{s.title}</h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{s.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Academy profile coming soon" text="Our introduction, history, mission and vision will appear here." />
        )}
      </section>

      <section aria-labelledby="founder-heading">
        <SectionHeading id="founder-heading" eyebrow="Leadership" title="Our founder" />
        {founders.loading ? <LoadingBlock /> : founders.items.length ? (
          <div className="space-y-6">{founders.items.map((f) => <PersonCard key={f.id} person={f} />)}</div>
        ) : (
          <EmptyState title="Founder profile coming soon" />
        )}
      </section>

      <section aria-labelledby="team-heading">
        <SectionHeading id="team-heading" eyebrow="Our people" title="Teachers and team" />
        {teachers.loading ? <LoadingBlock /> : teachers.items.length ? (
          <div className="grid gap-6 lg:grid-cols-2">{teachers.items.map((t) => <PersonCard key={t.id} person={t} />)}</div>
        ) : (
          <EmptyState title="Team profiles coming soon" />
        )}
      </section>
    </div>
  );
}

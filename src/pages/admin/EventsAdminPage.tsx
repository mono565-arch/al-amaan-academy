import { CollectionManager } from '../../components/admin/CollectionManager';
import { EventCard } from '../../components/Cards';
import { PageTitle } from '../../components/common';
import { EVENT_FIELDS } from '../../validation/forms';
import type { AcademyEvent } from '../../types';

export default function EventsAdminPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Events" text="Upcoming and past events shown on the Events & Achievements page." />
      <CollectionManager<AcademyEvent>
        collectionName="events"
        noun="event"
        fields={EVENT_FIELDS}
        defaults={{ published: true }}
        label={(e) => e.title}
        renderCard={(e) => <EventCard event={e} />}
      />
    </div>
  );
}

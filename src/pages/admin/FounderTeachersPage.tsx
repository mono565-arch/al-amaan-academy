import { CollectionManager } from '../../components/admin/CollectionManager';
import { PersonCard } from '../../components/Cards';
import { PageTitle } from '../../components/common';
import { PERSON_FIELDS } from '../../validation/forms';
import type { Person } from '../../types';

export default function FounderTeachersPage() {
  return (
    <div className="space-y-10">
      <PageTitle title="Founder & Teachers" text="Profiles appear on the About page when published." />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-navy">Founder</h2>
        <CollectionManager<Person>
          collectionName="founder"
          noun="founder profile"
          fields={PERSON_FIELDS}
          defaults={{ published: true }}
          label={(p) => p.name}
          renderCard={(p) => <PersonCard person={p} />}
        />
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-navy">Teachers and team</h2>
        <CollectionManager<Person>
          collectionName="teachers"
          noun="team member"
          fields={PERSON_FIELDS}
          defaults={{ published: true }}
          label={(p) => p.name}
          renderCard={(p) => <PersonCard person={p} />}
        />
      </div>
    </div>
  );
}

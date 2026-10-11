import { CollectionManager } from '../../components/admin/CollectionManager';
import { AchievementCard } from '../../components/Cards';
import { PageTitle } from '../../components/common';
import { ACHIEVEMENT_FIELDS } from '../../validation/forms';
import type { Achievement } from '../../types';

export default function AchievementsAdminPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Achievements" text="Recognitions and milestones shown publicly when published." />
      <CollectionManager<Achievement>
        collectionName="achievements"
        noun="achievement"
        fields={ACHIEVEMENT_FIELDS}
        defaults={{ published: true }}
        label={(a) => a.title}
        renderCard={(a) => <AchievementCard item={a} />}
      />
    </div>
  );
}

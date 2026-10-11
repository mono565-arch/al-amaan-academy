import { CollectionManager } from '../../components/admin/CollectionManager';
import { ImageBox, VideoBox } from '../../components/MediaView';
import { PageTitle } from '../../components/common';
import { GALLERY_FIELDS } from '../../validation/forms';
import type { GalleryItem } from '../../types';

export default function GalleryAdminPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Gallery & Videos" text="Add photos and videos by pasting their web addresses. Nothing is uploaded to the server." />
      <CollectionManager<GalleryItem>
        collectionName="gallery"
        noun="media item"
        fields={GALLERY_FIELDS}
        defaults={{ mediaType: 'image', published: true }}
        label={(g) => `${g.title} ${g.category}`}
        renderCard={(g) => (
          <div className="space-y-3">
            {g.mediaType === 'video' ? <VideoBox url={g.url} title={g.title || 'Video'} /> : <ImageBox src={g.url} alt={g.title || 'Photo'} ratioClass="aspect-[4/3]" />}
            <div>
              <p className="font-semibold text-navy">{g.title || 'Untitled'}</p>
              <p className="text-xs text-slate-500">{g.mediaType === 'video' ? 'Video' : 'Photo'}{g.category ? ` · ${g.category}` : ''}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

import { useState } from 'react';
import { cn, isDirectVideoFile, isValidHttpUrl, youtubeEmbedUrl } from '../lib/utils';

/** Image from an external URL. Falls back gracefully if the link is missing or broken. */
export function ImageBox({
  src,
  alt,
  ratioClass = 'aspect-video',
  className,
}: {
  src: string;
  alt: string;
  ratioClass?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || !isValidHttpUrl(src) || failed) {
    return (
      <div className={cn('flex w-full items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-500', ratioClass, className)}>
        Image unavailable
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('w-full object-cover', ratioClass, className)}
    />
  );
}

/** Video from an external URL: YouTube is embedded, direct files use the native player, others link out. */
export function VideoBox({ url, title = 'Video' }: { url: string; title?: string }) {
  if (!isValidHttpUrl(url)) {
    return <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">Video link unavailable</div>;
  }
  const embed = youtubeEmbedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          className="h-full w-full"
          src={embed}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  if (isDirectVideoFile(url)) {
    return <video className="aspect-video w-full rounded-lg bg-black" controls preload="metadata" src={url} aria-label={title} />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
      Watch video (opens in a new tab)
    </a>
  );
}

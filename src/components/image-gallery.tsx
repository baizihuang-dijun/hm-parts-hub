'use client';

import { useState } from 'react';
import { imageSize } from '@/lib/image-sizes';

export interface GalleryImage {
  file: string;
  alt: string;
}

/**
 * Product gallery (v6 mockup .gallery): large framed shot on a dark steel
 * backdrop, clickable thumbnails, and a mono caption row underneath.
 * The first image is treated as the LCP candidate (eager, fetchPriority high);
 * thumbnails and any non-selected large views are lazy.
 */
export function ImageGallery({
  images,
  caption,
}: {
  images: GalleryImage[];
  caption?: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  const size = imageSize(current.file);

  return (
    <div className="v6-gallery">
      {/* Fixed 4:3 frame on a dark steel backdrop; contained, never stretched or cropped (no CLS). */}
      <figure className="v6-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/products/${current.file}`}
          alt={current.alt}
          width={size.width}
          height={size.height}
          fetchPriority="high"
        />
      </figure>
      {images.length > 1 && (
        <div className="v6-thumbs">
          {images.map((img, i) => {
            const s = imageSize(img.file);
            return (
              <button
                key={img.file}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/products/${img.file}`}
                  alt=""
                  width={s.width}
                  height={s.height}
                  loading="lazy"
                  style={{ width: '72px', height: '54px', objectFit: 'contain', padding: '4px' }}
                />
              </button>
            );
          })}
        </div>
      )}
      <div className="v6-cap">
        <span>{caption ?? current.alt}</span>
        <span>FIG · actual unit photo</span>
      </div>
    </div>
  );
}

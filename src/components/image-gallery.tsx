'use client';

import { useState } from 'react';
import { imageSize } from '@/lib/image-sizes';

export interface GalleryImage {
  file: string;
  alt: string;
}

/**
 * Product gallery: large framed main image plus clickable thumbnails.
 * The first image is treated as the LCP candidate (eager, fetchPriority high);
 * thumbnails and any non-selected large views are lazy.
 */
export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  const size = imageSize(current.file);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/products/${current.file}`}
          alt={current.alt}
          width={size.width}
          height={size.height}
          fetchPriority="high"
          className="h-auto w-full"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => {
            const s = imageSize(img.file);
            const selected = i === active;
            return (
              <button
                key={img.file}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={selected}
                className={`shrink-0 overflow-hidden rounded-md border bg-muted transition-colors duration-150 ${
                  selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/products/${img.file}`}
                  alt=""
                  width={s.width}
                  height={s.height}
                  loading="lazy"
                  className="h-16 w-16 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { imageSize } from '@/lib/image-sizes';
import { mainImage, type ModelPage } from '@/lib/data';

/**
 * Compact model card used on the home page, category hub and brand hubs.
 * Whole card links to the model page; no application blurb is rendered here
 * by design (list surfaces stay scannable).
 */
export function ModelCard({ page }: { page: ModelPage }) {
  const main = mainImage(page);
  const size = main ? imageSize(main.file) : { width: 1200, height: 900 };
  const ton = page.copy.ton_class_approx;

  return (
    <Link
      href={page.url_path}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-none transition-shadow duration-150 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {main && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/products/${main.file}`}
            alt={`Final drive for ${page.make_name} ${page.model_name}`}
            width={size.width}
            height={size.height}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">
            {page.make_name} {page.model_name}
          </h3>
          {typeof ton === 'number' && (
            <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground">
              ~{ton} T
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-widest">PN</span>
          <span className="font-mono">{page.lead_pn || 'Nameplate match'}</span>
        </p>
        <div className="mt-auto flex items-center justify-end pt-1">
          <span className="text-xs font-medium text-primary group-hover:underline">View →</span>
        </div>
      </div>
    </Link>
  );
}

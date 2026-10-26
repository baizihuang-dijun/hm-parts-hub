import Link from 'next/link';
import { imageSize } from '@/lib/image-sizes';
import { mainImage, RFQ_PATH, type ModelPage } from '@/lib/data';

/**
 * Model card used on the home page, category hub and brand hubs.
 * Mockup mcard layout: mono make label, bold model name, tonnage tag and
 * lead part number in mono. The main body links to the model page; a
 * separate quote link prefills the RFQ form (no nested anchors).
 */
export function ModelCard({ page }: { page: ModelPage }) {
  const main = mainImage(page);
  const size = main ? imageSize(main.file) : { width: 1200, height: 900 };
  const ton = page.copy.ton_class_approx;
  const quoteHref =
    `${RFQ_PATH}?make=${encodeURIComponent(page.make_name)}` +
    `&model=${encodeURIComponent(page.model_name)}` +
    (page.lead_pn ? `&pn=${encodeURIComponent(page.lead_pn)}` : '');

  return (
    <article className="v6-mcard">
      <Link href={page.url_path} className="flex flex-1 flex-col">
        {/* Fixed 4:3 frame on a dark steel backdrop; images are contained, never stretched or cropped. */}
        <figure className="v6-mfig">
          {main && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/images/products/${main.file}`}
              alt={`Final drive for ${page.make_name} ${page.model_name}`}
              width={size.width}
              height={size.height}
              loading="lazy"
            />
          )}
        </figure>
        <div className="v6-mbody">
          <span className="v6-m-make">{page.make_name}</span>
          <span className="v6-m-model">{page.model_name}</span>
          <span className="v6-m-meta">
            {typeof ton === 'number' && (
              <span className="v6-m-ton">{`~${ton} T`}</span>
            )}
            {page.lead_pn ? (
              <span className="v6-m-pn">{`PN ${page.lead_pn}`}</span>
            ) : (
              <span className="v6-m-pn-none">Nameplate match</span>
            )}
          </span>
        </div>
      </Link>
      <div className="border-t border-border px-3.5 py-2.5">
        <Link
          href={quoteHref}
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8430F] hover:text-[#E8531C]"
        >
          Quote this model →
        </Link>
      </div>
    </article>
  );
}

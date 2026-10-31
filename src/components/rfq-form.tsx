'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RFQ_EMAIL, SITE_NAME, WEB3FORMS_KEY } from '@/config/site';
import { trackEvent } from './analytics';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const inputCls =
  'w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground';

export function RfqForm() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sourcePage, setSourcePage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSourcePage(window.location.href);
  }, []);

  // Form is only functional once a Web3Forms access key is configured.
  if (!WEB3FORMS_KEY) {
    return (
      <div className="border border-border bg-muted p-6">
        <h2 className="text-base font-semibold text-foreground">
          RFQ form is being configured
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The online RFQ form is being configured. Please email us
          {RFQ_EMAIL ? (
            <>
              {' '}
              at{' '}
              <a
                href={`mailto:${RFQ_EMAIL}?subject=${encodeURIComponent(
                  `Final Drive RFQ — ${SITE_NAME}`,
                )}`}
                className="font-semibold text-primary underline underline-offset-4"
              >
                {RFQ_EMAIL}
              </a>
            </>
          ) : (
            ' '
          )}
          with your machine make/model, part numbers, serial number and nameplate photos,
          and we will confirm the matching final drive before quoting.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'submitting') return;
    setState('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('access_key', WEB3FORMS_KEY);
    fd.set('subject', `Final Drive RFQ — ${SITE_NAME}`);
    fd.set('from_name', `${SITE_NAME} RFQ Form`);
    fd.set('form_name', 'final_drive_rfq');
    fd.set('source_page', sourcePage);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
      });
      const json: { success?: boolean; message?: string } = await res.json();
      if (res.ok && json.success) {
        setState('success');
        form.reset();
        // GA4: only fires when analytics consent was granted (trackEvent enforces it).
        trackEvent('generate_lead', { form_name: 'final_drive_rfq' });
      } else {
        setState('error');
        setErrorMsg(json.message || 'Submission failed. Please try again or email us.');
      }
    } catch {
      setState('error');
      setErrorMsg('Network error. Please try again or email us your request.');
    }
  }

  if (state === 'success') {
    return (
      <div className="border border-border bg-muted p-6" role="status">
        <h2 className="text-base font-semibold text-foreground">RFQ submitted</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thank you — your request has been received. We will reply with a technical
          confirmation path for your final drive. To speed up matching, email a nameplate
          photo{RFQ_EMAIL ? ` to ${RFQ_EMAIL}` : ''} and mention your name or part number.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="border border-border bg-card p-6">
      {/* Hidden Web3Forms fields */}
      <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
      <input type="hidden" name="subject" value={`Final Drive RFQ — ${SITE_NAME}`} />
      <input type="hidden" name="from_name" value={`${SITE_NAME} RFQ Form`} />
      <input type="hidden" name="form_name" value="final_drive_rfq" />
      <input type="hidden" name="source_page" value={sourcePage} />
      {/* Honeypot */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rfq-name" className={labelCls}>
            Name *
          </label>
          <input id="rfq-name" name="name" required className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="rfq-company" className={labelCls}>
            Company
          </label>
          <input id="rfq-company" name="company" className={inputCls} autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="rfq-email" className={labelCls}>
            Email *
          </label>
          <input
            id="rfq-email"
            name="email"
            type="email"
            required
            className={inputCls}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="rfq-phone" className={labelCls}>
            Phone
          </label>
          <input id="rfq-phone" name="phone" type="tel" className={inputCls} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="rfq-country" className={labelCls}>
            Country
          </label>
          <input
            id="rfq-country"
            name="country"
            className={inputCls}
            autoComplete="country-name"
          />
        </div>
        <div>
          <label htmlFor="rfq-pn" className={labelCls}>
            Part number(s)
          </label>
          <input
            id="rfq-pn"
            name="part_numbers"
            defaultValue={searchParams.get('pn') ?? ''}
            className={`${inputCls} font-mono`}
            placeholder="e.g. 20Y-27-00300"
          />
        </div>
        <div>
          <label htmlFor="rfq-make" className={labelCls}>
            Machine make
          </label>
          <input
            id="rfq-make"
            name="machine_make"
            defaultValue={searchParams.get('make') ?? ''}
            className={inputCls}
            placeholder="e.g. Komatsu"
          />
        </div>
        <div>
          <label htmlFor="rfq-model" className={labelCls}>
            Machine model
          </label>
          <input
            id="rfq-model"
            name="machine_model"
            defaultValue={searchParams.get('model') ?? ''}
            className={inputCls}
            placeholder="e.g. PC200-7"
          />
        </div>
        <div>
          <label htmlFor="rfq-serial" className={labelCls}>
            Machine serial number
          </label>
          <input id="rfq-serial" name="serial_number" className={`${inputCls} font-mono`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="rfq-message" className={labelCls}>
            Message *
          </label>
          <textarea
            id="rfq-message"
            name="message"
            rows={4}
            required
            className={inputCls}
            placeholder="What do you need — machine, part number, quantity, destination port, timeline…"
          />
        </div>
        <div className="sm:col-span-2 border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nameplate photos
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            A clear nameplate photo is the fastest way to a confirmed match. After you submit,
            send the photo
            {RFQ_EMAIL ? (
              <>
                {' '}to{' '}
                <a href={`mailto:${RFQ_EMAIL}`} className="underline underline-offset-2">
                  {RFQ_EMAIL}
                </a>
              </>
            ) : (
              ' '
            )}{' '}
            and mention your name or part number. See our{' '}
            <a
              href="/guides/how-to-check-excavator-final-drive-nameplate/"
              className="underline underline-offset-2"
            >
              nameplate check guide
            </a>
            .
          </p>
        </div>
      </div>

      {state === 'error' && (
        <p role="alert" className="mt-4 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'submitting' ? 'Submitting…' : 'Submit RFQ'}
        </button>
        <p className="text-xs text-muted-foreground">
          No obligation. We reply with a technical confirmation path, not an automated quote.
        </p>
      </div>
    </form>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { RFQ_EMAIL, SITE_NAME, WEB3FORMS_KEY } from '@/config/site';
import { trackEvent } from './analytics';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Sticky on-page RFQ form for model pages (v6 mockup aside.rfq).
 * Machine make/model are pre-attached as hidden fields; the part-number
 * input (id="mrfq-pn") is prefilled by the "Quote this" row links.
 * Submits to Web3Forms; nameplate photos are requested by reply email
 * (the Web3Forms free plan does not support file uploads).
 */
export function ModelRfqForm({ make, model }: { make: string; model: string }) {
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
      <aside className="v6-rfq" id="rfq">
        <h3>Request a quote</h3>
        <p className="rqsub">The online RFQ form is being configured.</p>
        <p className="v6-fine">
          Please email us
          {RFQ_EMAIL ? (
            <>
              {' '}
              at{' '}
              <a
                href={`mailto:${RFQ_EMAIL}?subject=${encodeURIComponent(
                  `Final Drive RFQ — ${make} ${model} — ${SITE_NAME}`,
                )}`}
              >
                {RFQ_EMAIL}
              </a>
            </>
          ) : (
            ' '
          )}
          with your machine make/model, part numbers, serial number and nameplate photos, and we
          will confirm the matching final drive before quoting.
        </p>
      </aside>
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
    fd.set('subject', `Final Drive RFQ — ${make} ${model} — ${SITE_NAME}`);
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
      <aside className="v6-rfq" id="rfq">
        <div className="v6-rfq-ok" role="status">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="11" stroke="#1E7A4D" strokeWidth="2" />
            <path
              d="m7.5 12.5 3 3 6-7"
              stroke="#1E7A4D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="big">RFQ received — thank you.</div>
          <p>
            Our team will confirm the configuration against your tag and come back with a quote. For
            faster matching, email a nameplate photo
            {RFQ_EMAIL ? ` to ${RFQ_EMAIL}` : ''} and mention your name or part number.
          </p>
          <p style={{ marginTop: '12px' }}>
            <button type="button" className="v6-mini cp" onClick={() => setState('idle')}>
              Submit another request
            </button>
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="v6-rfq" id="rfq">
      <h3>Request a quote</h3>
      <p className="rqsub">We reply with technical confirmation and per-unit terms.</p>
      <form ref={formRef} onSubmit={onSubmit}>
        {/* Hidden Web3Forms fields */}
        <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
        <input type="hidden" name="subject" value={`Final Drive RFQ — ${make} ${model} — ${SITE_NAME}`} />
        <input type="hidden" name="from_name" value={`${SITE_NAME} RFQ Form`} />
        <input type="hidden" name="form_name" value="final_drive_rfq" />
        <input type="hidden" name="source_page" value={sourcePage} />
        <input type="hidden" name="machine_make" value={make} />
        <input type="hidden" name="machine_model" value={model} />
        {/* Honeypot */}
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />

        <div className="v6-field">
          <label>Equipment</label>
          <div className="prefill">{`${make} · ${model}`}</div>
        </div>
        <div className="v6-field">
          <label htmlFor="mrfq-pn">Part number (from the tag)</label>
          <input id="mrfq-pn" name="pn" type="text" placeholder="e.g. 20Y-27-00300" />
        </div>
        <div className="v6-f2">
          <div className="v6-field">
            <label htmlFor="mrfq-name">Your name *</label>
            <input id="mrfq-name" name="name" type="text" required autoComplete="name" />
          </div>
          <div className="v6-field">
            <label htmlFor="mrfq-company">Company</label>
            <input id="mrfq-company" name="company" type="text" autoComplete="organization" />
          </div>
        </div>
        <div className="v6-f2">
          <div className="v6-field">
            <label htmlFor="mrfq-email">Work email *</label>
            <input id="mrfq-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="v6-field">
            <label htmlFor="mrfq-country">Country</label>
            <input id="mrfq-country" name="country" type="text" autoComplete="country-name" />
          </div>
        </div>
        <div className="v6-field">
          <label>Nameplate / tag photo</label>
          <p className="v6-fine" style={{ margin: 0 }}>
            A nameplate photo is the fastest way to a confirmed match — email it to
            {RFQ_EMAIL ? ` ${RFQ_EMAIL}` : ' us'} after submitting and mention your name or part
            number.
          </p>
        </div>
        <div className="v6-field">
          <label htmlFor="mrfq-msg">What do you need *</label>
          <textarea
            id="mrfq-msg"
            name="message"
            rows={3}
            required
            placeholder="What do you need — quantity, destination port, timeline…"
          />
        </div>
        {state === 'error' && (
          <p className="v6-fine" role="alert" style={{ color: '#b3261e', marginBottom: '10px' }}>
            {errorMsg}
          </p>
        )}
        <button
          className="v6-btn v6-btn-primary v6-btn-lg"
          type="submit"
          disabled={state === 'submitting'}
        >
          {state === 'submitting' ? 'Sending…' : 'Send RFQ'}
        </button>
        <p className="v6-fine">
          Submits securely to our inbox with the model and part number pre-attached. Fit,
          availability and lead time are confirmed in writing on each individual quote.
        </p>
      </form>
    </aside>
  );
}

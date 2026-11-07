// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Popover on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the triggers, and an open popover renders no content and no aria-controls', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const triggers = [...html.matchAll(/<button\b[^>]*cckpopovertrigger[^>]*>/gi)].map((match) => match[0]);
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toContain('class="cck-popover__trigger"');
    expect(triggers[0]).toContain('aria-haspopup="dialog"');
    expect(triggers[0]).toContain('aria-expanded="true"');
    expect(triggers[1]).toContain('aria-expanded="false"');
    for (const trigger of triggers) expect(trigger).not.toContain('aria-controls');
    expect(triggers[0]).toMatch(/id="cck-popover-[\w-]+-trigger"/);
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('popover="manual"');
    expect(html).not.toContain('cck-popover__content');
    expect(html).not.toContain('Share this page');
    expect(html).not.toContain('cck-popover__arrow');
  });

  it('renders the anchor on the server with its class, around the trigger', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    expect(html).toMatch(/<div[^>]*cckpopoveranchor[^>]*class="cck-popover__anchor"/i);
    expect(html).toMatch(/cck-popover__anchor"[^>]*>\s*<button[^>]*cckpopovertrigger/i);
  });
});

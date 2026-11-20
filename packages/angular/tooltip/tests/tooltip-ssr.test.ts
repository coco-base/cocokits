// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Tooltip on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the triggers with the author ids only, and no content and no description', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const compound = /<button[^>]*ccktooltiptrigger[^>]*>/i.exec(html)?.[0] ?? '';
    expect(compound).toContain('class="cck-tooltip__trigger"');
    expect(compound).toMatch(/id="cck-tooltip-[\w-]+-trigger"/);
    expect(compound).toContain('data-state="closed"');
    expect(compound).not.toContain('aria-describedby');
    const [info, save] = [...html.matchAll(/<button[^>]*ccktooltip=[^>]*>/gi)].map((match) => match[0]);
    expect(info).toContain('class="cck-tooltip__trigger"');
    expect(info).toContain('id="mine"');
    expect(info).toContain('aria-describedby="note"');
    expect(info).toContain('data-state="closed"');
    expect(save).not.toContain('aria-describedby');
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('popover="manual"');
    expect(html).not.toContain('cck-tooltip__content');
    expect(html).not.toContain('cck-tooltip__arrow');
    expect(html).not.toContain('-description');
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Dialog on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the triggers, and an open dialog renders no content and no aria-controls', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const triggers = [...html.matchAll(/<button\b[^>]*cckdialogtrigger[^>]*>/gi)].map((match) => match[0]);
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toContain('class="cck-dialog__trigger"');
    expect(triggers[0]).toContain('aria-haspopup="dialog"');
    expect(triggers[0]).toContain('aria-expanded="true"');
    expect(triggers[1]).toContain('aria-expanded="false"');
    for (const trigger of triggers) expect(trigger).not.toContain('aria-controls');
    expect(triggers[0]).toMatch(/id="cck-dialog-[\w-]+-trigger"/);
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('popover="manual"');
    expect(html).not.toContain('cck-dialog__content');
    expect(html).not.toContain('Delete project');
  });
});

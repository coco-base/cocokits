// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Menu on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the triggers, and an open menu renders no content and no aria-controls', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const triggers = [...html.matchAll(/<button\b[^>]*cckmenutrigger[^>]*>/gi)].map((match) => match[0]);
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toContain('class="cck-menu__trigger"');
    expect(triggers[0]).toContain('aria-haspopup="menu"');
    expect(triggers[0]).toContain('aria-expanded="true"');
    expect(triggers[0]).toContain('type="button"');
    expect(triggers[0]).toContain('data-state="open"');
    expect(triggers[1]).toContain('aria-expanded="false"');
    expect(triggers[1]).toContain('data-state="closed"');
    for (const trigger of triggers) expect(trigger).not.toContain('aria-controls');
    expect(triggers[0]).toMatch(/id="cck-menu-[\w-]+-trigger"/);
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('role="menuitem"');
    expect(html).not.toContain('popover="manual"');
    expect(html).not.toContain('cck-menu__content');
    expect(html).not.toContain('Rename');
  });
});

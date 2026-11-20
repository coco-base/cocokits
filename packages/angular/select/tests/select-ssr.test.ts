// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Select on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the trigger with the label of its value, the hidden input, and no list', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const triggers = [...html.matchAll(/<button\b[^>]*role="combobox"[^>]*>/gi)].map((match) => match[0]);
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toContain('class="cck-select__trigger"');
    expect(triggers[0]).toContain('aria-haspopup="listbox"');
    expect(triggers[0]).toContain('aria-expanded="false"');
    expect(triggers[1]).toContain('aria-expanded="false"');
    for (const trigger of triggers) expect(trigger).not.toContain('aria-controls');
    // The label comes from the option text, which exists before the Select renders.
    expect(html).toMatch(/cck-select__value[^>]*>\s*Pizza\s*</);
    expect(html).toMatch(/cck-select__value[^>]*>\s*Rice\s*</);
    expect(html).toMatch(/<input[^>]*name="dish"[^>]*value="Pizza"/);
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('role="option"');
    expect(html).not.toContain('cck-select__content');
  });
});

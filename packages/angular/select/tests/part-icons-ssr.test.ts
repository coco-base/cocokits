// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderPartIconsOnServer } from './part-icons-fixtures';

/** Every element with the class, from its opening tag to its closing tag (these parts nest no element of the same name). */
function parts(html: string, className: string): string[] {
  return [...html.matchAll(new RegExp(`<(\\w[\\w-]*)\\b[^>]*class="${className}"[^>]*>.*?</\\1>`, 'gs'))].map(
    (match) => match[0],
  );
}

describe('Part icons on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('puts the theme icons in the markup: Select chevron, Accordion indicator and the checked Checkbox tick', async () => {
    const html = (await renderPartIconsOnServer()).replace(/<!--[^>]*-->/g, '');

    const [chevron] = parts(html, 'cck-select__dropdown-icon');
    expect(chevron).toContain('data-icon-name="chevron-down"');
    expect(chevron).toContain('d="M-chevron"');

    const [indicator] = parts(html, 'cck-accordion__indicator');
    expect(indicator).toContain('data-icon-name="chevron-down"');
    expect(indicator).toContain('d="M-chevron"');

    // The Checkbox background holds the tick only while it is checked and not indeterminate.
    const ticks = parts(html, 'cck-checkbox__background').map((background) => background.includes('d="M-check"'));
    expect(ticks).toEqual([true, false, false]);
  });
});

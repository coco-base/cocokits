// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

/** The `cck-*` classes inside one field, in document order, without the field's own. */
function partsOf(html: string, id: string): string[] {
  const field = html.split(/(?=<div[^>]*class="cck-form-field")/).find((chunk) => chunk.includes(`id="${id}"`)) ?? '';
  return [...field.matchAll(/class="(cck-[a-z_-]+)"/g)].map((match) => match[1]).slice(1);
}

describe('FormField on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders every part in zone order, whatever the author order', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const zones = [
      'cck-label',
      'cck-form-field__wrapper',
      'cck-form-field__input-wrapper',
      'cck-form-field__feedback-wrapper',
      'cck-hint',
    ];
    expect(partsOf(html, 'ordered')).toEqual(zones);
    expect(partsOf(html, 'reversed')).toEqual(zones);
  });

  it('renders an empty feedback wrapper when there is no hint', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    expect(html).toMatch(/<div class="cck-form-field__feedback-wrapper" id="[^"]+"><\/div>/);
  });
});

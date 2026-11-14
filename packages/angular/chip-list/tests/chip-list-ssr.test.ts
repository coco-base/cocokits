// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './chip-list-ssr-fixtures';

/** The attributes of every opening tag whose name matches, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Chip list on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the chips of the initial value, in order, before the text box', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    expect([...html.matchAll(/cck-chip__content-wrapper"[^>]*>\s*([^<]*?)\s*</g)].map((match) => match[1])).toEqual([
      'Pizza',
      'Salad',
      'Locked',
    ]);
    expect(html.indexOf('Salad')).toBeLessThan(html.indexOf('cck-chip-list__input'));
  });

  it('renders the text box with the field control id, the description and no name', async () => {
    const html = await renderOnServer();
    const inputs = tags(html, 'input').filter((input) => input.class?.includes('cck-chip-list__input'));
    const inField = inputs[0];
    expect(inField.id).toMatch(/^dishes-field-control$/);
    expect(inField['aria-describedby']).toBe('dishes-field-hint-1');
    expect(inField['aria-required']).toBe('true');
    expect(inField.placeholder).toBe('Add a dish');
    expect(inputs.every((input) => input.name === undefined && input.required === undefined)).toBe(true);
    expect(inputs.find((input) => input.id === 'mine')?.['aria-label']).toBe('Tags');
    expect(inputs.find((input) => input['aria-label'] === 'Locked')?.disabled).toBeDefined();
  });

  it('renders the hidden inputs: one per chip, and one empty while required and empty', async () => {
    const hidden = tags(await renderOnServer(), 'input').filter((input) => input['aria-hidden'] === 'true');
    expect(hidden.map((input) => [input.name, input.required !== undefined])).toEqual([
      ['dish', true],
      ['dish', true],
      ['tag', true],
    ]);
  });

  it('renders the facts on the roots and resolves every reference', async () => {
    const html = await renderOnServer();
    const roots = tags(html, 'cck-chip-list');
    expect(roots.some((root) => root['data-required'] !== undefined && root['data-invalid'] !== undefined)).toBe(true);
    expect(roots.find((root) => root['data-disabled'] !== undefined)).toBeDefined();
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [
      ...[...html.matchAll(/\sfor="([^"]*)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/\saria-(?:describedby|labelledby)="([^"]*)"/g)].flatMap((match) => match[1].split(' ')),
    ];
    expect(references.length).toBeGreaterThanOrEqual(5);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
  });
});

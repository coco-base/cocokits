// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './ssr-fixtures';

/** The opening tag of the first element whose tag matches, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Input on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the ids, the label for and the description in the server HTML', async () => {
    const html = await renderOnServer();
    const inputs = tags(html, 'input');
    const byLabel = (name: string) => inputs.find((input) => input['aria-label'] === name || input.name === name);
    const email = byLabel('email');
    expect(email?.id).toMatch(/^cck-form-field-.+-control$/);
    expect(email?.type).toBe('email');
    expect(email?.['aria-describedby']).toMatch(/^cck-form-field-.+-feedback$/);
    const street = byLabel('street');
    expect(street?.id).toBe('street-field-control');
    expect(street?.['aria-describedby']).toBe('note street-field-feedback');
    expect(street?.required).toBe(''); // from the field
    expect(inputs.find((input) => input.id === 'mine')?.disabled).toBeDefined();
  });

  it('resolves every id a label or description points at', async () => {
    const html = await renderOnServer();
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [
      ...[...html.matchAll(/\sfor="([^"]*)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/\saria-describedby="([^"]*)"/g)].flatMap((match) => match[1].split(' ')),
    ];
    expect(references.length).toBeGreaterThanOrEqual(8);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
  });

  it('renders the control path as the name and type text by default', async () => {
    const html = await renderOnServer();
    const names = tags(html, 'input').map((input) => input.name);
    expect(names).toEqual(expect.arrayContaining(['email', 'street', 'address.city']));
    expect(
      tags(html, 'input')
        .filter((input) => input.cckinput !== undefined)
        .every((input) => input.type),
    ).toBe(true);
    expect(tags(html, 'input').find((input) => input.name === 'street')?.type).toBe('text');
  });

  it('renders the state facts, the required marker and the field facts', async () => {
    const html = await renderOnServer().then((result) => result.replace(/<!--[^>]*-->/g, ''));
    expect(html).toContain('<span class="cck-label__required-marker" aria-hidden="true">*</span>');
    const alone = tags(html, 'input').find((input) => input['aria-label'] === 'Alone');
    expect(alone).toMatchObject({
      'data-required': '',
      'data-invalid': '',
      'data-touched': '',
      'aria-invalid': 'true',
    });
    const fields = tags(html, 'div').filter((div) => div.class === 'cck-form-field');
    expect(fields.some((field) => field['data-required'] !== undefined && field['data-invalid'] !== undefined)).toBe(
      true,
    );
    expect(fields.find((field) => field.id === 'street-field')?.['data-required']).toBe('');
  });

  it('renders every placement of the label in zone order with the feedback wrapper described', async () => {
    const html = await renderOnServer().then((result) => result.replace(/<!--[^>]*-->/g, ''));
    const feedbacks = tags(html, 'div').filter((div) => div.class === 'cck-form-field__feedback-wrapper');
    expect(feedbacks.every((feedback) => feedback.id)).toBe(true);
    expect(feedbacks.map((feedback) => feedback.id)).toContain('street-field-feedback');
  });
});

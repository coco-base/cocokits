// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './ssr-fixtures';

/** The opening tags of the elements with this tag name, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

const clean = (html: string): string => html.replace(/<!--[^>]*-->/g, '');

describe('Textarea, zones and FieldError on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the textarea ids, name and description, and every IDREF resolves', async () => {
    const html = clean(await renderOnServer());
    const [textarea] = tags(html, 'textarea');
    expect(textarea.id).toBe('message-field-control');
    expect(textarea.name).toBe('message');
    expect(textarea.rows).toBe('4');
    expect(textarea['aria-describedby']).toBe('message-field-hint-1 message-field-error-1 message-field-error-2');
    expect(textarea.type).toBeUndefined();
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [
      ...[...html.matchAll(/\sfor="([^"]*)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/\saria-describedby="([^"]*)"/g)].flatMap((match) => match[1].split(' ')),
    ];
    expect(references.length).toBeGreaterThanOrEqual(4);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
  });

  it('renders the zones in the Anatomy order', async () => {
    const html = clean(await renderOnServer());
    const order = ['cck-label', 'cck-leading', 'cck-prefix', '<textarea', 'cck-suffix', 'cck-trailing', 'cck-hint'].map(
      (marker) => html.indexOf(marker),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('renders the FieldError roots as polite live regions, with content only for force', async () => {
    const html = clean(await renderOnServer());
    const errors = [
      ...html.matchAll(
        /<cck-field-error[^>]*aria-live="polite"[^>]*class="cck-field-error"[^>]*>([^<]*)<\/cck-field-error>/g,
      ),
    ].map((match) => match[1]);
    expect(errors).toEqual(['', 'Forced.']);
  });
});

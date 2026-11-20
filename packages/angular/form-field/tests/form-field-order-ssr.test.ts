// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

/** The markup of the field with the given id. */
function fieldOf(html: string, id: string): string {
  return (
    html.split(/(?=<cck-form-field[^>]*class="cck-form-field")/).find((chunk) => chunk.includes(`id="${id}"`)) ?? ''
  );
}

/** The id of the element whose text is `text`. */
function idOf(markup: string, text: string): string | undefined {
  return new RegExp(`id="([^"]+)"[^>]*>${text}<`).exec(markup)?.[1];
}

describe('FormField parts in an @if on the server', () => {
  it('numbers and lists a Hint and a FieldError inside a true @if in document order', async () => {
    const field = fieldOf((await renderOnServer()).replace(/<!--[^>]*-->/g, ''), 'cond');
    expect(idOf(field, 'First hint')).toBe('cond-hint-1');
    expect(idOf(field, 'Second hint')).toBe('cond-hint-2');
    expect(idOf(field, 'First error')).toBe('cond-error-1');
    expect(idOf(field, 'Second error')).toBe('cond-error-2');
    expect(/<input[^>]*aria-describedby="([^"]+)"/.exec(field)?.[1]).toBe(
      'cond-hint-1 cond-hint-2 cond-error-1 cond-error-2',
    );
  });
});

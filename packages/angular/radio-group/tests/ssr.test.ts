// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './ssr-fixtures';

/** The opening tags as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Radio group on the server', () => {
  it('renders the root facts, one generated name, the checked attribute and no tabindex', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const root = tags(html, 'cck-radio-group').find((div) => div.role === 'radiogroup');
    expect(root).toBeDefined();
    expect(root?.class).toContain('cck-radio-group');
    expect(root?.['aria-required']).toBe('true');
    expect(root?.['aria-orientation']).toBe('horizontal');
    expect(root?.['data-orientation']).toBe('horizontal');
    expect(root?.['data-required']).toBeDefined();
    const inputs = tags(html, 'input').filter((input) => input.type === 'radio');
    expect(new Set(inputs.map((input) => input.name)).size).toBe(1);
    expect(inputs[0]?.name).toMatch(/^cck-radio-group-/);
    expect(inputs.map((input) => input.checked !== undefined)).toEqual([false, true, false]);
    expect(inputs.map((input) => input.tabindex)).toEqual([undefined, undefined, undefined]);
    expect(inputs.map((input) => input.disabled !== undefined)).toEqual([false, false, true]);
    expect(inputs.every((input) => input.required !== undefined)).toBe(true);
  });
});

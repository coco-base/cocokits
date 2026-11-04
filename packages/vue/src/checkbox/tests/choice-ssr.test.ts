// @vitest-environment node
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { view } from '../../internal/tests/mount-helpers';
import { Checkbox } from '../index';
import { choiceControls } from './ssr-fixtures';

/** The server markup without the comments that mark slot fragments. */
async function markup(): Promise<string> {
  return (await renderToString(createSSRApp(view(choiceControls)))).replace(/<!--[\s\S]*?-->/g, '');
}

/** The opening tags with the name, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Checkbox, Switch and Radio on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect([Checkbox, Switch, Radio].every((component) => component !== undefined)).toBe(true);
  });

  it('renders the classes, the facts, the checked attribute and the mixed fact', async () => {
    const html = await markup();
    const roots = tags(html, 'div');
    expect(roots.filter((div) => div.class?.startsWith('cck-checkbox') && 'data-checked' in div)).not.toHaveLength(0);
    expect(roots.some((div) => 'data-indeterminate' in div)).toBe(true);
    expect(roots.some((div) => div.class?.startsWith('cck-switch') && 'data-required' in div)).toBe(true);
    const inputs = tags(html, 'input');
    expect(inputs.filter((input) => input.type === 'checkbox' && 'checked' in input).length).toBeGreaterThan(1);
    expect(inputs.find((input) => input.role === 'switch')).toBeDefined();
    expect(inputs.find((input) => input.id === 'mixed')?.['aria-describedby']).toBe('note');
    expect(inputs.filter((input) => input.type === 'radio').map((input) => input.value)).toEqual(['free', 'pro']);
    expect(inputs.find((input) => input.type === 'radio')).toHaveProperty('checked');
    expect(inputs.find((input) => input.value === 'yes')?.name).toBe('terms');
    expect(inputs.find((input) => 'disabled' in input)).toBeDefined();
    expect(inputs.find((input) => input['aria-readonly'] === 'true')).toHaveProperty('checked');
  });

  it('renders the control id in a field and resolves every id a label or description points at', async () => {
    const html = await markup();
    const inputs = tags(html, 'input');
    expect(inputs.find((input) => input.name === 'news')?.id).toBe('news-control');
    expect(inputs.find((input) => input.name === 'push')?.id).toBe('push-control');
    expect(inputs.find((input) => input.name === 'news')?.['aria-describedby']).toBe('news-feedback');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [
      ...[...html.matchAll(/\sfor="([^"]*)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/\saria-describedby="([^"]*)"/g)].flatMap((match) => match[1].split(' ')),
    ];
    expect(references.length).toBeGreaterThanOrEqual(10);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
    for (const input of inputs) expect(input.id, 'every input has an id').toBeTruthy();
  });

  it('marks the decorative parts aria-hidden and keeps the input attributes off the root', async () => {
    const html = await markup();
    for (const part of ['backdrop', 'background', 'thumb']) {
      const spans = tags(html, 'span').filter((span) => span.class?.includes(`__${part}`));
      expect(spans.length, part).toBeGreaterThan(0);
      expect(
        spans.every((span) => span['aria-hidden'] === 'true'),
        part,
      ).toBe(true);
    }
    const roots = tags(html, 'div').filter((div) => /^cck-(checkbox|switch|radio)\b/.test(div.class ?? ''));
    expect(roots.length).toBeGreaterThan(5);
    for (const root of roots) {
      expect(root.name).toBeUndefined();
      expect(root['aria-describedby']).toBeUndefined();
      expect(root.id).toBeUndefined();
    }
  });
});

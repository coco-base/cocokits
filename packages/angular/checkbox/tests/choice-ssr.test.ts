// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './ssr-fixtures';

/** The opening tags of the Checkbox, Switch and Radio. */
function roots(html: string): Record<string, string | undefined>[] {
  return ['cck-checkbox', 'cck-switch', 'cck-radio'].flatMap((tag) => tags(html, tag));
}

/** The opening tags with the name, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Checkbox, Switch and Radio on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the classes, the facts, the checked attribute and the mixed fact', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const hosts = roots(html);
    const checked = hosts.filter((div) => div.class?.startsWith('cck-checkbox') && div['data-checked'] !== undefined);
    expect(checked.length).toBeGreaterThan(0);
    expect(hosts.some((div) => div['data-indeterminate'] !== undefined)).toBe(true);
    expect(hosts.some((div) => div.class?.startsWith('cck-switch') && div['data-required'] !== undefined)).toBe(true);
    const inputs = tags(html, 'input');
    expect(inputs.filter((input) => input.type === 'checkbox' && input.checked !== undefined).length).toBeGreaterThan(
      1,
    );
    expect(inputs.find((input) => input.role === 'switch')).toBeDefined();
    expect(inputs.find((input) => input.id === 'mixed')?.['aria-describedby']).toBe('note');
    expect(inputs.filter((input) => input.type === 'radio').map((input) => input.value)).toEqual(['free', 'pro']);
    expect(inputs.find((input) => input.type === 'radio')?.checked).toBeDefined();
    expect(inputs.find((input) => input.disabled !== undefined)).toBeDefined();
    expect(inputs.find((input) => input['aria-readonly'] === 'true')?.checked).toBeDefined();
  });

  it('renders the control id in a field and resolves every id a label or description points at', async () => {
    const html = await renderOnServer();
    const inputs = tags(html, 'input');
    expect(inputs.find((input) => input.name === 'news')?.id).toBe('news-control');
    expect(inputs.find((input) => input.name === 'push')?.id).toBe('push-control');
    expect(inputs.find((input) => input.name === 'news')?.['aria-describedby']).toBe('news-hint-1');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [
      ...[...html.matchAll(/\sfor="([^"]*)"/g)].map((match) => match[1]),
      ...[...html.matchAll(/\saria-describedby="([^"]*)"/g)].flatMap((match) => match[1].split(' ')),
    ];
    expect(references.length).toBeGreaterThanOrEqual(10);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
    for (const input of inputs) expect(input.id, 'every input has an id').toBeTruthy();
  });

  it('marks the decorative parts aria-hidden and the host with none of the input attributes', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    for (const part of ['backdrop', 'background', 'thumb']) {
      const spans = tags(html, 'span').filter((span) => span.class?.includes(`__${part}`));
      expect(spans.length, part).toBeGreaterThan(0);
      expect(
        spans.every((span) => span['aria-hidden'] === 'true'),
        part,
      ).toBe(true);
    }
    const hosts = roots(html).filter((div) => /^cck-(checkbox|switch|radio)\b/.test(div.class ?? ''));
    expect(hosts.length).toBeGreaterThan(5);
    for (const host of hosts) {
      expect(host.name).toBeUndefined();
      expect(host['aria-describedby']).toBeUndefined();
    }
    expect(hosts.find((host) => host.id === 'mixed')).toBeUndefined();
  });
});

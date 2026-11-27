// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { ChoiceApp } from './app-fixture';
import { idsIn } from '../../internal/tests/choice-fixtures';

/** The opening tags with the name, as a name to value map. */
function tags(html: string, tag: string): Record<string, string | undefined>[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((match) =>
    Object.fromEntries([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2]])),
  );
}

describe('Checkbox, Switch and Radio on the server', () => {
  it('imports the three entries in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    for (const component of [Checkbox, Switch, Radio]) expect(typeof component).toBe('function');
  });

  it('renders the classes, the facts, the checked attribute and the mixed fact', () => {
    const html = renderToString(<ChoiceApp />);
    const roots = tags(html, 'div');
    expect(roots.some((div) => div.class?.startsWith('cck-checkbox') && div['data-checked'] !== undefined)).toBe(true);
    expect(roots.some((div) => div['data-indeterminate'] !== undefined)).toBe(true);
    expect(roots.some((div) => div.class?.startsWith('cck-switch') && div['data-required'] !== undefined)).toBe(true);
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

  it('renders the control id in a field and resolves every id a label or description points at', () => {
    const html = renderToString(<ChoiceApp />);
    const inputs = tags(html, 'input');
    expect(inputs.find((input) => input.name === 'news')?.id).toBe('news-control');
    expect(inputs.find((input) => input.name === 'push')?.id).toBe('push-control');
    expect(inputs.find((input) => input.name === 'news')?.['aria-describedby']).toBe('news-hint-1');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const references = [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')];
    expect(references.length).toBeGreaterThanOrEqual(10);
    for (const reference of references) expect(ids.has(reference), reference).toBe(true);
    for (const input of inputs) expect(input.id, 'every input has an id').toBeTruthy();
  });

  it('points both labels of a field control at the input', () => {
    const html = renderToString(<ChoiceApp />);
    const labels = tags(html, 'label').filter((label) => label.for === 'news-control');
    expect(labels.map((label) => label.class)).toEqual(['cck-label', 'cck-checkbox__label']);
  });

  it('marks the decorative parts aria-hidden and the root with none of the input attributes', () => {
    const html = renderToString(<ChoiceApp />);
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

import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer } from './ssr-fixtures';

/**
 * Markup without the hydration and event-replay bookkeeping Angular adds, without `tabindex` (set after mount), and without the `value`
 * attribute: the server serializes the value property of an input as an attribute, the browser render
 * only sets the property. The `checked` attribute is left out too, because the server writes it at another
 * position among the attributes; the same markup test proves it is present (`choice-ssr.test.ts`).
 */
function normalized(root: Element): string {
  return root.innerHTML
    .replace(/\s+(?:ngh|jsaction|value)="[^"]*"/g, '')
    .replace(/\s+checked=""/g, '')
    .replace(/\s+tabindex="[^"]*"/g, '')
    .replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

describe('Radio group hydration', () => {
  const apps: ApplicationRef[] = [];
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render, logs no hydration problem and then roves the tab stop', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();

    const html = await renderOnServer();
    document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    const problems: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      problems.push(args);
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      problems.push(args);
    });
    const logs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args);
    });
    const app = await bootstrapOnClient(true);
    apps.push(app);
    await app.whenStable();

    expect(logs.some(([m]) => String(m).startsWith('Angular hydrated'))).toBe(true);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    expect(first).toContain('role="radiogroup"');
    expect(document.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.getAttribute('value')).toBe('pro');
    expect(document.querySelector('input[type="radio"]')?.getAttribute('tabindex')).toBe('-1');
    expect(problems).toEqual([]);
  });
});

import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer } from './chip-list-ssr-fixtures';
import { must } from './fixtures';

/**
 * Markup without the hydration and event-replay bookkeeping Angular adds, and without the `value` attribute: the
 * server serializes the value property of an input as an attribute, the browser render only sets the property.
 */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction|value)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

describe('Chip list hydration', () => {
  const apps: ApplicationRef[] = [];
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render and logs no hydration problem', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();

    const html = await renderOnServer();
    document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    const problems: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args) => {
        problems.push(args);
      });
    }
    const logs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args);
    });
    const app = await bootstrapOnClient(true);
    apps.push(app);
    await app.whenStable();

    expect(logs.some(([m]) => String(m).startsWith('Angular hydrated'))).toBe(true);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    expect(first).toContain('Pizza');
    expect(first).toContain('cck-chip-list__input');
    expect(problems).toEqual([]);
  });
});

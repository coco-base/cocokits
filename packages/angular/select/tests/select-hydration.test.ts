import type { ApplicationRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer } from './fixtures';
import { stubOverlayApis } from './overlay-stubs';

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

describe('Select hydration', () => {
  const apps: ApplicationRef[] = [];
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render, logs no hydration problem, then opens the list on a click', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();
    document.body.innerHTML = '';

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
    expect(problems).toEqual([]);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    must(document.querySelector<HTMLElement>('button[role="combobox"]')).click();
    await app.whenStable();
    const list = must(document.querySelector('[role="listbox"]'));
    expect(list.closest('app-root')).toBeNull();
  });
});

import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer } from './fixtures';

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

describe('SvgIcon hydration', () => {
  const apps: ApplicationRef[] = [];
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render and logs no hydration problem', async () => {
    // The first client render, without hydration, is the reference.
    document.body.innerHTML = '<app-root></app-root>';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();

    const html = await renderOnServer();
    document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    const problems: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      // The unknown icon of the test app logs its own error; it is not a hydration problem.
      if (!String(args[0]).startsWith('CocoKits: the theme has no icon')) problems.push(args);
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

    // Angular logs this line (dev mode) only when it reused the server nodes: the app and the three icons.
    expect(logs.some(([m]) => String(m).startsWith('Angular hydrated 4 component(s)'))).toBe(true);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    expect(first).toContain('viewBox="0 0 24 24"');
    expect(problems).toEqual([]);
  });
});

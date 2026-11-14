import type { ApplicationRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { must } from './helpers';
import { stubOverlayApis } from './overlay-stubs';
import { bootstrapPartIconsOnClient, renderPartIconsOnServer } from './part-icons-fixtures';

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML
    .replace(/\s+(?:ngh|jsaction|value)="[^"]*"/g, '')
    .replace(/\s+checked=""/g, '')
    .replace(/<!--[^>]*-->/g, '');
}

describe('Part icons hydration', () => {
  const apps: ApplicationRef[] = [];
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render and logs no hydration problem, then the open list shows the indicator', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapPartIconsOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();
    document.body.innerHTML = '';

    const html = await renderPartIconsOnServer();
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
    const app = await bootstrapPartIconsOnClient(true);
    apps.push(app);
    await app.whenStable();

    expect(logs.some(([message]) => String(message).startsWith('Angular hydrated'))).toBe(true);
    expect(problems).toEqual([]);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    expect(first).toContain('data-icon="plus"');
    expect(first).toContain('data-icon="heart"');

    must(document.querySelector<HTMLElement>('button[role="combobox"]')).click();
    await app.whenStable();
    const indicators = [...document.querySelectorAll('[role="option"] .cck-select__option-indicator')];
    const held = indicators.map((part) => part.querySelector('.cck-svg-icon')?.getAttribute('data-icon') ?? null);
    expect(held).toEqual([null, 'heart']);
  });
});

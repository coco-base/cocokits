import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { must } from './fixtures';
import { bootstrapOnClient, renderOnServer } from './ssr-fixtures';

/** Markup without the hydration bookkeeping, the `value` attribute and the text the server writes for the value. */
function normalized(root: Element): string {
  return root.innerHTML
    .replace(/\s+(?:ngh|jsaction|value)="[^"]*"/g, '')
    .replace(/<!--[^>]*-->/g, '')
    .replace(/(<textarea[^>]*>)[^<]*(<\/textarea>)/g, '$1$2');
}

describe('Textarea hydration', () => {
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
    expect(first).toContain('cck-field-error');
    expect(problems).toEqual([]);
  });
});

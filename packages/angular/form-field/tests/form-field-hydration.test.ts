import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer } from './fixtures';
import { must } from './queries';

/**
 * Markup without the hydration and event-replay bookkeeping Angular adds, and without the `value` attribute: the
 * server writes the value property of an input as an attribute (as in the Input hydration test).
 */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction|value)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

describe('FormField hydration', () => {
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
    expect(first).toContain('cck-form-field__feedback-wrapper');
    expect(problems).toEqual([]);
  });

  it('keeps the server ids of the parts in an @if and the control description after hydration', async () => {
    const html = await renderOnServer();
    document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    const field = must(document.querySelector('#cond'));
    const ids = (): string[] => Array.from(field.querySelectorAll('.cck-hint, .cck-field-error'), (part) => part.id);
    const described = (): string | null => must(field.querySelector('input')).getAttribute('aria-describedby');
    const serverIds = ids();
    const serverDescription = described();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const app = await bootstrapOnClient(true);
    apps.push(app);
    await app.whenStable();
    expect(serverIds).toEqual(['cond-hint-1', 'cond-hint-2', 'cond-error-1', 'cond-error-2']);
    expect(serverDescription).toBe('cond-hint-1 cond-hint-2 cond-error-1 cond-error-2');
    expect(ids()).toEqual(serverIds);
    expect(described()).toBe(serverDescription);
  });
});

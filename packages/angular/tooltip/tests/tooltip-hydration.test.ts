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

describe('Tooltip hydration', () => {
  const apps: ApplicationRef[] = [];
  beforeEach(stubOverlayApis);
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render, logs no hydration problem, then adds the descriptions', async () => {
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
    // After mount the descriptions exist in the overlay container and the triggers name them.
    const info = must(document.querySelector<HTMLElement>('#mine'));
    const description = must(
      [...document.querySelectorAll('[role="tooltip"][hidden]')].find(
        (element) => element.textContent === 'Information',
      ),
    );
    expect(description.closest('app-root')).toBeNull();
    expect(description.textContent).toBe('Information');
    expect(info.getAttribute('aria-describedby')).toBe(`note ${description.id}`);
    expect(document.querySelectorAll('[role="tooltip"][hidden]')).toHaveLength(2);
  });
});

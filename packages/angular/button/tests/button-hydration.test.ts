import type { ApplicationRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bootstrapOnClient, renderOnServer, type Root } from './fixtures';

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

function mount(html: string): void {
  document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
}

describe('Button hydration', () => {
  const apps: ApplicationRef[] = [];
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  async function hydrate(): Promise<{
    app: ApplicationRef;
    root: Element;
    first: string;
    problems: unknown[][];
    hydrated: boolean;
  }> {
    // The first client render, without hydration, is the reference.
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();

    const html = await renderOnServer();
    mount(html);
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
    // Angular logs this line (dev mode) only when it reused the server nodes.
    const hydrated = logs.some(([m]) => String(m).startsWith('Angular hydrated 1 component'));
    return { app, root: must(document.querySelector('app-root')), first, problems, hydrated };
  }

  it('matches the first client render and logs no hydration problem', async () => {
    const { root, first, problems, hydrated } = await hydrate();
    expect(hydrated).toBe(true);
    expect(normalized(root)).toBe(first);
    expect(first).toContain('data-variant="primary"');
    expect(problems).toEqual([]);
  });

  it('handles a click afterwards and guards the disabled link', async () => {
    const { root, app } = await hydrate();
    const instance = must(app.components[0]).instance as Root;
    const buttons = root.querySelectorAll('button');
    must(buttons.item(0)).click();
    must(buttons.item(1)).click();
    expect(instance.clicked()).toBe(1);

    const link = must(root.querySelector('a[data-disabled]'));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(instance.linkClicked()).toBe(0);
  });
});

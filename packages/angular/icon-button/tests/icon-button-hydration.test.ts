import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type ApplicationRef,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckIcons } from '@cocokits/angular-core';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { plusIcon } from '@cocokits/icons';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckIconButtonImports } from '../index';

@Component({
  selector: 'app-root',
  imports: [CckIconButtonImports, CckSvgIconImports],
  template: `
    <button cckIconButton aria-label="Add" (click)="count = count + 1">
      <cck-svg-icon iconName="plus" />
    </button>
    <button cckIconButton aria-label="Off" disabled><cck-svg-icon iconName="plus" /></button>
    <a cckIconButton href="#go" aria-label="Go" disabled><cck-svg-icon iconName="plus" /></a>
    <output>{{ count }}</output>
  `,
})
class Root {
  protected count = 0;
}

const page = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [
  provideZonelessChangeDetection(),
  provideCckIcons({ icons: { plus: plusIcon } }),
  ...extra,
];

async function renderOnServer(): Promise<string> {
  destroyPlatform();
  const flags = globalThis as { ngDevMode?: unknown };
  const devMode = flags.ngDevMode;
  const globalsBefore = Object.getOwnPropertyDescriptors(globalThis);
  flags.ngDevMode = false;
  try {
    return await renderApplication(
      (context) =>
        bootstrapApplication(
          Root,
          { providers: providers(provideClientHydration(), provideServerRendering()) },
          context,
        ),
      { document: page },
    );
  } finally {
    flags.ngDevMode = devMode;
    for (const [name, before] of Object.entries(globalsBefore)) {
      if (Object.getOwnPropertyDescriptor(globalThis, name)?.value !== before.value) {
        Object.defineProperty(globalThis, name, before);
      }
    }
  }
}

function bootstrapOnClient(hydrate: boolean): ReturnType<typeof bootstrapApplication> {
  destroyPlatform();
  return bootstrapApplication(Root, { providers: providers(...(hydrate ? [provideClientHydration()] : [])) });
}

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

describe('Icon button hydration', () => {
  const apps: ApplicationRef[] = [];
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('matches the first client render, logs no hydration problem, then a click reaches the handler', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();
    document.body.innerHTML = '';

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

    expect(logs.some(([message]) => String(message).startsWith('Angular hydrated'))).toBe(true);
    expect(problems).toEqual([]);
    expect(normalized(must(document.querySelector('app-root')))).toBe(first);
    expect(first).toContain('data-icon="plus"');

    must(document.querySelector<HTMLElement>('button[aria-label="Add"]')).click();
    await app.whenStable();
    expect(must(document.querySelector('output')).textContent).toBe('1');
  });
});

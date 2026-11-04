import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  destroyPlatform,
  inject,
  provideZonelessChangeDetection,
  viewChild,
  type ApplicationRef,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPortal } from '../src/index';

@Component({
  selector: 'app-root',
  providers: [CckPortal],
  template: `<button #trigger>Open</button><ng-template #content><p class="portaled">content</p></ng-template>`,
})
class Root {
  private readonly portal = inject(CckPortal);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly template = viewChild('content', { read: TemplateRef });

  constructor() {
    this.portal.useContainer(inject(ViewContainerRef));
    afterRenderEffect({
      write: () => {
        const template = this.template();
        if (template) this.portal.attach(template, undefined, this.trigger().nativeElement);
      },
    });
  }
}

const PAGE = '<html><head></head><body><app-root></app-root></body></html>';

/** Renders on the server; the dev-mode renderer needs `ngDevMode` off and the DOM globals restored. */
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
          { providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()] },
          context,
        ),
      { document: PAGE },
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

function bootstrapOnClient(hydrate: boolean): Promise<ApplicationRef> {
  destroyPlatform();
  return bootstrapApplication(Root, {
    providers: [provideZonelessChangeDetection(), ...(hydrate ? [provideClientHydration()] : [])],
  });
}

/** Markup without the hydration bookkeeping Angular adds. */
function normalized(root: Element): string {
  return root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');
}

function must<T>(value: T | null): T {
  if (value === null) throw new Error('expected a value');
  return value;
}

describe('CckPortal hydration', () => {
  const apps: ApplicationRef[] = [];

  beforeEach(() => {
    HTMLElement.prototype.showPopover = vi.fn();
  });

  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('hydrates an open portal without a mismatch and renders the content into the host', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const reference = await bootstrapOnClient(false);
    await reference.whenStable();
    const first = normalized(must(document.querySelector('app-root')));
    reference.destroy();

    const html = await renderOnServer();
    document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    const problems: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => problems.push(args));
    vi.spyOn(console, 'warn').mockImplementation((...args) => problems.push(args));
    const logs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args));

    const app = await bootstrapOnClient(true);
    apps.push(app);
    await app.whenStable();

    const root = must(document.querySelector('app-root'));
    expect(logs.some(([m]) => String(m).startsWith('Angular hydrated'))).toBe(true);
    expect(problems).toEqual([]);
    expect(normalized(root)).toBe(first);
    const host = document.querySelector('[popover="manual"]');
    expect(host?.querySelector('.portaled')?.textContent).toBe('content');
    expect(root.contains(host)).toBe(false);
  });
});

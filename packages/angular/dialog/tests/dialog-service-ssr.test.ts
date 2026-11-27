// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('CckDialog on the server', () => {
  it('has no window, and importing the entry point touches no DOM', async () => {
    expect(typeof window).toBe('undefined');
    const entry = await import('../index');
    expect(typeof entry.CckDialog).toBe('function');
    expect(typeof entry.CCK_DIALOG_DATA).toBe('object');
  }, 30_000);
});

describe('CckDialog.open on the server', () => {
  it('renders nothing and returns a ref that is already finished', async () => {
    const { Component, destroyPlatform, inject, provideZonelessChangeDetection } = await import('@angular/core');
    const { bootstrapApplication } = await import('@angular/platform-browser');
    const { provideServerRendering, renderApplication } = await import('@angular/platform-server');
    const { CckDialog } = await import('../index');

    const seen: string[] = [];

    @Component({
      selector: 'app-root',
      template: `<p>{{ state }}</p>`,
    })
    class Root {
      protected readonly state: string;

      constructor() {
        const service = inject(CckDialog);
        const ref = service.open(Root);
        ref.afterClosed().subscribe((value) => seen.push(`closed:${String(value)}`));
        ref.afterOpened().subscribe({ complete: () => seen.push('opened:complete') });
        this.state = `${ref.getState()}:${String(service.openDialogs.length)}`;
      }
    }

    destroyPlatform();
    const flags = globalThis as { ngDevMode?: unknown };
    const devMode = flags.ngDevMode;
    flags.ngDevMode = false;
    let html: string;
    try {
      html = await renderApplication(
        (context) =>
          bootstrapApplication(
            Root,
            { providers: [provideZonelessChangeDetection(), provideServerRendering()] },
            context,
          ),
        { document: '<html><head></head><body><app-root></app-root></body></html>' },
      );
    } finally {
      flags.ngDevMode = devMode;
    }
    expect(html).toContain('<p>closed:0</p>');
    expect(html).not.toContain('<dialog');
    expect(seen).toEqual(['closed:undefined', 'opened:complete']);
  }, 30_000);
});

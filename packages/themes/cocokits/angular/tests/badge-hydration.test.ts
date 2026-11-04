import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckBadgeTheme } from '../src/index';

@Component({
  selector: 'app-root',
  imports: [CckBadgeImports, CckBadgeTheme],
  template: `
    <span cckBadge id="b" content="120" [max]="max" color="danger" size="lg"></span>
    <span cckBadge id="d"></span>
  `,
})
class Root {
  readonly max = 99;
}

/** The server markup without the hydration bookkeeping (`ngh` attributes and `ngetn` comments). */
const withoutHydrationMarks = (html: string | undefined): string | undefined =>
  html?.replace(/ ngh="[^"]*"/g, '').replace(/<!--ngetn-->/g, '');

const providers = [provideCckTheme(cocokitsThemeConfig)];

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme Badge hydration', () => {
  it('keeps the server markup and logs no error', async () => {
    const server = await renderApplication(
      (context) =>
        bootstrapApplication(
          Root,
          { providers: [provideServerRendering(), provideClientHydration(), ...providers] },
          context,
        ),
      { document: '<html><body><app-root></app-root></body></html>' },
    );
    destroyPlatform();

    // The server platform sets `ngServerMode`; the client render runs in the browser (jsdom).
    (globalThis as { ngServerMode?: boolean }).ngServerMode = false;
    const html = new DOMParser().parseFromString(server, 'text/html');
    document.body.innerHTML = html.body.innerHTML;

    const badge = document.getElementById('b');
    const dot = document.getElementById('d');
    const before = [badge?.outerHTML, dot?.outerHTML].map(withoutHydrationMarks);
    const logged: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
    }

    const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
    await app.injector.get(ApplicationRef).whenStable();

    expect(document.getElementById('b')).toBe(badge);
    expect([badge?.outerHTML, dot?.outerHTML].map(withoutHydrationMarks)).toEqual(before);
    expect(badge?.getAttribute('data-size')).toBe('lg');
    expect(logged).toEqual([]);
    app.destroy();
  });
});

import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTagImports } from '@cocokits/angular/tag';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckTagTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckTagImports, CckTagTheme],
  template: `
    <cck-tag id="t" variant="outline" color="danger" [size]="size" dot>Failed</cck-tag>
    <cck-tag id="d">Draft</cck-tag>
  `,
})
class Root {
  readonly size = 'lg';
}

/** The server markup without the hydration bookkeeping (`ngh` attributes and `ngetn` comments). */
const withoutHydrationMarks = (html: string | undefined): string | undefined =>
  html?.replace(/ ngh="[^"]*"/g, '').replace(/<!--ngetn-->/g, '');

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme Tag hydration', () => {
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

    const tag = document.getElementById('t');
    const plain = document.getElementById('d');
    const before = [tag?.outerHTML, plain?.outerHTML].map(withoutHydrationMarks);
    const logged: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
    }

    const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
    await app.injector.get(ApplicationRef).whenStable();

    expect(document.getElementById('t')).toBe(tag);
    expect([tag?.outerHTML, plain?.outerHTML].map(withoutHydrationMarks)).toEqual(before);
    expect(tag?.getAttribute('data-dot')).toBe('');
    expect(tag?.getAttribute('data-size')).toBe('lg');
    expect(plain?.getAttribute('data-variant')).toBe('soft');
    expect(logged).toEqual([]);
    app.destroy();
  });
});

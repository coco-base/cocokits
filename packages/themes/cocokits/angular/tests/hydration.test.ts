import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckButton, CckButtonAnchor } from '@cocokits/angular/button';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckButtonTheme } from '../src/index';
import { providers } from './helpers';

let clicks = 0;

@Component({
  selector: 'app-root',
  imports: [CckButton, CckButtonAnchor, CckButtonTheme],
  template: `
    <button cckButton id="b" variant="light" color="danger" (click)="clicks = clicks + 1">Save</button>
    <a cckButton id="a" href="/x" disabled (click)="clicks = clicks + 1">Go</a>
  `,
})
class Root {
  get clicks(): number {
    return clicks;
  }
  set clicks(value: number) {
    clicks = value;
  }
}

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('hydration', () => {
  it('keeps the server markup, logs no error and still works after hydrating', async () => {
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

    const button = document.getElementById('b');
    const link = document.getElementById('a');
    const before = [button?.outerHTML, link?.outerHTML];
    const logged: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
    }

    const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
    await app.injector.get(ApplicationRef).whenStable();

    // Hydration reused the server nodes, and the first client render matches the server markup.
    expect(document.getElementById('b')).toBe(button);
    expect([button?.outerHTML, link?.outerHTML]).toEqual(before);
    expect(logged).toEqual([]);

    button?.click();
    expect(clicks).toBe(1);
    // The capture-phase guard stops the consumer listener on the disabled link.
    link?.click();
    expect(clicks).toBe(1);
    app.destroy();
  });
});

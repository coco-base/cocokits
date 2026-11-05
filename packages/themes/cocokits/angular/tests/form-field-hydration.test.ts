import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckFormFieldTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckFormField, CckFormFieldTheme, CckInput],
  template: `
    <div cckFormField [size]="large" id="a"><input cckInput aria-label="Email" /></div>
    <div cckFormField id="b"><input cckInput aria-label="Email" /></div>
  `,
})
class Root {
  protected readonly large = 'lg';
}

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme FormField hydration', () => {
  it('keeps the server markup, logs no error and keeps data-size on both parts', async () => {
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

    (globalThis as { ngServerMode?: boolean }).ngServerMode = false;
    const html = new DOMParser().parseFromString(server, 'text/html');
    document.body.innerHTML = html.body.innerHTML;
    const first = document.getElementById('a');
    const strip = (markup: string): string => markup.replace(/ ngh="\d+"/g, '');
    const before = strip(document.body.innerHTML);
    const logged: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
    }

    const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
    await app.injector.get(ApplicationRef).whenStable();

    expect(document.getElementById('a')).toBe(first);
    expect(strip(document.body.innerHTML)).toBe(before);
    expect(logged).toEqual([]);
    expect([...document.querySelectorAll('[data-size]')].map((el) => el.getAttribute('data-size'))).toEqual([
      'lg',
      'lg',
      'md',
      'md',
    ]);
    app.destroy();
  });
});

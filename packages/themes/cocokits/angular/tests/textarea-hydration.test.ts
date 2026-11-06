import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFieldError } from '@cocokits/angular/field-error';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckPrefix } from '@cocokits/angular/prefix';
import { CckTextarea } from '@cocokits/angular/textarea';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckTextareaTheme } from '../src/index';
import { providers, strip } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckFormField, CckTextarea, CckTextareaTheme, CckPrefix, CckFieldError],
  template: `<div cckFormField id="a">
      <span cckPrefix>P</span><textarea cckTextarea aria-label="Message" autoResize></textarea>
      <div cckFieldError>Enter a message.</div>
    </div>
    <textarea cckTextarea aria-label="Plain" [rows]="rows"></textarea>`,
})
class Root {
  protected readonly rows = 2;
}

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme Textarea hydration', () => {
  it('keeps the server markup, logs no error and keeps data-auto-resize', async () => {
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
    expect(document.querySelectorAll('[data-auto-resize]')).toHaveLength(1);
    expect(document.querySelector('.cck-field-error')?.matches(':empty')).toBe(true);
    app.destroy();
  });
});

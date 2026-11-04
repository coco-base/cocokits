import { ApplicationRef, Component, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckCheckbox } from '@cocokits/angular/checkbox';
import { CckRadio } from '@cocokits/angular/radio';
import { CckSwitch } from '@cocokits/angular/switch';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxTheme, CckRadioTheme, CckSwitchTheme } from '../src/index';

@Component({
  selector: 'app-root',
  imports: [CckCheckbox, CckCheckboxTheme, CckSwitch, CckSwitchTheme, CckRadio, CckRadioTheme],
  template: `<div cckCheckbox id="c" [checked]="on" size="sm" color="success">Accept</div>
    <div cckSwitch id="s" labelPosition="before">Alerts</div>
    <div cckRadio id="r1" name="plan" [checked]="on">A</div>
    <div cckRadio id="r2" name="plan" size="lg">B</div>`,
})
class Root {
  protected readonly on = true;
}

const providers = [provideCckTheme(cocokitsThemeConfig)];

afterEach(() => {
  destroyPlatform();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme choice controls hydration', () => {
  it('keeps the server markup, logs no error and keeps the options', async () => {
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
    const first = document.querySelector('.cck-checkbox');
    const strip = (markup: string): string => markup.replace(/ ngh="\d+"/g, '');
    const before = strip(document.body.innerHTML);
    const logged: unknown[][] = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
    }

    const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
    await app.injector.get(ApplicationRef).whenStable();

    expect(document.querySelector('.cck-checkbox')).toBe(first);
    expect(strip(document.body.innerHTML)).toBe(before);
    expect(logged).toEqual([]);
    expect(document.querySelectorAll('[data-size]')).toHaveLength(4);
    expect(document.querySelector('.cck-checkbox')?.hasAttribute('data-checked')).toBe(true);
    // Still interactive: one click on the Switch input turns it on.
    document.querySelector<HTMLInputElement>('.cck-switch__input')?.click();
    await app.injector.get(ApplicationRef).whenStable();
    expect(document.querySelector('.cck-switch')?.hasAttribute('data-checked')).toBe(true);
    app.destroy();
  });
});

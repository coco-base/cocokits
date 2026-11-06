// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckCheckbox } from '@cocokits/angular/checkbox';
import { CckRadio } from '@cocokits/angular/radio';
import { CckSwitch } from '@cocokits/angular/switch';
import { describe, expect, it } from 'vitest';
import { CckCheckboxTheme, CckRadioTheme, CckSwitchTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckCheckbox, CckCheckboxTheme, CckSwitch, CckSwitchTheme, CckRadio, CckRadioTheme],
  template: `<div
      cckCheckbox
      id="c"
      [checked]="on"
      [indeterminate]="true"
      size="lg"
      color="danger"
      labelPosition="before"
    >
      Accept
    </div>
    <div cckSwitch id="s" [disabled]="true">Alerts</div>
    <div cckRadio id="r1" name="plan" [checked]="on">A</div>
    <div cckRadio id="r2" name="plan">B</div>`,
})
class Root {
  protected readonly on = true;
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );
const tags = (html: string, block: string): string[] =>
  [...html.matchAll(new RegExp(`<div[^>]*class="cck-${block}"[^>]*>`, 'g'))].map((match) => match[0]);

describe('theme choice controls on the server', () => {
  it('has no window access and renders the options and the checked mark of a Checkbox', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    const root = tags(html, 'checkbox')[0] ?? '';
    for (const part of [
      'cck-checkbox',
      'data-size="lg"',
      'data-cck-color="danger"',
      'data-label-position="before"',
      'data-checked=""',
      'data-indeterminate=""',
    ]) {
      expect(root).toContain(part);
    }
    expect(html).toMatch(/<input[^>]*checked=""/);
  });

  it('renders the Switch defaults, role and disabled fact', async () => {
    const html = await render(true);
    const root = tags(html, 'switch')[0] ?? '';
    expect(root).toContain('data-size="md"');
    expect(root).toContain('data-cck-color="brand"');
    expect(root).toContain('data-label-position="after"');
    expect(root).toContain('data-disabled=""');
    expect(html).toContain('role="switch"');
  });

  it('renders same-name Radios with the checked one marked', async () => {
    const html = await render(true);
    expect(tags(html, 'radio')[0] ?? '').toContain('data-checked=""');
    expect(tags(html, 'radio')[1] ?? '').not.toContain('data-checked');
    expect(tags(html, 'radio')[1] ?? '').toContain('data-size="md"');
  });

  it('renders no theme attribute without a theme', async () => {
    expect(await render(false)).not.toMatch(/data-(size|cck-color|label-position)=/);
  });
});

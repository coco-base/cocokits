// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { describe, expect, it } from 'vitest';
import { CckFormFieldTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckFormField, CckFormFieldTheme, CckInput],
  template: `
    <div cckFormField [size]="large"><input cckInput aria-label="Email" /></div>
    <div cckFormField><input cckInput aria-label="Email" /></div>
  `,
})
class Root {
  protected readonly large = 'lg';
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('theme FormField on the server', () => {
  it('renders data-size on the root and the input wrapper, lg and the default md, without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    expect(html.match(/data-size="lg"/g)).toHaveLength(2);
    expect(html.match(/data-size="md"/g)).toHaveLength(2);
    expect(html).toMatch(
      /<div[^>]*class="cck-form-field__input-wrapper"[^>]*data-size="lg"|<div[^>]*data-size="lg"[^>]*class="cck-form-field__input-wrapper"/,
    );
  });

  it('renders no data-size without a theme', async () => {
    expect(await render(false)).not.toContain('data-size');
  });
});

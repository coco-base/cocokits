// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckButton, CckButtonAnchor } from '@cocokits/angular/button';
import { describe, expect, it } from 'vitest';
import { CckButtonTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckButton, CckButtonAnchor, CckButtonTheme],
  template: `
    <button cckButton variant="outline" size="lg">Save</button>
    <a cckButton href="/x" disabled>Go</a>
  `,
})
class Root {}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('server render', () => {
  it('contains the class, type and theme data-* without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    expect(html).toMatch(
      /<button[^>]*class="cck-button"[^>]*type="button"|<button[^>]*type="button"[^>]*class="cck-button"/,
    );
    expect(html).toMatch(/<button[^>]*data-variant="outline"/);
    expect(html).toMatch(/<button[^>]*data-cck-color="brand"/);
    expect(html).toMatch(/<button[^>]*data-size="lg"/);
    expect(html).toMatch(/<a[^>]*data-variant="primary"[^>]*>|<a[^>]*data-size="md"[^>]*>/);
    expect(html).toMatch(/<a[^>]*aria-disabled="true"/);
  });

  it('renders no theme data-* without a theme', async () => {
    const html = await render(false);
    expect(html).not.toMatch(/data-variant|data-cck-color|data-size/);
  });
});

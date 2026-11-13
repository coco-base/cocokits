// @vitest-environment node
import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckIcons } from '@cocokits/angular-core';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { plusIcon } from '@cocokits/icons';
import { describe, expect, it } from 'vitest';
import { CckIconButtonImports } from '../index';

@Component({
  selector: 'app-root',
  imports: [CckIconButtonImports, CckSvgIconImports],
  template: `
    <button cckIconButton aria-label="Add"><cck-svg-icon iconName="plus" /></button>
    <button cckIconButton aria-label="Off" disabled><cck-svg-icon iconName="plus" /></button>
    <a cckIconButton href="#go" aria-label="Go" disabled><cck-svg-icon iconName="plus" /></a>
  `,
})
class Root {
  readonly root = true;
}

async function renderOnServer(): Promise<string> {
  destroyPlatform();
  const flags = globalThis as { ngDevMode?: unknown };
  const devMode = flags.ngDevMode;
  const globalsBefore = Object.getOwnPropertyDescriptors(globalThis);
  flags.ngDevMode = false;
  try {
    return await renderApplication(
      (context) =>
        bootstrapApplication(
          Root,
          {
            providers: [
              provideZonelessChangeDetection(),
              provideCckIcons({ icons: { plus: plusIcon } }),
              provideClientHydration(),
              provideServerRendering(),
            ],
          },
          context,
        ),
      { document: '<html><head></head><body><app-root></app-root></body></html>' },
    );
  } finally {
    flags.ngDevMode = devMode;
    for (const [name, before] of Object.entries(globalsBefore)) {
      if (Object.getOwnPropertyDescriptor(globalThis, name)?.value !== before.value) {
        Object.defineProperty(globalThis, name, before);
      }
    }
  }
}

describe('Icon button on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the class, type, the disabled markers and the icon in the markup', async () => {
    const html = await renderOnServer();

    const button = /<button[^>]*aria-label="Add"[^>]*>.*?<\/button>/.exec(html)?.[0] ?? '';
    expect(button).toContain('class="cck-icon-button"');
    expect(button).toContain('type="button"');
    expect(button).toContain('<path');
    expect(button).not.toContain('disabled');

    const off = /<button[^>]*aria-label="Off"[^>]*>/.exec(html)?.[0] ?? '';
    expect(off).toContain('disabled');
    expect(off).toContain('data-disabled=""');

    const link = /<a[^>]*aria-label="Go"[^>]*>/.exec(html)?.[0] ?? '';
    expect(link).toContain('class="cck-icon-button"');
    expect(link).toContain('aria-disabled="true"');
    expect(link).toContain('tabindex="-1"');
    expect(link).not.toContain('type=');
  });
});

// @vitest-environment node
import { Component, destroyPlatform, inject, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { checkIcon, searchIcon, type Icon } from '@cocokits/icons';
import { describe, expect, it } from 'vitest';
import { CckIconRegistry, provideCckIcons } from '../src/index';

@Component({ selector: 'app-root', template: `{{ search }}|{{ check }}` })
class Root {
  private readonly registry = inject(CckIconRegistry);
  protected readonly search = this.registry.has('search');
  protected readonly check = this.registry.get('check') !== undefined;
}

async function render(icons: Record<string, Icon>): Promise<string> {
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
          { providers: [provideZonelessChangeDetection(), provideServerRendering(), provideCckIcons({ icons })] },
          context,
        ),
      { document: '<html><head></head><body><app-root></app-root></body></html>' },
    );
  } finally {
    flags.ngDevMode = devMode;
    // The server renderer sets DOM globals; put them back so the next render starts clean.
    for (const [name, before] of Object.entries(globalsBefore)) {
      if (Object.getOwnPropertyDescriptor(globalThis, name)?.value !== before.value) {
        Object.defineProperty(globalThis, name, before);
      }
    }
  }
}

describe('the icon registry on the server', () => {
  it('has no window, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('keeps the icons of two renders in one process apart', async () => {
    const withSearch = await render({ search: searchIcon });
    const without = await render({ check: checkIcon });
    expect(withSearch).toContain('true|true');
    expect(without).toContain('false|true');
  });
});

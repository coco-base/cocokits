// @vitest-environment node
import { Component, destroyPlatform, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import { injectFormParticipation } from '../src/index';

const created: string[] = [];

@Component({
  selector: 'input[serverProbe]',
  template: '',
  host: {
    '[attr.data-fieldset-disabled]': 'participation.fieldsetDisabled()',
    '[attr.data-submitted]': 'participation.submitted()',
  },
})
class ServerProbe {
  readonly model = signal('model');
  readonly participation = injectFormParticipation({
    getValue: () => {
      created.push('getValue');
      return this.model();
    },
    onReset: () => {
      created.push('onReset');
    },
  });
}

@Component({
  selector: 'app-root',
  imports: [ServerProbe],
  template: `
    <form>
      <fieldset [attr.disabled]="off"><input serverProbe /></fieldset>
    </form>
  `,
})
class Root {
  protected readonly off = '';
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
          { providers: [provideZonelessChangeDetection(), provideServerRendering()] },
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

describe('injectFormParticipation on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the starting values and creates no cdk instance', async () => {
    const html = await renderOnServer();
    expect(html).toContain('data-fieldset-disabled="false"');
    expect(html).toContain('data-submitted="false"');
    expect(created).toEqual([]);
  });
});

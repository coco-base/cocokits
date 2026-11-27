// @vitest-environment node
import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  destroyPlatform,
  inject,
  provideZonelessChangeDetection,
  viewChild,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import { CckPortal } from '../src/index';

@Component({
  selector: 'app-root',
  providers: [CckPortal],
  template: `<button #trigger>Open</button><ng-template #content><p class="portaled">content</p></ng-template>`,
})
class Root {
  private readonly portal = inject(CckPortal);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly template = viewChild('content', { read: TemplateRef });

  constructor() {
    this.portal.useContainer(inject(ViewContainerRef));
    afterRenderEffect({
      write: () => {
        const template = this.template();
        if (template) this.portal.attach(template, undefined, this.trigger().nativeElement);
      },
    });
  }
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

describe('CckPortal on the server', () => {
  it('renders no overlay content, even when it would be open', async () => {
    const html = await renderOnServer();
    expect(html).toContain('Open');
    expect(html).not.toContain('portaled');
    expect(html).not.toContain('popover');
  });
});

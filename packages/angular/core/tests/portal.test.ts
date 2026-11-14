import {
  ApplicationRef,
  Component,
  Directive,
  ElementRef,
  InjectionToken,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeConfig } from '@cocokits/shared';
import { CckDir, CckPortal, provideCckTheme } from '../src/index';

const DECLARED = new InjectionToken<string>('DECLARED');

@Directive({ selector: '[declaredProvider]', providers: [{ provide: DECLARED, useValue: 'declaration-site' }] })
class DeclaredProvider {
  readonly marker = true;
}

@Component({ selector: 'portal-probe', template: '<i>{{ token }}</i>' })
class PortalProbe {
  readonly token = inject(DECLARED, { optional: true });
}

@Component({
  selector: 'portal-root',
  imports: [PortalProbe, DeclaredProvider],
  providers: [CckPortal],
  template: `
    <section id="parent">
      <button #trigger>Open</button>
      <div declaredProvider>
        <ng-template #content
          ><p id="content"><portal-probe /></p
        ></ng-template>
      </div>
    </section>
  `,
})
class PortalRoot {
  readonly open = input(false);
  private readonly portal = inject(CckPortal);
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly template = viewChild('content', { read: TemplateRef });

  constructor() {
    this.portal.useContainer(inject(ViewContainerRef));
    afterRenderEffect({
      write: () => {
        const [template, open] = [this.template(), this.open()];
        untracked(() => {
          if (open && template) this.portal.attach(template, undefined, this.trigger().nativeElement);
          else this.portal.detach();
        });
      },
    });
  }
}

@Component({
  selector: 'portal-host',
  imports: [PortalRoot, CckDir],
  template: `<div cckDir dir="rtl"><portal-root [open]="open()" /></div>`,
})
class PortalHost {
  readonly open = signal(false);
}

const theme: ThemeConfig = {
  name: 't',
  components: {},
  modeCollections: [
    { name: 'Page', attrName: 'page-mode', modes: [{ name: 'Dark', value: 'dark' }], defaultMode: 'Dark' },
    { name: 'Btn', attrName: 'btn-mode', componentName: 'button', modes: [], defaultMode: 'x' },
  ],
};

beforeEach(() => {
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':modal' && this.localName === 'dialog' && this.hasAttribute('data-modal');
  });
  HTMLElement.prototype.showPopover = vi.fn();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-page-mode');
  document.documentElement.removeAttribute('data-btn-mode');
});

async function render(
  withTheme = true,
): Promise<{ fixture: ReturnType<typeof TestBed.createComponent<PortalHost>>; el: HTMLElement }> {
  TestBed.configureTestingModule({ providers: withTheme ? [provideCckTheme(theme)] : [] });
  const fixture = TestBed.createComponent(PortalHost);
  document.body.append(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

async function open(fixture: { componentInstance: PortalHost; whenStable(): Promise<unknown> }): Promise<void> {
  fixture.componentInstance.open.set(true);
  await fixture.whenStable();
}

const hosts = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[popover]')];

describe('CckPortal', () => {
  it('renders nothing while closed', async () => {
    const { el } = await render();
    expect(hosts()).toHaveLength(0);
    expect(el.querySelector('#content')).toBeNull();
  });

  it('renders the content in the host, outside the trigger parent, and removes it on close', async () => {
    const { fixture, el } = await render();
    await open(fixture);
    const [host] = hosts();
    expect(host?.querySelector('#content')).not.toBeNull();
    expect(el.querySelector('#parent #content')).toBeNull();
    expect(host?.parentElement).toBe(document.body);

    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(hosts()).toHaveLength(0);
  });

  it('follows DI of the declaration site', async () => {
    const { fixture } = await render();
    await open(fixture);
    expect(hosts()[0]?.querySelector('i')?.textContent).toBe('declaration-site');
  });

  it('puts the host inside an open modal dialog that contains the trigger', async () => {
    const { fixture, el } = await render();
    const dialog = document.createElement('dialog');
    dialog.setAttribute('data-modal', '');
    document.body.append(dialog);
    dialog.append(el);
    await open(fixture);
    expect(hosts()[0]?.parentElement).toBe(dialog);
  });

  it('copies the page mode and the direction onto the host, not component modes', async () => {
    document.documentElement.setAttribute('data-page-mode', 'dark');
    document.documentElement.setAttribute('data-btn-mode', 'x');
    const { fixture } = await render();
    await open(fixture);
    const [host] = hosts();
    expect(host?.getAttribute('data-page-mode')).toBe('dark');
    expect(host?.hasAttribute('data-btn-mode')).toBe(false);
    expect(host?.getAttribute('dir')).toBe('rtl');
  });

  it('copies no mode without a theme', async () => {
    document.documentElement.setAttribute('data-page-mode', 'dark');
    const { fixture } = await render(false);
    await open(fixture);
    expect(hosts()[0]?.hasAttribute('data-page-mode')).toBe(false);
  });

  it('removes the host when the component is destroyed', async () => {
    const { fixture } = await render();
    await open(fixture);
    fixture.destroy();
    expect(hosts()).toHaveLength(0);
  });

  it('joins the change-detection tree of the declaration instead of adding a root view', async () => {
    const { fixture } = await render();
    const appRef = TestBed.inject(ApplicationRef);
    const before = appRef.viewCount;
    await open(fixture);
    expect(hosts()).toHaveLength(1);
    expect(appRef.viewCount).toBe(before);
  });
});

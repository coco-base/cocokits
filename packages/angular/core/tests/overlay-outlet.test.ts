import {
  Component,
  Directive,
  ElementRef,
  InjectionToken,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckOverlayLayer, createOverlayOutlet, injectOverlayHost, type OverlayOutlet } from '../src/index';
import { must } from './queries';

const DECLARED = new InjectionToken<string>('DECLARED');
const EXTRA = new InjectionToken<string>('EXTRA');

/** A root that a trigger applies: it owns its outlet, the trigger gives the template and the container. */
@Directive()
class TestRoot {
  readonly outlet: OverlayOutlet = createOverlayOutlet(TestRoot, this, [{ provide: EXTRA, useValue: 'extra' }]);
}

/** The roots by the id of their trigger. */
const roots = new Map<string, TestRoot>();

/** A theme directive that sits next to the trigger. */
@Directive({ selector: '[hostTheme]' })
class HostTheme {
  readonly name = 'host-theme';
}

@Directive({
  selector: 'button[testTriggerFor]',
  hostDirectives: [TestRoot],
})
class TestTrigger {
  readonly testTriggerFor = input.required<TemplateRef<unknown>>();
  readonly open = input(false);
  readonly root = inject(TestRoot);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    roots.set(element.id, this.root);
    const { portal, injector } = this.root.outlet;
    portal.useContainer(inject(ViewContainerRef));
    afterRenderEffect({
      write: () => {
        const [template, open] = [this.testTriggerFor(), this.open()];
        untracked(() => {
          if (open) portal.attach(template, undefined, element, { injector });
          else portal.detach();
        });
      },
    });
  }
}

/** A part in the content: it reports what it finds. */
@Component({
  selector: 'outlet-probe',
  template: '',
  host: { '[attr.data-found]': 'found' },
})
class OutletProbe {
  private readonly root = inject(TestRoot, { optional: true });
  private readonly layer = inject(CckOverlayLayer, { optional: true });
  private readonly extra = inject(EXTRA, { optional: true });
  private readonly declared = inject(DECLARED, { optional: true });
  private readonly theme = injectOverlayHost(HostTheme);
  readonly found = JSON.stringify({
    root: this.root !== null,
    ownLayer: this.root !== null && this.layer === this.root.outlet.layer,
    extra: this.extra,
    declared: this.declared,
    theme: this.theme?.name ?? null,
  });
}

@Directive({ selector: '[declaredProvider]', providers: [{ provide: DECLARED, useValue: 'declaration-site' }] })
class DeclaredProvider {
  readonly marker = true;
}

@Component({
  selector: 'outlet-host',
  imports: [TestTrigger, HostTheme, OutletProbe, DeclaredProvider],
  template: `
    <div declaredProvider>
      <button id="themed" hostTheme [testTriggerFor]="first" [open]="open">One</button>
      <ng-template #first><outlet-probe id="in-themed" /></ng-template>
      <button id="plain" [testTriggerFor]="second" [open]="open">Two</button>
      <ng-template #second>
        <outlet-probe id="in-plain" />
        <button id="nested" [testTriggerFor]="third" [open]="open">Three</button>
        <ng-template #third><outlet-probe id="in-nested" /></ng-template>
      </ng-template>
    </div>
    <outlet-probe id="outside" />
  `,
})
class OutletHost {
  readonly open = true;
}

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  roots.clear();
});

async function render(): Promise<ReturnType<typeof TestBed.createComponent<OutletHost>>> {
  const fixture = TestBed.createComponent(OutletHost);
  document.body.append(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  await fixture.whenStable();
  return fixture;
}

interface Found {
  readonly root: boolean;
  readonly ownLayer: boolean;
  readonly extra: string | null;
  readonly declared: string | null;
  readonly theme: string | null;
}

const found = (id: string): Found => JSON.parse(must(document.getElementById(id)?.getAttribute('data-found'))) as Found;

describe('createOverlayOutlet', () => {
  it('gives the content the root, its own layer and the extra providers', async () => {
    await render();
    expect(found('in-themed')).toMatchObject({ root: true, ownLayer: true, extra: 'extra' });
  });

  it('resolves every other token at the declaration', async () => {
    await render();
    expect(found('in-themed').declared).toBe('declaration-site');
    expect(found('in-nested').declared).toBe('declaration-site');
  });

  it('gives a nested overlay the layer of the overlay it is declared in as its parent layer', async () => {
    await render();
    const [themed, plain, nested] = ['themed', 'plain', 'nested'].map((id) => must(roots.get(id)).outlet);
    expect(themed?.parentLayer).toBeNull();
    expect(plain?.parentLayer).toBeNull();
    expect(nested?.parentLayer).toBe(plain?.layer);
  });
});

describe('injectOverlayHost', () => {
  it('finds a directive on the element of the root', async () => {
    await render();
    expect(found('in-themed').theme).toBe('host-theme');
  });

  it('gives null when the element has none, or outside an outlet', async () => {
    await render();
    expect(found('in-plain').theme).toBeNull();
    expect(found('in-nested').theme).toBeNull();
    expect(found('outside')).toMatchObject({ root: false, theme: null });
  });
});

import {
  ApplicationRef,
  Component,
  ElementRef,
  InjectionToken,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPortal } from '../src/index';

const LABEL = new InjectionToken<string>('LABEL');

@Component({ selector: 'div[portalCard]', template: '<b>{{ label }}</b>' })
class Card {
  readonly label = inject(LABEL, { optional: true }) ?? 'none';
}

@Component({ selector: 'section[portalOther]', template: 'other' })
class Other {
  readonly ready = true;
}

@Component({
  selector: 'portal-component-root',
  providers: [CckPortal],
  template: `<button #trigger>Open</button><ng-template #content><p id="template">template</p></ng-template>`,
})
class Root {
  readonly portal = inject(CckPortal);
  readonly injector = inject(Injector);
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly template = viewChild.required('content', { read: TemplateRef });
  readonly label = input('from-root');

  constructor() {
    this.portal.useContainer(inject(ViewContainerRef));
  }
}

const hosts = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[popover]')];

function create(): { root: Root; trigger: HTMLElement } {
  const fixture = TestBed.createComponent(Root);
  document.body.append(fixture.nativeElement as HTMLElement);
  fixture.detectChanges();
  return { root: fixture.componentInstance, trigger: fixture.componentInstance.trigger().nativeElement };
}

beforeEach(() => {
  vi.spyOn(Element.prototype, 'matches').mockImplementation(() => false);
  HTMLElement.prototype.showPopover = vi.fn();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('CckPortal.attachComponent', () => {
  it('renders the component into a host in the trigger container, with the given injector', () => {
    const { root, trigger } = create();
    const injector = Injector.create({ providers: [{ provide: LABEL, useValue: 'given' }], parent: root.injector });
    const ref = root.portal.attachComponent(Card, trigger, { injector });
    ref.changeDetectorRef.detectChanges();
    const [host] = hosts();
    expect(hosts()).toHaveLength(1);
    expect(host?.parentElement).toBe(document.body);
    expect(host?.querySelector('div')?.textContent).toBe('given');
    expect(root.portal.host).toBe(host);
  });

  it('replaces the previous attachment on a second call and destroys it on detach', () => {
    const { root, trigger } = create();
    const first = root.portal.attachComponent(Card, trigger);
    const destroyed = vi.fn();
    first.onDestroy(destroyed);
    root.portal.attachComponent(Other, trigger);
    expect(destroyed).toHaveBeenCalledTimes(1);
    expect(hosts()).toHaveLength(1);
    expect(hosts()[0]?.querySelector('section')).not.toBeNull();
    root.portal.detach();
    expect(hosts()).toHaveLength(0);
    root.portal.detach();
  });

  it('replaces a template with a component and the reverse', () => {
    const { root, trigger } = create();
    root.portal.attach(root.template(), undefined, trigger);
    expect(hosts()[0]?.querySelector('#template')).not.toBeNull();
    root.portal.attachComponent(Card, trigger);
    expect(hosts()).toHaveLength(1);
    expect(hosts()[0]?.querySelector('#template')).toBeNull();
    root.portal.attach(root.template(), undefined, trigger);
    expect(hosts()).toHaveLength(1);
    expect(hosts()[0]?.querySelector('div')).toBeNull();
  });

  it('joins the change-detection tree instead of adding a root view', () => {
    const { root, trigger } = create();
    const before = TestBed.inject(ApplicationRef).viewCount;
    root.portal.attachComponent(Card, trigger);
    expect(TestBed.inject(ApplicationRef).viewCount).toBe(before);
  });

  it('removes the host when the owner is destroyed', () => {
    const { root, trigger } = create();
    root.portal.attachComponent(Card, trigger);
    TestBed.resetTestingModule();
    expect(hosts()).toHaveLength(0);
  });

  it('needs a view container', () => {
    TestBed.configureTestingModule({ providers: [CckPortal] });
    const portal = TestBed.inject(CckPortal);
    expect(() => portal.attachComponent(Card, document.body)).toThrow(/useContainer/);
  });
});

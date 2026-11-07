// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ModeCollection } from '@cocokits/shared';
import { createPortalHost, resolveOverlayContainer } from '../index';

const showPopover = vi.fn();

beforeEach(() => {
  // jsdom has no top layer: emulate `:modal` (a dialog opened with showModal) and `showPopover`.
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':modal' && this.localName === 'dialog' && this.hasAttribute('data-modal');
  });
  showPopover.mockClear();
  HTMLElement.prototype.showPopover = showPopover;
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, 'fullscreenElement');
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-mode');
  document.documentElement.removeAttribute('dir');
});

function mount(markup: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = markup;
  document.body.append(wrapper);
  return wrapper;
}

function mountTrigger(markup = '<button id="t">t</button>'): HTMLElement {
  const trigger = mount(markup).querySelector<HTMLElement>('#t');
  if (!trigger) throw new Error('Missing trigger');
  return trigger;
}

/** A button inside the shadow tree of `#h`. */
function shadowButton(): { shadow: ShadowRoot; inner: HTMLElement } {
  const shadow = document.getElementById('h')?.attachShadow({ mode: 'open' });
  if (!shadow) throw new Error('Missing host');
  const inner = document.createElement('button');
  shadow.append(inner);
  return { shadow, inner };
}

/** Puts the element with this id into fullscreen for `document`; the afterEach hook takes it out. */
function fullscreen(id: string | null): Element | null {
  const element = id ? document.getElementById(id) : null;
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
  return element;
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('resolveOverlayContainer', () => {
  it('chooses the body by default', () => {
    expect(resolveOverlayContainer(mountTrigger())).toBe(document.body);
  });

  it('chooses the closest open modal dialog that contains the trigger', () => {
    const trigger = mountTrigger(
      '<dialog data-modal open id="outer"><dialog data-modal open id="inner"><button id="t">t</button></dialog></dialog>',
    );
    expect((resolveOverlayContainer(trigger) as Element).id).toBe('inner');
  });

  it('ignores a dialog that is not modal', () => {
    const trigger = mountTrigger('<dialog open><button id="t">t</button></dialog>');
    expect(resolveOverlayContainer(trigger)).toBe(document.body);
  });

  it('chooses the fullscreen element for any trigger, also one outside it', () => {
    const trigger = mountTrigger();
    mount('<section id="fs"></section>');
    const section = fullscreen('fs');
    expect(resolveOverlayContainer(trigger)).toBe(section);
  });

  it('chooses the fullscreen element before a modal dialog or a shadow root', () => {
    mount('<section id="fs"></section>');
    const section = fullscreen('fs');
    const trigger = mountTrigger('<dialog data-modal open><button id="t">t</button></dialog>');
    expect(resolveOverlayContainer(trigger)).toBe(section);
    mount('<div id="h"></div>');
    expect(resolveOverlayContainer(shadowButton().inner)).toBe(section);
  });

  it('chooses the shadow root of a trigger inside a shadow tree', () => {
    mount('<div id="h"></div>');
    const { shadow, inner } = shadowButton();
    expect(resolveOverlayContainer(inner)).toBe(shadow);
  });

  it('prefers a modal dialog that holds the shadow host over the shadow root', () => {
    mount('<dialog data-modal open id="d"><div id="h"></div></dialog>');
    const { inner } = shadowButton();
    expect((resolveOverlayContainer(inner) as Element).id).toBe('d');
  });
});

/** Page-wide mode collections with these attribute names. */
function collections(...attrNames: string[]): ModeCollection[] {
  return attrNames.map((attrName) => ({ name: attrName, attrName, modes: [], defaultMode: '' }));
}

describe('createPortalHost', () => {
  it('appends a shown popover host with no box to the container', () => {
    const trigger = mountTrigger();
    const host = createPortalHost({ getTrigger: () => trigger, getDirection: () => 'ltr' });
    expect(host.element.parentElement).toBe(document.body);
    expect(host.element.getAttribute('popover')).toBe('manual');
    expect(host.element.style.width).toBe('0px');
    expect(host.element.style.position).toBe('fixed');
    expect(showPopover).toHaveBeenCalledTimes(1);
    host.destroy();
  });

  it('registers nothing and leaves no host behind when showPopover throws', () => {
    const trigger = mountTrigger();
    const getDirection = vi.fn(() => 'ltr' as const);
    showPopover.mockImplementationOnce(() => {
      throw new Error('not allowed');
    });
    expect(() => createPortalHost({ getTrigger: () => trigger, getDirection })).toThrow('not allowed');
    expect(getDirection).not.toHaveBeenCalled();
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('goes inside the modal dialog of the trigger', () => {
    const trigger = mountTrigger('<dialog data-modal open><button id="t">t</button></dialog>');
    const host = createPortalHost({ getTrigger: () => trigger, getDirection: () => 'ltr' });
    expect(host.element.parentElement?.localName).toBe('dialog');
    host.destroy();
  });

  it('carries dir and resolves each mode per axis from the closest ancestor', () => {
    document.documentElement.setAttribute('data-mode', 'dark');
    const trigger = mountTrigger('<div data-density="compact"><button id="t">t</button></div>');
    const host = createPortalHost({
      getTrigger: () => trigger,
      modeCollections: collections('mode', 'density', 'contrast'),
      getDirection: () => 'rtl',
    });
    expect(host.element.getAttribute('dir')).toBe('rtl');
    expect(host.element.getAttribute('data-mode')).toBe('dark');
    expect(host.element.getAttribute('data-density')).toBe('compact');
    expect(host.element.hasAttribute('data-contrast')).toBe(false);
    host.destroy();
  });

  it('copies only the page-wide collections, not a component collection', () => {
    document.documentElement.setAttribute('data-mode', 'dark');
    document.documentElement.setAttribute('data-size', 'big');
    const trigger = mountTrigger('<button id="t">t</button>');
    const host = createPortalHost({
      getTrigger: () => trigger,
      modeCollections: [
        ...collections('mode', 'mode'),
        { name: 'size', attrName: 'size', componentName: 'button', modes: [], defaultMode: '' },
      ],
      getDirection: () => 'ltr',
    });
    expect(host.element.getAttribute('data-mode')).toBe('dark');
    expect(host.element.hasAttribute('data-size')).toBe(false);
    host.destroy();
  });

  it('prefers the nearer ancestor over the root', () => {
    document.documentElement.setAttribute('data-mode', 'dark');
    const trigger = mountTrigger('<div data-mode="light"><button id="t">t</button></div>');
    const host = createPortalHost({
      getTrigger: () => trigger,
      modeCollections: collections('mode'),
      getDirection: () => 'ltr',
    });
    expect(host.element.getAttribute('data-mode')).toBe('light');
    host.destroy();
  });

  it('follows a change of a mode attribute, then drops it when no ancestor has it', async () => {
    const trigger = mountTrigger('<div id="scope" data-mode="light"><button id="t">t</button></div>');
    const scope = document.getElementById('scope');
    const host = createPortalHost({
      getTrigger: () => trigger,
      modeCollections: collections('mode'),
      getDirection: () => 'ltr',
    });
    scope?.setAttribute('data-mode', 'dark');
    await flush();
    expect(host.element.getAttribute('data-mode')).toBe('dark');
    scope?.removeAttribute('data-mode');
    await flush();
    expect(host.element.hasAttribute('data-mode')).toBe(false);
    host.destroy();
  });

  it('re-reads the direction when dir changes', async () => {
    const trigger = mountTrigger();
    let direction: 'ltr' | 'rtl' = 'ltr';
    const host = createPortalHost({ getTrigger: () => trigger, getDirection: () => direction });
    direction = 'rtl';
    document.documentElement.setAttribute('dir', 'rtl');
    await flush();
    expect(host.element.getAttribute('dir')).toBe('rtl');
    host.destroy();
  });

  it('syncs every live host from one observer and stops with the last', async () => {
    const trigger = mountTrigger('<div id="scope" data-mode="light"><button id="t">t</button></div>');
    const options = {
      getTrigger: () => trigger,
      modeCollections: collections('mode'),
      getDirection: () => 'ltr' as const,
    };
    const first = createPortalHost(options);
    const second = createPortalHost(options);
    document.getElementById('scope')?.setAttribute('data-mode', 'dark');
    await flush();
    expect(first.element.getAttribute('data-mode')).toBe('dark');
    expect(second.element.getAttribute('data-mode')).toBe('dark');
    first.destroy();
    document.getElementById('scope')?.setAttribute('data-mode', 'light');
    await flush();
    expect(second.element.getAttribute('data-mode')).toBe('light');
    expect(first.element.getAttribute('data-mode')).toBe('dark');
    second.destroy();
    document.getElementById('scope')?.setAttribute('data-mode', 'dark');
    await flush();
    expect(second.element.getAttribute('data-mode')).toBe('light');
  });

  it('removes the host on destroy and ignores a second destroy', () => {
    const trigger = mountTrigger();
    const host = createPortalHost({ getTrigger: () => trigger, getDirection: () => 'ltr' });
    host.destroy();
    host.destroy();
    expect(host.element.isConnected).toBe(false);
  });

  it('throws without a trigger', () => {
    expect(() => createPortalHost({ getTrigger: () => null, getDirection: () => 'ltr' })).toThrow(/trigger/);
  });
});

describe('createPortalHost on a fullscreen change', () => {
  const create = (trigger: HTMLElement) => createPortalHost({ getTrigger: () => trigger, getDirection: () => 'ltr' });

  it.each(['fullscreenchange', 'webkitfullscreenchange'])(
    'moves an open host into the fullscreen element and shows it again on %s',
    (name) => {
      const trigger = mountTrigger('<section id="fs"></section><button id="t">t</button>');
      const host = create(trigger);
      expect(host.element.parentElement).toBe(document.body);
      showPopover.mockClear();
      const section = fullscreen('fs');
      document.dispatchEvent(new Event(name));
      expect(host.element.parentElement).toBe(section);
      expect(showPopover).toHaveBeenCalledTimes(1);
      fullscreen(null);
      document.dispatchEvent(new Event(name));
      expect(host.element.parentElement).toBe(document.body);
      host.destroy();
    },
  );

  it('creates a new host inside the fullscreen element', () => {
    const trigger = mountTrigger('<section id="fs"></section><button id="t">t</button>');
    const section = fullscreen('fs');
    const host = create(trigger);
    expect(host.element.parentElement).toBe(section);
    host.destroy();
  });

  it('shows hosts again in creation order, so a nested overlay stays above its parent', () => {
    const trigger = mountTrigger('<section id="fs"></section><button id="t">t</button>');
    const first = create(trigger);
    const second = create(trigger);
    const shown: HTMLElement[] = [];
    showPopover.mockImplementation(function (this: HTMLElement) {
      shown.push(this);
    });
    fullscreen('fs');
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(shown).toEqual([first.element, second.element]);
    first.destroy();
    second.destroy();
  });

  it('leaves a host that is already in the right container alone', () => {
    const trigger = mountTrigger();
    const host = create(trigger);
    showPopover.mockClear();
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(showPopover).not.toHaveBeenCalled();
    host.destroy();
  });

  it('puts focus back on the same element inside the moved host', () => {
    const trigger = mountTrigger('<section id="fs"></section><button id="t">t</button>');
    const host = create(trigger);
    const inner = document.createElement('button');
    host.element.append(inner);
    // jsdom does not focus inside an element with `popover` (it has no top layer).
    host.element.removeAttribute('popover');
    inner.focus();
    // Moving an open popover closes it and drops focus: emulate that in the append.
    const append = Object.getOwnPropertyDescriptor(Element.prototype, 'append')?.value as (
      this: Element,
      ...nodes: (Node | string)[]
    ) => void;
    vi.spyOn(Element.prototype, 'append').mockImplementation(function (this: Element, ...nodes: (Node | string)[]) {
      append.apply(this, nodes);
      (document.activeElement as HTMLElement | null)?.blur();
    });
    fullscreen('fs');
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(document.activeElement).toBe(inner);
    host.destroy();
  });

  it('listens once per document and removes the listeners with the last host', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const trigger = mountTrigger();
    const first = create(trigger);
    const second = create(trigger);
    const added = add.mock.calls.filter(([name]) => name.includes('fullscreenchange')).map(([name]) => name);
    expect(added.sort()).toEqual(['fullscreenchange', 'webkitfullscreenchange']);
    first.destroy();
    expect(remove.mock.calls.filter(([name]) => name.includes('fullscreenchange'))).toHaveLength(0);
    second.destroy();
    const removed = remove.mock.calls.filter(([name]) => name.includes('fullscreenchange')).map(([name]) => name);
    expect(removed.sort()).toEqual(['fullscreenchange', 'webkitfullscreenchange']);
  });
});

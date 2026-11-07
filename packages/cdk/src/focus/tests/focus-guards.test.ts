// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { connectFocusGuards } from '../index';
import { mount, must } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const MARKUP =
  '<button id="before">before</button><button id="t">t</button><button id="after">after</button>' +
  '<div id="c" role="dialog" aria-label="Popover"><span id="g1" tabindex="0"></span>' +
  '<button id="in1">one</button><button id="in2">two</button><span id="g2" tabindex="0"></span></div>';

function setup() {
  const view = mount(MARKUP);
  const guards = connectFocusGuards({
    getContent: () => view.byId('c'),
    getTrigger: () => view.byId('t'),
    getGuards: () => [view.byId('g1'), view.byId('g2')],
  });
  return { ...view, guards };
}

describe('connectFocusGuards', () => {
  it('sends Tab from the end guard to the element after the trigger', () => {
    const { byId } = setup();
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('sends Shift+Tab from the start guard to the trigger', () => {
    const { byId } = setup();
    byId('g1').focus();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('blurs when nothing follows the trigger outside the content', () => {
    const { byId } = mount(
      '<button id="t">t</button><div id="c"><button id="in">in</button><span id="g2" tabindex="0"></span></div>',
    );
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: () => byId('t'),
      getGuards: () => [null, byId('g2')],
    });
    byId('g2').focus();
    expect(document.activeElement).toBe(document.body);
  });

  it('ignores focus on other elements', () => {
    const { byId } = setup();
    byId('in2').focus();
    expect(document.activeElement).toBe(byId('in2'));
  });

  it('stops forwarding after destroy', () => {
    const { byId, guards } = setup();
    guards.destroy();
    guards.destroy();
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('g2'));
  });

  it('leaves axe clean for an open popover with its guards', async () => {
    setup();
    const results = await axe(document.body);
    expect(results.violations).toEqual([]);
  });
});

describe('connectFocusGuards in a modal dialog', () => {
  // jsdom has no top layer: a dialog with `data-modal` stands in for one opened with `showModal()`.
  const modal = (): void => {
    const real = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')?.value as (
      this: Element,
      selector: string,
    ) => boolean;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
      return real.call(this, selector);
    });
  };

  it('goes to the next tabbable inside the dialog, never to an element outside it', () => {
    modal();
    const { byId } = mount(
      '<button id="outside">outside</button><dialog data-modal open id="d"><button id="t">t</button><button id="next">next</button>' +
        '<div id="c"><button id="in">in</button><span id="g2" tabindex="0"></span></div></dialog><button id="after">after</button>',
    );
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: () => byId('t'),
      getGuards: () => [null, byId('g2')],
    });
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('next'));
  });

  it('wraps to the first tabbable of the dialog when nothing follows, and does not leave the dialog', () => {
    modal();
    const { byId } = mount(
      '<button id="outside">outside</button><dialog data-modal open id="d"><button id="first">first</button>' +
        '<button id="t">t</button><div id="c"><button id="in">in</button>' +
        '<span id="g2" tabindex="0"></span></div></dialog><button id="after">after</button>',
    );
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: () => byId('t'),
      getGuards: () => [null, byId('g2')],
    });
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('first'));
  });

  it('wraps to the trigger itself when it is the only tabbable of the dialog outside the content', () => {
    modal();
    const { byId } = mount(
      '<dialog data-modal open id="d"><button id="t">t</button><div id="c"><button id="in">in</button>' +
        '<span id="g2" tabindex="0"></span></div></dialog><button id="after">after</button>',
    );
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: () => byId('t'),
      getGuards: () => [null, byId('g2')],
    });
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('tries the next element when one does not take focus', () => {
    const { byId } = mount(
      '<button id="t">t</button><button id="stuck">stuck</button><button id="ok">ok</button>' +
        '<div id="c"><button id="in">in</button><span id="g2" tabindex="0"></span></div>',
    );
    Object.defineProperty(byId('stuck'), 'focus', { value: () => undefined });
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: () => byId('t'),
      getGuards: () => [null, byId('g2')],
    });
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('ok'));
  });
});

describe('connectFocusGuards across shadow roots', () => {
  function connect(byId: (id: string) => HTMLElement, trigger: () => HTMLElement): void {
    connectFocusGuards({
      getContent: () => byId('c'),
      getTrigger: trigger,
      getGuards: () => [null, byId('g2')],
    });
  }
  const content = '<div id="c"><button id="in">in</button><span id="g2" tabindex="0"></span></div>';

  it('goes to the next tabbable in the shadow root of the trigger', () => {
    const { byId } = mount('<div id="h"></div><button id="after">after</button>' + content);
    const shadow = byId('h').attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button id="t">t</button><button id="next">next</button>';
    connect(byId, () => must(shadow.getElementById('t')));
    byId('g2').focus();
    expect(shadow.activeElement?.id).toBe('next');
  });

  it('goes to the next tabbable after the host when the trigger is the last in its shadow root', () => {
    const { byId } = mount('<div id="h"></div><button id="after">after</button>' + content);
    const shadow = byId('h').attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button id="t">t</button>';
    connect(byId, () => must(shadow.getElementById('t')));
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('goes into another shadow root that follows the trigger', () => {
    const { byId } = mount('<button id="t">t</button><div id="h"></div>' + content);
    const shadow = byId('h').attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button id="s">s</button>';
    connect(byId, () => byId('t'));
    byId('g2').focus();
    expect(shadow.activeElement?.id).toBe('s');
  });
});

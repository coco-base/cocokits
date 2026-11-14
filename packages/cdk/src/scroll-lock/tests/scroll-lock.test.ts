// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { lockScroll } from '../index';

const root = (): HTMLElement => document.documentElement;

/** jsdom has no layout: the sizes the tests need are defined per element and removed after each test. */
const defined: [object, string][] = [];
function size(target: object, values: Record<string, number>): void {
  for (const [name, value] of Object.entries(values)) {
    Object.defineProperty(target, name, { configurable: true, value });
    defined.push([target, name]);
  }
}

/** A page that scrolls: the root is taller than the viewport and has a 15 px scrollbar. */
function scrollingPage(): void {
  size(root(), { scrollHeight: 2000, clientHeight: 800, clientWidth: 985 });
  size(window, { innerWidth: 1000 });
}

beforeEach(() => {
  size(root(), { scrollHeight: 0, clientHeight: 0, scrollWidth: 0, clientWidth: 0 });
  size(document.body, { scrollHeight: 0, clientHeight: 0, scrollWidth: 0, clientWidth: 0 });
});

afterEach(() => {
  for (const [target, name] of defined.splice(0)) Reflect.deleteProperty(target, name);
  root().removeAttribute('style');
  document.body.removeAttribute('style');
  root().removeAttribute('dir');
});

describe('lockScroll', () => {
  it('hides overflow and restores the previous inline values on unlock', () => {
    scrollingPage();
    root().style.overflow = 'scroll';
    const unlock = lockScroll(document);
    expect(root().style.overflow).toBe('hidden');
    unlock();
    expect(root().style.overflow).toBe('scroll');
  });

  it('pads the root by the scrollbar width and restores the padding', () => {
    scrollingPage();
    root().style.paddingRight = '4px';
    const unlock = lockScroll(document);
    expect(root().style.paddingRight).toBe('19px');
    unlock();
    expect(root().style.paddingRight).toBe('4px');
  });

  it('keeps the lock until the last of several locks is released', () => {
    scrollingPage();
    const first = lockScroll(document);
    const second = lockScroll(document);
    first();
    expect(root().style.overflow).toBe('hidden');
    second();
    expect(root().style.overflow).toBe('');
  });

  it('makes a second call of the same unlock do nothing', () => {
    scrollingPage();
    const first = lockScroll(document);
    const second = lockScroll(document);
    first();
    first();
    expect(root().style.overflow).toBe('hidden');
    second();
    expect(root().style.overflow).toBe('');
  });

  it('locks again after a full release', () => {
    scrollingPage();
    lockScroll(document)();
    const unlock = lockScroll(document);
    expect(root().style.overflow).toBe('hidden');
    unlock();
  });
});

describe('lockScroll when the page does not scroll', () => {
  it('changes nothing and writes no variable', () => {
    size(root(), { clientWidth: 985 });
    size(window, { innerWidth: 1000 });
    const unlock = lockScroll(document);
    expect(root().getAttribute('style')).toBeNull();
    expect(document.body.getAttribute('style')).toBeNull();
    unlock();
    expect(root().getAttribute('style')).toBeNull();
  });

  it('does not lock later either until the next first lock', () => {
    const first = lockScroll(document);
    scrollingPage();
    const second = lockScroll(document);
    expect(root().style.overflow).toBe('');
    first();
    second();
    const third = lockScroll(document);
    expect(root().style.overflow).toBe('hidden');
    third();
  });
});

describe('lockScroll and scrollbar-gutter', () => {
  it.each(['stable', 'stable both-edges'])('adds no padding with scrollbar-gutter: %s', (gutter) => {
    scrollingPage();
    root().style.setProperty('scrollbar-gutter', gutter);
    const unlock = lockScroll(document);
    expect(root().style.overflow).toBe('hidden');
    expect(root().style.paddingRight).toBe('');
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('');
    unlock();
  });
});

describe('lockScroll with a scrolling body', () => {
  /** The root has its own overflow (so the body keeps its own), the body scrolls with a 15 px scrollbar. */
  function scrollingBody(): void {
    root().style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.paddingRight = '2px';
    size(document.body, { scrollHeight: 2000, clientHeight: 800, offsetWidth: 1000, clientWidth: 985 });
    size(window, { innerWidth: 1000 });
    size(root(), { clientWidth: 1000 });
  }

  it('hides and pads the body, and restores it', () => {
    scrollingBody();
    const unlock = lockScroll(document);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('17px');
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('15px');
    unlock();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('2px');
    expect(root().style.overflowY).toBe('auto');
  });

  it('leaves the body alone when its overflow goes to the viewport', () => {
    scrollingPage();
    document.body.style.overflowY = 'auto';
    size(document.body, { scrollHeight: 2000, clientHeight: 800 });
    const unlock = lockScroll(document);
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
    unlock();
  });
});

describe('lockScroll and --scrollbar-width', () => {
  it('writes the padded width while locked and removes it after the last unlock', () => {
    scrollingPage();
    const first = lockScroll(document);
    const second = lockScroll(document);
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('15px');
    first();
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('15px');
    second();
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('');
  });

  it('does not write it at a scrollbar width of 0', () => {
    size(root(), { scrollHeight: 2000, clientHeight: 800, clientWidth: 1000 });
    size(window, { innerWidth: 1000 });
    const unlock = lockScroll(document);
    expect(root().style.overflow).toBe('hidden');
    expect(root().style.getPropertyValue('--scrollbar-width')).toBe('');
    unlock();
  });

  it('pads the right side in a right-to-left page', () => {
    scrollingPage();
    root().setAttribute('dir', 'rtl');
    const unlock = lockScroll(document);
    expect(root().style.paddingRight).toBe('15px');
    expect(root().style.paddingLeft).toBe('');
    unlock();
  });
});

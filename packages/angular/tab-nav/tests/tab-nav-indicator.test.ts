import { signal } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { CckTabNavImports } from '../index';

const imports = [...CckTabNavImports];
const { classes } = tabNavAnatomy;
const resizeCallbacks: (() => void)[] = [];
let offset = 0;

/** Lays the list at 10,5 and the links 100px wide side by side, so every box is known. */
function mockLayout(): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains(classes.list)) return new DOMRect(10, 5, 300, 40);
    if (this.classList.contains(classes.link)) {
      const index = [...(this.parentElement?.querySelectorAll(`.${classes.link}`) ?? [])].indexOf(this);
      return new DOMRect(10 + offset + index * 100, 5, 100, 40);
    }
    return new DOMRect(0, 0, 0, 0);
  });
}

class FakeResizeObserver {
  constructor(callback: () => void) {
    resizeCallbacks.push(callback);
  }
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
}

const indicator = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>(`.${classes.indicator}`);
  if (!element) throw new Error('no indicator');
  return element;
};
const variables = (): Record<string, string> =>
  Object.fromEntries(
    ['left', 'top', 'width', 'height'].map((name) => [
      name,
      indicator().style.getPropertyValue(`--active-tab-${name}`),
    ]),
  );

const TWO = `<nav cckTabNav aria-label="x">
  <a cckTabNavLink href="#a" [active]="current() === 'a'">A</a>
  <a cckTabNavLink href="#b" [active]="current() === 'b'">B</a>
</nav>`;

describe('TabNav indicator', () => {
  beforeEach(() => {
    resizeCallbacks.length = 0;
    offset = 0;
    mockLayout();
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, writable: true, value: FakeResizeObserver });
  });
  afterEach(() => {
    Reflect.deleteProperty(window, 'ResizeObserver');
    vi.restoreAllMocks();
  });

  it('writes the box of the active link on the one indicator after mount', async () => {
    const current = signal('a');
    await render(TWO, { imports, componentProperties: { current } });
    await waitFor(() => {
      expect(variables()).toEqual({ left: '0px', top: '0px', width: '100px', height: '40px' });
    });
    expect(document.querySelectorAll(`.${classes.indicator}`)).toHaveLength(1);
  });

  it('follows a change of the active link and a resize of the list', async () => {
    const current = signal('a');
    await render(TWO, { imports, componentProperties: { current } });
    await waitFor(() => {
      expect(variables().left).toBe('0px');
    });
    current.set('b');
    await waitFor(() => {
      expect(variables().left).toBe('100px');
    });
    offset = 20;
    expect(resizeCallbacks).not.toHaveLength(0);
    resizeCallbacks.forEach((callback) => {
      callback();
    });
    expect(variables().left).toBe('120px');
  });

  it('removes the variables when no link is active', async () => {
    const current = signal('a');
    await render(TWO, { imports, componentProperties: { current } });
    await waitFor(() => {
      expect(variables().width).toBe('100px');
    });
    current.set('none');
    await waitFor(() => {
      expect(variables().width).toBe('');
    });
  });
});

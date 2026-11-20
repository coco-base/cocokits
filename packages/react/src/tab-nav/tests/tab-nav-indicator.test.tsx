// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example } from './fixtures';

const resizeCallbacks: (() => void)[] = [];
let offset = 0;

/** Lays the list at 10,5 and the links 100px wide side by side, so every box is known. */
function mockLayout(): void {
  // jsdom has no layout: the list shows all three links.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('cck-tab-nav__list') ? 300 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('cck-tab-nav__list')) return new DOMRect(10, 5, 300, 40);
    if (this.classList.contains('cck-tab-nav__link')) {
      const index = [...(this.parentElement?.querySelectorAll('.cck-tab-nav__link') ?? [])].indexOf(this);
      return new DOMRect(10 + offset + index * 100, 5, 100, 40);
    }
    return new DOMRect(0, 0, 0, 0);
  });
}

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
  constructor(callback: () => void) {
    resizeCallbacks.push(callback);
  }
}

const indicator = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>('.cck-tab-nav__indicator');
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

beforeEach(() => {
  resizeCallbacks.length = 0;
  offset = 0;
  mockLayout();
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, writable: true, value: FakeResizeObserver });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, 'ResizeObserver');
  vi.restoreAllMocks();
});

describe('TabNav indicator', () => {
  it('writes the box of the active link on the one indicator after mount', async () => {
    render(<Example active="activity" />);
    await waitFor(() => {
      expect(variables()).toEqual({ left: '100px', top: '0px', width: '100px', height: '40px' });
    });
  });

  it('follows a change of the active link and a resize of the list', async () => {
    const { rerender } = render(<Example active="overview" />);
    await waitFor(() => {
      expect(variables().left).toBe('0px');
    });
    rerender(<Example active="settings" />);
    await waitFor(() => {
      expect(variables().left).toBe('200px');
    });
    offset = 20;
    expect(resizeCallbacks).not.toHaveLength(0);
    resizeCallbacks.forEach((callback) => {
      callback();
    });
    expect(variables().left).toBe('220px');
  });

  it('writes no variable when no link is active', async () => {
    const { rerender } = render(<Example active="overview" />);
    await waitFor(() => {
      expect(variables().left).toBe('0px');
    });
    rerender(<Example active="none" />);
    await waitFor(() => {
      expect(indicator().style.getPropertyValue('--active-tab-left')).toBe('');
    });
  });
});

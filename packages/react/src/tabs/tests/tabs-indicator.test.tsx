// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example } from './fixtures';

const resizeCallbacks: (() => void)[] = [];
let offset = 0;

/** Lays the list at 10,5 and the triggers 100px wide side by side, so every box is known. */
function mockLayout(): void {
  // jsdom has no layout: the list shows all three triggers, so selecting one scrolls nothing.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'tablist' ? 300 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tablist') return new DOMRect(10, 5, 300, 40);
    if (this.getAttribute('role') === 'tab') {
      const index = [...(this.parentElement?.querySelectorAll('[role="tab"]') ?? [])].indexOf(this);
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
  const element = document.querySelector<HTMLElement>('.cck-tabs__indicator');
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

describe('Tabs indicator', () => {
  it('writes the box of the selected trigger on the one indicator after mount', async () => {
    render(<Example defaultValue="password" />);
    await waitFor(() => {
      expect(variables()).toEqual({ left: '100px', top: '0px', width: '100px', height: '40px' });
    });
    expect(document.querySelectorAll('.cck-tabs__indicator')).toHaveLength(1);
  });

  it('follows a selection change and a resize of the list', async () => {
    render(<Example defaultValue="account" />);
    await waitFor(() => {
      expect(variables().left).toBe('0px');
    });
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
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
});

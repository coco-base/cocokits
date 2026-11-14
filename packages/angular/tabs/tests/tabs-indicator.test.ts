import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTabsImports } from '../index';

const imports = [...CckTabsImports];
const resizeCallbacks: (() => void)[] = [];
let offset = 0;

/** Lays the list at 10,5 and the triggers 100px wide side by side, so every box is known. */
function mockLayout(): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tablist') return new DOMRect(10, 5, 300, 40);
    if (this.getAttribute('role') === 'tab') {
      const index = [...(this.parentElement?.querySelectorAll('[role="tab"]') ?? [])].indexOf(this);
      return new DOMRect(10 + offset + index * 100, 5, 100, 40);
    }
    return new DOMRect(0, 0, 0, 0);
  });
  // The list is 300 by 40 and shows all of its content, so a selection scrolls nothing.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(40);
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

const TWO = `<cck-tabs aria-label="x">
  <cck-tab label="Account">a</cck-tab><cck-tab label="Password">b</cck-tab>
</cck-tabs>`;

describe('Tabs indicator', () => {
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

  it('writes the box of the selected trigger on the one indicator after mount', async () => {
    await render(TWO, { imports });
    await waitFor(() => {
      expect(variables()).toEqual({ left: '0px', top: '0px', width: '100px', height: '40px' });
    });
    expect(document.querySelectorAll('.cck-tabs__indicator')).toHaveLength(1);
  });

  it('follows a selection change and a resize of the list', async () => {
    const user = userEvent.setup();
    await render(TWO, { imports });
    await user.click(screen.getByRole('tab', { name: 'Password' }));
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

  it('removes the variables when no tab is selected', async () => {
    const tabs = signal(['a']);
    await render(
      `<cck-tabs aria-label="x">@for (name of tabs(); track name) { <cck-tab label="Account">a</cck-tab> }</cck-tabs>`,
      { imports, componentProperties: { tabs } },
    );
    await waitFor(() => {
      expect(variables().width).toBe('100px');
    });
    tabs.set([]);
    await waitFor(() => {
      expect(variables().width).toBe('');
    });
  });
});

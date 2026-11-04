import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTabsImports } from '../index';

const imports = [...CckTabsImports];
const TEMPLATE = `
  <div cckTabs aria-label="x" [(selectedIndex)]="index">
    <div cckTab label="A">a</div><div cckTab label="B">b</div><div cckTab label="C">c</div><div cckTab label="D">d</div>
  </div>`;
const list = (): HTMLElement => screen.getByRole('tablist');

/** A 300px list showing four 200px triggers: the list scrolls horizontally and the boxes follow its scroll offset. */
function mockLayout(): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('role') === 'tablist') return new DOMRect(10, 5, 300, 40);
    if (this.getAttribute('role') === 'tab') {
      const parent = this.parentElement;
      const index = [...(parent?.querySelectorAll('[role="tab"]') ?? [])].indexOf(this);
      return new DOMRect(10 + index * 200 - (parent?.scrollLeft ?? 0), 5, 200, 40);
    }
    return new DOMRect(0, 0, 0, 0);
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'tablist' ? 300 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(40);
}

describe('Tabs scroll into view', () => {
  beforeEach(mockLayout);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not scroll on the first render', async () => {
    const index = signal<number | null>(3);
    await render(TEMPLATE, { imports, componentProperties: { index } });
    expect(list().scrollLeft).toBe(0);
  });

  it('scrolls the list to a tab a key moves focus to', async () => {
    const user = userEvent.setup();
    const index = signal<number | null>(null);
    await render(TEMPLATE, { imports, componentProperties: { index } });
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    // The third trigger spans 400..600 of a 300 wide list: it ends 300 past the start of the list.
    expect(list().scrollLeft).toBeGreaterThan(0);
    const box = screen.getByRole('tab', { name: 'C' }).getBoundingClientRect();
    expect(box.right).toBeLessThanOrEqual(list().getBoundingClientRect().right);
  });

  it('scrolls the list to a tab the parent selects after the first render', async () => {
    const index = signal<number | null>(0);
    await render(TEMPLATE, { imports, componentProperties: { index } });
    index.set(3);
    await waitFor(() => {
      expect(list().scrollLeft).toBeGreaterThan(0);
    });
    const box = screen.getByRole('tab', { name: 'D' }).getBoundingClientRect();
    expect(box.right).toBeLessThanOrEqual(list().getBoundingClientRect().right);
  });
});

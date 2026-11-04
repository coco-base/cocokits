// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from '../index';
import { mountView, tabsView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const panels = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

/** Three tabs; `1` and `'1'` are different values. */
function numbers(root: Record<string, unknown> = {}): () => VNode {
  return () =>
    h(TabsRoot, root, () => [
      h(TabsList, { 'aria-label': 'Numbers' }, () => [
        h(TabsTrigger, { value: 1 }, () => 'One'),
        h(TabsTrigger, { value: '1' }, () => 'Text one'),
        h(TabsTrigger, { value: 2 }, () => 'Two'),
      ]),
      h(TabsContent, { value: 1 }, () => 'content 1'),
      h(TabsContent, { value: '1' }, () => 'content text 1'),
      h(TabsContent, { value: 2 }, () => 'content 2'),
    ]);
}

describe('TabsContent lazy content', () => {
  it('renders every panel element but the content of the selected one only', async () => {
    mountView(tabsView({ root: { modelValue: 'password' } }));
    await nextTick();
    expect(panels()).toHaveLength(3);
    expect(panels().map((panel) => panel.textContent)).toEqual(['', 'Password panel', '']);
    expect(panels().map((panel) => panel.hidden)).toEqual([true, false, true]);
  });

  it('adds the content of a tab when it is selected and removes it when it is deselected', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await userEvent.click(tab('Notifications'));
    expect(panels().map((panel) => panel.textContent)).toEqual(['', '', 'Notifications panel']);
    expect(tab('Notifications').getAttribute('aria-controls')).toBe(panels()[2]?.id);
  });

  it('keeps every panel content, hidden, with unmountOnHide set to false', async () => {
    mountView(tabsView({ root: { modelValue: 'account', unmountOnHide: false } }));
    await nextTick();
    expect(panels().map((panel) => panel.textContent)).toEqual([
      'Account panel',
      'Password panel',
      'Notifications panel',
    ]);
    expect(panels().map((panel) => panel.hidden)).toEqual([false, true, true]);
  });

  it('keeps the content of one panel with forceMount and leaves it hidden', async () => {
    mountView(() =>
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(TabsTrigger, { value: 'a' }, () => 'A'),
          h(TabsTrigger, { value: 'b' }, () => 'B'),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
        h(TabsContent, { value: 'b', forceMount: true }, () => 'b'),
      ]),
    );
    await nextTick();
    expect(panels().map((panel) => panel.textContent)).toEqual(['a', 'b']);
    expect(panels()[1]?.hidden).toBe(true);
  });

  it('with asChild gates the children of the child element', async () => {
    mountView(() =>
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(TabsTrigger, { value: 'a' }, () => 'A'),
          h(TabsTrigger, { value: 'b' }, () => 'B'),
        ]),
        h(TabsContent, { value: 'a', asChild: true }, () => h('section', 'a')),
        h(TabsContent, { value: 'b', asChild: true }, () => h('section', 'b')),
      ]),
    );
    await nextTick();
    expect(panels().map((panel) => [panel.tagName, panel.textContent])).toEqual([
      ['SECTION', 'a'],
      ['SECTION', ''],
    ]);
  });
});

describe('Tabs number values', () => {
  it('selects a number tab and tells 1 from "1"', async () => {
    mountView(numbers({ modelValue: 1 }));
    await nextTick();
    expect(tab('One').getAttribute('aria-selected')).toBe('true');
    expect(tab('Text one').getAttribute('aria-selected')).toBe('false');
    expect(tab('One').id).not.toBe(tab('Text one').id);
    expect(tab('One').getAttribute('aria-controls')).not.toBe(tab('Text one').getAttribute('aria-controls'));
    expect(panels().map((panel) => panel.textContent)).toEqual(['content 1', '', '']);
  });

  it('emits the number value of the clicked tab', async () => {
    const update = vi.fn();
    mountView(numbers({ defaultValue: 1, 'onUpdate:modelValue': update }));
    await userEvent.click(tab('Two'));
    expect(update).toHaveBeenCalledWith(2);
    expect(panels().map((panel) => panel.textContent)).toEqual(['', '', 'content 2']);
  });
});

describe('Tabs keys', () => {
  it('wraps from the last tab to the first by default', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    tab('Account').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Notifications'));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('stops at the ends with loop set to false', async () => {
    mountView(tabsView({ root: { modelValue: 'account' }, list: { loop: false } }));
    await nextTick();
    tab('Account').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Account'));
    await userEvent.keyboard('{End}{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
    expect(tab('Notifications').getAttribute('aria-selected')).toBe('true');
  });

  it('moves focus without selecting in manual mode, then Enter selects', async () => {
    mountView(tabsView({ root: { modelValue: 'account', activationMode: 'manual' } }));
    await nextTick();
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(tab('Account').getAttribute('aria-selected')).toBe('true');
    await userEvent.keyboard('{Enter}');
    expect(tab('Password').getAttribute('aria-selected')).toBe('true');
  });

  it('flips the horizontal arrows in right-to-left and not Home and End', async () => {
    mountView(tabsView({ root: { modelValue: 'account', dir: 'rtl' } }));
    await nextTick();
    tab('Account').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Password'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('Account'));
  });
});

describe('TabsIndicator', () => {
  it('renders a span as a direct child of the list and none when it is left out', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    const indicator = document.querySelector('.cck-tabs__indicator');
    expect(indicator?.tagName).toBe('SPAN');
    expect(indicator?.parentElement).toBe(screen.getByRole('tablist'));
    cleanup();
    mountView(tabsView({ root: { modelValue: 'account' }, indicator: false }));
    await nextTick();
    expect(document.querySelector('.cck-tabs__indicator')).toBeNull();
  });

  it('renders the tag given with as and keeps aria-hidden', async () => {
    mountView(() =>
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(TabsTrigger, { value: 'a' }, () => 'A'),
          h(TabsIndicator, { as: 'i' }),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
      ]),
    );
    await nextTick();
    const indicator = document.querySelector('.cck-tabs__indicator');
    expect(indicator?.tagName).toBe('I');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Tabs scroll into view', () => {
  it('scrolls only the list when a keyboard move reaches a tab outside it', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    const list = screen.getByRole('tablist');
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this === list ? 150 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this === list) return new DOMRect(0, 0, 150, 40);
      if (this.getAttribute('role') === 'tab') {
        const index = [...list.querySelectorAll('[role="tab"]')].indexOf(this);
        return new DOMRect(index * 100 - list.scrollLeft, 0, 100, 40);
      }
      return new DOMRect(0, 0, 0, 0);
    });
    const page = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(list.scrollLeft).toBe(150);
    expect(page).not.toHaveBeenCalled();
  });
});

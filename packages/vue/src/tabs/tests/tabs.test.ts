// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from '../index';
import { mountView, tabsView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });
const panelOf = (name: string): HTMLElement => {
  const element = document.getElementById(tab(name).getAttribute('aria-controls') ?? '');
  if (!element) throw new Error(`no panel for ${name}`);
  return element;
};
const selectedTabs = (): (string | null)[] =>
  screen
    .getAllByRole('tab')
    .flatMap((element) => (element.getAttribute('aria-selected') === 'true' ? [element.textContent] : []));

describe('Tabs rendered contract', () => {
  it('renders the list, a trigger per tab with a label, the one indicator and a panel per tab with the fixed classes', async () => {
    const { container } = mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    const root = container.querySelector('.cck-tabs');
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-orientation')).toBe('horizontal');
    const list = screen.getByRole('tablist', { name: 'Account settings' });
    expect(list.className).toBe('cck-tabs__list');
    expect(list.getAttribute('aria-orientation')).toBeNull();
    expect(list.children).toHaveLength(4);
    expect(list.lastElementChild?.className).toBe('cck-tabs__indicator');
    expect(list.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
    expect(list.lastElementChild?.tagName).toBe('SPAN');
    for (const name of ['Account', 'Password', 'Notifications']) {
      expect(tab(name).tagName).toBe('BUTTON');
      expect(tab(name).className).toBe('cck-tabs__trigger');
      expect(tab(name).getAttribute('type')).toBe('button');
      const label = tab(name).querySelector('.cck-tabs__trigger-label');
      expect(label?.tagName).toBe('SPAN');
      expect(label?.textContent).toBe(name);
    }
    expect(container.querySelectorAll('.cck-tabs__panel')).toHaveLength(3);
  });

  it('links trigger and panel, selects the bound value and hides the other panels', async () => {
    mountView(tabsView({ root: { modelValue: 'password' } }));
    await nextTick();
    expect(selectedTabs()).toEqual(['Password']);
    expect(tab('Password').hasAttribute('data-selected')).toBe(true);
    expect(tab('Account').hasAttribute('data-selected')).toBe(false);
    const panel = panelOf('Password');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab('Password').id);
    expect(panel.getAttribute('tabindex')).toBe('0');
    expect(panel.hidden).toBe(false);
    expect(panel.hasAttribute('data-selected')).toBe(true);
    expect(panelOf('Account').hidden).toBe(true);
    expect(panelOf('Account').hasAttribute('data-selected')).toBe(false);
    expect(tab('Password').tabIndex).toBe(0);
    expect(tab('Account').tabIndex).toBe(-1);
  });

  it('selects the first enabled tab after the triggers have mounted when no value is given', async () => {
    mountView(tabsView({ lockPassword: true }));
    await nextTick();
    expect(selectedTabs()).toEqual(['Account']);
    expect(tab('Account').tabIndex).toBe(0);
  });

  it('marks the vertical orientation on the root, the list, the triggers and the panels', async () => {
    const { container } = mountView(tabsView({ root: { modelValue: 'account', orientation: 'vertical' } }));
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.getAttribute('data-orientation')).toBe('vertical');
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
    expect(screen.getByRole('tablist').getAttribute('data-orientation')).toBe('vertical');
    expect(tab('Account').getAttribute('data-orientation')).toBe('vertical');
    expect(panelOf('Account').getAttribute('data-orientation')).toBe('vertical');
  });

  it('marks a disabled tab natively and with data-disabled, and keeps it visible', async () => {
    mountView(tabsView({ root: { modelValue: 'account' }, lockPassword: true }));
    await nextTick();
    expect((tab('Password') as HTMLButtonElement).disabled).toBe(true);
    expect(tab('Password').hasAttribute('data-disabled')).toBe(true);
    expect(tab('Account').hasAttribute('data-disabled')).toBe(false);
  });

  it('forwards aria-labelledby to the list and keeps the machine attributes out of reach', async () => {
    mountView(() => [
      h('h2', { id: 'title' }, 'Settings'),
      h(TabsRoot, { modelValue: 'a', class: 'mine' }, () => [
        h(TabsList, { 'aria-labelledby': 'title' }, () => [
          h(TabsTrigger, { value: 'a', id: 'custom', 'data-x': '1' }, () => 'A'),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
      ]),
    ]);
    await nextTick();
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeTruthy();
    expect([...(document.querySelector('.cck-tabs')?.classList ?? [])].sort()).toEqual(['cck-tabs', 'mine']);
    expect(tab('A').id).not.toBe('custom');
    expect(tab('A').getAttribute('data-x')).toBe('1');
  });

  it('merges onto its child with asChild', async () => {
    mountView(() => [
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x', asChild: true }, () => h('section')),
        h(TabsIndicator),
        h(TabsContent, { value: 'a', asChild: true }, () => h('article', 'a')),
        h(TabsTrigger, { value: 'a', asChild: true }, () => h('a', { href: '#a' }, 'A')),
      ]),
    ]);
    await nextTick();
    expect(screen.getByRole('tablist').tagName).toBe('SECTION');
    expect(screen.getByRole('tabpanel').tagName).toBe('ARTICLE');
    expect(screen.getByRole('tab').tagName).toBe('A');
    expect(screen.getByRole('tab').querySelector('.cck-tabs__trigger-label')?.textContent).toBe('A');
  });

  it('throws a clear error when a part is used outside the root', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(TabsTrigger, { value: 'a' }, () => 'A'))).toThrow(
      'CocoKits: <TabsTrigger> must be used inside <TabsRoot>.',
    );
  });
});

describe('Tabs value', () => {
  it('is uncontrolled: a click selects and emits update:modelValue', async () => {
    const onValueChange = vi.fn();
    mountView(tabsView({ root: { 'onUpdate:modelValue': onValueChange } }));
    await nextTick();
    await userEvent.click(tab('Password'));
    expect(selectedTabs()).toEqual(['Password']);
    expect(panelOf('Password').hidden).toBe(false);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('password');
  });

  it('reports nothing for a click on the selected tab or a disabled tab', async () => {
    const onValueChange = vi.fn();
    mountView(tabsView({ root: { modelValue: 'account', 'onUpdate:modelValue': onValueChange }, lockPassword: true }));
    await nextTick();
    await userEvent.click(tab('Account'));
    await userEvent.click(tab('Password'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('is controlled with v-model: a parent that refuses the change keeps the old value', async () => {
    const onUpdate = vi.fn();
    mountView(tabsView({ root: { modelValue: 'account', 'onUpdate:modelValue': onUpdate } }));
    await nextTick();
    await userEvent.click(tab('Password'));
    expect(onUpdate).toHaveBeenCalledWith('password');
    expect(selectedTabs()).toEqual(['Account']);
  });

  it('follows a parent write without reporting it', async () => {
    const value = ref('account');
    const onValueChange = vi.fn();
    mountView(() =>
      tabsView({
        root: {
          modelValue: value.value,
          'onUpdate:modelValue': (next: string) => {
            value.value = next;
            onValueChange(next);
          },
        },
      })(),
    );
    await nextTick();
    value.value = 'notifications';
    await nextTick();
    expect(selectedTabs()).toEqual(['Notifications']);
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(tab('Account'));
    expect(value.value).toBe('account');
  });

  it('keeps the selection when the selected tab becomes disabled', async () => {
    const lock = ref(false);
    mountView(() => tabsView({ root: { modelValue: 'password' }, lockPassword: lock.value })());
    await nextTick();
    lock.value = true;
    await nextTick();
    expect(selectedTabs()).toEqual(['Password']);
    expect(tab('Account').tabIndex).toBe(0);
    expect(tab('Password').tabIndex).toBe(-1);
  });

  it('keeps the first resolved tab selected when it becomes disabled later', async () => {
    const lock = ref(false);
    mountView(() =>
      h(TabsRoot, null, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(TabsTrigger, { value: 'a', disabled: lock.value }, () => 'A'),
          h(TabsTrigger, { value: 'b' }, () => 'B'),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
        h(TabsContent, { value: 'b' }, () => 'b'),
      ]),
    );
    await nextTick();
    expect(selectedTabs()).toEqual(['A']);
    lock.value = true;
    await nextTick();
    expect(selectedTabs()).toEqual(['A']);
    expect(tab('B').tabIndex).toBe(0);
  });
});

describe('Tabs keyboard', () => {
  it('has one tab stop: Tab enters at the selected tab and the next Tab goes to its panel', async () => {
    const user = userEvent.setup();
    mountView(tabsView({ root: { modelValue: 'password' } }));
    await nextTick();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(tab('Password'));
    await user.tab();
    expect(document.activeElement).toBe(panelOf('Password'));
  });

  it('moves with the arrows, wraps, and selects in automatic mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    mountView(tabsView({ root: { 'onUpdate:modelValue': onValueChange } }));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(selectedTabs()).toEqual(['Password']);
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Notifications'));
    expect(onValueChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([
      'password',
      'notifications',
      'account',
      'notifications',
    ]);
    expect(tab('Notifications').tabIndex).toBe(0);
  });

  it('moves to the first and last enabled tab with Home and End', async () => {
    const user = userEvent.setup();
    mountView(
      tabsView({ root: { modelValue: 'account', 'onUpdate:modelValue': () => undefined }, lockPassword: true }),
    );
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tab('Notifications'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('skips a disabled tab', async () => {
    const user = userEvent.setup();
    mountView(tabsView({ lockPassword: true }));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('moves focus without selecting in manual mode, and selects with Enter and Space', async () => {
    const user = userEvent.setup();
    mountView(tabsView({ root: { modelValue: 'account', activationMode: 'manual' } }));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(selectedTabs()).toEqual(['Account']);
    expect(tab('Account').tabIndex).toBe(0);
    await user.keyboard('{Enter}');
    expect(selectedTabs()).toEqual(['Password']);
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(selectedTabs()).toEqual(['Notifications']);
  });

  it('uses Up and Down in a vertical list and ignores Left and Right', async () => {
    const user = userEvent.setup();
    mountView(tabsView({ root: { orientation: 'vertical' } }));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('flips the horizontal arrows in rtl but not the vertical ones', async () => {
    const user = userEvent.setup();
    const Rtl = (orientation: 'horizontal' | 'vertical'): ReturnType<typeof defineComponent> =>
      defineComponent({
        setup: () => {
          provideDirection('rtl');
          return () => tabsView({ root: { orientation } })();
        },
      });
    const horizontal = mountView(() => h(Rtl('horizontal')));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    horizontal.unmount();
    mountView(() => h(Rtl('vertical')));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Password'));
  });

  it('does not handle a key with a modifier, and lets the author veto', async () => {
    const user = userEvent.setup();
    mountView(() =>
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(
            TabsTrigger,
            {
              value: 'a',
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'ArrowLeft') event.preventDefault();
              },
            },
            () => 'A',
          ),
          h(
            TabsTrigger,
            {
              value: 'b',
              onClick: (event: Event) => {
                event.preventDefault();
              },
            },
            () => 'B',
          ),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
        h(TabsContent, { value: 'b' }, () => 'b'),
      ]),
    );
    await nextTick();
    tab('A').focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(document.activeElement).toBe(tab('A'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('A'));
    await user.click(tab('B'));
    expect(tab('A').getAttribute('aria-selected')).toBe('true');
  });

  it('marks the trigger focused by keyboard with data-focus-visible, and not after a pointer press', async () => {
    const user = userEvent.setup();
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Password').hasAttribute('data-focus-visible')).toBe(true);
    expect(tab('Account').hasAttribute('data-focus-visible')).toBe(false);
    await user.click(tab('Notifications'));
    expect(tab('Notifications').hasAttribute('data-focus-visible')).toBe(false);
  });
});

describe('Tabs collection', () => {
  it('follows tabs added, removed and reordered', async () => {
    const user = userEvent.setup();
    const names: Ref<string[]> = ref(['a', 'b', 'c']);
    mountView(() =>
      h(TabsRoot, { modelValue: 'a' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () =>
          names.value.map((name) => h(TabsTrigger, { key: name, value: name }, () => name)),
        ),
        ...names.value.map((name) => h(TabsContent, { key: name, value: name }, () => `${name} body`)),
      ]),
    );
    await nextTick();
    names.value = ['c', 'a'];
    await nextTick();
    await nextTick();
    expect(screen.getAllByRole('tab').map((element) => element.textContent)).toEqual(['c', 'a']);
    tab('a').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
    names.value = ['a', 'c'];
    await nextTick();
    await nextTick();
    tab('a').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
  });
});

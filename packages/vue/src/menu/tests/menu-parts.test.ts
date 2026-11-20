// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, ref, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuItemLeading,
  MenuItemShortcut,
  MenuItemSupportingText,
  MenuItemTrailing,
  MenuRadioGroup,
  MenuRadioItem,
} from '../index';
import { menu, menuView, mountView, open, press, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const checkbox = (name: string): HTMLElement => screen.getByRole('menuitemcheckbox', { name });
const radio = (name: string): HTMLElement => screen.getByRole('menuitemradio', { name });

describe('Menu checkbox item (menu-05)', () => {
  /** A menu with one checkbox item bound to `shown`. */
  const view = (shown = ref(false), extra: Record<string, unknown> = {}) =>
    menuView({
      items: () => [
        h(
          MenuCheckboxItem,
          { modelValue: shown.value, 'onUpdate:modelValue': (next: boolean) => (shown.value = next), ...extra },
          () => [h(MenuItemIndicator, null, () => 'x'), 'Show grid'],
        ),
        h(MenuItem, null, () => 'Other'),
      ],
    });

  it('has the menuitemcheckbox role, aria-checked and the state markers', async () => {
    mountView(view(ref(true)));
    await open();
    const item = checkbox('Show grid');
    expect(item.tagName).toBe('DIV');
    expect(item.className).toBe('cck-menu__checkbox-item');
    expect(item.getAttribute('aria-checked')).toBe('true');
    expect(item.getAttribute('data-state')).toBe('checked');
    expect(item.querySelector('.cck-menu__item-indicator')?.getAttribute('data-state')).toBe('checked');
    expect(item.querySelector('.cck-menu__item-indicator')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('toggles with a click and closes the menu', async () => {
    const shown = ref(false);
    mountView(view(shown));
    await open();
    await userEvent.click(checkbox('Show grid'));
    expect(shown.value).toBe(true);
    await settle();
    expect(menu()).toBeNull();
  });

  it('toggles with Enter and closes, with Space and keeps the menu open', async () => {
    const shown = ref(false);
    mountView(view(shown));
    await open();
    await press(' ');
    expect(shown.value).toBe(true);
    expect(checkbox('Show grid').getAttribute('aria-checked')).toBe('true');
    expect(menu()).not.toBeNull();
    await press(' ');
    expect(shown.value).toBe(false);
    await press('{Enter}');
    expect(shown.value).toBe(true);
    await settle();
    expect(menu()).toBeNull();
  });

  it('toggles uncontrolled from defaultChecked and emits once per press', async () => {
    const onUpdate = vi.fn();
    mountView(
      menuView({
        items: () => [
          h(MenuCheckboxItem, { defaultChecked: true, 'onUpdate:modelValue': onUpdate }, () => 'Show grid'),
        ],
      }),
    );
    await open();
    expect(checkbox('Show grid').getAttribute('aria-checked')).toBe('true');
    await press(' ');
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(false);
    expect(checkbox('Show grid').getAttribute('aria-checked')).toBe('false');
  });

  it('a disabled item stays focusable and changes nothing; select can keep the menu open', async () => {
    const shown = ref(false);
    mountView(view(shown, { disabled: true }));
    await open();
    await userEvent.click(checkbox('Show grid'));
    await press(' ');
    expect(shown.value).toBe(false);
    expect(checkbox('Show grid').getAttribute('aria-disabled')).toBe('true');
    expect(menu()).not.toBeNull();
    cleanup();
    const other = ref(false);
    mountView(
      view(other, {
        onSelect: (event: Event) => {
          event.preventDefault();
        },
      }),
    );
    await open();
    await userEvent.click(checkbox('Show grid'));
    expect(other.value).toBe(true);
    expect(menu()).not.toBeNull();
  });
});

describe('Menu radio group and items (menu-05)', () => {
  const view = (value = ref<string | null>('name')) =>
    menuView({
      items: () => [
        h(
          MenuRadioGroup,
          { modelValue: value.value, 'onUpdate:modelValue': (next: string) => (value.value = next) },
          () => [
            h(MenuGroupLabel, null, () => 'Sort by'),
            h(MenuRadioItem, { value: 'name' }, () => 'Name'),
            h(MenuRadioItem, { value: 'date' }, () => 'Date'),
          ],
        ),
      ],
    });

  it('renders a group named by its label with menuitemradio items that follow the value', async () => {
    mountView(view());
    await open();
    const group = screen.getByRole('group', { name: 'Sort by' });
    expect(group.className).toBe('cck-menu__radio-group');
    expect(radio('Name').getAttribute('aria-checked')).toBe('true');
    expect(radio('Date').getAttribute('aria-checked')).toBe('false');
    expect(radio('Date').className).toBe('cck-menu__radio-item');
  });

  it('checks an item with a click (closing the menu) and with Space (keeping it open)', async () => {
    const value = ref<string | null>('name');
    mountView(view(value));
    await open();
    await userEvent.click(radio('Date'));
    expect(value.value).toBe('date');
    await settle();
    expect(menu()).toBeNull();
    await open();
    expect(document.activeElement).toBe(radio('Name'));
    await press(' ');
    expect(value.value).toBe('name');
    expect(menu()).not.toBeNull();
    expect(radio('Name').getAttribute('aria-checked')).toBe('true');
  });

  it('does not emit again for the item that is checked already', async () => {
    const onUpdate = vi.fn();
    mountView(
      menuView({
        items: () => [
          h(MenuRadioGroup, { modelValue: 'name', 'onUpdate:modelValue': onUpdate }, () => [
            h(MenuRadioItem, { value: 'name' }, () => 'Name'),
          ]),
        ],
      }),
    );
    await open();
    await press(' ');
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

describe('Menu item parts and groups (menu-06)', () => {
  const parts = (): VNode[] => [
    h(MenuGroup, null, () => [
      h(MenuGroupLabel, null, () => 'File'),
      h(MenuItem, null, () => [
        h(MenuItemLeading, null, () => 'L'),
        'Rename',
        h(MenuItemSupportingText, null, () => 'Change the name'),
        h(MenuItemShortcut, null, () => 'Ctrl+R'),
        h(MenuItemTrailing, null, () => 'T'),
      ]),
      h(MenuItem, null, () => 'Delete'),
    ]),
  ];

  it('renders the group with aria-labelledby the label and the part classes', async () => {
    mountView(menuView({ items: parts }));
    await open();
    const group = screen.getByRole('group', { name: 'File' });
    expect(group.className).toBe('cck-menu__group');
    expect(group.getAttribute('aria-labelledby')).toBe(document.querySelector('.cck-menu__group-label')?.id);
    for (const name of ['item-leading', 'item-trailing', 'item-supporting-text', 'item-shortcut']) {
      expect(document.querySelector(`.cck-menu__${name}`), name).not.toBeNull();
    }
  });

  it('hides leading and trailing from assistive technology and describes the item by the supporting text', async () => {
    mountView(menuView({ items: parts }));
    await open();
    expect(document.querySelector('.cck-menu__item-leading')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('.cck-menu__item-trailing')?.getAttribute('aria-hidden')).toBe('true');
    const support = document.querySelector('.cck-menu__item-supporting-text');
    const rename = document.querySelector('.cck-menu__item');
    expect(support?.id).toBeTruthy();
    expect(rename?.getAttribute('aria-describedby')).toBe(support?.id);
    expect(screen.getByRole('menuitem', { description: 'Change the name' })).toBe(rename);
    const second = screen.getByRole('menuitem', { name: 'Delete' });
    expect(second.hasAttribute('aria-describedby')).toBe(false);
  });

  it('has no axe violations with every part', async () => {
    const { container } = mountView(menuView({ items: parts }));
    await open();
    expect((await axe(menu() ?? container)).violations).toEqual([]);
    expect(trigger()).toBeTruthy();
  });
});

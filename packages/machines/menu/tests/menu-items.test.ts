import { describe, expect, it, vi } from 'vitest';
import {
  getMenuItemChange,
  getMenuProps,
  menuAnatomy,
  menuGroupLabelId,
  menuItemDescriptionId,
  menuKeymap,
  menuMeta,
  transitionMenu,
  type MenuEvent,
  type MenuItemEntry,
} from '../index';
import { dataKeys, edit, event, keyOnItem, opened } from './fixtures';

const notes: MenuItemEntry = { key: 'notes', text: 'Notes', kind: 'checkbox', checked: false };
const archived: MenuItemEntry = { key: 'archived', text: 'Archived', kind: 'checkbox', checked: true };
const small: MenuItemEntry = { key: 'small', text: 'Small', kind: 'radio', value: 'sm', checked: true };
const large: MenuItemEntry = { key: 'large', text: 'Large', kind: 'radio', value: 'lg', checked: false };
const locked: MenuItemEntry = { key: 'locked', text: 'Locked', kind: 'checkbox', disabled: true };

describe('anatomy of the item parts (menu-05, -06)', () => {
  it('names the classes of the Anatomy table', () => {
    expect(menuAnatomy.classes).toMatchObject({
      checkboxItem: 'cck-menu__checkbox-item',
      radioGroup: 'cck-menu__radio-group',
      radioItem: 'cck-menu__radio-item',
      itemIndicator: 'cck-menu__item-indicator',
      group: 'cck-menu__group',
      groupLabel: 'cck-menu__group-label',
      itemLeading: 'cck-menu__item-leading',
      itemTrailing: 'cck-menu__item-trailing',
      itemSupportingText: 'cck-menu__item-supporting-text',
      itemShortcut: 'cck-menu__item-shortcut',
      sub: 'cck-menu__sub',
      subTrigger: 'cck-menu__sub-trigger',
      subContent: 'cck-menu__sub-content',
    });
  });

  it('declares the roles and the default elements of the new parts', () => {
    expect(menuMeta.roles).toMatchObject({
      checkboxItem: 'menuitemcheckbox',
      radioItem: 'menuitemradio',
      radioGroup: 'group',
      group: 'group',
      subTrigger: 'menuitem',
      subContent: 'menu',
      itemIndicator: null,
      itemLeading: null,
    });
    expect(menuMeta.defaultElements).toMatchObject({
      checkboxItem: 'div',
      radioItem: 'div',
      itemIndicator: 'span',
      itemLeading: 'span',
      itemShortcut: 'span',
    });
  });
});

describe('checkbox and radio items (menu-05)', () => {
  it.each([
    ['an unchecked checkbox item', notes, 'menuitemcheckbox', 'false', 'unchecked', 'cck-menu__checkbox-item'],
    ['a checked checkbox item', archived, 'menuitemcheckbox', 'true', 'checked', 'cck-menu__checkbox-item'],
    ['a checked radio item', small, 'menuitemradio', 'true', 'checked', 'cck-menu__radio-item'],
    ['an unchecked radio item', large, 'menuitemradio', 'false', 'unchecked', 'cck-menu__radio-item'],
  ])('renders %s', (_name, entry, role, checked, state, className) => {
    const props = getMenuProps(opened(), vi.fn()).item(entry);
    expect(props).toMatchObject({ role, 'aria-checked': checked, 'data-state': state, class: className });
  });

  it('never renders aria-checked or data-state on a plain item', () => {
    const props = getMenuProps(opened(), vi.fn()).item(edit);
    expect(props.role).toBe('menuitem');
    expect(props['aria-checked']).toBeUndefined();
    expect(props['data-state']).toBeUndefined();
    expect(props['data-highlighted']).toBeUndefined();
  });

  it('highlights the active checkbox or radio item of an open menu only', () => {
    const open = getMenuProps(opened({ items: [notes, small], activeKey: 'small' }), vi.fn());
    expect(open.item(small)['data-highlighted']).toBe('');
    expect(open.item(notes)['data-highlighted']).toBeUndefined();
    const closed = getMenuProps(opened({ open: false, items: [notes, small], activeKey: 'small' }), vi.fn());
    expect(closed.item(small)['data-highlighted']).toBeUndefined();
  });

  it('keeps a disabled item focusable: aria-disabled and data-disabled, no native disabled', () => {
    const props = getMenuProps(opened({ items: [locked] }), vi.fn()).item(locked);
    expect(props).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '', tabIndex: 0, 'aria-checked': 'false' });
  });

  it('is part of the roving tab stop like any item', () => {
    const { item } = getMenuProps(opened({ items: [edit, notes, small], activeKey: 'notes' }), vi.fn());
    expect([edit, notes, small].map((entry) => item(entry).tabIndex)).toEqual([-1, 0, -1]);
  });

  it('renders exactly the data attributes of the meta', () => {
    const parts = getMenuProps(opened({ items: [{ ...notes, disabled: true }], activeKey: 'notes' }), vi.fn());
    const props = parts.item({ ...notes, disabled: true });
    expect(dataKeys(props)).toEqual([...menuMeta.dataAttrs.checkboxItem].sort());
    expect(dataKeys(parts.itemIndicator({ checked: true }))).toEqual([...menuMeta.dataAttrs.itemIndicator].sort());
  });

  it('sends the click, the focus and the pointer move of the item', () => {
    const send = vi.fn<(sent: MenuEvent) => void>();
    const props = getMenuProps(opened(), send).item(notes);
    props.onClick(event);
    props.onFocus(event);
    props.onPointerMove(event);
    expect(send.mock.calls.map(([sent]) => sent)).toEqual([
      { type: 'ITEM.RUN', key: 'notes', disabled: false, event },
      { type: 'ITEM.FOCUS', key: 'notes' },
      { type: 'ITEM.POINTER_MOVE', key: 'notes', event },
    ]);
  });
});

describe('the change a press asks for (menu-05)', () => {
  it.each([
    ['checks an unchecked checkbox item', notes, { type: 'checkbox', key: 'notes', checked: true, reason: 'user' }],
    [
      'unchecks a checked checkbox item',
      archived,
      { type: 'checkbox', key: 'archived', checked: false, reason: 'user' },
    ],
    ['checks an unchecked radio item', large, { type: 'radio', key: 'large', value: 'lg', reason: 'user' }],
    ['changes nothing for a checked radio item', small, null],
    ['changes nothing for a radio item with no value', { key: 'r', text: 'R', kind: 'radio' } as const, null],
    ['changes nothing for a plain item', edit, null],
    ['changes nothing for a disabled checkbox item', locked, null],
    ['changes nothing for a disabled radio item', { ...large, disabled: true }, null],
  ] as const)('%s', (_name, entry, change) => {
    expect(getMenuItemChange(entry)).toEqual(change);
  });

  it('keeps ITEM.RUN as the close of the menu and leaves ITEM.CHECK open', () => {
    const state = opened({ items: [notes] });
    expect(transitionMenu(state, { type: 'ITEM.RUN', key: 'notes', disabled: false, event })).toEqual({
      open: false,
      reason: 'item',
    });
    expect(transitionMenu(state, { type: 'ITEM.CHECK', key: 'notes', event })).toBeNull();
    expect(transitionMenu(state, { type: 'ITEM.POINTER_MOVE', key: 'notes', event })).toBeNull();
  });
});

describe('Enter and Space on a checkbox or radio item (menu-05)', () => {
  it.each([notes, archived, small, large])('Enter presses $key, which closes the menu', (entry) => {
    const { sent, event: pressed } = keyOnItem(opened(), entry, 'Enter');
    expect(sent).toMatchObject({ type: 'ITEM.PRESS', key: entry.key });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it.each([notes, archived, small, large])('Space checks $key and keeps the menu open', (entry) => {
    const { sent, event: pressed } = keyOnItem(opened(), entry, ' ');
    expect(sent).toMatchObject({ type: 'ITEM.CHECK', key: entry.key });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('presses a plain item with Space too, which closes the menu', () => {
    expect(keyOnItem(opened(), edit, ' ').sent).toMatchObject({ type: 'ITEM.PRESS' });
  });

  it.each([
    ['Enter', 'Enter'],
    ['Space', ' '],
  ])('sends nothing for %s on a disabled item, and holds the default action', (_name, keyName) => {
    const { send, event: pressed } = keyOnItem(opened(), locked, keyName);
    expect(send).not.toHaveBeenCalled();
    expect(pressed.defaultPrevented).toBe(true);
  });

  it('leaves Space to a running typeahead search', () => {
    const typeahead = { match: () => null, reset: vi.fn(), isActive: () => true };
    const { send } = keyOnItem(opened({ typeahead }), notes, ' ');
    expect(send).not.toHaveBeenCalled();
  });

  it('has a keymap row and a meta row for each of the two keys', () => {
    const bound = menuKeymap.filter((binding) => binding.context === 'Menu checkbox or radio item');
    expect(bound.map((binding) => binding.row)).toEqual(['Enter', 'Space']);
    const rows = menuMeta.keyboard.filter((row) => row.context === 'Menu checkbox or radio item');
    expect(rows.map((row) => row.key)).toEqual(['Enter', 'Space']);
  });
});

describe('radio group, group and label (menu-05, -06)', () => {
  const parts = getMenuProps(opened(), vi.fn());

  it('renders a radio group as a group named by its label only while one is mounted', () => {
    expect(parts.radioGroup({ id: 'g1', hasLabel: true })).toEqual({
      class: 'cck-menu__radio-group',
      role: 'group',
      'aria-labelledby': 'g1-label',
    });
    expect(parts.radioGroup({ id: 'g1' })['aria-labelledby']).toBeUndefined();
  });

  it('renders a group as a group named by its label', () => {
    expect(parts.group({ id: 'g2', hasLabel: true })).toEqual({
      class: 'cck-menu__group',
      role: 'group',
      'aria-labelledby': 'g2-label',
    });
    expect(parts.group({ id: 'g2', hasLabel: false })['aria-labelledby']).toBeUndefined();
  });

  it('gives the label the id the group points at, and no role', () => {
    expect(parts.groupLabel({ id: 'g2' })).toEqual({ class: 'cck-menu__group-label', id: menuGroupLabelId('g2') });
    expect(menuGroupLabelId('g2')).toBe('g2-label');
  });
});

describe('parts inside an item (menu-06)', () => {
  const parts = getMenuProps(opened(), vi.fn());

  it('hides the leading and trailing from assistive technology', () => {
    expect(parts.itemLeading).toEqual({ class: 'cck-menu__item-leading', 'aria-hidden': 'true' });
    expect(parts.itemTrailing).toEqual({ class: 'cck-menu__item-trailing', 'aria-hidden': 'true' });
  });

  it('renders the shortcut as text of the item, not hidden', () => {
    expect(parts.itemShortcut).toEqual({ class: 'cck-menu__item-shortcut' });
  });

  it('hides the indicator and gives it the state of its item', () => {
    expect(parts.itemIndicator({ checked: true })).toEqual({
      class: 'cck-menu__item-indicator',
      'aria-hidden': 'true',
      'data-state': 'checked',
    });
    expect(parts.itemIndicator({})['data-state']).toBe('unchecked');
  });

  it('describes an item by its supporting text only while it has one', () => {
    const described: MenuItemEntry = { ...edit, hasDescription: true };
    const id = menuItemDescriptionId('m1', 'edit');
    expect(id).toBe('m1-item-edit-description');
    expect(parts.item(described)['aria-describedby']).toBe(id);
    expect(parts.item(edit)['aria-describedby']).toBeUndefined();
    expect(parts.itemSupportingText({ key: 'edit' })).toEqual({ class: 'cck-menu__item-supporting-text', id });
  });

  it('builds the description id from the key, so equal text in two items never collides', () => {
    expect(menuItemDescriptionId('m1', 'a b')).not.toBe(menuItemDescriptionId('m1', 'a-b'));
  });

  it('describes a checkbox item and a radio item too', () => {
    expect(parts.item({ ...notes, hasDescription: true })['aria-describedby']).toBe('m1-item-notes-description');
    expect(parts.item({ ...small, hasDescription: true })['aria-describedby']).toBe('m1-item-small-description');
  });
});

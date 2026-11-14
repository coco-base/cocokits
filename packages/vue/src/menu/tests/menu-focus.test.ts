// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
import { byId, item, menu, menuView, mountView, open, press, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** A press that lands on space that cannot take focus, and moves no focus by itself. */
function pressOnEmptySpace(): void {
  document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }));
}

interface Row {
  readonly name: string;
  /** Props of the sample menu. */
  readonly options?: Parameters<typeof menuView>[0];
  /** Moves focus and acts; the menu is open on `Edit` when it starts. */
  readonly act: (parentOpen: { value: boolean }) => Promise<unknown> | undefined;
  readonly after: () => Element | null;
  readonly stillOpen: boolean;
}

const rows: readonly Row[] = [
  ...(['{Enter}', ' ', 'click'] as const).map((how): Row => ({
    name: `an enabled item runs by ${how === 'click' ? 'a click' : how}`,
    act: async () => (how === 'click' ? userEvent.click(item('Edit')) : userEvent.keyboard(how)),
    after: trigger,
    stillOpen: false,
  })),
  ...(['{Enter}', ' ', 'click'] as const).map((how): Row => ({
    name: `an enabled item runs by ${how === 'click' ? 'a click' : how} with preventDefault()`,
    options: {
      itemProps: {
        Edit: {
          onSelect: (event: Event) => {
            event.preventDefault();
          },
        },
      },
    },
    act: async () => (how === 'click' ? userEvent.click(item('Edit')) : userEvent.keyboard(how)),
    after: () => item('Edit'),
    stillOpen: true,
  })),
  ...(['{Enter}', ' ', 'click'] as const).map((how): Row => ({
    name: `a disabled item is pressed by ${how === 'click' ? 'a click' : how}`,
    act: async () => {
      item('Move').focus();
      if (how === 'click') await userEvent.click(item('Move'));
      else await userEvent.keyboard(how);
    },
    after: () => item('Move'),
    stillOpen: true,
  })),
  { name: 'Escape on an item', act: () => userEvent.keyboard('{Escape}'), after: trigger, stillOpen: false },
  { name: 'Tab on an item', act: () => userEvent.tab(), after: () => byId('after'), stillOpen: false },
  {
    name: 'Shift+Tab on an item',
    act: () => userEvent.tab({ shift: true }),
    after: trigger,
    stillOpen: false,
  },
  {
    name: 'a press outside on space that cannot take focus',
    act: () => {
      pressOnEmptySpace();
      return undefined;
    },
    after: trigger,
    stillOpen: false,
  },
  {
    name: 'a press on a focusable element outside',
    act: () => userEvent.click(byId('after')),
    after: () => byId('after'),
    stillOpen: false,
  },
  { name: 'a click on the trigger', act: () => userEvent.click(trigger()), after: trigger, stillOpen: false },
  {
    name: 'the parent sets open to false, focus on an item',
    options: { open: ref(true) },
    act: (parentOpen) => {
      parentOpen.value = false;
      return undefined;
    },
    after: trigger,
    stillOpen: false,
  },
  {
    name: 'an element outside, focused by script, when the parent sets open to false',
    options: { open: ref(true) },
    act: (parentOpen) => {
      byId('after').focus();
      parentOpen.value = false;
      return undefined;
    },
    after: () => byId('after'),
    stillOpen: false,
  },
];

describe('Menu focus table', () => {
  it.each(rows)('$name', async ({ options, act, after, stillOpen }) => {
    const parentOpen = options?.open ?? ref(false);
    mountView(menuView(options?.open ? options : { ...options, open: parentOpen }));
    if (parentOpen.value) await settle();
    else await open();
    if (!parentOpen.value) throw new Error('The menu did not open.');
    // A menu opened by its parent starts focused as any other.
    expect(document.activeElement).toBe(item('Edit'));
    await act(parentOpen);
    await settle();
    expect(document.activeElement).toBe(after());
    expect(menu() !== null).toBe(stillOpen);
  });

  it('sends focus to the content when the author removes the focused item and the menu stays open', async () => {
    const shown = ref(true);
    mountView(() => [
      h(MenuRoot, null, () => [
        h(MenuTrigger, null, () => 'Actions'),
        h(MenuContent, null, () => [
          h(MenuItem, { key: 'a' }, () => 'Edit'),
          ...(shown.value ? [h(MenuItem, { key: 'b' }, () => 'Remove me')] : []),
        ]),
      ]),
    ]);
    await open();
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(item('Remove me'));
    shown.value = false;
    await settle();
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(menu());
  });

  it('sends focus to the content when the menu has no item', async () => {
    mountView(menuView({ items: () => [] }));
    await open();
    expect(document.activeElement).toBe(menu());
    await press('{Escape}');
    expect(document.activeElement).toBe(trigger());
  });
});

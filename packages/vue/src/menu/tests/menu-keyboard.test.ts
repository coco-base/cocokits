// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { defineComponent, h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { byId, item, menu, menuView, mountView, open, press, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const focusedText = (): string | null | undefined => document.activeElement?.textContent;

/** Opens the menu on `Edit` and then runs the keys. */
async function openThen(keys: string): Promise<void> {
  await open();
  expect(document.activeElement).toBe(item('Edit'));
  await press(keys);
}

describe.each([
  ['ltr', menuView],
  [
    'rtl',
    () => {
      const Page = defineComponent({
        setup() {
          provideDirection('rtl');
          return menuView();
        },
      });
      return () => [h(Page)];
    },
  ],
] as const)('Menu keyboard (%s)', (_dir, makeView) => {
  it('opens on the first item with Enter and Space on the trigger, and Enter closes it again', async () => {
    mountView(makeView());
    trigger().focus();
    await press('{Enter}');
    expect(focusedText()).toBe('Edit');
    await press('{Escape}');
    expect(document.activeElement).toBe(trigger());
    await press(' ');
    expect(focusedText()).toBe('Edit');
    expect(menu()).not.toBeNull();
    trigger().focus();
    await press('{Enter}');
    expect(menu()).toBeNull();
  });

  it('opens on the first item with ArrowDown and on the last with ArrowUp', async () => {
    mountView(makeView());
    trigger().focus();
    await press('{ArrowDown}');
    expect(focusedText()).toBe('Edit');
    await press('{Escape}');
    await press('{ArrowUp}');
    expect(focusedText()).toBe('Delete');
  });

  it('moves with ArrowDown and ArrowUp, through the disabled item, and wraps at both ends', async () => {
    mountView(makeView());
    await openThen('{ArrowDown}');
    expect(focusedText()).toBe('Duplicate');
    await press('{ArrowDown}');
    expect(focusedText()).toBe('Move');
    await press('{ArrowDown}{ArrowDown}');
    expect(focusedText()).toBe('Edit');
    await press('{ArrowUp}');
    expect(focusedText()).toBe('Delete');
  });

  it('moves to the last and first item with End and Home', async () => {
    mountView(makeView());
    await openThen('{End}');
    expect(focusedText()).toBe('Delete');
    await press('{Home}');
    expect(focusedText()).toBe('Edit');
  });

  it('finds an item by typing, including a disabled one, and cycles a repeated character', async () => {
    mountView(makeView());
    await openThen('d');
    expect(focusedText()).toBe('Duplicate');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await press('d');
    expect(focusedText()).toBe('Delete');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await press('m');
    expect(focusedText()).toBe('Move');
  });

  it('runs the focused item with Enter and with Space, and goes back to the trigger', async () => {
    const run = vi.fn();
    mountView(menuView({ itemProps: { Duplicate: { onSelect: run }, Delete: { onSelect: run } } }));
    await openThen('{ArrowDown}{Enter}');
    expect(run).toHaveBeenCalledTimes(1);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    await open();
    await press('{End} ');
    expect(run).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(trigger());
  });

  it('runs nothing on the disabled item with Enter or Space, and keeps the menu open on it', async () => {
    const run = vi.fn();
    mountView(menuView({ itemProps: { Move: { onSelect: run } } }));
    await openThen('{ArrowDown}{ArrowDown}{Enter} ');
    expect(run).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(focusedText()).toBe('Move');
  });

  it('does not run an item while Space continues a search', async () => {
    const run = vi.fn();
    mountView(menuView({ itemProps: { Duplicate: { onSelect: run } } }));
    await openThen('d ');
    expect(run).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(focusedText()).toBe('Duplicate');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    mountView(makeView());
    await openThen('{Escape}');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on Tab and moves to the element after the trigger', async () => {
    mountView(makeView());
    await openThen('{Tab}');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('closes on Shift+Tab and focuses the trigger', async () => {
    mountView(makeView());
    await openThen('{Shift>}{Tab}{/Shift}');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('leaves keys with Ctrl, Alt or Meta alone', async () => {
    mountView(makeView());
    await openThen('{Control>}d{/Control}{Alt>}{ArrowDown}{/Alt}{Meta>}{End}{/Meta}');
    expect(focusedText()).toBe('Edit');
    expect(menu()).not.toBeNull();
  });
});

describe('Menu keyboard keys that a listener prevented', () => {
  it('are left alone', async () => {
    mountView(
      menuView({
        contentProps: {
          onKeydown: (event: KeyboardEvent) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(focusedText()).toBe('Edit');
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { byId, menu, menuView, mountView, open, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const refuse = (event: Event): void => {
  event.preventDefault();
};

/** A press that lands outside and moves no focus, so only the press is a cause. */
function pressOutside(): void {
  byId('before').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }));
}

const CAUSES = [
  ['escapeKeyDown', 'Escape', () => userEvent.keyboard('{Escape}')],
  [
    'pointerDownOutside',
    'a press outside',
    () => {
      pressOutside();
      return undefined;
    },
  ],
  [
    'interactOutside',
    'a press outside',
    () => {
      pressOutside();
      return undefined;
    },
  ],
  ['focusOutside', 'Tab', () => userEvent.tab()],
  ['interactOutside', 'Tab', () => userEvent.tab()],
] as const;

describe('Menu content refusal', () => {
  it.each(CAUSES)('%s refuses %s with preventDefault(), and no change is emitted', async (name, _cause, act) => {
    const onUpdate = vi.fn();
    const handler = vi.fn(refuse);
    mountView(
      menuView({
        rootProps: { 'onUpdate:open': onUpdate },
        contentProps: { [`on${name.charAt(0).toUpperCase()}${name.slice(1)}`]: handler },
      }),
    );
    await open();
    await act();
    await settle();
    expect(handler).toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true]]);
  });

  it.each(CAUSES)('%s emits and lets %s close the menu when nobody refuses', async (name, _cause, act) => {
    const onUpdate = vi.fn();
    const handler = vi.fn();
    mountView(
      menuView({
        rootProps: { 'onUpdate:open': onUpdate },
        contentProps: { [`on${name.charAt(0).toUpperCase()}${name.slice(1)}`]: handler },
      }),
    );
    await open();
    await act();
    await settle();
    // The focus move of Tab can raise the intent more than once (the guard, then the element after the trigger).
    expect(handler).toHaveBeenCalled();
    expect(menu()).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('an Escape that is refused leaves focus where it is', async () => {
    mountView(menuView({ contentProps: { onEscapeKeyDown: refuse } }));
    await open();
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await settle();
    expect(document.activeElement?.textContent).toBe('Duplicate');
  });

  it('a refused press outside leaves the menu open and focus where it is', async () => {
    mountView(menuView({ contentProps: { onPointerDownOutside: refuse } }));
    await open();
    pressOutside();
    await settle();
    expect(menu()).not.toBeNull();
    expect(document.activeElement?.textContent).toBe('Edit');
  });
});

describe('Menu refusal does not hold back the trigger, an item or the parent', () => {
  const all = {
    onEscapeKeyDown: refuse,
    onPointerDownOutside: refuse,
    onFocusOutside: refuse,
    onInteractOutside: refuse,
  };

  it('closes on a click on the trigger', async () => {
    mountView(menuView({ contentProps: all }));
    await open();
    await userEvent.click(trigger());
    await settle();
    expect(menu()).toBeNull();
  });

  it('closes when an item runs', async () => {
    mountView(menuView({ contentProps: all }));
    await open();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(menu()).toBeNull();
  });

  it('closes when the parent writes false', async () => {
    const state = ref(true);
    mountView(menuView({ contentProps: all, open: state }));
    await settle();
    expect(menu()).not.toBeNull();
    state.value = false;
    await settle();
    expect(menu()).toBeNull();
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverClose } from '../index';
import { byId, mountView, popoverView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });
const dialog = (): HTMLElement | null => screen.queryByRole('dialog');

async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

describe('Popover focus', () => {
  it('moves focus to the first focusable element of the content on open', async () => {
    mountView(popoverView({}));
    await open();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('moves focus to the content itself when it holds nothing focusable', async () => {
    mountView(popoverView({ inner: () => h('p', 'Just text') }));
    await open();
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('opens from the keyboard with Enter and Space', async () => {
    mountView(popoverView({}));
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(dialog()).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    trigger().focus();
    await userEvent.keyboard(' ');
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    mountView(popoverView({}));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes with the Close part and returns focus to the trigger', async () => {
    mountView(popoverView({}));
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('returns focus to the trigger after an outside press on non-focusable space', async () => {
    mountView(popoverView({}));
    await open();
    await userEvent.click(document.body);
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('returns focus after the press has moved it to the body, as a browser does for empty space', async () => {
    mountView(popoverView({}));
    await open();
    // A browser blurs the focused element when a press lands on space that cannot take focus, after the press handlers.
    const blur = (): void => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
    document.addEventListener('mouseup', blur, { once: true });
    await userEvent.click(document.body);
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('leaves focus on another focusable element that an outside press landed on', async () => {
    mountView(popoverView({}));
    await open();
    await userEvent.click(byId('after'));
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('sends Tab from the last focusable element to the element after the trigger, and closes', async () => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await open();
    await userEvent.tab();
    await settle();
    expect(document.activeElement).toBe(byId('after'));
    expect(dialog()).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('sends Shift+Tab from the first focusable element back to the trigger, and closes with focus-out', async () => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await open();
    await userEvent.tab({ shift: true });
    await settle();
    expect(document.activeElement).toBe(trigger());
    expect(dialog()).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('moves between the focusable elements of the content with Tab without closing', async () => {
    mountView(
      popoverView({ inner: () => [h('input', { 'aria-label': 'Name' }), h(PopoverClose, null, () => 'Close')] }),
    );
    await open();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
    expect(dialog()).not.toBeNull();
  });

  it('keeps the guards as empty tab stops without a role, next to the content', async () => {
    mountView(popoverView({}));
    await open();
    const content = screen.getByRole('dialog');
    const guards = [content.previousElementSibling, content.nextElementSibling] as HTMLElement[];
    for (const guard of guards) {
      expect(guard.tagName).toBe('SPAN');
      expect(guard.getAttribute('tabindex')).toBe('0');
      expect(guard.hasAttribute('aria-hidden')).toBe(false);
      expect(guard.textContent).toBe('');
    }
  });
});

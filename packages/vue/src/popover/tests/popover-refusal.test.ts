// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, withModifiers } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';
import { PopoverContent, PopoverRoot } from '../index';
import { byId, dialog, mountView, open, popoverView, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** A press that lands outside and moves no focus, so only the press is a cause. */
function pressOutside(): void {
  byId('before').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }));
}

describe('Popover content: escapeKeyDown', () => {
  it('emits with the keydown and closes when nobody refuses', async () => {
    const onEscape = vi.fn();
    mountView(popoverView({ contentProps: { onEscapeKeyDown: onEscape } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(onEscape).toHaveBeenCalledOnce();
    expect(onEscape.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect(dialog()).toBeNull();
  });

  it.each([
    [
      'preventDefault()',
      (event: KeyboardEvent) => {
        event.preventDefault();
      },
    ],
    ['.prevent', withModifiers(() => undefined, ['prevent'])],
  ])('stays open with %s', async (_name, handler) => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate }, contentProps: { onEscapeKeyDown: handler } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).not.toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true]]);
  });
});

describe('Popover content: pointerDownOutside, focusOutside and interactOutside', () => {
  it('emit pointerDownOutside then interactOutside with one cancelable event for a press outside', async () => {
    const order: string[] = [];
    const events: Event[] = [];
    mountView(
      popoverView({
        contentProps: {
          onPointerDownOutside: (event: PointerDownOutsideEvent) => {
            order.push('pointerDownOutside');
            events.push(event);
          },
          onInteractOutside: (event: PointerDownOutsideEvent) => {
            order.push('interactOutside');
            events.push(event);
          },
        },
      }),
    );
    await open();
    pressOutside();
    await settle();
    expect(order).toEqual(['pointerDownOutside', 'interactOutside']);
    expect(events[0]).toBe(events[1]);
    expect((events[0] as PointerDownOutsideEvent).detail.originalEvent.type).toBe('pointerdown');
    expect(dialog()).toBeNull();
  });

  it.each([
    ['pointerDownOutside', 'onPointerDownOutside'],
    ['interactOutside', 'onInteractOutside'],
  ])('%s refuses a press outside with preventDefault()', async (_name, prop) => {
    mountView(
      popoverView({
        contentProps: {
          [prop]: (event: PointerDownOutsideEvent) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    pressOutside();
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('refuses a press outside with the .prevent modifier', async () => {
    mountView(popoverView({ contentProps: { onPointerDownOutside: withModifiers(() => undefined, ['prevent']) } }));
    await open();
    pressOutside();
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('emits focusOutside then interactOutside when focus leaves, and a refusal moves nothing', async () => {
    const order: string[] = [];
    mountView(
      popoverView({
        contentProps: {
          onFocusOutside: (event: FocusOutsideEvent) => {
            order.push('focusOutside');
            event.preventDefault();
          },
          onInteractOutside: (event: FocusOutsideEvent) => {
            order.push(`interactOutside:${event.detail.originalEvent.type}`);
          },
        },
      }),
    );
    await open();
    byId('after').focus();
    await settle();
    expect(order).toEqual(['focusOutside', 'interactOutside:focusin']);
    expect(dialog()).not.toBeNull();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('closes on focus-out when nobody refuses', async () => {
    const onFocusOutside = vi.fn();
    mountView(popoverView({ contentProps: { onFocusOutside } }));
    await open();
    byId('after').focus();
    await settle();
    expect(onFocusOutside).toHaveBeenCalledOnce();
    expect(dialog()).toBeNull();
  });
});

describe('Popover emits', () => {
  it('declares the six cancelable ones on the content and update:open on the root', () => {
    expect((PopoverContent as { emits?: readonly string[] }).emits).toEqual([
      'escapeKeyDown',
      'pointerDownOutside',
      'focusOutside',
      'interactOutside',
      'openAutoFocus',
      'closeAutoFocus',
    ]);
    expect((PopoverRoot as { emits?: readonly string[] }).emits).toEqual(['update:open']);
  });
});

describe('Popover content: openAutoFocus', () => {
  it('focuses the autofocus element when not prevented', async () => {
    const onOpen = vi.fn();
    mountView(
      popoverView({
        contentProps: { onOpenAutoFocus: onOpen },
        inner: () => [h('button', { id: 'first' }, 'first'), h('input', { id: 'wanted', autofocus: true })],
      }),
    );
    await open();
    expect(onOpen).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(byId('wanted'));
  });

  it('leaves focus where it was when prevented', async () => {
    mountView(
      popoverView({
        contentProps: {
          onOpenAutoFocus: (event: Event) => {
            event.preventDefault();
          },
        },
        inner: () => [h('input', { id: 'wanted', autofocus: true })],
      }),
    );
    const before = byId('before');
    before.focus();
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(dialog()).not.toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('Popover content: closeAutoFocus', () => {
  it('returns focus to the trigger unless prevented', async () => {
    const onClose = vi.fn();
    mountView(popoverView({ contentProps: { onCloseAutoFocus: onClose } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(onClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger());
  });

  it('skips the return when prevented', async () => {
    mountView(
      popoverView({
        contentProps: {
          onCloseAutoFocus: (event: Event) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).not.toBe(trigger());
  });
});

describe('Popover without a Trigger', () => {
  it('warns in development and renders nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(PopoverRoot, { open: true }, () => h(PopoverContent, { 'aria-label': 'Share' }, () => 'text')));
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<PopoverContent> has no <PopoverTrigger>'));
    expect(dialog()).toBeNull();
  });
});

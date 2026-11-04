// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, ref, withModifiers } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PointerDownOutsideEvent } from '@cocokits/vue-core';
import { DialogClose, DialogContent, DialogRoot, DialogTrigger } from '../index';
import { boxAt, dialogView, mountView, pressOn, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Delete' });
const dialog = (): HTMLDialogElement | null => screen.queryByRole('dialog');

/** A press on the backdrop: the dialog element itself, outside its box. */
function pressBackdrop(): void {
  const element = dialog();
  if (!element) throw new Error('no dialog');
  boxAt(element);
  pressOn(element, { clientX: 10, clientY: 10 });
}

async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

describe('Dialog content: escapeKeyDown', () => {
  it('emits with the keydown before the dialog closes, and closes when nobody refuses', async () => {
    const onEscape = vi.fn();
    const onUpdate = vi.fn();
    mountView(dialogView({ rootProps: { 'onUpdate:open': onUpdate }, contentProps: { onEscapeKeyDown: onEscape } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(onEscape).toHaveBeenCalledOnce();
    expect(onEscape.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect((onEscape.mock.calls[0]?.[0] as KeyboardEvent).key).toBe('Escape');
    expect(dialog()).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('stays open when a listener calls preventDefault()', async () => {
    const onUpdate = vi.fn();
    mountView(
      dialogView({
        rootProps: { 'onUpdate:open': onUpdate },
        contentProps: {
          onEscapeKeyDown: (event: KeyboardEvent) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).not.toBeNull();
    expect(dialog()?.matches(':modal')).toBe(true);
    expect(onUpdate.mock.calls).toEqual([[true]]);
  });

  it('stays open with the .prevent modifier', async () => {
    mountView(dialogView({ contentProps: { onEscapeKeyDown: withModifiers(() => undefined, ['prevent']) } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('closes again once the listener stops refusing', async () => {
    const dirty = ref(true);
    mountView(() =>
      dialogView({
        contentProps: {
          onEscapeKeyDown: (event: KeyboardEvent) => {
            if (dirty.value) event.preventDefault();
          },
        },
      })(),
    );
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).not.toBeNull();
    dirty.value = false;
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
  });

  it('is not called for a close request without a key', async () => {
    const onEscape = vi.fn();
    mountView(dialogView({ contentProps: { onEscapeKeyDown: onEscape } }));
    await open();
    dialog()?.dispatchEvent(new Event('cancel', { cancelable: true }));
    await settle();
    expect(onEscape).not.toHaveBeenCalled();
    expect(dialog()).toBeNull();
  });
});

describe('Dialog content: pointerDownOutside and interactOutside', () => {
  it('emit in this order with the same cancelable event, whose detail is the press', async () => {
    const order: string[] = [];
    const events: Event[] = [];
    mountView(
      dialogView({
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
    pressBackdrop();
    await settle();
    expect(order).toEqual(['pointerDownOutside', 'interactOutside']);
    expect(events[0]).toBe(events[1]);
    expect(events[0]?.cancelable).toBe(true);
    expect((events[0] as PointerDownOutsideEvent).detail.originalEvent.type).toBe('pointerdown');
    expect(dialog()).toBeNull();
  });

  it.each([
    ['pointerDownOutside', 'onPointerDownOutside'],
    ['interactOutside', 'onInteractOutside'],
  ])('%s refuses with preventDefault() and the focus stays inside the dialog', async (_name, prop) => {
    mountView(
      dialogView({
        contentProps: {
          [prop]: (event: PointerDownOutsideEvent) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    const inside = document.activeElement;
    expect(dialog()?.contains(inside)).toBe(true);
    pressBackdrop();
    // A browser may blur the focused element on a press that lands on the backdrop.
    (inside as HTMLElement).blur();
    await settle();
    expect(dialog()).not.toBeNull();
    expect(document.activeElement).toBe(inside);
  });

  it('refuses with the .prevent modifier', async () => {
    mountView(dialogView({ contentProps: { onPointerDownOutside: withModifiers(() => undefined, ['prevent']) } }));
    await open();
    pressBackdrop();
    await settle();
    expect(dialog()).not.toBeNull();
  });
});

describe('Dialog emits', () => {
  it('declares the cancelable ones on the content (focusOutside is for a non-modal dialog) and update:open on the root', () => {
    expect((DialogContent as { emits?: readonly string[] }).emits).toEqual([
      'escapeKeyDown',
      'pointerDownOutside',
      'focusOutside',
      'interactOutside',
      'openAutoFocus',
      'closeAutoFocus',
    ]);
    expect((DialogRoot as { emits?: readonly string[] }).emits).toEqual(['update:open']);
  });
});

describe('Dialog content: openAutoFocus', () => {
  it('is called once right after showModal(), with the native focusing already done', async () => {
    const seen: (Element | null)[] = [];
    mountView(
      dialogView({
        contentProps: {
          onOpenAutoFocus: () => {
            seen.push(document.activeElement);
          },
        },
      }),
    );
    await open();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(screen.getByRole('link', { name: 'First' }));
  });

  it('keeps the focus a listener moves to another element of the dialog, also when it prevents the event', async () => {
    mountView(
      dialogView({
        contentProps: {
          onOpenAutoFocus: (event: Event) => {
            event.preventDefault();
            screen.getByRole('button', { name: 'Cancel' }).focus();
          },
        },
      }),
    );
    await open();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
  });
});

describe('Dialog content: closeAutoFocus', () => {
  it('returns focus to the opener unless the event is prevented', async () => {
    const onClose = vi.fn();
    mountView(dialogView({ contentProps: { onCloseAutoFocus: onClose } }));
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await settle();
    expect(onClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger());
  });

  it('skips the return when a listener prevents it', async () => {
    mountView(
      dialogView({
        contentProps: {
          onCloseAutoFocus: (event: Event) => {
            event.preventDefault();
          },
        },
      }),
    );
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).not.toBe(trigger());
  });
});

describe('Dialog parts without a consumer veto', () => {
  const veto = (event: Event): void => {
    event.preventDefault();
  };
  it('open and close whatever the click listeners of the Trigger and the Close do', async () => {
    mountView(() =>
      h(DialogRoot, null, () => [
        h(DialogTrigger, { onClick: veto }, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'x' }, () => [h(DialogClose, { onClick: veto }, () => 'Cancel')]),
      ]),
    );
    await open();
    expect(dialog()).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await settle();
    expect(dialog()).toBeNull();
  });
});

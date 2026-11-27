// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, withModifiers } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PointerDownOutsideEvent } from '@cocokits/vue-core';
import { TooltipContent, TooltipRoot } from '../index';
import { tooltipContent, mountView, settle, stubOverlayBrowser, tooltipView } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const tip = (): HTMLElement | null => tooltipContent();

/** Opens the tooltip with the keyboard, which shows it at once. */
async function open(): Promise<void> {
  await userEvent.tab();
  await userEvent.tab();
  await settle();
  expect(tip()).not.toBeNull();
}

/** A press that lands outside and moves no focus. */
function pressOutside(): void {
  document
    .getElementById('after')
    ?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true }));
}

describe('Tooltip content: escapeKeyDown', () => {
  it('emits with the keydown and closes when nobody refuses', async () => {
    const onEscape = vi.fn();
    mountView(tooltipView({ contentProps: { onEscapeKeyDown: onEscape } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(onEscape).toHaveBeenCalledOnce();
    expect(onEscape.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect(tip()).toBeNull();
  });

  it.each([
    [
      'preventDefault()',
      (event: KeyboardEvent) => {
        event.preventDefault();
      },
    ],
    ['.prevent', withModifiers(() => undefined, ['prevent'])],
  ])('stays shown with %s', async (_name, handler) => {
    mountView(tooltipView({ contentProps: { onEscapeKeyDown: handler } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(tip()).not.toBeNull();
  });
});

describe('Tooltip content: pointerDownOutside', () => {
  it('closes on a press outside (a new cause) and emits a cancelable event whose detail is the press', async () => {
    const onOutside = vi.fn();
    mountView(tooltipView({ contentProps: { onPointerDownOutside: onOutside } }));
    await open();
    pressOutside();
    await settle();
    expect(onOutside).toHaveBeenCalledOnce();
    const event = onOutside.mock.calls[0]?.[0] as PointerDownOutsideEvent;
    expect(event.cancelable).toBe(true);
    expect(event.detail.originalEvent.type).toBe('pointerdown');
    expect(tip()).toBeNull();
  });

  it.each([
    [
      'preventDefault()',
      (event: PointerDownOutsideEvent) => {
        event.preventDefault();
      },
    ],
    ['.prevent', withModifiers(() => undefined, ['prevent'])],
  ])('stays shown with %s', async (_name, handler) => {
    mountView(tooltipView({ contentProps: { onPointerDownOutside: handler } }));
    await open();
    pressOutside();
    await settle();
    expect(tip()).not.toBeNull();
  });
});

describe('Tooltip emits and anchor', () => {
  it('declares escapeKeyDown and pointerDownOutside on the content and update:open on the root', () => {
    expect((TooltipContent as { emits?: readonly string[] }).emits).toEqual(['escapeKeyDown', 'pointerDownOutside']);
    expect((TooltipRoot as { emits?: readonly string[] }).emits).toEqual(['update:open']);
  });

  it('warns in development when the content has no Trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(TooltipRoot, { open: true }, () => h(TooltipContent, null, () => 'text')));
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<TooltipContent> has no <TooltipTrigger>'));
    expect(tip()).toBeNull();
  });
});

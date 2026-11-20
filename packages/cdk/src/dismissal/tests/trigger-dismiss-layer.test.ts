// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTriggerDismissLayer } from '../index';
import type { DismissIntent, TriggerDismissHost } from '../index';
import { click, el, escape, press, tick } from './helpers';

const stops: (() => void)[] = [];
afterEach(() => {
  stops.splice(0).forEach((stop) => {
    stop();
  });
});

function setup(overrides: Partial<TriggerDismissHost> = {}) {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  const list = el('list');
  const held: boolean[] = [];
  const presses: { intent: DismissIntent; focusLeft: boolean }[] = [];
  const host: TriggerDismissHost = {
    trigger: () => trigger,
    inside: () => [trigger, list],
    parent: () => null,
    escape: () => true,
    press: (intent, focusLeft) => {
      presses.push({ intent, focusLeft });
      return true;
    },
    holdFocusOut: (value) => held.push(value),
    ...overrides,
  };
  const dismissal = createTriggerDismissLayer(host);
  stops.push(dismissal.stop);
  trigger.focus();
  return { trigger, list, held, presses, ...dismissal };
}

describe('createTriggerDismissLayer', () => {
  it('asks the host at once for Escape and refuses the intent when the host does', () => {
    const asked = vi.fn(() => false);
    setup({ escape: asked });
    const event = escape();
    expect(asked).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('asks the host in the same task as the press, saying a mouse press moves the focus', () => {
    const { presses } = setup();
    press(el('outside'), { pointerType: 'mouse' });
    expect(presses).toHaveLength(1);
    expect(presses[0]?.focusLeft).toBe(true);
  });

  it('reads the focus of a touch press, which has moved it already', () => {
    const { presses, trigger } = setup();
    const outside = el('outside');
    press(outside, { pointerType: 'touch' });
    click(outside);
    expect(presses[0]?.focusLeft).toBe(false);
    trigger.blur();
    press(outside, { pointerType: 'touch' });
    click(outside);
    expect(presses[1]?.focusLeft).toBe(true);
  });

  it('holds the focus-out from the press and releases it once the press has settled', async () => {
    const { held } = setup();
    press(el('outside'), { pointerType: 'mouse' });
    expect(held).toEqual([true]);
    await tick();
    expect(held).toEqual([true, false]);
  });

  it('does not hold the focus-out for a press inside', () => {
    const { held, list } = setup();
    press(list, { pointerType: 'mouse' });
    expect(held).toEqual([]);
  });

  it('keeps a lower layer open when the host refuses a press', () => {
    const lower = vi.fn();
    const base = el('base');
    const trigger = document.createElement('button');
    document.body.append(trigger);
    const lowerLayer = createTriggerDismissLayer({
      trigger: () => base,
      inside: () => [base],
      parent: () => null,
      escape: () => true,
      press: () => {
        lower();
        return true;
      },
      holdFocusOut: () => undefined,
    });
    stops.push(lowerLayer.stop);
    const upper = createTriggerDismissLayer({
      trigger: () => trigger,
      inside: () => [trigger],
      parent: () => null,
      escape: () => true,
      press: () => false,
      holdFocusOut: () => undefined,
    });
    stops.push(upper.stop);
    press(el('outside'), { pointerType: 'mouse' });
    expect(lower).not.toHaveBeenCalled();
  });

  it('keeps the focus on the trigger of a refused mouse press by cancelling its mousedown', async () => {
    setup({ press: () => false });
    press(el('outside'), { pointerType: 'mouse' });
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(mousedown);
    expect(mousedown.defaultPrevented).toBe(true);
    await tick();
    const later = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(later);
    expect(later.defaultPrevented).toBe(false);
  });

  it('removes the one-shot mousedown listener of a refused mouse press on stop', () => {
    const { stop } = setup({ press: () => false });
    press(el('outside'), { pointerType: 'mouse' });
    stop();
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(mousedown);
    expect(mousedown.defaultPrevented).toBe(false);
  });

  it('gives the focus back after a refused touch press', () => {
    const { trigger, held } = setup({ press: () => false });
    const outside = el('outside');
    trigger.blur();
    press(outside, { pointerType: 'touch' });
    click(outside);
    expect(document.activeElement).toBe(trigger);
    expect(held.at(-1)).toBe(false);
  });

  it('stops listening and releases the hold on stop', () => {
    const { stop, held, presses } = setup();
    press(el('outside'), { pointerType: 'touch' });
    stop();
    expect(held.at(-1)).toBe(false);
    press(el('again'), { pointerType: 'mouse' });
    expect(presses).toHaveLength(0);
    stop();
  });
});

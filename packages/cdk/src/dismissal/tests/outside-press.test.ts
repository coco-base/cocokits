// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { click, el, escape, layerFor, nativeDialog, press } from './helpers';

describe('outside press', () => {
  it('dismisses on an outside press and not on an inside press', () => {
    const trigger = el('t');
    const content = el('c');
    const child = el('x', content);
    const { calls } = layerFor([trigger, content]);
    press(trigger);
    press(child);
    expect(calls).toEqual([]);
    press(el('o'));
    expect(calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('ignores a pointerdown that was default-prevented before it reached the document', () => {
    const { calls } = layerFor([el('a')]);
    const prevented = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    prevented.preventDefault();
    document.body.dispatchEvent(prevented);
    expect(calls).toEqual([]);
  });

  it('ignores a pointerdown that the target default-prevented while it was handled (mouse and touch)', () => {
    const { calls } = layerFor([el('a')]);
    const target = el('o');
    target.addEventListener('pointerdown', (event) => {
      event.preventDefault();
    });
    press(target);
    press(target, { pointerType: 'touch' });
    click(target);
    expect(calls).toEqual([]);
  });

  it('closes a tooltip and the popover below it for a press outside both', () => {
    const popoverContent = el('p');
    const popover = layerFor([el('pt'), popoverContent]);
    const tooltip = layerFor([el('tt', popoverContent), el('tc')]);
    press(el('outside'));
    expect(tooltip.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(popover.calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('closes only the tooltip for a press inside the popover', () => {
    const popoverContent = el('p');
    const popover = layerFor([popoverContent]);
    const tooltip = layerFor([el('tt', popoverContent), el('tc')]);
    press(popoverContent);
    expect(tooltip.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(popover.calls).toEqual([]);
  });

  it('skips a layer that does not listen and goes on below it', () => {
    const lower = layerFor([el('l')]);
    const quiet = layerFor([el('q')], { dismissOn: ['escape'] });
    press(el('o'));
    expect(quiet.calls).toEqual([]);
    expect(lower.calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('gives every layer above the one that contains the target an intent, from the top down', () => {
    const order: string[] = [];
    const base = el('base');
    layerFor([base], { onDismiss: () => order.push('base') });
    layerFor([el('mid')], { onDismiss: () => order.push('mid') });
    layerFor([el('top')], { onDismiss: () => order.push('top') });
    press(base);
    expect(order).toEqual(['top', 'mid']);
  });

  it('stops at a refused intent, so the layers below stay open', () => {
    const lower = layerFor([el('l')]);
    const upper = layerFor([el('u')], { refuse: true });
    press(el('o'));
    expect(upper.calls).toHaveLength(1);
    expect(lower.calls).toEqual([]);
  });

  it('counts a layer opened from another as inside the parent', () => {
    const parentContent = el('p');
    const childContent = el('c');
    const parent = layerFor([parentContent]);
    const child = layerFor([childContent], { getParent: () => parent.layer });
    press(childContent);
    expect(parent.calls).toEqual([]);
    expect(child.calls).toEqual([]);
    press(parentContent);
    expect(child.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(parent.calls).toEqual([]);
  });

  it('stacks a child above its parent even when it registered first', () => {
    const parentContent = el('p');
    const childContent = el('c');
    const registered: { parent?: ReturnType<typeof layerFor> } = {};
    const child = layerFor([childContent], { getParent: () => registered.parent?.layer ?? null });
    const parent = layerFor([parentContent]);
    registered.parent = parent;
    escape();
    expect(child.calls).toEqual([['escape', 'keydown']]);
    expect(parent.calls).toEqual([]);
    press(parentContent);
    expect(child.calls).toHaveLength(2);
    expect(parent.calls).toEqual([]);
  });

  it('survives a parent cycle', () => {
    const first: ReturnType<typeof layerFor>[] = [];
    first[0] = layerFor([el('a')], { getParent: () => first[1]?.layer ?? null });
    first[1] = layerFor([el('b')], { getParent: () => first[0]?.layer ?? null });
    expect(() => {
      press(el('o'));
      escape();
    }).not.toThrow();
  });

  it('ends the walk at a modal: nothing below it gets the press', () => {
    const lower = layerFor([el('l')]);
    const dialog = nativeDialog();
    dialog.getBoundingClientRect = () => new DOMRect(100, 100, 200, 100);
    const modal = layerFor([dialog], { getNativeDialog: () => dialog });
    const popover = layerFor([el('p')]);
    press(el('o'));
    expect(popover.calls).toHaveLength(1);
    expect(modal.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(lower.calls).toEqual([]);
  });

  it('dismisses on a press on the dialog outside its rect (the backdrop) but not inside it (the padding)', () => {
    const dialog = nativeDialog();
    dialog.getBoundingClientRect = () => new DOMRect(100, 100, 200, 100);
    const { calls } = layerFor([dialog], { getNativeDialog: () => dialog });
    press(dialog, { clientX: 150, clientY: 150 });
    expect(calls).toEqual([]);
    press(dialog, { clientX: 20, clientY: 150 });
    expect(calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('ignores a secondary-button and a ctrl+primary press on a modal, but not on a non-modal', () => {
    const dialog = nativeDialog();
    dialog.getBoundingClientRect = () => new DOMRect(100, 100, 200, 100);
    const modal = layerFor([dialog], { getNativeDialog: () => dialog });
    press(dialog, { clientX: 20, clientY: 150, button: 2 });
    press(dialog, { clientX: 20, clientY: 150, button: 0, ctrlKey: true });
    expect(modal.calls).toEqual([]);
    modal.layer.destroy();
    const plain = layerFor([el('a')]);
    press(el('o'), { button: 2 });
    expect(plain.calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('reaches no layer below a modal during its exit, and ends the walk with no intent', () => {
    const lower = layerFor([el('l')]);
    const dialog = nativeDialog();
    dialog.getBoundingClientRect = () => new DOMRect(100, 100, 200, 100);
    const modal = layerFor([dialog], { getNativeDialog: () => dialog });
    modal.layer.exit();
    press(el('o'));
    press(dialog, { clientX: 20, clientY: 150 });
    expect(modal.calls).toEqual([]);
    expect(lower.calls).toEqual([]);
    modal.layer.destroy();
    press(el('o2'));
    expect(lower.calls).toHaveLength(1);
  });

  it('does not count a press on the page scrollbar', () => {
    const { calls } = layerFor([el('a')]);
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 100 });
    press(document.documentElement, { clientX: 110, clientY: 5 });
    expect(calls).toEqual([]);
    press(document.documentElement, { clientX: 50, clientY: 0 });
    expect(calls).toEqual([['outside-press', 'pointerdown']]);
    Reflect.deleteProperty(document.documentElement, 'clientWidth');
  });

  it('does not count a press on the scrollbar of any scroller', () => {
    const { calls } = layerFor([el('a')]);
    const scroller = el('scroller');
    scroller.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    Object.defineProperties(scroller, {
      offsetWidth: { value: 100 },
      offsetHeight: { value: 100 },
      clientWidth: { value: 85 },
      clientHeight: { value: 100 },
      clientLeft: { value: 0 },
      clientTop: { value: 0 },
    });
    press(scroller, { clientX: 95, clientY: 50 });
    expect(calls).toEqual([]);
    press(scroller, { clientX: 40, clientY: 50 });
    expect(calls).toEqual([['outside-press', 'pointerdown']]);
  });
});

describe('touch', () => {
  it('waits for the click: a scroll or a long press never dismisses', () => {
    const { calls } = layerFor([el('a')]);
    const outside = el('o');
    press(outside, { pointerType: 'touch' });
    expect(calls).toEqual([]);
    document.dispatchEvent(new Event('pointercancel'));
    click(outside);
    expect(calls).toEqual([]);
  });

  it('dismisses on the click of a tap, with the pointerdown event', () => {
    const { calls, intents } = layerFor([el('a')]);
    const outside = el('o');
    const down = press(outside, { pointerType: 'touch' });
    click(outside);
    expect(calls).toEqual([['outside-press', 'pointerdown']]);
    expect(intents[0]?.event).toBe(down);
    click(outside);
    expect(calls).toHaveLength(1);
  });

  it('decides the layers when the press starts, not when the click arrives', () => {
    const content = el('c');
    const { calls } = layerFor([content]);
    const outside = el('o');
    press(content, { pointerType: 'touch' });
    click(outside);
    expect(calls).toEqual([]);
  });

  it('dispatches a mouse press at pointerdown', () => {
    const { calls } = layerFor([el('a')]);
    press(el('o'), { pointerType: 'mouse' });
    expect(calls).toHaveLength(1);
  });

  it('sets cursor: pointer on iOS while a listening layer exists and restores the author value', () => {
    const agent = vi
      .spyOn(window.navigator, 'userAgent', 'get')
      .mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)');
    document.body.style.cursor = 'crosshair';
    const quiet = layerFor([el('q')], { dismissOn: ['escape'] });
    expect(document.body.style.cursor).toBe('crosshair');
    const first = layerFor([el('a')]);
    const second = layerFor([el('b')]);
    expect(document.body.style.cursor).toBe('pointer');
    first.layer.destroy();
    expect(document.body.style.cursor).toBe('pointer');
    second.layer.exit();
    expect(document.body.style.cursor).toBe('crosshair');
    quiet.layer.destroy();
    agent.mockRestore();
  });

  it('leaves the cursor alone elsewhere', () => {
    layerFor([el('a')]);
    expect(document.body.style.cursor).toBe('');
  });
});

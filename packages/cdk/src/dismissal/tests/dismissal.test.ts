// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { click, el, escape, layerFor, nativeDialog, press, tick } from './helpers';

describe('Escape', () => {
  it('goes to the topmost layer only and is default-prevented', () => {
    const lower = layerFor([el('a')]);
    const upper = layerFor([el('b')]);
    const event = escape();
    expect(upper.calls).toEqual([['escape', 'keydown']]);
    expect(lower.calls).toEqual([]);
    expect(event.defaultPrevented).toBe(true);
    upper.layer.destroy();
    escape();
    expect(lower.calls).toEqual([['escape', 'keydown']]);
  });

  it('does nothing when the topmost layer does not listen for it', () => {
    const { calls } = layerFor([el('a')], { dismissOn: ['outside-press'] });
    const event = escape();
    expect(calls).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves a keydown that an inner element stopped or prevented alone', () => {
    const { calls } = layerFor([el('a')]);
    const inner = el('inner');
    inner.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });
    escape(inner);
    const prevented = el('prevented');
    prevented.addEventListener('keydown', (event) => {
      event.preventDefault();
    });
    escape(prevented);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(calls).toEqual([]);
  });

  it('ignores a keydown during IME composition (isComposing or keyCode 229)', () => {
    const { calls } = layerFor([el('a')]);
    escape(document.body, { isComposing: true });
    escape(document.body, { imeKeyCode: 229 });
    expect(calls).toEqual([]);
  });

  it('treats Escape with a modifier key like Escape', () => {
    const { calls } = layerFor([el('a')]);
    escape(document.body, { shiftKey: true });
    expect(calls).toEqual([['escape', 'keydown']]);
  });

  it('still prevents the keydown when the intent is refused', () => {
    const { intents } = layerFor([el('a')], { refuse: true });
    const event = escape();
    expect(intents[0]?.defaultPrevented).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves the keydown unprevented while the intent is raised, so a handler can refuse it', () => {
    const seen: boolean[] = [];
    layerFor([el('a')], {
      onDismiss: (intent) => {
        seen.push(intent.event.defaultPrevented);
      },
    });
    escape();
    expect(seen).toEqual([false]);
  });

  it('reaches no layer below an exiting modal and does not close it natively', () => {
    const lower = layerFor([el('l')]);
    const dialog = nativeDialog();
    const modal = layerFor([dialog], { getNativeDialog: () => dialog });
    modal.layer.exit();
    const event = escape();
    expect(modal.calls).toEqual([]);
    expect(lower.calls).toEqual([]);
    expect(event.defaultPrevented).toBe(true);
    modal.layer.destroy();
    escape();
    expect(lower.calls).toEqual([['escape', 'keydown']]);
  });

  it('goes to the layer below an exited non-modal layer at once', () => {
    const lower = layerFor([el('l')]);
    const upper = layerFor([el('u')]);
    upper.layer.exit();
    escape();
    expect(upper.calls).toEqual([]);
    expect(lower.calls).toEqual([['escape', 'keydown']]);
  });
});

describe('native cancel', () => {
  it('routes a close request with no key as an escape intent with the cancel event', () => {
    const dialog = nativeDialog();
    const { calls, intents } = layerFor([dialog], { getNativeDialog: () => dialog });
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(calls).toEqual([['escape', 'cancel']]);
    expect(intents[0]?.event).toBe(event);
  });

  it('is not a request when an Escape keydown that an inner element stopped led to it', async () => {
    const dialog = nativeDialog();
    const { calls } = layerFor([dialog], { getNativeDialog: () => dialog });
    const inner = document.createElement('button');
    inner.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });
    dialog.append(inner);
    escape(inner);
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(calls).toEqual([]);
    expect(event.defaultPrevented).toBe(true);
    await tick();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(calls).toEqual([['escape', 'cancel']]);
  });

  it('goes to the topmost layer, so the dialog stays open under a popover', () => {
    const dialog = nativeDialog();
    const lower = layerFor([dialog], { getNativeDialog: () => dialog });
    const upper = layerFor([el('p')]);
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(upper.calls).toEqual([['escape', 'cancel']]);
    expect(lower.calls).toEqual([]);
  });

  it('is swallowed during the exit of the modal', () => {
    const dialog = nativeDialog();
    const { layer, calls } = layerFor([dialog], { getNativeDialog: () => dialog });
    layer.exit();
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(calls).toEqual([]);
  });

  it('leaves the cancel of an unrelated dialog alone', () => {
    layerFor([el('a')]);
    const other = nativeDialog();
    const event = new Event('cancel', { cancelable: true });
    other.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

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

describe('forced native close', () => {
  const closeEvent = (): Event => new Event('close');

  it('reconciles a close that follows a refused cancel as an escape intent that cannot be refused', () => {
    const dialog = nativeDialog();
    const { calls, intents } = layerFor([dialog], { getNativeDialog: () => dialog, refuse: true });
    dialog.dispatchEvent(new Event('cancel', { cancelable: false }));
    expect(calls).toEqual([['escape', 'cancel']]);
    dialog.dispatchEvent(closeEvent());
    expect(calls).toEqual([
      ['escape', 'cancel'],
      ['escape', 'close'],
    ]);
    expect(intents[1]?.defaultPrevented).toBe(false);
  });

  it('reconciles a close that is delivered in a later task, after any timer (the native close is queued)', async () => {
    const dialog = nativeDialog();
    const { calls } = layerFor([dialog], { getNativeDialog: () => dialog, refuse: true });
    dialog.dispatchEvent(new Event('cancel', { cancelable: false }));
    await tick();
    await tick();
    dialog.dispatchEvent(closeEvent());
    expect(calls).toEqual([
      ['escape', 'cancel'],
      ['escape', 'close'],
    ]);
  });

  it('keeps the mark for its own dialog when another dialog closes first', () => {
    const b = nativeDialog();
    const a = nativeDialog();
    const lower = layerFor([b], { getNativeDialog: () => b });
    const upper = layerFor([a], { getNativeDialog: () => a, refuse: true });
    a.dispatchEvent(new Event('cancel', { cancelable: false }));
    b.dispatchEvent(closeEvent());
    expect(lower.calls).toEqual([]);
    a.dispatchEvent(closeEvent());
    expect(upper.calls).toEqual([
      ['escape', 'cancel'],
      ['escape', 'close'],
    ]);
  });

  it('leaves a close with no refused cancel before it alone (a form method=dialog close)', async () => {
    const dialog = nativeDialog();
    const { calls } = layerFor([dialog], { getNativeDialog: () => dialog, refuse: true });
    dialog.dispatchEvent(closeEvent());
    expect(calls).toEqual([]);
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await tick();
    dialog.dispatchEvent(closeEvent());
    // A cancel the browser let us prevent does not close the dialog: a later close is some other close.
    expect(calls).toEqual([['escape', 'cancel']]);
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

describe('focus-out', () => {
  it('dismisses only a layer that listens for it', () => {
    const inside = document.createElement('button');
    const outside = document.createElement('button');
    document.body.append(inside, outside);
    const quiet = layerFor([inside]);
    outside.focus();
    expect(quiet.calls).toEqual([]);
    quiet.layer.destroy();
    const loud = layerFor([inside], { dismissOn: ['escape', 'outside-press', 'focus-out'] });
    inside.focus();
    expect(loud.calls).toEqual([]);
    outside.focus();
    expect(loud.calls).toEqual([['focus-out', 'focusin']]);
  });

  it('ends at a modal', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const popover = layerFor([el('p')], { dismissOn: ['focus-out'] });
    const dialog = nativeDialog();
    layerFor([dialog], { getNativeDialog: () => dialog });
    outside.focus();
    expect(popover.calls).toEqual([]);
  });
});

describe('lifetime', () => {
  it('removes every listener it added with the last layer and ignores a second destroy', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const first = layerFor([el('a')]);
    const second = layerFor([el('b')]);
    const added = add.mock.calls.length;
    first.layer.destroy();
    expect(remove).not.toHaveBeenCalled();
    second.layer.destroy();
    second.layer.destroy();
    expect(remove).toHaveBeenCalledTimes(added);
    escape();
    expect(first.calls).toEqual([]);
    expect(second.calls).toEqual([]);
    add.mockRestore();
    remove.mockRestore();
  });

  it('registers nothing while no element exists yet', () => {
    const { layer, calls } = layerFor([]);
    escape();
    layer.exit();
    layer.destroy();
    expect(calls).toEqual([]);
  });

  it('gives a destroyed layer no intent that is already collected', () => {
    const order: string[] = [];
    const lowerLayer = layerFor([el('l')], { onDismiss: () => order.push('lower') });
    layerFor([el('u')], {
      onDismiss: () => {
        order.push('upper');
        lowerLayer.layer.destroy();
      },
    });
    press(el('o'));
    expect(order).toEqual(['upper']);
  });
});

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { el, layerFor, nativeDialog, press } from './helpers';

describe('modal option', () => {
  it('makes a layer without a native dialog a barrier for the layers below', () => {
    const lower = layerFor([el('l')]);
    const upper = layerFor([el('u')], { modal: true });
    press(el('outside'));
    expect(upper.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(lower.calls).toEqual([]);
  });

  it('ends the walk even when the modal layer does not listen', () => {
    const lower = layerFor([el('l')]);
    layerFor([el('u')], { modal: true, dismissOn: ['escape'] });
    press(el('outside'));
    expect(lower.calls).toEqual([]);
  });

  it('keeps a layer opened from the modal one usable and lets the modal one stay open', () => {
    const modal = layerFor([el('m')], { modal: true });
    const inner = el('c');
    const child = layerFor([inner], { getParent: () => modal.layer });
    press(inner);
    expect(child.calls).toEqual([]);
    expect(modal.calls).toEqual([]);
  });

  it('stays a barrier after exit() until destroy()', () => {
    const lower = layerFor([el('l')]);
    const upper = layerFor([el('u')], { modal: true });
    upper.layer.exit();
    const outside = el('outside');
    press(outside);
    expect(lower.calls).toEqual([]);
    upper.layer.destroy();
    press(outside);
    expect(lower.calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('is off by default', () => {
    const lower = layerFor([el('l')]);
    layerFor([el('u')]);
    press(el('outside'));
    expect(lower.calls).toEqual([['outside-press', 'pointerdown']]);
  });
});

describe('a native dialog that is open but not modal', () => {
  it('is not a barrier: an outside press also reaches the layer below', () => {
    const lower = layerFor([el('l')]);
    const dialog = nativeDialog();
    dialog.setAttribute('open', '');
    const upper = layerFor([dialog], { getNativeDialog: () => dialog });
    press(el('outside'));
    expect(upper.calls).toEqual([['outside-press', 'pointerdown']]);
    expect(lower.calls).toEqual([['outside-press', 'pointerdown']]);
  });

  it('closes on focus moving out, and a press inside it is not outside', () => {
    const dialog = nativeDialog();
    dialog.setAttribute('open', '');
    const inner = document.createElement('button');
    dialog.append(inner);
    const { calls } = layerFor([dialog], { getNativeDialog: () => dialog, dismissOn: ['outside-press', 'focus-out'] });
    press(inner);
    expect(calls).toEqual([]);
    const outside = el('outside');
    outside.tabIndex = 0;
    outside.focus();
    expect(calls).toEqual([['focus-out', 'focusin']]);
  });

  it('is still a barrier while it is not open yet', () => {
    const lower = layerFor([el('l')]);
    const dialog = nativeDialog();
    layerFor([dialog], { getNativeDialog: () => dialog });
    press(el('outside'));
    expect(lower.calls).toEqual([]);
  });
});

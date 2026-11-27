// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { scheduleFocus, trackFocusVisible } from '../index';

describe('trackFocusVisible', () => {
  it('is visible after a key press and not after a pointer press', () => {
    const tracker = trackFocusVisible(document);
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(tracker.isFocusVisible()).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(tracker.isFocusVisible()).toBe(true);
    tracker.destroy();
  });

  it('ignores a lone modifier key', () => {
    const tracker = trackFocusVisible(document);
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));
    expect(tracker.isFocusVisible()).toBe(false);
    tracker.destroy();
  });

  it('shares one listener set and removes it with the last tracker', () => {
    const first = trackFocusVisible(document);
    const second = trackFocusVisible(document);
    first.destroy();
    first.destroy();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(second.isFocusVisible()).toBe(false);
    second.destroy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(second.isFocusVisible()).toBe(false);
    const fresh = trackFocusVisible(document);
    expect(fresh.isFocusVisible()).toBe(true);
    fresh.destroy();
  });
});

describe('trackFocusVisible and window focus', () => {
  const refocusWindow = (): void => {
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
  };

  it('keeps visible after a key press when the window regains focus', () => {
    const tracker = trackFocusVisible(document);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    refocusWindow();
    expect(tracker.isFocusVisible()).toBe(true);
    tracker.destroy();
  });

  it('keeps not visible after a pointer press when the window regains focus', () => {
    const tracker = trackFocusVisible(document);
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    refocusWindow();
    expect(tracker.isFocusVisible()).toBe(false);
    tracker.destroy();
  });
});

describe('scheduleFocus', () => {
  it('runs the task in the next frame and can be cancelled', async () => {
    const calls: string[] = [];
    scheduleFocus(document, () => calls.push('ran'));
    scheduleFocus(document, () => calls.push('cancelled'))();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(calls).toEqual(['ran']);
  });
});

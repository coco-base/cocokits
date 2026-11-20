import { describe, expect, it, vi } from 'vitest';
import { buttonAnatomy, buttonMeta, getButtonProps, linkClickGuard } from '../index';

const cls = 'cck-button';

describe('getButtonProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(buttonAnatomy.classes.root).toBe(cls);
  });

  it.each([
    ['button enabled', { element: 'button' }, { class: cls }],
    ['button explicit false', { element: 'button', disabled: false }, { class: cls }],
    ['a enabled', { element: 'a' }, { class: cls }],
    ['button disabled', { element: 'button', disabled: true }, { class: cls, disabled: true, 'data-disabled': '' }],
  ] as const)('%s', (_name, input, expected) => {
    expect(getButtonProps(input)).toEqual(expected);
  });

  it('disabled link: aria-disabled, tabindex -1, data-disabled, guard, no disabled attribute', () => {
    const props = getButtonProps({ element: 'a', disabled: true });
    expect(props).toEqual({
      class: cls,
      'aria-disabled': 'true',
      tabindex: -1,
      'data-disabled': '',
      onClick: linkClickGuard,
    });
    expect(props).not.toHaveProperty('disabled');
  });

  it('only emits data-* declared in the meta', () => {
    for (const element of ['button', 'a'] as const) {
      const keys = Object.keys(getButtonProps({ element, disabled: true })).filter((k) => k.startsWith('data-'));
      expect(buttonMeta.dataAttrs.root).toEqual(expect.arrayContaining(keys));
    }
  });

  it('does not set type', () => {
    expect(getButtonProps({ element: 'button' })).not.toHaveProperty('type');
  });
});

describe('link guard', () => {
  const makeEvent = (defaultPrevented: boolean) => ({
    defaultPrevented,
    preventDefault: vi.fn(),
    stopImmediatePropagation: vi.fn(),
  });

  it('prevents default and stops other listeners', () => {
    const event = makeEvent(false);
    linkClickGuard(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('does nothing when default is already prevented', () => {
    const event = makeEvent(true);
    linkClickGuard(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
  });
});

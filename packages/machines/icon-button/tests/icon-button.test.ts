import { describe, expect, it } from 'vitest';
import { buttonMeta, getButtonProps, linkClickGuard } from '../../button';
import { getIconButtonProps, iconButtonAnatomy, iconButtonMeta } from '../index';

const cls = 'cck-icon-button';

describe('getIconButtonProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(iconButtonAnatomy.block).toBe('icon-button');
    expect(iconButtonAnatomy.classes.root).toBe(cls);
  });

  it.each([
    ['button enabled', { element: 'button' }, { class: cls }],
    ['button explicit false', { element: 'button', disabled: false }, { class: cls }],
    ['a enabled', { element: 'a' }, { class: cls }],
    ['button disabled', { element: 'button', disabled: true }, { class: cls, disabled: true, 'data-disabled': '' }],
    [
      'a disabled',
      { element: 'a', disabled: true },
      { class: cls, 'aria-disabled': 'true', tabindex: -1, 'data-disabled': '', onClick: linkClickGuard },
    ],
  ] as const)('%s', (_name, input, expected) => {
    expect(getIconButtonProps(input)).toEqual(expected);
  });

  it('is the Button props with only the class changed', () => {
    for (const element of ['button', 'a'] as const) {
      for (const disabled of [false, true]) {
        expect(getIconButtonProps({ element, disabled })).toEqual({
          ...getButtonProps({ element, disabled }),
          class: cls,
        });
      }
    }
  });

  it('does not set type', () => {
    expect(getIconButtonProps({ element: 'button' })).not.toHaveProperty('type');
  });

  it('only emits data-* declared in the meta', () => {
    for (const element of ['button', 'a'] as const) {
      const keys = Object.keys(getIconButtonProps({ element, disabled: true })).filter((k) => k.startsWith('data-'));
      expect(iconButtonMeta.dataAttrs.root).toEqual(expect.arrayContaining(keys));
    }
  });
});

describe('iconButtonMeta', () => {
  it('reuses the Button meta rows', () => {
    expect(iconButtonMeta).toEqual(buttonMeta);
    expect(iconButtonMeta.keyboard).toBe(buttonMeta.keyboard);
  });
});

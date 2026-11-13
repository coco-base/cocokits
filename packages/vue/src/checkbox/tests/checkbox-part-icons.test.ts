// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { iconNamesIn, noPartIconsThemeConfig, themed } from '../../internal/tests/part-icon-fixtures';
import { Radio } from '../../radio';
import { Checkbox } from '../index';
import { box } from './fixtures';
import { mountView } from '../../internal/tests/mount-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const background = (): Element | null => document.querySelector('.cck-checkbox__background');

describe('Checkbox part icon (the theme names it)', () => {
  const states: readonly [string, Record<string, unknown>, string[]][] = [
    ['unchecked', { modelValue: false }, []],
    ['checked', { modelValue: true }, ['check']],
    ['indeterminate', { modelValue: false, indeterminate: true }, []],
    ['checked and indeterminate', { modelValue: true, indeterminate: true }, []],
  ];
  it.each(states)('while %s, the background holds %j', (_name, props, expected) => {
    mountView(themed(() => h(Checkbox, { 'aria-label': 'Terms', ...props })));
    expect(iconNamesIn(background())).toEqual(expected);
    expect(background()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('adds and removes the tick with the state', async () => {
    const checked = ref(false);
    mountView(
      themed(() =>
        h(Checkbox, {
          'aria-label': 'Terms',
          modelValue: checked.value,
          'onUpdate:modelValue': (next: unknown) => {
            checked.value = next === true;
          },
        }),
      ),
    );
    expect(iconNamesIn(background())).toEqual([]);
    await userEvent.click(box());
    expect(iconNamesIn(background())).toEqual(['check']);
    await userEvent.click(box());
    expect(iconNamesIn(background())).toEqual([]);
  });

  it('draws no tick without a theme, and with a theme that names none', () => {
    mountView(() => h(Checkbox, { 'aria-label': 'Terms', modelValue: true }));
    expect(background()?.innerHTML).toBe('');
    cleanup();
    mountView(themed(() => h(Checkbox, { 'aria-label': 'Terms', modelValue: true }), noPartIconsThemeConfig));
    expect(background()?.innerHTML).toBe('');
  });

  it('gives the Radio no icon', () => {
    mountView(themed(() => h(Radio, { 'aria-label': 'Free', name: 'plan', value: 'free', modelValue: true })));
    expect(document.querySelector('.cck-radio__background')?.innerHTML).toBe('');
  });
});

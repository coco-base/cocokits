// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  customPartIconsThemeConfig,
  drawnIconsIn,
  missingPartIconsThemeConfig,
  noPartIconsThemeConfig,
  themed,
} from '../../internal/tests/part-icon-fixtures';
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
    expect(drawnIconsIn(background())).toEqual(expected);
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
    expect(drawnIconsIn(background())).toEqual([]);
    await userEvent.click(box());
    expect(drawnIconsIn(background())).toEqual(['check']);
    await userEvent.click(box());
    expect(drawnIconsIn(background())).toEqual([]);
  });

  const rows: readonly [string, Parameters<typeof themed>[1] | undefined, string, boolean][] = [
    ['no theme', undefined, 'check', false],
    ['a theme that names none', noPartIconsThemeConfig, 'check', false],
    ['a theme icon the registry has', customPartIconsThemeConfig, 'heart', false],
    ['a theme icon the registry lacks', missingPartIconsThemeConfig, 'check', true],
  ];
  it.each(rows)('draws the tick of the fallback order with %s', (_name, config, expected, logs) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const render = () => h(Checkbox, { 'aria-label': 'Terms', modelValue: true });
    mountView(config === undefined ? render : themed(render, config));
    expect(drawnIconsIn(background())).toEqual([expected]);
    const messages = error.mock.calls.map((call) => String(call[0]));
    expect(messages.some((message) => message.includes('"nope"') && message.includes('background'))).toBe(logs);
    if (!logs) expect(error).not.toHaveBeenCalled();
  });

  it('gives the Radio no icon', () => {
    mountView(themed(() => h(Radio, { 'aria-label': 'Free', name: 'plan', value: 'free', modelValue: true })));
    expect(document.querySelector('.cck-radio__background')?.innerHTML).toBe('');
  });
});

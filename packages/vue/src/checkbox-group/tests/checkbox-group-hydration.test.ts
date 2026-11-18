// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { CheckboxGroup } from '../index';

let mounted: App | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const app = (): App =>
  createSSRApp({
    render: () =>
      h(
        FormField,
        { id: 'f' },
        {
          label: () => h(Label, null, () => 'Toppings'),
          default: () =>
            h(CheckboxGroup, { defaultValue: ['olives'], name: 'toppings' }, () => [
              h(Checkbox, { value: 'cheese' }, () => 'Cheese'),
              h(Checkbox, { value: 'olives' }, () => 'Olives'),
            ]),
        },
      ),
  });

describe('CheckboxGroup hydration', () => {
  it('hydrates the server markup without a mismatch and keeps working', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(app());
    mounted = app();
    mounted.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    await nextTick();
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input')];
    expect(inputs.map((input) => input.checked)).toEqual([false, true]);
    await userEvent.click(inputs[0]);
    expect(inputs.map((input) => input.checked)).toEqual([true, true]);
  });
});

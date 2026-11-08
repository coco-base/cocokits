// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField as BaseFormField } from '@cocokits/vue/form-field';
import { Hint } from '@cocokits/vue/hint';
import { Input } from '@cocokits/vue/input';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, type FormFieldProps } from '../src/index';
import { themed } from './helpers';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const formFieldAnatomy = defineAnatomy({
  block: 'form-field',
  parts: {
    root: { name: 'Root', description: 'The field.' },
    inputWrapper: { name: 'InputWrapper', description: 'The control zone.' },
  },
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { size } = cocokitsThemeConfig.components['form-field'];

const root = (): HTMLElement => screen.getByTestId('field');
const inputWrapper = (): HTMLElement => {
  const wrapper = root().querySelector<HTMLElement>(`.${formFieldAnatomy.classes.inputWrapper}`);
  if (!wrapper) throw new Error('no input wrapper');
  return wrapper;
};
const sizes = (): (string | null)[] => [root().getAttribute('data-size'), inputWrapper().getAttribute('data-size')];
const mount = (props: Partial<FormFieldProps> = {}): void => {
  render(themed(() => h(FormField, { 'data-testid': 'field', ...props })));
};

describe('theme FormField', () => {
  it('renders the config default on the root and the input wrapper', () => {
    mount();
    expect(sizes()).toEqual(['md', 'md']);
    expect(root().classList.contains(formFieldAnatomy.classes.root)).toBe(true);
  });

  it.each(size.values)('moves data-size to %s on both parts', (value) => {
    mount({ size: value });
    expect(sizes()).toEqual([value, value]);
  });

  it('removes the attribute with null', () => {
    mount({ size: null });
    expect(sizes()).toEqual([null, null]);
  });

  it('follows a changed size prop', async () => {
    const current = ref<FormFieldProps['size']>('sm');
    render(themed(() => h(FormField, { 'data-testid': 'field', size: current.value })));
    expect(sizes()).toEqual(['sm', 'sm']);
    current.value = 'lg';
    await nextTick();
    expect(sizes()).toEqual(['lg', 'lg']);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      themed(() => [h(FormField, { 'data-testid': 'field' }), h(FormField, { 'data-testid': 'own', size: 'sm' })], {
        'form-field': { size: 'lg' },
      }),
    );
    expect(sizes()).toEqual(['lg', 'lg']);
    expect(screen.getByTestId('own').getAttribute('data-size')).toBe('sm');
  });

  it('renders no data-size for a base without a theme provider', () => {
    render(BaseFormField, { attrs: { 'data-testid': 'field' } });
    expect(sizes()).toEqual([null, null]);
  });

  it('renders a div by default and keeps data-size with as and asChild', () => {
    mount({ size: 'lg' });
    expect(root().tagName).toBe('DIV');
    expect(sizes()).toEqual(['lg', 'lg']);
    cleanup();
    mount({ size: 'sm', as: 'section' });
    expect(root().tagName).toBe('SECTION');
    expect(sizes()).toEqual(['sm', 'sm']);
    cleanup();
    render(themed(() => h(FormField, { size: 'lg', asChild: true }, () => h('article', { 'data-testid': 'field' }))));
    expect(root().tagName).toBe('ARTICLE');
    expect(sizes()).toEqual(['lg', 'lg']);
  });

  it('forwards the base props and the label, control and hint slots', async () => {
    render(
      themed(() =>
        h(
          FormField,
          { 'data-testid': 'field', required: true },
          {
            label: () => h('span', 'Email'),
            default: () => h(Input, { 'data-testid': 'input' }),
            hint: () => h(Hint, () => 'Hint'),
          },
        ),
      ),
    );
    await nextTick();
    const input = screen.getByTestId('input');
    expect(input.hasAttribute('required')).toBe(true);
    expect(root().hasAttribute('data-required')).toBe(true);
    expect(inputWrapper().contains(input)).toBe(true);
    expect(input.getAttribute('id')).toMatch(/-control$/);
    expect(input.getAttribute('aria-describedby')).toMatch(/-hint-1$/);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Hint')).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormField as BaseFormField } from '@cocokits/react/form-field';
import { Hint } from '@cocokits/react/hint';
import { Input } from '@cocokits/react/input';
import { ThemeProvider } from '@cocokits/react-core';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField } from '../src/index';
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

const root = (): HTMLElement => screen.getByTestId('field');
const inputWrapper = (): HTMLElement => {
  const wrapper = root().querySelector<HTMLElement>(`.${formFieldAnatomy.classes.inputWrapper}`);
  if (!wrapper) throw new Error('no input wrapper');
  return wrapper;
};
const sizes = (): (string | null)[] => [root().getAttribute('data-size'), inputWrapper().getAttribute('data-size')];

const { size } = cocokitsThemeConfig.components['form-field'];

describe('theme FormField', () => {
  it('renders the config default on the root and the input wrapper', () => {
    render(themed(<FormField data-testid="field" />));
    expect(sizes()).toEqual(['md', 'md']);
    expect(root().className).toBe(formFieldAnatomy.classes.root);
  });

  it.each(size.values)('moves data-size to %s on both parts', (value) => {
    render(themed(<FormField data-testid="field" size={value} />));
    expect(sizes()).toEqual([value, value]);
  });

  it('removes the attribute with null', () => {
    render(themed(<FormField data-testid="field" size={null} />));
    expect(sizes()).toEqual([null, null]);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ 'form-field': { size: 'lg' } }}>
        <FormField data-testid="field" />
        <FormField data-testid="own" size="sm" />
      </ThemeProvider>,
    );
    expect(sizes()).toEqual(['lg', 'lg']);
    expect(screen.getByTestId('own').getAttribute('data-size')).toBe('sm');
  });

  it('renders no data-size for a base without a theme provider', () => {
    render(<BaseFormField data-testid="field" />);
    expect(sizes()).toEqual([null, null]);
  });

  it('forwards the base props, the label, the control and the hint', () => {
    render(
      themed(
        <FormField data-testid="field" required label={<span>Email</span>} hint={<Hint>Hint</Hint>}>
          <Input data-testid="input" />
        </FormField>,
      ),
    );
    const input = screen.getByTestId('input');
    expect(input.hasAttribute('required')).toBe(true);
    expect(root().hasAttribute('data-required')).toBe(true);
    expect(inputWrapper().contains(input)).toBe(true);
    expect(input.getAttribute('id')).toMatch(/-control$/);
    expect(input.getAttribute('aria-describedby')).toMatch(/-hint-1$/);
  });

  it('renders a div by default and keeps data-size on an element chosen with render', () => {
    render(themed(<FormField data-testid="field" size="lg" />));
    expect(root().tagName).toBe('DIV');
    expect(sizes()).toEqual(['lg', 'lg']);
    cleanup();
    render(themed(<FormField data-testid="field" size="sm" render={<section />} />));
    expect(root().tagName).toBe('SECTION');
    expect(sizes()).toEqual(['sm', 'sm']);
  });

  it('does not log from the component under StrictMode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<FormField data-testid="field" />));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { IconButton, SvgIcon, type IconButtonProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { variant, color, size, rounded } = cocokitsThemeConfig.components['icon-button'];

const withIcon = (props: Partial<IconButtonProps> = {}): ReactElement => (
  <IconButton aria-label="Add" {...props}>
    <SvgIcon iconName="plus" />
  </IconButton>
);

describe('theme IconButton', () => {
  it('renders the config defaults and the class', () => {
    render(themed(withIcon()));
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).toBe('cck-icon-button');
    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.getAttribute('data-cck-color')).toBe('brand');
    expect(button.getAttribute('data-size')).toBe('md');
    expect(button.hasAttribute('data-rounded')).toBe(false);
  });

  it.each([
    ['variant', 'data-variant', variant.values],
    ['color', 'data-cck-color', color.values],
    ['size', 'data-size', size.values],
  ] as const)('moves %s to every value', (option, attribute, values) => {
    for (const value of values) {
      render(themed(withIcon({ [option]: value })));
      expect(screen.getByRole('button').getAttribute(attribute)).toBe(value);
      cleanup();
    }
  });

  it('has the Button values for variant, and the three sizes of its own collection', () => {
    expect(variant.values).toEqual(['primary', 'outline', 'light', 'basic']);
    expect(size.values).toEqual(['sm', 'md', 'lg']);
    expect(rounded.values).toEqual([true, false]);
  });

  it('renders data-rounded while rounded is true', () => {
    render(themed(withIcon({ rounded: true })));
    expect(screen.getByRole('button').hasAttribute('data-rounded')).toBe(true);
  });

  it('removes an attribute with null', () => {
    render(themed(withIcon({ variant: null, color: null, size: null })));
    const button = screen.getByRole('button');
    expect(['data-variant', 'data-cck-color', 'data-size'].filter((name) => button.hasAttribute(name))).toEqual([]);
  });

  it('lets a provider override win over the default, and the own prop win over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ 'icon-button': { variant: 'light', size: 'lg' } }}>
        {withIcon({ size: 'sm' })}
      </ThemeProvider>,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('data-variant')).toBe('light');
    expect(button.getAttribute('data-size')).toBe('sm');
  });

  it('renders a disabled link with the theme data-*', () => {
    render(
      themed(
        <IconButton aria-label="Go" nativeButton={false} disabled size="lg" render={<a href="#go" />}>
          <SvgIcon iconName="link" />
        </IconButton>,
      ),
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.getAttribute('data-size')).toBe('lg');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('type')).toBe(false);
  });

  it('does not log from the component with a name and a pack icon', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(themed(withIcon()));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(error).not.toHaveBeenCalled();
  });
});

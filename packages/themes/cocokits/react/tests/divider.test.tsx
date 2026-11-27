// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Divider as BaseDivider } from '@cocokits/react/divider';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Divider } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const divider = (): HTMLElement => screen.getByTestId('divider');
const { size, color } = cocokitsThemeConfig.components.divider;

describe('theme Divider', () => {
  it('renders the config defaults on one hr with the base attributes', () => {
    render(themed(<Divider data-testid="divider" />));
    expect(divider().tagName).toBe('HR');
    expect(divider().className).toBe('cck-divider');
    expect(divider().getAttribute('data-size')).toBe('md');
    expect(divider().getAttribute('data-color')).toBe('default');
    expect(divider().getAttribute('data-orientation')).toBe('horizontal');
    expect(divider().hasAttribute('data-cck-color')).toBe(false);
  });

  it.each([
    ['size', 'data-size', size.values],
    ['color', 'data-color', color.values],
  ] as const)('moves %s to every value', (option, attribute, values) => {
    for (const value of values) {
      render(themed(<Divider data-testid="divider" {...{ [option]: value }} />));
      expect(divider().getAttribute(attribute)).toBe(value);
      cleanup();
    }
  });

  it('removes an attribute with null', () => {
    render(themed(<Divider data-testid="divider" size={null} color={null} />));
    for (const name of ['data-size', 'data-color']) expect(divider().hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ divider: { size: 'lg', color: 'dark' } }}>
        <Divider data-testid="divider" size="md" />
      </ThemeProvider>,
    );
    expect(divider().getAttribute('data-size')).toBe('md');
    expect(divider().getAttribute('data-color')).toBe('dark');
  });

  it('updates a mounted root: value, null, then undefined restores the default', () => {
    const { rerender } = render(themed(<Divider data-testid="divider" color="dark" />));
    const element = divider();
    expect(element.getAttribute('data-color')).toBe('dark');
    rerender(themed(<Divider data-testid="divider" color={null} />));
    expect(divider()).toBe(element);
    expect(element.hasAttribute('data-color')).toBe(false);
    rerender(themed(<Divider data-testid="divider" color={undefined} />));
    expect(element.getAttribute('data-color')).toBe('default');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(<BaseDivider data-testid="divider" />);
    expect(divider().hasAttribute('data-size')).toBe(false);
    expect(divider().hasAttribute('data-color')).toBe(false);
  });

  it('passes the base props and native attributes through, and ref reaches the hr', () => {
    const ref = createRef<HTMLHRElement>();
    render(
      themed(<Divider ref={ref} data-testid="divider" orientation="vertical" decorative id="x" className="mine" />),
    );
    expect(ref.current).toBe(divider());
    expect(divider().getAttribute('data-orientation')).toBe('vertical');
    expect(divider().getAttribute('role')).toBe('none');
    expect(divider().id).toBe('x');
    expect(divider().className).toContain('cck-divider');
    expect(divider().className).toContain('mine');
  });

  it('does not log under StrictMode and names itself Divider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<Divider />));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(Divider.displayName).toBe('Divider');
  });
});

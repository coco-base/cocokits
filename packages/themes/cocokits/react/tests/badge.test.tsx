// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge as BaseBadge } from '@cocokits/react/badge';
import { BadgeContainer } from '@cocokits/react/badge-container';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Badge } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const badge = (): HTMLElement => screen.getByTestId('badge');
const { variant, color, size } = cocokitsThemeConfig.components.badge;

describe('theme Badge', () => {
  it('renders the config defaults', () => {
    render(themed(<Badge data-testid="badge" content={5} />));
    expect(badge().getAttribute('data-variant')).toBe('rounded');
    expect(badge().getAttribute('data-cck-color')).toBe('contrast');
    expect(badge().getAttribute('data-size')).toBe('md');
    expect(badge().className).toBe('cck-badge');
    expect(badge().textContent).toBe('5');
  });

  it.each([
    ['variant', 'data-variant', variant.values],
    ['color', 'data-cck-color', color.values],
    ['size', 'data-size', size.values],
  ] as const)('moves %s to every value', (option, attribute, values) => {
    for (const value of values) {
      render(themed(<Badge data-testid="badge" {...{ [option]: value }} />));
      expect(badge().getAttribute(attribute)).toBe(value);
      cleanup();
    }
  });

  it('removes an attribute with null', () => {
    render(themed(<Badge data-testid="badge" variant={null} color={null} size={null} />));
    for (const name of ['data-variant', 'data-cck-color', 'data-size']) expect(badge().hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ badge: { variant: 'rectangle', size: 'xl' } }}>
        <Badge data-testid="badge" size="sm" />
      </ThemeProvider>,
    );
    expect(badge().getAttribute('data-variant')).toBe('rectangle');
    expect(badge().getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', () => {
    const { rerender } = render(themed(<Badge data-testid="badge" variant="rectangle" />));
    const element = badge();
    expect(element.getAttribute('data-variant')).toBe('rectangle');
    rerender(themed(<Badge data-testid="badge" variant={null} />));
    expect(badge()).toBe(element);
    expect(element.hasAttribute('data-variant')).toBe(false);
    rerender(themed(<Badge data-testid="badge" variant={undefined} />));
    expect(badge()).toBe(element);
    expect(element.getAttribute('data-variant')).toBe('rounded');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(<BaseBadge data-testid="badge" />);
    expect(
      badge()
        .getAttributeNames()
        .filter((name) => /^data-(variant|cck-color|size)$/.test(name)),
    ).toEqual([]);
  });

  it('passes the base props and the container position through', () => {
    render(
      themed(
        <BadgeContainer position="bottom-right">
          <Badge data-testid="badge" content="120" max={99} />
        </BadgeContainer>,
      ),
    );
    expect(badge().parentElement?.getAttribute('data-position')).toBe('bottom-right');
    expect(badge().hasAttribute('data-position')).toBe(false);
    expect(badge().hasAttribute('hidden')).toBe(false);
    expect(badge().hasAttribute('data-truncated')).toBe(true);
    expect(badge().textContent).toBe('99+');
  });

  it('does not log under StrictMode and names itself Badge', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<Badge />));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(Badge.displayName).toBe('Badge');
  });
});

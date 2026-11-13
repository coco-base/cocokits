// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { heartIcon } from '@cocokits/icons';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { SvgIcon, type SvgIconProps } from '../src/index';
import { packIcons, themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { size, color } = cocokitsThemeConfig.components['svg-icon'];

const rootOf = (container: HTMLElement): HTMLElement => container.firstElementChild as HTMLElement;
const icon = (props: Partial<SvgIconProps> = {}): ReactElement => <SvgIcon iconName="heart" {...props} />;

describe('theme SvgIcon', () => {
  it('renders a registered icon with no option attribute by default', () => {
    const { container } = render(themed(icon()));
    const root = rootOf(container);
    expect(root.className).toBe('cck-svg-icon');
    expect(root.getAttribute('data-icon')).toBe('heart');
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(['data-size', 'data-cck-color', 'data-rtl-mirror'].filter((name) => root.hasAttribute(name))).toEqual([]);
  });

  it('has the sizes of its own collection and no default size or color', () => {
    expect(size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
    expect(size.default).toBeNull();
    expect(color.default).toBeNull();
  });

  it.each([
    ['size', 'data-size', size.values],
    ['color', 'data-cck-color', color.values],
  ] as const)('sets %s to every value', (option, attribute, values) => {
    for (const value of values) {
      const { container } = render(themed(icon({ [option]: value })));
      expect(rootOf(container).getAttribute(attribute)).toBe(value);
      cleanup();
    }
  });

  it('renders data-rtl-mirror while rtlMirror is true', () => {
    const { container } = render(themed(icon({ rtlMirror: true })));
    expect(rootOf(container).hasAttribute('data-rtl-mirror')).toBe(true);
  });

  it('removes an attribute with null', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ 'svg-icon': { size: 'lg' } }}>
        {icon({ size: null })}
      </ThemeProvider>,
    );
    expect(rootOf(container).hasAttribute('data-size')).toBe(false);
  });

  it('puts the options on the root only, and keeps label and the native props', () => {
    const { container } = render(themed(icon({ size: 'lg', label: 'Favourite', className: 'mine' })));
    const root = rootOf(container);
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Favourite');
    expect(root.className).toBe('cck-svg-icon mine');
    expect(container.querySelector('svg')?.hasAttribute('data-size')).toBe(false);
  });

  it('draws every icon of the pack without an error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    for (const name of Object.keys(packIcons)) {
      const { container } = render(themed(<SvgIcon iconName={name} />));
      expect(container.querySelectorAll('path').length, name).toBeGreaterThan(0);
      cleanup();
    }
    expect(error).not.toHaveBeenCalled();
  });
});

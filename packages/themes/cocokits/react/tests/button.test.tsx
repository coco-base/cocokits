// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button as BaseButton } from '@cocokits/react/button';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Button, type ButtonProps } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const button = (): HTMLElement => screen.getByRole('button');
const themed = (ui: ReactElement): ReactElement => (
  <StrictMode>
    <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>
  </StrictMode>
);

const { variant, color, size } = cocokitsThemeConfig.components.button;

describe('theme Button', () => {
  it('renders the config defaults', () => {
    render(themed(<Button>Save</Button>));
    expect(button().getAttribute('data-variant')).toBe('primary');
    expect(button().getAttribute('data-cck-color')).toBe('brand');
    expect(button().getAttribute('data-size')).toBe('md');
    expect(button().className).toBe('cck-button');
  });

  it.each(variant.values)('moves data-variant to %s', (value) => {
    render(themed(<Button variant={value}>Save</Button>));
    expect(button().getAttribute('data-variant')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    render(themed(<Button color={value}>Save</Button>));
    expect(button().getAttribute('data-cck-color')).toBe(value);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    render(themed(<Button size={value}>Save</Button>));
    expect(button().getAttribute('data-size')).toBe(value);
  });

  it('removes an attribute with null', () => {
    render(themed(<Button variant={null} color={null} size={null} />));
    expect(button().hasAttribute('data-variant')).toBe(false);
    expect(button().hasAttribute('data-cck-color')).toBe(false);
    expect(button().hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop win over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ button: { variant: 'light', size: 'lg' } }}>
        <Button size="sm">Save</Button>
      </ThemeProvider>,
    );
    expect(button().getAttribute('data-variant')).toBe('light');
    expect(button().getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(<BaseButton>Save</BaseButton>);
    expect(
      button()
        .getAttributeNames()
        .filter((name) => /^data-(variant|cck-color|size)$/.test(name)),
    ).toEqual([]);
  });

  it('passes disabled and the other base props to the base', () => {
    const onClick = vi.fn();
    render(
      themed(
        <Button disabled type="submit" onClick={onClick}>
          Save
        </Button>,
      ),
    );
    expect(button().hasAttribute('disabled')).toBe(true);
    expect(button().hasAttribute('data-disabled')).toBe(true);
    expect(button().getAttribute('type')).toBe('submit');
    button().click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link through render, with the theme data-*', () => {
    render(
      themed(
        <Button nativeButton={false} size="lg" render={<a href="#go" />}>
          Go
        </Button>,
      ),
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.getAttribute('data-size')).toBe('lg');
    expect(link.hasAttribute('type')).toBe(false);
  });

  it('does not log from the component under StrictMode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<Button>Save</Button>));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('theme Button on both root kinds', () => {
  const kinds: readonly [string, (props?: Partial<ButtonProps>) => ReactElement, () => HTMLElement][] = [
    ['button', (props) => <Button {...props}>Go</Button>, () => screen.getByRole('button')],
    [
      'link',
      (props) => (
        <Button nativeButton={false} render={<a href="#go" />} {...props}>
          Go
        </Button>
      ),
      () => screen.getByRole('link'),
    ],
  ];

  describe.each(kinds)('%s', (_kind, ui, root) => {
    it('renders the defaults', () => {
      render(themed(ui()));
      expect([root().dataset.variant, root().dataset.cckColor, root().dataset.size]).toEqual([
        'primary',
        'brand',
        'md',
      ]);
    });

    it.each([
      ['variant', 'data-variant', variant.values],
      ['color', 'data-cck-color', color.values],
      ['size', 'data-size', size.values],
    ] as const)('moves %s to every value', (option, attribute, values) => {
      for (const value of values) {
        render(themed(ui({ [option]: value })));
        expect(root().getAttribute(attribute)).toBe(value);
        cleanup();
      }
    });

    it('removes the attributes with null', () => {
      render(themed(ui({ variant: null, color: null, size: null })));
      for (const name of ['data-variant', 'data-cck-color', 'data-size']) expect(root().hasAttribute(name)).toBe(false);
    });

    it('lets the provider override win over the default and the own prop over the override', () => {
      render(
        <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ button: { variant: 'light', size: 'lg' } }}>
          {ui({ size: 'sm' })}
        </ThemeProvider>,
      );
      expect(root().getAttribute('data-variant')).toBe('light');
      expect(root().getAttribute('data-size')).toBe('sm');
    });

    it('updates a mounted root: value, null, then undefined restores the default', () => {
      const { rerender } = render(themed(ui({ variant: 'outline' })));
      const element = root();
      expect(element.getAttribute('data-variant')).toBe('outline');
      rerender(themed(ui({ variant: null })));
      expect(root()).toBe(element);
      expect(element.hasAttribute('data-variant')).toBe(false);
      rerender(themed(ui({ variant: undefined })));
      expect(root()).toBe(element);
      expect(element.getAttribute('data-variant')).toBe('primary');
    });
  });

  it('names itself Button', () => {
    expect(Button.displayName).toBe('Button');
  });
});

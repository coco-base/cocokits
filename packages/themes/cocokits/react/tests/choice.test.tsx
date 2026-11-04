// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox as BaseCheckbox } from '@cocokits/react/checkbox';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Checkbox, Radio, Switch } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const themed = (ui: ReactElement): ReactElement => (
  <StrictMode>
    <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>
  </StrictMode>
);

const CASES = [
  ['checkbox', 'Checkbox', Checkbox],
  ['switch', 'Switch', Switch],
  ['radio', 'Radio', Radio],
] as const;

describe.each(CASES)('theme %s', (block, displayName, Component) => {
  const options = cocokitsThemeConfig.components[block];
  const root = (container: HTMLElement): HTMLElement => {
    const element = container.querySelector<HTMLElement>(`.cck-${block}`);
    if (!element) throw new Error(`no .cck-${block}`);
    return element;
  };
  const ui = (props: Record<string, unknown> = {}): ReactElement => (
    <Component name="group" {...props}>
      Label
    </Component>
  );

  it('has a displayName', () => {
    expect(Component.displayName).toBe(displayName);
  });

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(ui()));
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-cck-color')).toBe('brand');
    expect(root(container).getAttribute('data-label-position')).toBe('after');
  });

  it.each(options.size.values)('moves data-size to %s', (value) => {
    const { container } = render(themed(ui({ size: value })));
    expect(root(container).getAttribute('data-size')).toBe(value);
  });

  it.each(options.color.values)('moves data-cck-color to %s', (value) => {
    const { container } = render(themed(ui({ color: value })));
    expect(root(container).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(options.labelPosition.values)('moves data-label-position to %s', (value) => {
    const { container } = render(themed(ui({ labelPosition: value })));
    expect(root(container).getAttribute('data-label-position')).toBe(value);
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(ui()));
    expect(container.querySelectorAll('[data-size]')).toHaveLength(1);
    expect(container.querySelector('input')?.hasAttribute('data-size')).toBe(false);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(ui({ size: null, color: null, labelPosition: null })));
    for (const name of ['data-size', 'data-cck-color', 'data-label-position']) {
      expect(root(container).hasAttribute(name)).toBe(false);
    }
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ [block]: { size: 'lg', labelPosition: 'before' } }}>
        {ui({ size: 'sm' })}
      </ThemeProvider>,
    );
    expect(root(container).getAttribute('data-size')).toBe('sm');
    expect(root(container).getAttribute('data-label-position')).toBe('before');
  });

  it('keeps the base facts and passes the base props through', () => {
    const { container } = render(themed(ui({ defaultChecked: true, disabled: true })));
    expect(root(container).hasAttribute('data-checked')).toBe(true);
    expect(root(container).hasAttribute('data-disabled')).toBe(true);
    expect(container.querySelector('input')?.disabled).toBe(true);
    expect(container.querySelector('label')?.textContent).toContain('Label');
  });

  it('stays quiet in StrictMode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(themed(ui()));
    expect(error).not.toHaveBeenCalled();
  });
});

describe('theme Checkbox and Switch', () => {
  it('renders the mixed fact and the native Switch role', () => {
    const { container } = render(themed(<Checkbox indeterminate>Select all</Checkbox>));
    expect(container.querySelector('.cck-checkbox')?.hasAttribute('data-indeterminate')).toBe(true);
    const switchRender = render(themed(<Switch>Alerts</Switch>));
    expect(switchRender.container.querySelector('input')?.getAttribute('role')).toBe('switch');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    const { container } = render(<BaseCheckbox>Label</BaseCheckbox>);
    const names = container.querySelector('.cck-checkbox')?.getAttributeNames() ?? [];
    expect(names.filter((name) => /^data-(size|cck-color|label-position)$/.test(name))).toEqual([]);
  });
});

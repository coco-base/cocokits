// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip as BaseChip } from '@cocokits/react/chip';
import { ChipList as BaseChipList } from '@cocokits/react/chip-list';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Chip, ChipList } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { chip } = cocokitsThemeConfig.components;
const root = (): HTMLElement => screen.getByTestId('root');

interface Row {
  readonly name: 'chip' | 'chip-list';
  readonly displayName: string;
  readonly ui: (size?: string | null) => ReactElement;
  readonly base: ReactElement;
}

const rows: readonly Row[] = [
  {
    name: 'chip',
    displayName: 'Chip',
    ui: (size) => <Chip data-testid="root" {...(size === undefined ? {} : { size: size as 'sm' })} />,
    base: <BaseChip data-testid="root" />,
  },
  {
    name: 'chip-list',
    displayName: 'ChipList',
    ui: (size) => (
      <ChipList data-testid="root" aria-label="Toppings" {...(size === undefined ? {} : { size: size as 'sm' })} />
    ),
    base: <BaseChipList data-testid="root" aria-label="Toppings" />,
  },
];

describe.each(rows)('theme $name', ({ name, displayName, ui, base }) => {
  const values = cocokitsThemeConfig.components[name].size.values;
  const overrides = { [name]: { size: 'lg' } };

  it('renders the config default on the root', () => {
    render(themed(ui()));
    expect(root().getAttribute('data-size')).toBe('md');
  });

  it.each(values)('moves data-size to %s', (value) => {
    render(themed(ui(value)));
    expect(root().getAttribute('data-size')).toBe(value);
  });

  it('removes the attribute with null', () => {
    render(themed(ui(null)));
    expect(root().hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {ui()}
      </ThemeProvider>,
    );
    expect(root().getAttribute('data-size')).toBe('lg');
    cleanup();
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {ui('sm')}
      </ThemeProvider>,
    );
    expect(root().getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', () => {
    const { rerender } = render(themed(ui('lg')));
    const element = root();
    rerender(themed(ui(null)));
    expect(root()).toBe(element);
    expect(element.hasAttribute('data-size')).toBe(false);
    rerender(themed(ui(undefined)));
    expect(element.getAttribute('data-size')).toBe('md');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(base);
    expect(root().hasAttribute('data-size')).toBe(false);
  });

  it('names itself and logs nothing under StrictMode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(themed(ui()));
    expect(error).not.toHaveBeenCalled();
    expect((name === 'chip' ? Chip : ChipList).displayName).toBe(displayName);
  });
});

describe('theme Chip remove icon and list chips', () => {
  it('draws the close icon the theme names in the remove button', () => {
    render(
      themed(
        <Chip data-testid="root" removable>
          Pizza
        </Chip>,
      ),
    );
    const icon = root().querySelector('.cck-chip__remove .cck-svg-icon');
    expect(chip.icons.remove).toBe('close');
    expect(icon?.getAttribute('data-icon')).toBe('close');
  });

  it('gives each chip of a list its own data-size and the remove icon', () => {
    render(themed(<ChipList data-testid="root" aria-label="Toppings" defaultValue={['Ham', 'Olives']} size="lg" />));
    const chips = root().querySelectorAll(':scope > .cck-chip');
    expect(chips).toHaveLength(2);
    for (const element of chips) {
      expect(element.getAttribute('data-size')).toBe('md');
      expect(element.querySelector('.cck-svg-icon')?.getAttribute('data-icon')).toBe('close');
    }
  });
});

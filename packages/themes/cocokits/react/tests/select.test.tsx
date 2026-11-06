// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Select as BaseSelect } from '@cocokits/react/select';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Select, type SelectRootProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.select;
const example = (props: Partial<SelectRootProps> = {}): ReactElement => (
  <Select.Root {...props}>
    <Select.Trigger aria-label="Dish">
      <Select.Value placeholder="Choose a dish" />
      <Select.Icon />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="Cake">
        <Select.ItemIndicator />
        <Select.ItemText>Cake</Select.ItemText>
      </Select.Item>
      <Select.Item value="Pizza">
        <Select.ItemIndicator />
        <Select.ItemText>Pizza</Select.ItemText>
      </Select.Item>
    </Select.Content>
  </Select.Root>
);
const root = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('.cck-select');
  if (!element) throw new Error('no .cck-select');
  return element;
};

describe('theme select', () => {
  it('has a displayName on the themed root and shares the base parts', () => {
    expect(Select.Root.displayName).toBe('Select.Root');
    expect(Object.keys(Select).sort()).toEqual(Object.keys(BaseSelect).sort());
    for (const part of Object.keys(BaseSelect).filter((name) => name !== 'Root') as Exclude<
      keyof typeof BaseSelect,
      'Root'
    >[]) {
      expect(Select[part]).toBe(BaseSelect[part]);
    }
  });

  it('renders the config default on the root', () => {
    const { container } = render(themed(example()));
    expect(root(container).getAttribute('data-size')).toBe('md');
  });

  it('moves size to data-size for every value, on the root only', () => {
    for (const value of options.size.values) {
      const { container, unmount } = render(themed(example({ size: value })));
      expect(root(container).getAttribute('data-size')).toBe(value);
      expect(container.querySelectorAll('[data-size]')).toHaveLength(1);
      unmount();
    }
  });

  it('removes the attribute with null', () => {
    const { container } = render(themed(example({ size: null })));
    expect(root(container).hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const overrides = { select: { size: 'lg' } } as const;
    const first = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {example()}
      </ThemeProvider>,
    );
    expect(root(first.container).getAttribute('data-size')).toBe('lg');
    first.unmount();
    const second = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {example({ size: 'sm' })}
      </ThemeProvider>,
    );
    expect(root(second.container).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    expect(root(container).hasAttribute('data-size')).toBe(false);
  });

  it('keeps the base behaviour: the combobox, a typed value and native props on the root', () => {
    const { container } = render(
      themed(
        <Select.Root<number> className="wide" defaultValue={2} itemToStringLabel={(value) => `${String(value)} items`}>
          <Select.Trigger aria-label="Count">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={1}>
              <Select.ItemText>One</Select.ItemText>
            </Select.Item>
            <Select.Item value={2}>
              <Select.ItemText>Two</Select.ItemText>
            </Select.Item>
          </Select.Content>
        </Select.Root>,
      ),
    );
    expect(screen.getByRole('combobox').getAttribute('aria-haspopup')).toBe('listbox');
    expect(root(container).classList.contains('wide')).toBe(true);
    expect(screen.getByRole('combobox').textContent).toContain('2 items');
  });

  it('types the value by multiple', () => {
    const onValueChange = vi.fn();
    render(
      themed(
        <Select.Root multiple defaultValue={['Cake']} onValueChange={onValueChange}>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
          </Select.Trigger>
        </Select.Root>,
      ),
    );
    expect(screen.getByRole('combobox').textContent).toBe('Cake');
  });
});

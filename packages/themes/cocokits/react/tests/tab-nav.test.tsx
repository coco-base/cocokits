// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabNav as BaseTabNav } from '@cocokits/react/tab-nav';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabNav, type TabNavRootProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components['tab-nav'];
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const example = (props: Partial<TabNavRootProps> = {}): ReactElement => (
  <TabNav.Root aria-label="Project" {...props}>
    <TabNav.List>
      <TabNav.Link href="#account" active>
        Account
      </TabNav.Link>
      <TabNav.Link href="#password">Password</TabNav.Link>
      <TabNav.Indicator />
    </TabNav.List>
  </TabNav.Root>
);
const root = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('.cck-tab-nav');
  if (!element) throw new Error('no .cck-tab-nav');
  return element;
};

describe('theme tab nav', () => {
  it('has a displayName on the themed root and shares the base link', () => {
    expect(TabNav.Root.displayName).toBe('TabNav.Root');
    expect(TabNav.List).toBe(BaseTabNav.List);
    expect(TabNav.Link).toBe(BaseTabNav.Link);
    expect(TabNav.Indicator).toBe(BaseTabNav.Indicator);
    expect(TabNav.Panel).toBe(BaseTabNav.Panel);
  });

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(example()));
    expect(root(container).getAttribute('data-variant')).toBe('border');
    expect(root(container).getAttribute('data-cck-color')).toBe('neutral');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-header-align')).toBe('start');
  });

  it.each([
    ['variant', 'data-variant'],
    ['color', 'data-cck-color'],
    ['size', 'data-size'],
    ['headerAlign', 'data-header-align'],
  ] as const)('moves %s to %s for every value', (option, attribute) => {
    for (const value of options[option].values) {
      const { container, unmount } = render(themed(example({ [option]: value })));
      expect(root(container).getAttribute(attribute)).toBe(value);
      unmount();
    }
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(example()));
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(example({ variant: null, color: null, size: null, headerAlign: null })));
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ 'tab-nav': { variant: 'line', size: 'lg' } }}>
        {example({ size: 'sm' })}
      </ThemeProvider>,
    );
    expect(root(container).getAttribute('data-variant')).toBe('line');
    expect(root(container).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    expect(root(container).hasAttribute('data-variant')).toBe(false);
  });

  it('keeps the base behaviour: the landmark, the active link and no tab roles', () => {
    render(themed(example()));
    expect(screen.getByRole('navigation', { name: 'Project' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Account' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Password' }).hasAttribute('aria-current')).toBe(false);
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('passes native props through to the root', () => {
    const { container } = render(themed(example({ id: 'nav' })));
    expect(root(container).id).toBe('nav');
  });
});

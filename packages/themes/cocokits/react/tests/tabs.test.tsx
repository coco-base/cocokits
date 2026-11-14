// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs as BaseTabs } from '@cocokits/react/tabs';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Tabs, type TabsRootProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.tabs;
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const example = (props: Partial<TabsRootProps> = {}): ReactElement => (
  <Tabs.Root defaultValue="account" {...props}>
    <Tabs.List aria-label="Account settings">
      <Tabs.Trigger value="account">Account</Tabs.Trigger>
      <Tabs.Trigger value="password">Password</Tabs.Trigger>
      <Tabs.Indicator />
    </Tabs.List>
    <Tabs.Content value="account">Change your name.</Tabs.Content>
    <Tabs.Content value="password">Change your password.</Tabs.Content>
  </Tabs.Root>
);
const root = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('.cck-tabs');
  if (!element) throw new Error('no .cck-tabs');
  return element;
};

describe('theme tabs', () => {
  it('has a displayName on the themed root and shares the base parts', () => {
    expect(Tabs.Root.displayName).toBe('Tabs.Root');
    expect(Tabs.List).toBe(BaseTabs.List);
    expect(Tabs.Trigger).toBe(BaseTabs.Trigger);
    expect(Tabs.Indicator).toBe(BaseTabs.Indicator);
    expect(Tabs.Content).toBe(BaseTabs.Content);
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
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ tabs: { variant: 'line', size: 'lg' } }}>
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

  it('keeps the base behaviour: roles, selection and the change callback', async () => {
    const onValueChange = vi.fn();
    render(themed(example({ onValueChange })));
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(onValueChange).toHaveBeenCalledWith('password', expect.objectContaining({ reason: 'user' }));
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel', { name: 'Password' }).textContent).toBe('Change your password.');
  });

  it('forwards dir to the base root: the own value is rendered and the arrows flip', async () => {
    const user = userEvent.setup();
    const { container } = render(themed(example({ dir: 'rtl' })));
    expect(root(container).getAttribute('dir')).toBe('rtl');
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Password' }));
  });

  it('passes native props through to the root', () => {
    const { container } = render(themed(example({ id: 'tabs' })));
    expect(root(container).id).toBe('tabs');
  });
});

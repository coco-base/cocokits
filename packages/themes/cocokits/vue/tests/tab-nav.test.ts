// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TabNavIndicator as BaseTabNavIndicator,
  TabNavLink as BaseTabNavLink,
  TabNavList as BaseTabNavList,
  TabNavPanel as BaseTabNavPanel,
} from '@cocokits/vue/tab-nav';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabNavIndicator, TabNavLink, TabNavList, TabNavPanel, TabNavRoot } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components['tab-nav'];
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const example = (props: Record<string, unknown> = {}): VNode =>
  h(TabNavRoot as Component, { 'aria-label': 'Project', ...props }, () =>
    h(TabNavList, null, () => [
      h(TabNavLink, { href: '#account', active: true }, () => 'Account'),
      h(TabNavLink, { href: '#password' }, () => 'Password'),
      h(TabNavIndicator),
    ]),
  );
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-tab-nav');
  if (!element) throw new Error('no .cck-tab-nav');
  return element;
};

describe('theme tab nav', () => {
  it('shares the base link', () => {
    expect(TabNavLink).toBe(BaseTabNavLink);
    expect(TabNavList).toBe(BaseTabNavList);
    expect(TabNavIndicator).toBe(BaseTabNavIndicator);
    expect(TabNavPanel).toBe(BaseTabNavPanel);
  });

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(() => example()));
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
      const view = render(themed(() => example({ [option]: value })));
      expect(root(view.container).getAttribute(attribute)).toBe(value);
      view.unmount();
    }
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(() => example()));
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(() => example({ variant: null, color: null, size: null, headerAlign: null })));
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default, and the own option over the override', () => {
    const { container } = render(themed(() => example({ size: 'sm' }), { 'tab-nav': { variant: 'line', size: 'lg' } }));
    expect(root(container).getAttribute('data-variant')).toBe('line');
    expect(root(container).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    expect(root(container).hasAttribute('data-variant')).toBe(false);
  });

  it('keeps the base behaviour: the landmark, the active link, no tab roles and the attributes that fall through', () => {
    const { container } = render(themed(() => example({ id: 'nav' })));
    expect(root(container).id).toBe('nav');
    expect(screen.getByRole('navigation', { name: 'Project' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Account' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Password' }).hasAttribute('aria-current')).toBe(false);
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('forwards tabPanel and asChild to the base root and keeps the panel part', () => {
    const { container } = render(
      themed(() => [example({ tabPanel: 'routed' }), h(TabNavPanel, { id: 'routed' }, () => 'Account page')]),
    );
    expect(root(container).tagName).toBe('NAV');
    expect(container.querySelector('.cck-tab-nav__list')?.getAttribute('role')).toBe('tablist');
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(2);
    const panel = container.querySelector('.cck-tab-nav__panel');
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe(container.querySelector('[aria-selected="true"]')?.id);
    expect(panel?.hasAttribute('data-variant')).toBe(false);
  });
});

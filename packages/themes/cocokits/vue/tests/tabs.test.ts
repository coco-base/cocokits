// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/vue';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TabsContent as BaseTabsContent,
  TabsIndicator as BaseTabsIndicator,
  TabsList as BaseTabsList,
} from '@cocokits/vue/tabs';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.tabs;
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const example = (props: Record<string, unknown> = {}): VNode =>
  h(TabsRoot as Component, { modelValue: 'account', ...props }, () => [
    h(TabsList, { 'aria-label': 'Account settings' }, () => [
      h(TabsTrigger, { value: 'account' }, () => 'Account'),
      h(TabsTrigger, { value: 'password' }, () => 'Password'),
    ]),
    h(TabsContent, { value: 'account' }, () => 'Change your name.'),
    h(TabsContent, { value: 'password' }, () => 'Change your password.'),
  ]);
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-tabs');
  if (!element) throw new Error('no .cck-tabs');
  return element;
};

describe('theme tabs', () => {
  it('shares the base parts', () => {
    expect(TabsList).toBe(BaseTabsList);
    expect(TabsContent).toBe(BaseTabsContent);
    expect(TabsIndicator).toBe(BaseTabsIndicator);
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
    const { container } = render(themed(() => example({ size: 'sm' }), { tabs: { variant: 'line', size: 'lg' } }));
    expect(root(container).getAttribute('data-variant')).toBe('line');
    expect(root(container).getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    expect(root(container).hasAttribute('data-variant')).toBe(false);
  });

  it('keeps the base behaviour: v-model and the attributes that fall through', async () => {
    const tab = ref('account');
    const onUpdate = vi.fn();
    const { container } = render(
      themed(() =>
        h(
          TabsRoot as Component,
          {
            modelValue: tab.value,
            'onUpdate:modelValue': (value: string) => {
              tab.value = value;
              onUpdate(value);
            },
            id: 'tabs',
          },
          () => [
            h(TabsList, { 'aria-label': 'Account settings' }, () => [
              h(TabsTrigger, { value: 'account' }, () => 'Account'),
              h(TabsTrigger, { value: 'password' }, () => 'Password'),
            ]),
            h(TabsContent, { value: 'account' }, () => 'Change your name.'),
            h(TabsContent, { value: 'password' }, () => 'Change your password.'),
          ],
        ),
      ),
    );
    expect(root(container).id).toBe('tabs');
    await fireEvent.click(screen.getByRole('tab', { name: 'Password' }));
    await nextTick();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith('password');
    expect(tab.value).toBe('password');
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
  });

  it('keeps its own value when no model is bound', async () => {
    render(
      themed(() =>
        h(TabsRoot as Component, null, () => [
          h(TabsList, { 'aria-label': 'Account settings' }, () => [
            h(TabsTrigger, { value: 'account' }, () => 'Account'),
            h(TabsTrigger, { value: 'password' }, () => 'Password'),
          ]),
          h(TabsContent, { value: 'account' }, () => 'Change your name.'),
          h(TabsContent, { value: 'password' }, () => 'Change your password.'),
        ]),
      ),
    );
    await fireEvent.click(screen.getByRole('tab', { name: 'Password' }));
    await nextTick();
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
  });

  it('forwards unmountOnHide and a number value to the base root', () => {
    const { container } = render(
      themed(() =>
        h(TabsRoot as Component, { modelValue: 2, unmountOnHide: false }, () => [
          h(TabsList, { 'aria-label': 'Numbers' }, () => [
            h(TabsTrigger, { value: 1 }, () => 'One'),
            h(TabsTrigger, { value: 2 }, () => 'Two'),
            h(TabsIndicator),
          ]),
          h(TabsContent, { value: 1 }, () => 'content 1'),
          h(TabsContent, { value: 2 }, () => 'content 2'),
        ]),
      ),
    );
    expect(container.querySelector('[aria-selected="true"]')?.textContent).toBe('Two');
    expect(container.querySelectorAll('[role="tabpanel"]')[0].textContent).toBe('content 1');
    expect((container.querySelectorAll('[role="tabpanel"]')[0] as HTMLElement).hidden).toBe(true);
  });
});

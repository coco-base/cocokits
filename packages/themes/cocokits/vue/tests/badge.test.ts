// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge as BaseBadge } from '@cocokits/vue/badge';
import { BadgeContainer } from '@cocokits/vue/badge-container';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Badge, type BadgeProps } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { variant, color, size } = cocokitsThemeConfig.components.badge;
const themed = (
  renderFn: () => VNode | VNode[],
  overrides?: Record<string, Record<string, string | null>>,
): Component =>
  defineComponent({
    setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig, overrides }, renderFn),
  });

function mountBadge(props: Partial<BadgeProps> = {}): HTMLElement {
  render(themed(() => h(Badge, { 'data-testid': 'badge', ...props })));
  return screen.getByTestId('badge');
}

describe('theme Badge', () => {
  it('renders the config defaults', () => {
    const el = mountBadge({ content: 5 });
    expect(el.getAttribute('data-variant')).toBe('rounded');
    expect(el.getAttribute('data-cck-color')).toBe('contrast');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.classList.contains('cck-badge')).toBe(true);
    expect(el.textContent).toBe('5');
  });

  it.each(variant.values)('moves data-variant to %s', (value) => {
    expect(mountBadge({ variant: value }).getAttribute('data-variant')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    expect(mountBadge({ color: value }).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountBadge({ size: value }).getAttribute('data-size')).toBe(value);
  });

  it('removes an attribute with null', () => {
    const el = mountBadge({ variant: null, color: null, size: null });
    for (const name of ['data-variant', 'data-cck-color', 'data-size']) expect(el.hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      themed(() => h(Badge, { 'data-testid': 'badge', size: 'sm' }), {
        badge: { variant: 'rectangle', size: 'xl' },
      }),
    );
    const el = screen.getByTestId('badge');
    expect(el.getAttribute('data-variant')).toBe('rectangle');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', async () => {
    const value = ref<BadgeProps['variant']>('rectangle');
    render(themed(() => h(Badge, { 'data-testid': 'badge', variant: value.value })));
    const el = screen.getByTestId('badge');
    expect(el.getAttribute('data-variant')).toBe('rectangle');
    value.value = null;
    await nextTick();
    expect(el.hasAttribute('data-variant')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(el.getAttribute('data-variant')).toBe('rounded');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(h(BaseBadge, { 'data-testid': 'badge' }));
    expect(screen.getByTestId('badge').hasAttribute('data-variant')).toBe(false);
  });

  it('keeps the container position and max of the base', () => {
    render(
      themed(() =>
        h(BadgeContainer, { position: 'bottom-left' }, () => [
          h(Badge, { 'data-testid': 'badge', content: '120', max: 99 }),
        ]),
      ),
    );
    const el = screen.getByTestId('badge');
    expect(el.parentElement?.getAttribute('data-position')).toBe('bottom-left');
    expect(el.hasAttribute('data-position')).toBe(false);
    expect(el.textContent).toBe('99+');
  });
});

describe('theme Badge polymorphism and element', () => {
  it('renders the as tag with the theme data-*', () => {
    const el = mountBadge({ as: 'strong', content: 5 });
    expect(el.tagName).toBe('STRONG');
    expect(el.getAttribute('data-size')).toBe('md');
  });

  it('merges onto the default slot child with asChild, keeping the parts and the theme data-*', () => {
    render(
      themed(() => h(Badge, { asChild: true, content: 5, size: 'lg' }, () => h('em', { 'data-testid': 'badge' }))),
    );
    const el = screen.getByTestId('badge');
    expect(el.tagName).toBe('EM');
    expect(el.getAttribute('data-size')).toBe('lg');
    expect(el.textContent).toBe('5');
  });

  it('exposes the DOM element through a component ref', () => {
    const badge = ref<{ readonly element: Element | null } | null>(null);
    render(themed(() => h(Badge, { 'data-testid': 'badge', ref: badge, content: 5 })));
    expect(badge.value?.element).toBe(screen.getByTestId('badge'));
  });
});

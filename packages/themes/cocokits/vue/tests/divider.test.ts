// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Divider as BaseDivider } from '@cocokits/vue/divider';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Divider, type DividerProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { size, color } = cocokitsThemeConfig.components.divider;

function mountDivider(props: Partial<DividerProps> = {}): HTMLElement {
  render(themed(() => h(Divider, { 'data-testid': 'divider', ...props })));
  return screen.getByTestId('divider');
}

describe('theme Divider', () => {
  it('renders the config defaults on one hr with the base attributes', () => {
    const el = mountDivider();
    expect(el.tagName).toBe('HR');
    expect(el.classList.contains('cck-divider')).toBe(true);
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-color')).toBe('default');
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
    expect(el.hasAttribute('data-cck-color')).toBe(false);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountDivider({ size: value }).getAttribute('data-size')).toBe(value);
  });

  it.each(color.values)('moves data-color to %s', (value) => {
    expect(mountDivider({ color: value }).getAttribute('data-color')).toBe(value);
  });

  it('removes an attribute with null', () => {
    const el = mountDivider({ size: null, color: null });
    for (const name of ['data-size', 'data-color']) expect(el.hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      themed(() => h(Divider, { 'data-testid': 'divider', size: 'md' }), { divider: { size: 'lg', color: 'dark' } }),
    );
    const el = screen.getByTestId('divider');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-color')).toBe('dark');
  });

  it('updates a mounted root: value, null, then undefined restores the default', async () => {
    const value = ref<DividerProps['color']>('dark');
    render(themed(() => h(Divider, { 'data-testid': 'divider', color: value.value })));
    const el = screen.getByTestId('divider');
    expect(el.getAttribute('data-color')).toBe('dark');
    value.value = null;
    await nextTick();
    expect(el.hasAttribute('data-color')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(el.getAttribute('data-color')).toBe('default');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(h(BaseDivider, { 'data-testid': 'divider' }));
    expect(screen.getByTestId('divider').hasAttribute('data-size')).toBe(false);
    expect(screen.getByTestId('divider').hasAttribute('data-color')).toBe(false);
  });

  it('passes the base props and native attributes through; the component root is the hr', () => {
    const divider = ref<{ $el: Element } | null>(null);
    render(
      themed(() =>
        h(Divider, {
          'data-testid': 'divider',
          ref: divider,
          orientation: 'vertical',
          decorative: true,
          id: 'x',
          class: 'mine',
        }),
      ),
    );
    const el = screen.getByTestId('divider');
    expect(divider.value?.$el).toBe(el);
    expect(el.getAttribute('data-orientation')).toBe('vertical');
    expect(el.getAttribute('role')).toBe('none');
    expect(el.id).toBe('x');
    expect(el.classList.contains('mine')).toBe(true);
    expect(el.classList.contains('cck-divider')).toBe(true);
  });
});

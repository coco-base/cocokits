// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tag as BaseTag } from '@cocokits/vue/tag';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Tag, type TagProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { variant, color, size, dot } = cocokitsThemeConfig.components.tag;

function mountTag(props: Partial<TagProps> = {}): HTMLElement {
  render(themed(() => h(Tag, { 'data-testid': 'tag', ...props }, () => 'Paid')));
  return screen.getByTestId('tag');
}

describe('theme Tag', () => {
  it('renders the config defaults, the class and the text', () => {
    const el = mountTag();
    expect(el.tagName).toBe('SPAN');
    expect(el.getAttribute('data-variant')).toBe('soft');
    expect(el.getAttribute('data-cck-color')).toBe('brand');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.hasAttribute('data-dot')).toBe(false);
    expect(el.classList.contains('cck-tag')).toBe(true);
    expect(el.textContent).toBe('Paid');
  });

  it.each(variant.values)('moves data-variant to %s', (value) => {
    expect(mountTag({ variant: value }).getAttribute('data-variant')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    expect(mountTag({ color: value }).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountTag({ size: value }).getAttribute('data-size')).toBe(value);
  });

  it.each(dot.values)('renders data-dot for dot=%s', (value) => {
    expect(mountTag({ dot: value }).hasAttribute('data-dot')).toBe(value);
  });

  it('removes an attribute with null', () => {
    const el = mountTag({ variant: null, color: null, size: null, dot: null });
    for (const name of ['data-variant', 'data-cck-color', 'data-size', 'data-dot']) {
      expect(el.hasAttribute(name)).toBe(false);
    }
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      themed(() => h(Tag, { 'data-testid': 'tag', size: 'sm' }), {
        tag: { variant: 'outline', size: 'lg' },
      }),
    );
    const el = screen.getByTestId('tag');
    expect(el.getAttribute('data-variant')).toBe('outline');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', async () => {
    const value = ref<TagProps['variant']>('solid');
    render(themed(() => h(Tag, { 'data-testid': 'tag', variant: value.value })));
    const el = screen.getByTestId('tag');
    expect(el.getAttribute('data-variant')).toBe('solid');
    value.value = null;
    await nextTick();
    expect(el.hasAttribute('data-variant')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(el.getAttribute('data-variant')).toBe('soft');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(h(BaseTag, { 'data-testid': 'tag' }));
    expect(screen.getByTestId('tag').hasAttribute('data-variant')).toBe(false);
  });
});

describe('theme Tag polymorphism and element', () => {
  it('renders the as tag with the theme data-*', () => {
    const el = mountTag({ as: 'strong' });
    expect(el.tagName).toBe('STRONG');
    expect(el.getAttribute('data-size')).toBe('md');
  });

  it('merges onto the default slot child with asChild, keeping the class and the theme data-*', () => {
    render(themed(() => h(Tag, { asChild: true, size: 'lg' }, () => h('em', { 'data-testid': 'tag' }, 'Beta'))));
    const el = screen.getByTestId('tag');
    expect(el.tagName).toBe('EM');
    expect(el.classList.contains('cck-tag')).toBe(true);
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('exposes the DOM element through a component ref', () => {
    const tag = ref<{ readonly element: Element | null } | null>(null);
    render(themed(() => h(Tag, { 'data-testid': 'tag', ref: tag })));
    expect(tag.value?.element).toBe(screen.getByTestId('tag'));
  });
});

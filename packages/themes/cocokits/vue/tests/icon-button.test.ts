// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { IconButton, SvgIcon, type IconButtonProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type Kind = 'button' | 'link';
const { variant, color, size, rounded } = cocokitsThemeConfig.components['icon-button'];

const linkProps = (kind: Kind): Record<string, string> => (kind === 'link' ? { as: 'a', href: '#go' } : {});

/** Renders the IconButton as a native button or as a link and returns its root element. */
function mountIconButton(kind: Kind, props: Partial<IconButtonProps> = {}): HTMLElement {
  render(
    themed(() =>
      h(IconButton, { 'aria-label': 'Add', ...linkProps(kind), ...props }, () => h(SvgIcon, { iconName: 'plus' })),
    ),
  );
  return screen.getByRole(kind);
}

describe.each<Kind>(['button', 'link'])('theme IconButton as a %s', (kind) => {
  it('renders the config defaults and the class, and no rounded marker', () => {
    const el = mountIconButton(kind);
    expect(el.getAttribute('data-variant')).toBe('primary');
    expect(el.getAttribute('data-cck-color')).toBe('brand');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.hasAttribute('data-rounded')).toBe(false);
    expect(el.classList.contains('cck-icon-button')).toBe(true);
  });

  it.each(variant.values)('moves data-variant to %s', (value) => {
    expect(mountIconButton(kind, { variant: value }).getAttribute('data-variant')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    expect(mountIconButton(kind, { color: value }).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountIconButton(kind, { size: value }).getAttribute('data-size')).toBe(value);
  });

  it.each(rounded.values)('renders data-rounded for rounded=%s', (value) => {
    const el = mountIconButton(kind, { rounded: value });
    expect(el.hasAttribute('data-rounded')).toBe(value);
  });

  it('removes an attribute with null', () => {
    const el = mountIconButton(kind, { variant: null, color: null, size: null, rounded: null });
    for (const name of ['data-variant', 'data-cck-color', 'data-size', 'data-rounded']) {
      expect(el.hasAttribute(name), name).toBe(false);
    }
  });

  it('lets a provider override win over the default, and the own option win over the override', () => {
    render(
      themed(
        () =>
          h(IconButton, { 'aria-label': 'Add', ...linkProps(kind), size: 'sm' }, () =>
            h(SvgIcon, { iconName: 'plus' }),
          ),
        { 'icon-button': { variant: 'light', size: 'lg', rounded: true } },
      ),
    );
    const el = screen.getByRole(kind);
    expect(el.getAttribute('data-variant')).toBe('light');
    expect(el.getAttribute('data-size')).toBe('sm');
    expect(el.hasAttribute('data-rounded')).toBe(true);
  });

  it('follows live option updates, and undefined restores the default after null', async () => {
    const value = ref<IconButtonProps['variant']>('outline');
    render(
      themed(() =>
        h(IconButton, { 'aria-label': 'Add', ...linkProps(kind), variant: value.value }, () =>
          h(SvgIcon, { iconName: 'plus' }),
        ),
      ),
    );
    const el = screen.getByRole(kind);
    expect(el.getAttribute('data-variant')).toBe('outline');
    value.value = null;
    await nextTick();
    expect(el.hasAttribute('data-variant')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(el.getAttribute('data-variant')).toBe('primary');
  });
});

describe('theme IconButton content', () => {
  it('draws the pack icon of the theme, hidden from assistive technology', () => {
    const el = mountIconButton('button');
    const icon = el.querySelector('.cck-svg-icon');
    expect(icon?.getAttribute('data-icon-name')).toBe('plus');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('is not a Button: it has its own class only', () => {
    const el = mountIconButton('button');
    expect(el.classList.contains('cck-button')).toBe(false);
  });

  it('exposes the element and keeps the disabled behaviour of the base', () => {
    let exposed: { element: Element | null } | undefined;
    render(
      themed(() =>
        h(IconButton, {
          'aria-label': 'Add',
          disabled: true,
          ref: (instance) => {
            exposed = instance as unknown as { element: Element | null };
          },
        }),
      ),
    );
    const el = screen.getByRole('button');
    expect(exposed?.element).toBe(el);
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('data-disabled')).toBe(true);
  });
});

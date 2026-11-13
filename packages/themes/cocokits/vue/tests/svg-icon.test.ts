// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cocokitsIcons, cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { SvgIcon, type SvgIconProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { size, color, rtlMirror } = cocokitsThemeConfig.components['svg-icon'];

type Overrides = Record<string, Record<string, string | boolean | null>>;

/** The root of the first icon in the container; fails the test when there is none. */
function rootOf(container: Element): HTMLElement {
  const root = container.querySelector<HTMLElement>('.cck-svg-icon');
  if (!root) throw new Error('No SvgIcon rendered.');
  return root;
}

/** Renders the SvgIcon inside the cocokits theme and returns its root element. */
function mountIcon(props: Record<string, unknown> = {}, overrides?: Overrides): HTMLElement {
  const { container } = render(themed(() => h(SvgIcon, { iconName: 'heart', ...props }), overrides));
  return rootOf(container);
}

describe('theme SvgIcon', () => {
  it('draws the icon of the cocokits pack, with every path of it', () => {
    const el = mountIcon();
    expect(el.getAttribute('data-icon-name')).toBe('heart');
    expect(el.querySelector('svg')?.getAttribute('viewBox')).toBe(cocokitsIcons.heart.viewBox);
    expect([...el.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual(
      cocokitsIcons.heart.paths.map((path) => path.d),
    );
  });

  it('renders no theme option by default: it is 1em and takes the text color', () => {
    const el = mountIcon();
    for (const name of ['data-size', 'data-cck-color', 'data-rtl-mirror']) {
      expect(el.hasAttribute(name), name).toBe(false);
    }
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountIcon({ size: value }).getAttribute('data-size')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    expect(mountIcon({ color: value }).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(rtlMirror.values)('renders data-rtl-mirror for rtlMirror=%s', (value) => {
    expect(mountIcon({ rtlMirror: value }).hasAttribute('data-rtl-mirror')).toBe(value);
  });

  it('lets a provider override win over the default, and null remove it', () => {
    const overrides: Overrides = { 'svg-icon': { size: 'lg', rtlMirror: true } };
    const el = mountIcon({}, overrides);
    expect(el.getAttribute('data-size')).toBe('lg');
    expect(el.hasAttribute('data-rtl-mirror')).toBe(true);
    cleanup();
    const removed = mountIcon({ size: null, rtlMirror: null }, overrides);
    expect(removed.hasAttribute('data-size')).toBe(false);
    expect(removed.hasAttribute('data-rtl-mirror')).toBe(false);
  });

  it('follows live option updates', async () => {
    const value = ref<SvgIconProps['size']>('sm');
    const { container } = render(themed(() => h(SvgIcon, { iconName: 'heart', size: value.value })));
    const el = rootOf(container);
    expect(el.getAttribute('data-size')).toBe('sm');
    value.value = 'xl';
    await nextTick();
    expect(el.getAttribute('data-size')).toBe('xl');
  });

  it('keeps the label as role img with aria-label, and falls attrs through', () => {
    const el = mountIcon({ label: 'Favourite', class: 'mine' });
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Favourite');
    expect(el.hasAttribute('aria-hidden')).toBe(false);
    expect(el.classList.contains('mine')).toBe(true);
  });

  it('exposes the element', () => {
    let exposed: { element: Element | null } | undefined;
    const el = mountIcon({
      ref: (instance: unknown) => {
        exposed = instance as { element: Element | null };
      },
    });
    expect(exposed?.element).toBe(el);
  });
});

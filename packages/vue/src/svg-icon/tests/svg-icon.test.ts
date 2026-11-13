// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { svgIconAnatomy, svgIconMeta } from '@cocokits/machines/svg-icon';
import { ThemeProvider } from '@cocokits/vue-core';
import * as entry from '../index';
import { SvgIcon } from '../index';
import { pick } from '../../internal/tests/mount-helpers';
import { iconsThemeConfig, mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const themed = (child: () => VNode | VNode[]) =>
  mountView(() => h(ThemeProvider, { themeConfig: iconsThemeConfig }, child));
const spyError = () => vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('@cocokits/vue/svg-icon', () => {
  it('exports the component and its props type from the entry point', () => {
    expect(Object.keys(entry)).toEqual(['SvgIcon']);
  });

  it('renders the root, the svg and one path per icon path, with only d, fill-rule and clip-rule', () => {
    const { container } = themed(() => h(SvgIcon, { iconName: 'heart' }));
    const root = pick(container, '.cck-svg-icon');
    expect(root.tagName).toBe('SPAN');
    expect(root.getAttribute('data-icon-name')).toBe('heart');
    const svg = pick(root, 'svg');
    expect(svg.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    const paths = [...svg.querySelectorAll('path')];
    expect(paths.map((path) => path.getAttributeNames().sort())).toEqual([['d'], ['clip-rule', 'd', 'fill-rule']]);
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M1 1h2', 'M3 3h2']);
    expect(paths[1]?.getAttribute('fill-rule')).toBe('evenodd');
    expect(paths[1]?.getAttribute('clip-rule')).toBe('nonzero');
  });

  it('is decorative without a label, and named with one', () => {
    const { container } = themed(() => [
      h(SvgIcon, { iconName: 'plus' }),
      h(SvgIcon, { iconName: 'plus', label: 'Add' }),
      h(SvgIcon, { iconName: 'plus', label: '' }),
    ]);
    const [plain, named, empty] = [...container.querySelectorAll<HTMLElement>('.cck-svg-icon')] as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    expect(plain.getAttribute('aria-hidden')).toBe('true');
    expect(plain.hasAttribute('role')).toBe(false);
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Add');
    expect(named.hasAttribute('aria-hidden')).toBe(false);
    expect(empty.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('img', { name: 'Add' })).toBe(named);
  });

  it('falls attrs and the class through to the root, and keeps the theme data-*', () => {
    const { container } = themed(() => h(SvgIcon, { iconName: 'plus', class: 'mine', id: 'x' }));
    const root = pick(container, '.cck-svg-icon');
    expect([...root.classList].sort()).toEqual(['cck-svg-icon', 'mine']);
    expect(root.id).toBe('x');
    expect(root.hasAttribute('data-size')).toBe(false);
    expect(root.hasAttribute('data-rtl-mirror')).toBe(false);
  });

  it('renders nothing from the theme but data-icon-name without a provider, and logs one error', async () => {
    const error = spyError();
    const { container } = mountView(() => h(SvgIcon, { iconName: 'heart' }));
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.hasAttribute('viewBox')).toBe(false);
    expect(svg.querySelector('path')).toBeNull();
    expect(container.querySelector('.cck-svg-icon')?.getAttribute('data-icon-name')).toBe('heart');
    await nextTick();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[0]).toContain('CocoKits: the theme has no icon named "heart"');
  });

  it('logs once per mount and once more per changed unknown name, and never for a found icon', async () => {
    const error = spyError();
    const name = ref('missing');
    themed(() => h(SvgIcon, { iconName: name.value }));
    await nextTick();
    expect(error).toHaveBeenCalledTimes(1);
    name.value = 'other-missing';
    await nextTick();
    expect(error).toHaveBeenCalledTimes(2);
    name.value = 'plus';
    await nextTick();
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('renders markup in the data as attribute text and adds no element', () => {
    const attack = '"/><script>alert(1)</script><path d="';
    const config = { ...iconsThemeConfig, icons: { evil: { viewBox: '0 0 1 1', paths: [{ d: attack }] } } };
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: config }, () => h(SvgIcon, { iconName: 'evil' })),
    );
    const root = pick(container, '.cck-svg-icon');
    expect([...root.querySelectorAll('*')].map((element) => element.tagName.toLowerCase())).toEqual(['svg', 'path']);
    expect(root.querySelector('path')?.getAttribute('d')).toBe(attack);
    expect(container.querySelector('script')).toBeNull();
  });

  it('exposes the root element, null before mount', () => {
    let exposed: { element: Element | null } | undefined;
    const { container } = themed(() =>
      h(SvgIcon, {
        iconName: 'plus',
        ref: (instance) => {
          exposed = instance as unknown as { element: Element | null };
        },
      }),
    );
    expect(exposed?.element).toBe(container.querySelector('.cck-svg-icon'));
  });

  it('declares the data-icon-name of the meta on the root', () => {
    expect(svgIconMeta.dataAttrs.root).toContain('data-icon-name');
    const { container } = themed(() => h(SvgIcon, { iconName: 'plus' }));
    const root = pick(container, '.cck-svg-icon');
    expect(root.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual(['data-icon-name']);
  });
});

// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { svgIconAnatomy, svgIconMeta } from '@cocokits/machines/svg-icon';
import { IconProvider, useIconRegistry } from '@cocokits/vue-core';
import * as entry from '../index';
import { SvgIcon } from '../index';
import { pick } from '../../internal/tests/mount-helpers';
import { checkIcon, heartIcon, mountView, plusIcon, svgOf, withIcons } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const provided = (child: () => VNode | VNode[]) => mountView(() => h(withIcons(child)));
const spyError = () => vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('@cocokits/vue/svg-icon', () => {
  it('exports the component and its props type from the entry point', () => {
    expect(Object.keys(entry)).toEqual(['SvgIcon']);
  });

  it('renders the host, the owned svg and the body of a registered icon', () => {
    const { container } = provided(() => h(SvgIcon, { iconName: 'heart' }));
    const root = pick(container, '.cck-svg-icon');
    expect(root.tagName).toBe(svgIconMeta.defaultElements?.root?.toUpperCase());
    expect(root.getAttribute('data-icon')).toBe('heart');
    const svg = pick(root, 'svg');
    expect(svg.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(svg.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(svg.innerHTML).toBe(heartIcon.body);
  });

  it('is decorative without a label, and named with one', () => {
    const { container } = provided(() => [
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
    const { container } = provided(() => h(SvgIcon, { iconName: 'plus', class: 'mine', id: 'x' }));
    const root = pick(container, '.cck-svg-icon');
    expect([...root.classList].sort()).toEqual(['cck-svg-icon', 'mine']);
    expect(root.id).toBe('x');
    expect(root.hasAttribute('data-size')).toBe(false);
    expect(root.hasAttribute('data-rtl-mirror')).toBe(false);
  });

  it('draws a base icon without any provider', () => {
    const { container } = mountView(() => h(SvgIcon, { iconName: 'check' }));
    expect(pick(container, 'svg').innerHTML).toBe(checkIcon.body);
  });

  it('renders an empty svg for a name that is not registered, and logs one error', async () => {
    const error = spyError();
    const { container } = mountView(() => h(SvgIcon, { iconName: 'heart' }));
    const svg = pick(container, 'svg');
    expect(svg.hasAttribute('viewBox')).toBe(false);
    expect(svg.innerHTML).toBe('');
    expect(container.querySelector('.cck-svg-icon')?.getAttribute('data-icon')).toBe('heart');
    await nextTick();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[0]).toContain('CocoKits: no icon named "heart" is registered');
  });

  it('logs once per mount and once more per changed unknown name, and never for a found icon', async () => {
    const error = spyError();
    const name = ref('missing');
    provided(() => h(SvgIcon, { iconName: name.value }));
    await nextTick();
    expect(error).toHaveBeenCalledTimes(1);
    name.value = 'other-missing';
    await nextTick();
    expect(error).toHaveBeenCalledTimes(2);
    name.value = 'plus';
    await nextTick();
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('draws a name that is registered later', async () => {
    spyError();
    const { container } = mountView(() =>
      h(IconProvider, null, () => [
        h(SvgIcon, { iconName: 'late' }),
        h({
          setup() {
            const registry = useIconRegistry();
            return () =>
              h(
                'button',
                {
                  onClick: () => {
                    registry.registerIcons({ late: plusIcon });
                  },
                },
                'add',
              );
          },
        }),
      ]),
    );
    expect(pick(container, 'svg').innerHTML).toBe('');
    pick(container, 'button').click();
    await nextTick();
    expect(pick(container, 'svg').innerHTML).toBe(plusIcon.body);
  });

  it('draws a name registered later in the outer provider inside a nested one', async () => {
    spyError();
    const { container } = mountView(() =>
      h(IconProvider, null, () => [
        h(IconProvider, null, () => h(SvgIcon, { iconName: 'late' })),
        h({
          setup() {
            const registry = useIconRegistry();
            return () =>
              h(
                'button',
                {
                  onClick: () => {
                    registry.registerIcons({ late: plusIcon });
                  },
                },
                'add',
              );
          },
        }),
      ]),
    );
    expect(pick(container, 'svg').innerHTML).toBe('');
    pick(container, 'button').click();
    await nextTick();
    expect(pick(container, 'svg').innerHTML).toBe(plusIcon.body);
  });

  it('draws a lazy icon after mount, calls the loader once for several icons, and logs nothing', async () => {
    const error = spyError();
    const load = vi.fn(() => Promise.resolve(plusIcon));
    const { container } = mountView(() =>
      h(IconProvider, { lazyIcons: { plus: load } }, () => [
        h(SvgIcon, { iconName: 'plus' }),
        h(SvgIcon, { iconName: 'plus' }),
      ]),
    );
    expect(container.querySelectorAll('path')).toHaveLength(0);
    await vi.waitFor(() => {
      expect([...container.querySelectorAll('svg')].map((svg) => svg.innerHTML)).toEqual([
        plusIcon.body,
        plusIcon.body,
      ]);
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it('draws a lazy icon of the outer provider inside a nested one', async () => {
    const { container } = mountView(() =>
      h(IconProvider, { lazyIcons: { plus: () => Promise.resolve(plusIcon) } }, () =>
        h(IconProvider, null, () => h(SvgIcon, { iconName: 'plus' })),
      ),
    );
    await vi.waitFor(() => {
      expect(pick(container, 'svg').innerHTML).toBe(plusIcon.body);
    });
  });

  it('draws an svg string after mount, without data-icon', async () => {
    const { container } = provided(() => h(SvgIcon, { svg: svgOf(heartIcon) }));
    await nextTick();
    const root = pick(container, '.cck-svg-icon');
    expect(root.hasAttribute('data-icon')).toBe(false);
    const svg = pick(root, 'svg');
    expect(svg.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(svg.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.innerHTML).toBe(heartIcon.body);
  });

  it('draws an empty icon and logs an error for a string that is not an svg', async () => {
    const error = spyError();
    const { container } = provided(() => h(SvgIcon, { svg: '<div>no</div>' }));
    await nextTick();
    expect(pick(container, 'svg').innerHTML).toBe('');
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[0]).toContain('CocoKits:');
  });

  it('uses iconName when both are given, and logs an error', async () => {
    const error = spyError();
    const { container } = provided(() => h(SvgIcon, { iconName: 'plus', svg: svgOf(heartIcon) }));
    await nextTick();
    expect(pick(container, 'svg').innerHTML).toBe(plusIcon.body);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[0]).toContain('iconName');
  });

  it('draws nothing and logs an error when neither is given', async () => {
    const error = spyError();
    const { container } = provided(() => h(SvgIcon));
    await nextTick();
    expect(pick(container, 'svg').innerHTML).toBe('');
    expect(pick(container, '.cck-svg-icon').hasAttribute('data-icon')).toBe(false);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('exposes the root element, null before mount', () => {
    let exposed: { element: Element | null } | undefined;
    const { container } = provided(() =>
      h(SvgIcon, {
        iconName: 'plus',
        ref: (instance) => {
          exposed = instance as unknown as { element: Element | null };
        },
      }),
    );
    expect(exposed?.element).toBe(container.querySelector('.cck-svg-icon'));
  });

  it('declares the data-icon of the meta on the root', () => {
    expect(svgIconMeta.dataAttrs.root).toContain('data-icon');
    const { container } = provided(() => h(SvgIcon, { iconName: 'plus' }));
    const root = pick(container, '.cck-svg-icon');
    expect(root.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual(['data-icon']);
  });
});

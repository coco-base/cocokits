// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { SvgIcon } from '../index';
import { mountView, svgOf, heartIcon, withIcons } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SvgIcon accessibility (axe)', () => {
  it.each<[string, () => VNode]>([
    ['decorative', () => h('p', ['Like ', h(SvgIcon, { iconName: 'heart' })])],
    ['named with a label', () => h(SvgIcon, { iconName: 'heart', label: 'Favourite' })],
    ['an svg string', () => h(SvgIcon, { svg: svgOf(heartIcon), label: 'Favourite' })],
    ['a name that is not registered', () => h(SvgIcon, { iconName: 'missing' })],
  ])('has no violations: %s', async (_name, make) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = mountView(() => h(withIcons(make)));
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

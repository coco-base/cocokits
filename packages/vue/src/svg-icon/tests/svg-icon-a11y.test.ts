// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ThemeProvider } from '@cocokits/vue-core';
import { SvgIcon } from '../index';
import { iconsThemeConfig, mountView } from './fixtures';

afterEach(cleanup);

describe('SvgIcon accessibility (axe)', () => {
  it.each<[string, () => VNode]>([
    ['decorative', () => h('p', ['Like ', h(SvgIcon, { iconName: 'heart' })])],
    ['named with a label', () => h(SvgIcon, { iconName: 'heart', label: 'Favourite' })],
    ['a name the theme does not have', () => h(SvgIcon, { iconName: 'missing' })],
  ])('has no violations: %s', async (_name, make) => {
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: iconsThemeConfig }, make));
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

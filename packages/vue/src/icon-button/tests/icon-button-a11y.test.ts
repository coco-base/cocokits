// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { SvgIcon } from '../../svg-icon';
import { IconButton } from '../index';
import { inTheme, mountView } from './fixtures';

afterEach(cleanup);

const plus = (): VNode => h(SvgIcon, { iconName: 'plus' });

describe('IconButton accessibility (axe)', () => {
  it.each<[string, () => VNode]>([
    ['named by aria-label', () => h(IconButton, { 'aria-label': 'Add item' }, plus)],
    ['disabled', () => h(IconButton, { 'aria-label': 'Add item', disabled: true }, plus)],
    ['a toggle with aria-pressed', () => h(IconButton, { 'aria-label': 'Mute', 'aria-pressed': 'true' }, plus)],
    ['a link', () => h(IconButton, { as: 'a', href: '#go', 'aria-label': 'Go' }, plus)],
    ['a disabled link', () => h(IconButton, { as: 'a', href: '#go', disabled: true, 'aria-label': 'Go' }, plus)],
    ['named by a labelled icon', () => h(IconButton, null, () => h(SvgIcon, { iconName: 'plus', label: 'Add item' }))],
  ])('has no violations: %s', async (_name, make) => {
    const { container } = mountView(() => inTheme(make));
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

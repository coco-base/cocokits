// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Button } from '../index';
import { mountView } from './fixtures';

afterEach(cleanup);

describe('Button accessibility (axe)', () => {
  it.each<[string, () => VNode]>([
    ['text', () => h(Button, null, () => 'Save')],
    [
      'icon-only with aria-label',
      () => h(Button, { 'aria-label': 'Close' }, () => h('svg', { 'aria-hidden': 'true', width: 8, height: 8 })),
    ],
    ['disabled', () => h(Button, { disabled: true }, () => 'Save')],
    ['link', () => h(Button, { as: 'a', href: '#go' }, () => 'Go')],
    ['disabled link', () => h(Button, { as: 'a', href: '#go', disabled: true }, () => 'Go')],
    ['asChild link', () => h(Button, { asChild: true }, () => h('a', { href: '#go' }, 'Go'))],
  ])('has no violations: %s', async (_name, make) => {
    const { container } = mountView(make);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

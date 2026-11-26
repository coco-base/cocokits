// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tagAnatomy, tagMeta } from '@cocokits/machines/tag';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Tag } from '../index';
import { mountView, pick, testThemeConfig } from './fixtures';

afterEach(cleanup);

describe('Tag (rendered contract)', () => {
  it('renders the default element of the meta with the class, no role and no other attribute', () => {
    const { container } = mountView(() => h(Tag, null, () => 'Paid'));
    const root = pick(container, '.cck-tag');
    expect(root.tagName.toLowerCase()).toBe(tagMeta.defaultElements?.root);
    expect(root.className).toBe(tagAnatomy.classes.root);
    expect(root.getAttributeNames()).toEqual(['class']);
    expect(root.textContent).toBe('Paid');
  });

  it('renders its slot as it is, an icon included, with no wrapper', () => {
    const { container } = mountView(() => h(Tag, null, () => [h('svg', { 'aria-hidden': 'true' }), 'Passed']));
    const root = pick(container, '.cck-tag');
    expect([...root.children].map((element) => element.tagName.toLowerCase())).toEqual(['svg']);
    expect(root.textContent).toBe('Passed');
  });

  it('renders an empty span without a slot', () => {
    const { container } = mountView(() => h(Tag));
    const root = pick(container, '.cck-tag');
    expect(root.children).toHaveLength(0);
    expect(root.textContent).toBe('');
  });

  it('passes native attributes through, joins class and merges style', () => {
    const { container } = mountView(() =>
      h(Tag, { id: 'state', title: 'State', class: 'mine', style: { color: 'red' } }, () => 'Beta'),
    );
    const root = pick(container, '.cck-tag');
    expect(root.id).toBe('state');
    expect(root.title).toBe('State');
    expect([...root.classList].sort()).toEqual([tagAnatomy.classes.root, 'mine']);
    expect(root.style.color).toBe('red');
  });

  it('keeps a role the author writes', () => {
    const { container } = mountView(() => h(Tag, { role: 'status' }, () => 'Saved'));
    expect(pick(container, '.cck-tag').getAttribute('role')).toBe('status');
  });

  it('emits only the theme options as data-*, with no dev warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () => h(Tag, null, () => 'Paid')),
    );
    const root = pick(container, '.cck-tag');
    const dataNames = root
      .getAttributeNames()
      .filter((name) => name.startsWith('data-'))
      .sort();
    expect(dataNames).toEqual(['data-cck-color', 'data-dot', 'data-size', 'data-variant']);
    expect(root.getAttribute('data-variant')).toBe('soft');
    expect(root.getAttribute('data-cck-color')).toBe('neutral');
    expect(root.getAttribute('data-size')).toBe('md');
    expect(root.getAttribute('data-dot')).toBe('false');
    expect(tagMeta.dataAttrs.root).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('Tag theme', () => {
  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        [tagAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(tagAnatomy.parts) },
        },
      },
    });
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: config }, () => h(Tag)));
    expect(pick(container, '.cck-tag').getAttribute('data-probe')).toBe('on');
  });
});

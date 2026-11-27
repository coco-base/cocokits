// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { badgeAnatomy, badgeMeta } from '@cocokits/machines/badge';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Badge } from '../index';
import { BadgeContainer } from '../../badge-container';
import { mountView, pick, testThemeConfig } from './fixtures';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(badgeAnatomy.parts) },
    },
  },
});

function root(container: Element): HTMLElement {
  return pick(container, '.cck-badge');
}

describe('Badge (rendered contract)', () => {
  it('renders a span root with the content part', () => {
    const { container } = mountView(() => h(Badge, { content: 5 }));
    const badge = root(container);
    expect(badge.tagName).toBe('SPAN');
    expect(badge.textContent).toBe('5');
    expect(badge.querySelector('.cck-badge__content')?.textContent).toBe('5');
    expect(badge.querySelector('.cck-badge__max-indicator')).toBeNull();
    expect(badge.hasAttribute('data-empty')).toBe(false);
    expect(badge.hasAttribute('role')).toBe(false);
  });

  it.each<[string, number | string | null | undefined]>([
    ['undefined', undefined],
    ['null', null],
    ['empty string', ''],
    ['number 0', 0],
  ])('shows no text (data-empty) for %s', (_name, content) => {
    const { container } = mountView(() => h(Badge, { content }));
    const badge = root(container);
    expect(badge.hasAttribute('data-empty')).toBe(true);
    expect(badge.querySelector('.cck-badge__content')?.textContent).toBe('');
  });

  it('shows the string "0" without data-empty', () => {
    const { container } = mountView(() => h(Badge, { content: '0', max: 99 }));
    expect(root(container).textContent).toBe('0');
    expect(root(container).hasAttribute('data-empty')).toBe(false);
    expect(root(container).hasAttribute('data-truncated')).toBe(false);
  });

  it.each<[number | string]>([[120], ['120']])('truncates %s above max', (content) => {
    const { container } = mountView(() => h(Badge, { content, max: 99 }));
    const badge = root(container);
    expect(badge.hasAttribute('data-truncated')).toBe(true);
    expect(badge.querySelector('.cck-badge__content')?.textContent).toBe('99');
    expect(badge.querySelector('.cck-badge__max-indicator')?.textContent).toBe('+');
  });

  it('never truncates text, or with max 0', () => {
    const text = mountView(() => h(Badge, { content: 'New', max: 1 }));
    expect(root(text.container).textContent).toBe('New');
    cleanup();
    const zero = mountView(() => h(Badge, { content: 500, max: 0 }));
    expect(root(zero.container).textContent).toBe('500');
  });

  it('hide renders the root only, with the native hidden attribute and no data-empty', () => {
    const { container } = mountView(() => h(Badge, { content: 5, hide: true }));
    const badge = root(container);
    expect(badge.hasAttribute('hidden')).toBe(true);
    expect(badge.hasAttribute('data-empty')).toBe(false);
    expect(badge.children).toHaveLength(0);
  });

  it('falls class, style and attrs through to the root', () => {
    const { container } = mountView(() =>
      h(Badge, { content: 1, class: 'mine', style: { color: 'red' }, id: 'x', 'aria-hidden': 'true' }),
    );
    const badge = root(container);
    expect([...badge.classList].sort()).toEqual(['cck-badge', 'mine']);
    expect(badge.style.color).toBe('red');
    expect(badge.id).toBe('x');
  });

  it('adds the theme attributes', () => {
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () => h(Badge, { content: 1 })),
    );
    const badge = root(container);
    expect(badge.getAttribute('data-variant')).toBe('rounded');
    expect(badge.getAttribute('data-cck-color')).toBe('contrast');
    expect(badge.getAttribute('data-size')).toBe('md');
  });

  it('only renders data-* attributes the meta declares', () => {
    const declared = new Set<string>(badgeMeta.dataAttrs.root);
    const themed = new Set(['data-variant', 'data-cck-color', 'data-size']);
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () =>
        h(BadgeContainer, null, () => h(Badge, { content: 120, max: 99 })),
      ),
    );
    const names = [...root(container).attributes].map((a) => a.name).filter((n) => n.startsWith('data-'));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(declared.has(name) || themed.has(name)).toBe(true);
  });

  it('follows its props: text, truncation, empty and hide', async () => {
    const content = ref<number | string | null>(5);
    const max = ref<number | undefined>(undefined);
    const hide = ref(false);
    const { container } = mountView(() => h(Badge, { content: content.value, max: max.value, hide: hide.value }));
    const badge = () => root(container);
    expect(badge().textContent).toBe('5');
    content.value = 120;
    max.value = 99;
    await nextTick();
    expect(badge().textContent).toBe('99+');
    expect(badge().hasAttribute('data-truncated')).toBe(true);
    max.value = undefined;
    await nextTick();
    expect(badge().textContent).toBe('120');
    expect(badge().querySelector('.cck-badge__max-indicator')).toBeNull();
    expect(badge().hasAttribute('data-truncated')).toBe(false);
    content.value = null;
    await nextTick();
    expect(badge().hasAttribute('data-empty')).toBe(true);
    hide.value = true;
    await nextTick();
    expect(badge().hasAttribute('hidden')).toBe(true);
    expect(badge().hasAttribute('data-empty')).toBe(false);
    expect(badge().children).toHaveLength(0);
  });

  it('renders the default elements of the meta, and no data-hidden or inline style', () => {
    const { container } = mountView(() => h(Badge, { content: 120, max: 99 }));
    const badge = root(container);
    expect(badge.tagName.toLowerCase()).toBe(badgeMeta.defaultElements?.root);
    expect(badge.querySelector('.cck-badge__content')?.tagName.toLowerCase()).toBe(badgeMeta.defaultElements?.content);
    expect(badge.querySelector('.cck-badge__max-indicator')?.tagName.toLowerCase()).toBe(
      badgeMeta.defaultElements?.maxIndicator,
    );
    expect(badge.hasAttribute('data-hidden')).toBe(false);
    expect(badge.hasAttribute('style')).toBe(false);
  });

  it('hidden wins over a hidden=false attr', () => {
    const { container } = mountView(() => h(Badge, { hide: true, hidden: false }));
    expect(root(container).hasAttribute('hidden')).toBe(true);
  });
});

describe('Badge theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: allPartsConfig }, () => h(Badge, { content: 120, max: 99 })),
    );
    for (const className of Object.values(badgeAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});

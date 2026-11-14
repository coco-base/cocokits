// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { badgeContainerAnatomy, badgeContainerMeta } from '@cocokits/machines/badge-container';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Badge } from '../../badge';
import { BadgeContainer } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeContainerAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(badgeContainerAnatomy.parts) },
    },
  },
});

const host = () => h('button', { type: 'button' }, 'Inbox');

describe('BadgeContainer (rendered contract)', () => {
  it('renders a div root with the class, no style and children in author order', () => {
    const { container } = mountView(() => h(BadgeContainer, null, () => [host(), h(Badge, { content: 2 })]));
    const root = pick(container, '.cck-badge-container');
    expect(root.tagName).toBe('DIV');
    expect(root.hasAttribute('style')).toBe(false);
    expect(root.tagName.toLowerCase()).toBe(badgeContainerMeta.defaultElements?.root);
    expect([...root.children].map((c) => c.tagName)).toEqual(['BUTTON', 'SPAN']);
    expect(badgeContainerMeta.dataAttrs.root).toEqual(['data-position']);
    expect(root.getAttributeNames().filter((n) => n.startsWith('data-'))).toEqual(['data-position']);
  });

  it('falls attrs through', () => {
    const { container } = mountView(() => h(BadgeContainer, { class: 'mine', id: 'c' }));
    const root = pick(container, '.cck-badge-container');
    expect([...root.classList].sort()).toEqual(['cck-badge-container', 'mine']);
    expect(root.id).toBe('c');
  });

  it('puts data-position on the root: top-right by default, then each corner', () => {
    const position = (value?: 'top-left' | 'bottom-left' | 'bottom-right') =>
      pick(mountView(() => h(BadgeContainer, value ? { position: value } : null)).container, '.cck-badge-container')
        .dataset.position;
    expect(position()).toBe('top-right');
    for (const corner of ['top-left', 'bottom-left', 'bottom-right'] as const) expect(position(corner)).toBe(corner);
  });

  it('leaves the badge without any position', () => {
    const { container } = mountView(() => h(BadgeContainer, null, () => h(Badge, { content: 1 })));
    expect(pick(container, '.cck-badge').hasAttribute('data-position')).toBe(false);
    cleanup();
    expect(mountView(() => h(Badge, { content: 1 })).container.querySelector('[data-position]')).toBeNull();
  });

  it('keeps a hidden badge a direct child', () => {
    const { container } = mountView(() => h(BadgeContainer, null, () => h(Badge, { content: 2, hide: true })));
    expect(pick(container, '.cck-badge-container > .cck-badge').hasAttribute('hidden')).toBe(true);
  });

  it('updates data-position when the position changes', async () => {
    const position = ref<'top-left' | 'bottom-right'>('top-left');
    const { container } = mountView(() =>
      h(BadgeContainer, { position: position.value }, () => h(Badge, { content: 1 })),
    );
    expect(pick(container, '.cck-badge-container').dataset.position).toBe('top-left');
    position.value = 'bottom-right';
    await nextTick();
    expect(pick(container, '.cck-badge-container').dataset.position).toBe('bottom-right');
  });
});

describe('BadgeContainer theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = mountView(() =>
      h(ThemeProvider, { themeConfig: allPartsConfig }, () => h(BadgeContainer, null, () => h(Badge, { content: 2 }))),
    );
    for (const className of Object.values(badgeContainerAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});

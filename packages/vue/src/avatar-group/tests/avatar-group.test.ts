// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { avatarGroupMeta } from '@cocokits/machines/avatar-group';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { AvatarRoot } from '../../avatar';
import { AvatarGroup } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

describe('AvatarGroup', () => {
  it('renders a div root that keeps its children in order', () => {
    const { container } = mountView(() =>
      h(AvatarGroup, null, () => [h(AvatarRoot, { id: 'one' }), h(AvatarRoot, { id: 'two' })]),
    );
    const group = pick(container, '.cck-avatar-group');
    expect(group.tagName).toBe('DIV');
    expect([...group.children].map((child) => child.id)).toEqual(['one', 'two']);
    expect(group.hasAttribute('role')).toBe(false);
  });

  it('lets native attributes and a merged class through', () => {
    const { container } = mountView(() =>
      h(AvatarGroup, { id: 'team', class: 'mine', role: 'group', 'aria-label': 'Team' }),
    );
    const group = pick(container, '.cck-avatar-group');
    expect([...group.classList].sort()).toEqual(['cck-avatar-group', 'mine']);
    expect(group.id).toBe('team');
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Team');
  });

  it('renders with as, merges with asChild and exposes the element', () => {
    const group = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => [
      h(AvatarGroup, { ref: group, as: 'ul' }),
      h(AvatarGroup, { asChild: true }, () => h('section')),
    ]);
    expect(container.querySelector('ul.cck-avatar-group')).not.toBeNull();
    expect(group.value?.element).toBe(container.querySelector('ul'));
    expect(container.querySelector('section.cck-avatar-group')).not.toBeNull();
  });

  it('emits only the theme data-size and the data-* the meta declares', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: { 'avatar-group': { size: { attrName: 'size', values: ['sm', 'md'], default: 'md' } } },
    });
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: config }, () => h(AvatarGroup)));
    expect(
      pick(container, '.cck-avatar-group')
        .getAttributeNames()
        .filter((name) => name.startsWith('data-')),
    ).toEqual(['data-size']);
    expect(avatarGroupMeta.dataAttrs.root).toEqual([]);
  });
});

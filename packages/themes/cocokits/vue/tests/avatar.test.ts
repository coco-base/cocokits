// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { AvatarFallback } from '@cocokits/vue/avatar';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { AvatarGroup, AvatarLabel, AvatarRoot, type AvatarRootProps } from '../src/index';
import { themed } from './helpers';

afterEach(cleanup);

const { avatar, 'avatar-group': group, 'avatar-label': label } = cocokitsThemeConfig.components;
const el = (id: string): HTMLElement => screen.getByTestId(id);
const attr = (id: string, name: string): string | null => el(id).getAttribute(name);

const make = (id: string, props: Record<string, unknown>): VNode => {
  const all = { 'data-testid': id, ...props };
  if (id === 'avatar') return h(AvatarRoot, all, () => h(AvatarFallback, () => 'AL'));
  return id === 'group' ? h(AvatarGroup, all) : h(AvatarLabel, { name: 'Ada', ...all });
};

describe('theme AvatarRoot, AvatarGroup and AvatarLabel', () => {
  it('render the config defaults next to the base classes', () => {
    render(themed(() => [make('avatar', {}), make('group', {}), make('label', {})]));
    expect(el('avatar').classList.contains('cck-avatar')).toBe(true);
    expect(el('group').classList.contains('cck-avatar-group')).toBe(true);
    expect(el('label').classList.contains('cck-avatar-label')).toBe(true);
    expect(attr('avatar', 'data-size')).toBe('md');
    expect(attr('group', 'data-size')).toBe('md');
    expect(attr('label', 'data-size')).toBe('md');
    expect(attr('label', 'data-avatar-position')).toBe('start');
    expect(attr('label', 'data-text-layout')).toBe('stacked');
  });

  it.each([
    ['avatar', 'size', 'data-size', avatar.size.values],
    ['group', 'size', 'data-size', group.size.values],
    ['label', 'size', 'data-size', label.size.values],
    ['label', 'avatarPosition', 'data-avatar-position', label.avatarPosition.values],
    ['label', 'textLayout', 'data-text-layout', label.textLayout.values],
  ] as const)('the %s %s prop renders %s for every value', (id, option, name, values) => {
    for (const value of values) {
      render(themed(() => make(id, { [option]: value })));
      expect(attr(id, name)).toBe(value);
      cleanup();
    }
  });

  it('remove the attributes with null', () => {
    render(
      themed(() => [
        make('avatar', { size: null }),
        make('group', { size: null }),
        make('label', { size: null, avatarPosition: null, textLayout: null }),
      ]),
    );
    for (const [id, name] of [
      ['avatar', 'data-size'],
      ['group', 'data-size'],
      ['label', 'data-size'],
      ['label', 'data-avatar-position'],
      ['label', 'data-text-layout'],
    ] as const) {
      expect(el(id).hasAttribute(name)).toBe(false);
    }
  });

  it('let a provider override win over the default and the own prop over the override', () => {
    render(
      themed(() => [make('avatar', { size: 'lg' }), make('label', {})], {
        avatar: { size: 'xs' },
        'avatar-label': { textLayout: 'inline' },
      }),
    );
    expect(attr('avatar', 'data-size')).toBe('lg');
    expect(attr('label', 'data-text-layout')).toBe('inline');
  });

  it('update a mounted root: value, null, then undefined restores the default', async () => {
    const value = ref<AvatarRootProps['size']>('lg');
    render(themed(() => make('avatar', { size: value.value })));
    const element = el('avatar');
    expect(element.getAttribute('data-size')).toBe('lg');
    value.value = null;
    await nextTick();
    expect(element.hasAttribute('data-size')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(element.getAttribute('data-size')).toBe('md');
  });

  it('expose the root element of each component', () => {
    const refs = {
      avatar: ref<{ element: Element | null } | null>(null),
      label: ref<{ element: Element | null } | null>(null),
    };
    render(
      themed(() => [
        h(AvatarRoot, { 'data-testid': 'avatar', ref: refs.avatar }),
        h(AvatarLabel, { 'data-testid': 'label', ref: refs.label }),
      ]),
    );
    expect(refs.avatar.value?.element).toBe(el('avatar'));
    expect(refs.label.value?.element).toBe(el('label'));
  });
});

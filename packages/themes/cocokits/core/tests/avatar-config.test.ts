import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  avatarGroupSizeModes,
  avatarLabelSizeDefaultMode,
  avatarLabelSizeModes,
  avatarSizeModes,
} from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig avatar, avatar group and avatar label', () => {
  const { avatar, 'avatar-group': group, 'avatar-label': label } = cocokitsThemeConfig.components;
  const anatomyOf = (block: string) =>
    defineAnatomy({ block, parts: { root: { name: 'Root', description: `The ${block}.` } } });
  const SIZES = ['xs', 'sm', 'md', 'lg'];

  it.each([
    ['avatar', avatar],
    ['avatar-group', group],
    ['avatar-label', label],
  ] as const)('%s has a root size option from the token modes, default md', (_name, component) => {
    expect(component.size.attrName).toBe('size');
    expect(component.size.values).toEqual(SIZES);
    expect(component.size.default).toBe('md');
    expect(component.size.partNames).toEqual(['root']);
  });

  it('takes the sizes from the generated token modes', () => {
    expect(avatar.size.values).toBe(avatarSizeModes);
    expect(group.size.values).toBe(avatarGroupSizeModes);
    expect(label.size.values).toBe(avatarLabelSizeModes);
    expect(label.size.default).toBe(avatarLabelSizeDefaultMode);
  });

  it('gives the label its two layout options on the root, with the old defaults', () => {
    expect(label.avatarPosition).toMatchObject({
      attrName: 'avatar-position',
      values: ['start', 'end', 'top', 'bottom'],
      default: 'start',
      partNames: ['root'],
    });
    expect(label.textLayout).toMatchObject({
      attrName: 'text-layout',
      values: ['stacked', 'inline'],
      default: 'stacked',
      partNames: ['root'],
    });
    expectTypeOf(label.avatarPosition.values).toEqualTypeOf<readonly ['start', 'end', 'top', 'bottom']>();
    expectTypeOf(label.textLayout.values).toEqualTypeOf<readonly ['stacked', 'inline']>();
  });

  it('resolves the defaults to data attributes on the root', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar')).root).toEqual({ 'data-size': 'md' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-group')).root).toEqual({ 'data-size': 'md' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-label')).root).toEqual({
      'data-size': 'md',
      'data-avatar-position': 'start',
      'data-text-layout': 'stacked',
    });
  });

  it('lets an own option win and null remove', () => {
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-label'), {
        size: 'lg',
        avatarPosition: 'bottom',
        textLayout: null,
      }).root,
    ).toEqual({ 'data-size': 'lg', 'data-avatar-position': 'bottom' });
  });
});

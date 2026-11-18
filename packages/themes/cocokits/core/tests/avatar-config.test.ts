import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  avatarGroupSizeModes,
  avatarLabelSizeDefaultMode,
  avatarLabelSizeModes,
  avatarSizeModes,
  themeActiveColorModes,
} from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig avatar, avatar group and avatar label', () => {
  const { avatar, 'avatar-group': group, 'avatar-label': label } = cocokitsThemeConfig.components;
  const anatomyOf = (block: string) =>
    defineAnatomy({ block, parts: { root: { name: 'Root', description: `The ${block}.` } } });
  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

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
      values: ['left', 'top', 'right', 'bottom'],
      default: 'left',
      partNames: ['root'],
    });
    expect(label.labelAlignment).toMatchObject({
      attrName: 'label-alignment',
      values: ['horizontal', 'vertical'],
      default: 'vertical',
      partNames: ['root'],
    });
    expectTypeOf(label.avatarPosition.values).toEqualTypeOf<readonly ['left', 'top', 'right', 'bottom']>();
    expectTypeOf(label.labelAlignment.values).toEqualTypeOf<readonly ['horizontal', 'vertical']>();
  });

  it('resolves the defaults to data attributes on the root', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar')).root).toEqual({
      'data-size': 'md',
      'data-cck-color': 'contrast',
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-group')).root).toEqual({ 'data-size': 'md' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-label')).root).toEqual({
      'data-size': 'md',
      'data-avatar-position': 'left',
      'data-label-alignment': 'vertical',
    });
  });

  it('describes the color option in plain words', () => {
    expect(avatar.color.description).toBe('Colour of the fallback; the default is contrast.');
  });

  it('gives the avatar a color option from the Active Color modes, contrast by default', () => {
    expect(avatar.color).toMatchObject({ attrName: 'cck-color', default: 'contrast', partNames: ['root'] });
    expect(avatar.color.values).toBe(themeActiveColorModes);
    expect(avatar.color.values).toEqual(['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']);
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar'), { color: 'danger', size: null }).root).toEqual({
      'data-cck-color': 'danger',
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar'), { color: null }).root).toEqual({
      'data-size': 'md',
    });
  });

  it('lets an own option win and null remove', () => {
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomyOf('avatar-label'), {
        size: 'lg',
        avatarPosition: 'bottom',
        labelAlignment: null,
      }).root,
    ).toEqual({ 'data-size': 'lg', 'data-avatar-position': 'bottom' });
  });
});

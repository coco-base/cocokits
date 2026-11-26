import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { tagSizeDefaultMode, tagSizeModes, themeActiveColorModes } from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig tag', () => {
  const { tag, accordion } = cocokitsThemeConfig.components;
  const anatomy = defineAnatomy({ block: 'tag', parts: { root: { name: 'Root', description: 'The tag.' } } });

  it('has the variants soft, solid and outline on the root, soft by default', () => {
    expect(tag.variant).toMatchObject({
      attrName: 'variant',
      values: ['soft', 'solid', 'outline'],
      default: 'soft',
      partNames: ['root'],
    });
    expectTypeOf(tag.variant.values).toEqualTypeOf<readonly ['soft', 'solid', 'outline']>();
  });

  it('takes the colours from the Active Color modes', () => {
    expect(tag.color).toMatchObject({ attrName: 'cck-color', default: 'brand', partNames: ['root'] });
    expect(tag.color.values).toBe(themeActiveColorModes);
  });

  it('takes the sizes sm, md and lg from the generated token modes, md by default', () => {
    expect(tag.size).toMatchObject({ attrName: 'size', default: 'md', partNames: ['root'] });
    expect(tag.size.values).toBe(tagSizeModes);
    expect(tag.size.values).toEqual(['sm', 'md', 'lg']);
    expect(tag.size.default).toBe(tagSizeDefaultMode);
  });

  it('has a boolean dot option, off by default, with the same value list as the other boolean options', () => {
    expect(tag.dot).toMatchObject({ attrName: 'dot', default: false, partNames: ['root'] });
    expect(tag.dot.values).toBe(accordion.hideToggle.values);
    expectTypeOf(tag.dot.values).toEqualTypeOf<readonly [true, false]>();
  });

  it('resolves the defaults to data attributes on the root, without the dot', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy).root).toEqual({
      'data-variant': 'soft',
      'data-cck-color': 'brand',
      'data-size': 'md',
    });
  });

  it('lets an own option win and null remove', () => {
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomy, { variant: 'outline', color: 'success', size: null, dot: true })
        .root,
    ).toEqual({ 'data-variant': 'outline', 'data-cck-color': 'success', 'data-dot': '' });
  });
});

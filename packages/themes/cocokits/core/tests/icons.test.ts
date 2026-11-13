import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { iconButtonSizeModes, svgIconSizeModes } from '../src/generated/token-modes';
import { type CocokitsIconName, cocokitsIcons, cocokitsThemeConfig } from '../src/index';

/** The names of the pack, in the order of the spec. */
const NAMES = [
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'check',
  'check-circle',
  'close',
  'plus',
  'minus',
  'search',
  'info',
  'warning',
  'email',
  'link',
  'copy',
  'code',
  'heart',
  'heart-fill',
  'user',
  'menu',
  'setting',
  'tools',
  'trash',
  'light',
  'dark',
  'mic',
  'card',
  'dollar',
  'pizza-slice',
  'steak',
  'volume-mute',
  'volume-off',
  'volume-low',
  'volume',
  'volume-high',
] as const;

/** `d` holds only path commands, numbers and separators: no markup character can be in it. */
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const machines = join(import.meta.dirname, '..', '..', '..', '..', 'machines');
/** The part names of a machine anatomy, read from its source (the theme package imports no machine). */
const partsOf = (block: string): string[] =>
  [...readFileSync(join(machines, block, `${block}.anatomy.ts`), 'utf8').matchAll(/readonly (\w+): AnatomyPart/g)].map(
    (match) => match[1],
  );

describe('the cocokits icon pack', () => {
  it('holds exactly the 39 names of the spec, in order', () => {
    expect(NAMES).toHaveLength(39);
    expect(Object.keys(cocokitsIcons)).toEqual([...NAMES]);
    expectTypeOf<CocokitsIconName>().toEqualTypeOf<keyof typeof cocokitsIcons>();
    expectTypeOf<CocokitsIconName>().toEqualTypeOf<(typeof NAMES)[number]>();
  });

  it('is the icon set of the theme config', () => {
    expect(cocokitsThemeConfig.icons).toBe(cocokitsIcons);
  });

  it.each(NAMES)('%s is path data only: a viewBox and paths with d, fillRule and clipRule', (name) => {
    const icon = cocokitsIcons[name];
    expect(Object.keys(icon).sort()).toEqual(['paths', 'viewBox']);
    expect(icon.viewBox).toBe(name === 'check-circle' || name === 'card' ? '0 0 24 25' : '0 0 24 24');
    expect(icon.paths.length).toBeGreaterThan(0);
    for (const path of icon.paths) {
      expect(Object.keys(path).every((key) => ['d', 'fillRule', 'clipRule'].includes(key))).toBe(true);
      expect(path.d, name).toMatch(PATH_DATA);
      for (const rule of [path.fillRule, path.clipRule]) expect([undefined, 'nonzero', 'evenodd']).toContain(rule);
    }
  });

  it('carries no markup, colour or style anywhere in the data', () => {
    const text = JSON.stringify(cocokitsIcons);
    expect(text).not.toMatch(/[<>]|svg|"(?:fill|stroke|style|href|class|id)":|#[0-9a-f]{3,6}/i);
  });
});

describe('cocokitsThemeConfig.partIconNames', () => {
  it('names the icon of the Select, the Accordion and the Checkbox', () => {
    expect(cocokitsThemeConfig.partIconNames).toEqual({
      select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
      accordion: { indicator: 'chevron-down' },
      checkbox: { background: 'check' },
    });
  });

  const rows = Object.entries(cocokitsThemeConfig.partIconNames).flatMap(([block, parts]) =>
    Object.entries(parts).map(([part, icon]) => ({ block, part, icon })),
  );

  it.each(rows)('$block.$part names an icon of the pack and a part of the $block anatomy', ({ block, part, icon }) => {
    expect(Object.keys(cocokitsThemeConfig.icons)).toContain(icon);
    expect(partsOf(block)).toContain(part);
  });

  it('is no option: resolveThemeAttrs renders no attribute for it', () => {
    const anatomy = defineAnatomy({
      block: 'select',
      parts: { root: { name: 'Root', description: 'Root.' }, dropdownIcon: { name: 'Icon', description: 'Icon.' } },
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy).dropdownIcon).toEqual({});
  });
});

describe('icon-button and svg-icon options', () => {
  const iconButtonAnatomy = defineAnatomy({
    block: 'icon-button',
    parts: { root: { name: 'Root', description: 'Root.' } },
  });
  const svgIconAnatomy = defineAnatomy({
    block: 'svg-icon',
    parts: { root: { name: 'Root', description: 'Root.' }, svg: { name: 'Svg', description: 'Svg.' } },
  });
  const { 'icon-button': iconButton, 'svg-icon': svgIcon } = cocokitsThemeConfig.components;

  it('renders the IconButton defaults on the root: primary, brand, md, not rounded', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, iconButtonAnatomy).root).toEqual({
      'data-variant': 'primary',
      'data-cck-color': 'brand',
      'data-size': 'md',
    });
  });

  it('renders every IconButton option on the root', () => {
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, iconButtonAnatomy, {
        variant: 'light',
        color: 'danger',
        size: 'lg',
        rounded: true,
      }).root,
    ).toEqual({ 'data-variant': 'light', 'data-cck-color': 'danger', 'data-size': 'lg', 'data-rounded': '' });
  });

  it('takes the IconButton variants like the Button and the sizes from the token modes', () => {
    expect(iconButton.variant.values).toEqual(cocokitsThemeConfig.components.button.variant.values);
    expect(iconButton.size.values).toBe(iconButtonSizeModes);
    expect(iconButton.size.values).toEqual(['sm', 'md', 'lg']);
    expect(iconButton.rounded.default).toBe(false);
  });

  it('renders no SvgIcon attribute by default, so the icon is 1em and currentColor', () => {
    expect(svgIcon.size.default).toBeNull();
    expect(svgIcon.color.default).toBeNull();
    expect(svgIcon.rtlMirror.default).toBe(false);
    expect(resolveThemeAttrs(cocokitsThemeConfig, svgIconAnatomy).root).toEqual({});
  });

  it('renders every SvgIcon option on the root only', () => {
    const attrs = resolveThemeAttrs(cocokitsThemeConfig, svgIconAnatomy, {
      size: '2xl',
      color: 'info',
      rtlMirror: true,
    });
    expect(attrs.root).toEqual({ 'data-size': '2xl', 'data-cck-color': 'info', 'data-rtl-mirror': '' });
    expect(attrs.svg).toEqual({});
  });

  it('takes the SvgIcon sizes xs to 2xl from the token modes', () => {
    expect(svgIcon.size.values).toBe(svgIconSizeModes);
    expect(svgIcon.size.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
  });
});

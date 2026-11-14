import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { iconButtonSizeModes, svgIconSizeModes } from '../src/generated/token-modes';
import { checkIcon, chevronDownIcon, defaultPartIcons } from '@cocokits/icons';
import { cocokitsThemeConfig, cocokitsThemeIcons } from '../src/index';
import type { ThemeIconName } from '../src/theme-icons';

const machines = join(import.meta.dirname, '..', '..', '..', '..', 'machines');
/** The part names of a machine anatomy, read from its source (the theme package imports no machine). */
const partsOf = (block: string): string[] =>
  [...readFileSync(join(machines, block, `${block}.anatomy.ts`), 'utf8').matchAll(/readonly (\w+): AnatomyPart/g)].map(
    (match) => match[1],
  );

describe('cocokitsThemeIcons', () => {
  it('holds the chevron-down and the check icon of the pack', () => {
    expect(cocokitsThemeIcons).toEqual({ 'chevron-down': chevronDownIcon, check: checkIcon });
    expectTypeOf<ThemeIconName>().toEqualTypeOf<'chevron-down' | 'check'>();
  });
});

describe('cocokitsThemeConfig components.*.icons', () => {
  const { select, accordion, checkbox } = cocokitsThemeConfig.components;

  it('names the icon of the Select, the Accordion and the Checkbox', () => {
    expect({ select: select.icons, accordion: accordion.icons, checkbox: checkbox.icons }).toEqual({
      select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
      accordion: { indicator: 'chevron-down' },
      checkbox: { background: 'check' },
    });
  });

  const rows = Object.entries({ select, accordion, checkbox }).flatMap(([block, config]) =>
    Object.entries(config.icons).map(([part, icon]) => ({ block, part, icon })),
  );

  it.each(rows)(
    '$block.$part names a key of cocokitsThemeIcons and a part of the $block anatomy',
    ({ block, part, icon }) => {
      expect(Object.keys(cocokitsThemeIcons)).toContain(icon);
      expect(partsOf(block)).toContain(part);
    },
  );

  it.each(Object.entries(defaultPartIcons))(
    'each defaultPartIcons key of %s is a part of that anatomy',
    (block, icons) => {
      for (const part of Object.keys(icons)) expect(partsOf(block)).toContain(part);
    },
  );

  it('is no option: resolveThemeAttrs renders no attribute for it', () => {
    const anatomy = defineAnatomy({
      block: 'select',
      parts: { root: { name: 'Root', description: 'Root.' }, dropdownIcon: { name: 'Icon', description: 'Icon.' } },
    });
    const attrs = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(attrs.dropdownIcon).toEqual({});
    expect(Object.values(attrs.root)).not.toContain('chevron-down');
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

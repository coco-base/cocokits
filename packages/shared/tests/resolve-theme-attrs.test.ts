import { describe, expect, it } from 'vitest';
import { defineAnatomy, defineThemeConfig, resolveThemeAttrs } from '../src/index';
import type { ThemeConfig } from '../src/index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    button: {
      variant: { attrName: 'variant', values: ['primary', 'outline'], default: 'primary' },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      none: { attrName: 'none', values: ['a'], default: null },
      rounded: { attrName: 'rounded', values: [true, false], default: false },
      thumbSize: { attrName: 'thumb', values: ['sm', 'lg'], default: 'sm', partNames: ['thumb'] },
    },
    separator: {},
  },
});

const part = { name: 'Part', description: 'A part.' };
const buttonAnatomy = defineAnatomy({ block: 'button', parts: { root: part, thumb: part } });
const rootOnly = defineAnatomy({ block: 'button', parts: { root: part } });

describe('resolveThemeAttrs', () => {
  it.each([
    {
      name: 'config defaults',
      ownValues: {},
      overrideValues: {},
      expected: { 'data-variant': 'primary', 'data-cck-color': 'brand' },
    },
    {
      name: 'override beats default',
      ownValues: {},
      overrideValues: { variant: 'outline' },
      expected: { 'data-variant': 'outline', 'data-cck-color': 'brand' },
    },
    {
      name: 'own beats override',
      ownValues: { variant: 'primary' },
      overrideValues: { variant: 'outline' },
      expected: { 'data-variant': 'primary', 'data-cck-color': 'brand' },
    },
    {
      name: 'own null removes despite override',
      ownValues: { variant: null },
      overrideValues: { variant: 'outline' },
      expected: { 'data-cck-color': 'brand' },
    },
    {
      name: 'override null removes the default',
      ownValues: {},
      overrideValues: { color: null },
      expected: { 'data-variant': 'primary' },
    },
    {
      name: 'own undefined defers to override',
      ownValues: { variant: undefined },
      overrideValues: { variant: 'outline' },
      expected: { 'data-variant': 'outline', 'data-cck-color': 'brand' },
    },
    {
      name: 'true renders a presence attribute, a null default renders when given',
      ownValues: { rounded: true, none: 'a' },
      overrideValues: {},
      expected: {
        'data-variant': 'primary',
        'data-cck-color': 'brand',
        'data-none': 'a',
        'data-rounded': '',
      },
    },
  ])('$name', ({ ownValues, overrideValues, expected }) => {
    expect(resolveThemeAttrs(themeConfig, rootOnly, ownValues, overrideValues).root).toEqual(expected);
  });

  it('returns one record per anatomy part, each with only the options that list it', () => {
    expect(resolveThemeAttrs(themeConfig, buttonAnatomy).thumb).toEqual({ 'data-thumb': 'sm' });
    expect(Object.keys(resolveThemeAttrs(themeConfig, buttonAnatomy))).toEqual(['root', 'thumb']);
  });

  it('does not mutate its inputs', () => {
    const ownValues = Object.freeze({ variant: 'outline' });
    const overrideValues = Object.freeze({ color: null });
    expect(() => resolveThemeAttrs(themeConfig, buttonAnatomy, ownValues, overrideValues)).not.toThrow();
  });

  it.each(['separator', 'missing'])('returns {} for every part of %s', (block) => {
    const anatomy = defineAnatomy({ block, parts: { root: part, thumb: part } });
    expect(resolveThemeAttrs(themeConfig, anatomy)).toEqual({ root: {}, thumb: {} });
  });
});

describe('defineThemeConfig types', () => {
  it('rejects a reserved base name in attrName', () => {
    defineThemeConfig({
      name: 'bad',
      components: {
        // @ts-expect-error `disabled` is a reserved base name
        button: { x: { attrName: 'disabled', values: ['a'], default: null } },
      },
    });
  });

  it('rejects the form state fact names in attrName', () => {
    defineThemeConfig({
      name: 'bad',
      components: {
        // @ts-expect-error `touched` is a reserved base name
        a: { x: { attrName: 'touched', values: ['a'], default: null } },
        // @ts-expect-error `dirty` is a reserved base name
        b: { x: { attrName: 'dirty', values: ['a'], default: null } },
        // @ts-expect-error `pending` is a reserved base name
        c: { x: { attrName: 'pending', values: ['a'], default: null } },
        // @ts-expect-error `submitted` is a reserved base name
        d: { x: { attrName: 'submitted', values: ['a'], default: null } },
        // @ts-expect-error `focused` is a reserved base name
        e: { x: { attrName: 'focused', values: ['a'], default: null } },
        // @ts-expect-error `filled` is a reserved base name
        f: { x: { attrName: 'filled', values: ['a'], default: null } },
        // @ts-expect-error `indeterminate` is a reserved base name
        g: { x: { attrName: 'indeterminate', values: ['a'], default: null } },
      },
    });
  });
});

describe('ThemeConfig modeCollections', () => {
  it('is optional and kept as given', () => {
    const collections = [
      {
        name: 'Theme / Color',
        attrName: 'cck-color-mode',
        modes: [{ name: 'Light', value: 'light' }],
        defaultMode: 'Light',
      },
    ];
    const bare: ThemeConfig = defineThemeConfig({ name: 'a', components: {} });
    expect(bare.modeCollections).toBeUndefined();
    expect(defineThemeConfig({ name: 'b', components: {}, modeCollections: collections }).modeCollections).toBe(
      collections,
    );
  });
});

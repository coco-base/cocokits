import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { formFieldWidthModes } from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig form-field width', () => {
  const formFieldAnatomy = defineAnatomy({
    block: 'form-field',
    parts: {
      root: { name: 'Root', description: 'The field.' },
      inputWrapper: { name: 'InputWrapper', description: 'The control zone.' },
    },
  });
  const { width } = cocokitsThemeConfig.components['form-field'];

  it('has an optional width option on the root only, xs to xl from the token modes, with no default', () => {
    expect(width.attrName).toBe('width');
    expect(width.values).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    expect(width.values).toBe(formFieldWidthModes);
    expect(width.default).toBeNull();
    expect(width.partNames).toEqual(['root']);
    expectTypeOf(width.values).toEqualTypeOf<readonly ['xs', 'sm', 'md', 'lg', 'xl']>();
  });

  it.each([
    ['unset', undefined],
    ['md', 'md'],
    ['xs', 'xs'],
    ['null', null],
  ] as const)('renders data-width on the root only for %s', (_name, value) => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, formFieldAnatomy, { width: value });
    expect(resolved.root['data-width']).toBe(value ?? undefined);
    expect(resolved.inputWrapper['data-width']).toBeUndefined();
  });
});

describe('cocokitsThemeConfig switch variant', () => {
  const { variant } = cocokitsThemeConfig.components.switch;
  const anatomy = defineAnatomy({
    block: 'switch',
    parts: { root: { name: 'Root', description: 'The root.' } },
  });

  it('has the variant option on the root: contained by default, rail the other value', () => {
    expect(variant.attrName).toBe('variant');
    expect(variant.values).toEqual(['contained', 'rail']);
    expect(variant.default).toBe('contained');
    expect(variant.partNames).toEqual(['root']);
    expectTypeOf(variant.values).toEqualTypeOf<readonly ['contained', 'rail']>();
  });

  it.each([
    ['rail', 'rail'],
    ['null', null],
  ] as const)('renders data-variant for %s', (_name, value) => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy, { variant: value }).root;
    expect(resolved['data-variant']).toBe(value ?? undefined);
  });
});

describe('cocokitsThemeConfig textarea resize', () => {
  const textareaAnatomy = defineAnatomy({
    block: 'textarea',
    parts: { root: { name: 'Root', description: 'The textarea.' } },
  });
  const { resize } = cocokitsThemeConfig.components.textarea;

  it('has the resize option on the root, on (vertical) by default, with a direction for horizontal and both', () => {
    expect(resize.attrName).toBe('resize');
    expect(resize.values).toEqual([true, false, 'vertical', 'horizontal', 'both']);
    expect(resize.default).toBe(true);
    expect(resize.partNames).toEqual(['root']);
    expect(resize.description).toBeTruthy();
  });

  it.each([
    ['unset', undefined, { 'data-size': 'md', 'data-resize': '' }],
    ['true', true, { 'data-size': 'md', 'data-resize': '' }],
    ['vertical', 'vertical', { 'data-size': 'md', 'data-resize': 'vertical' }],
    ['horizontal', 'horizontal', { 'data-size': 'md', 'data-resize': 'horizontal' }],
    ['both', 'both', { 'data-size': 'md', 'data-resize': 'both' }],
    ['false', false, { 'data-size': 'md' }],
    ['null', null, { 'data-size': 'md' }],
  ] as const)('renders data-resize for %s', (_name, value, attrs) => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, { resize: value }).root).toEqual(attrs);
  });
});

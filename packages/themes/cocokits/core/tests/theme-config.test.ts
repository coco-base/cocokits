import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  accordionSizeDefaultMode,
  accordionSizeModes,
  dividerSizeDefaultMode,
  dividerSizeModes,
  formFieldSizeDefaultMode,
  formFieldSizeModes,
  badgeSizeDefaultMode,
  badgeSizeModes,
  buttonSizeDefaultMode,
  buttonSizeModes,
  selectSizeDefaultMode,
  selectSizeModes,
  tabsSizeDefaultMode,
  tabsSizeModes,
  themeActiveColorDefaultMode,
  themeActiveColorModes,
} from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

const button = cocokitsThemeConfig.components.button;
const buttonAnatomy = defineAnatomy({
  block: 'button',
  parts: { root: { name: 'Root', description: 'The button.' } },
});
const badgeAnatomy = defineAnatomy({
  block: 'badge',
  parts: { root: { name: 'Root', description: 'The badge.' } },
});
const badgeContainerAnatomy = defineAnatomy({
  block: 'badge-container',
  parts: { root: { name: 'Root', description: 'The badge container.' } },
});

describe('cocokitsThemeConfig button', () => {
  it.each([
    ['variant', 'variant', 'primary', ['primary', 'outline', 'light', 'basic']],
    ['color', 'cck-color', 'brand', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'size', 'md', ['sm', 'md', 'lg']],
  ] as const)('%s renders data-%s, defaults to %s', (option, attrName, fallback, values) => {
    expect(button[option].attrName).toBe(attrName);
    expect(button[option].default).toBe(fallback);
    expect(button[option].values).toEqual(values);
    expect(button[option].partNames).toEqual(['root']);
  });

  it('resolves the defaults to data attributes', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, buttonAnatomy).root).toEqual({
      'data-variant': 'primary',
      'data-cck-color': 'brand',
      'data-size': 'md',
    });
  });

  it('lets an own option win and null remove', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, buttonAnatomy, { size: 'lg', variant: null }).root).toEqual({
      'data-cck-color': 'brand',
      'data-size': 'lg',
    });
  });

  it('takes color and size from the generated token modes', () => {
    expect(button.color.values).toBe(themeActiveColorModes);
    expect(button.color.default).toBe(themeActiveColorDefaultMode);
    expect(button.size.values).toBe(buttonSizeModes);
    expect(button.size.default).toBe(buttonSizeDefaultMode);
  });

  it('keeps the exact literal tuples in the type', () => {
    expectTypeOf(button.variant.values).toEqualTypeOf<readonly ['primary', 'outline', 'light', 'basic']>();
    expectTypeOf(button.color.values).toEqualTypeOf<
      readonly ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']
    >();
    expectTypeOf(button.size.values).toEqualTypeOf<readonly ['sm', 'md', 'lg']>();
  });
});

describe('cocokitsThemeConfig badge', () => {
  const badge = cocokitsThemeConfig.components.badge;

  it.each([
    ['variant', 'variant', 'rounded', ['rounded', 'rectangle']],
    ['color', 'cck-color', 'contrast', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'size', 'md', ['sm', 'md', 'lg', 'xl']],
  ] as const)('%s renders data-%s, defaults to %s', (option, attrName, fallback, values) => {
    expect(badge[option].attrName).toBe(attrName);
    expect(badge[option].default).toBe(fallback);
    expect(badge[option].values).toEqual(values);
    expect(badge[option].partNames).toEqual(['root']);
  });

  it('resolves the defaults to the data attributes on the root', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, badgeAnatomy).root).toEqual({
      'data-variant': 'rounded',
      'data-cck-color': 'contrast',
      'data-size': 'md',
    });
  });

  it('lets an own option win', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, badgeAnatomy, { size: 'xl', color: 'danger' }).root).toEqual({
      'data-variant': 'rounded',
      'data-cck-color': 'danger',
      'data-size': 'xl',
    });
  });

  it('takes color and size from the generated token modes', () => {
    expect(badge.color.values).toBe(themeActiveColorModes);
    expect(badge.size.values).toBe(badgeSizeModes);
    expect(badge.size.default).toBe(badgeSizeDefaultMode);
  });

  it('keeps the exact literal tuples in the type', () => {
    expectTypeOf(badge.variant.values).toEqualTypeOf<readonly ['rounded', 'rectangle']>();
    expectTypeOf(badge.size.values).toEqualTypeOf<readonly ['sm', 'md', 'lg', 'xl']>();
  });
});

describe('cocokitsThemeConfig divider', () => {
  const divider = cocokitsThemeConfig.components.divider;
  const dividerAnatomy = defineAnatomy({
    block: 'divider',
    parts: { root: { name: 'Root', description: 'The divider.' } },
  });

  it.each([
    ['size', 'size', 'md', ['md', 'lg']],
    ['color', 'color', 'default', ['light', 'default', 'dark']],
  ] as const)(
    'the %s option renders %s with its default and values on the root',
    (option, attrName, fallback, values) => {
      expect(divider[option].attrName).toBe(attrName);
      expect(divider[option].default).toBe(fallback);
      expect(divider[option].values).toEqual(values);
      expect(divider[option].partNames).toEqual(['root']);
    },
  );

  it('renders data-size and data-color, not the Active Color marker, and null removes them', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, dividerAnatomy).root).toEqual({
      'data-size': 'md',
      'data-color': 'default',
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, dividerAnatomy, { size: 'lg', color: 'dark' }).root).toEqual({
      'data-size': 'lg',
      'data-color': 'dark',
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, dividerAnatomy, { size: null, color: null }).root).toEqual({});
  });

  it('takes the size from the generated index and types the values', () => {
    expect(divider.size.values).toBe(dividerSizeModes);
    expect(divider.size.default).toBe(dividerSizeDefaultMode);
    expectTypeOf(divider.size.values).toEqualTypeOf<readonly ['md', 'lg']>();
    expectTypeOf(divider.color.values).toEqualTypeOf<readonly ['light', 'default', 'dark']>();
  });
});

describe('cocokitsThemeConfig badge-container', () => {
  it('is supported with no options', () => {
    expect(cocokitsThemeConfig.components['badge-container']).toEqual({});
    const attrs = resolveThemeAttrs(cocokitsThemeConfig, badgeContainerAnatomy);
    expect(Object.values(attrs).every((part) => Object.keys(part).length === 0)).toBe(true);
  });
});

describe.each(['label', 'hint', 'input', 'field-error', 'prefix', 'suffix', 'leading', 'trailing'] as const)(
  'cocokitsThemeConfig %s',
  (name) => {
    const anatomy = defineAnatomy({
      block: name,
      parts: { root: { name: 'Root', description: `The ${name}.` } },
    });

    it('is supported with no options and renders no data attribute', () => {
      expect(cocokitsThemeConfig.components[name]).toEqual({});
      const attrs = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
      expect(Object.values(attrs).every((part) => Object.keys(part).length === 0)).toBe(true);
    });
  },
);

describe('cocokitsThemeConfig form-field', () => {
  const formFieldAnatomy = defineAnatomy({
    block: 'form-field',
    parts: {
      root: { name: 'Root', description: 'The field.' },
      inputWrapper: { name: 'InputWrapper', description: 'The control zone.' },
    },
  });
  const { size } = cocokitsThemeConfig.components['form-field'];

  it('has the size option on the root and the input wrapper, with sm, md and lg and the default md', () => {
    expect(size.attrName).toBe('size');
    expect(size.values).toEqual(['sm', 'md', 'lg']);
    expect(size.default).toBe('md');
    expect(size.partNames).toEqual(['root', 'inputWrapper']);
  });

  it('takes the size from the generated token modes', () => {
    expect(size.values).toBe(formFieldSizeModes);
    expect(size.default).toBe(formFieldSizeDefaultMode);
  });

  it('keeps the exact literal tuples in the type', () => {
    expectTypeOf(size.values).toEqualTypeOf<readonly ['sm', 'md', 'lg']>();
    expectTypeOf(size.partNames).toEqualTypeOf<readonly ['root', 'inputWrapper']>();
  });

  it('renders data-size on both parts, with an own option winning and null removing', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, formFieldAnatomy)).toMatchObject({
      root: { 'data-size': 'md' },
      inputWrapper: { 'data-size': 'md' },
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, formFieldAnatomy, { size: 'lg' })).toMatchObject({
      root: { 'data-size': 'lg' },
      inputWrapper: { 'data-size': 'lg' },
    });
    const removed = resolveThemeAttrs(cocokitsThemeConfig, formFieldAnatomy, { size: null });
    expect(removed.root).toEqual({});
    expect(removed.inputWrapper).toEqual({});
  });
});

describe('cocokitsThemeConfig textarea', () => {
  const textareaAnatomy = defineAnatomy({
    block: 'textarea',
    parts: { root: { name: 'Root', description: 'The textarea.' } },
  });
  const { autoResize } = cocokitsThemeConfig.components.textarea;

  it('has the boolean autoResize option on the root, off by default', () => {
    expect(autoResize.attrName).toBe('auto-resize');
    expect(autoResize.values).toEqual([true, false]);
    expect(autoResize.default).toBe(false);
    expect(autoResize.partNames).toEqual(['root']);
    expect(autoResize.description).toBeTruthy();
  });

  it('keeps the literal types', () => {
    expectTypeOf(autoResize.values).toEqualTypeOf<readonly [true, false]>();
    expectTypeOf(autoResize.default).toEqualTypeOf<boolean>();
  });

  it('renders data-auto-resize only when true', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy).root).toEqual({});
    expect(resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, { autoResize: true }).root).toEqual({
      'data-auto-resize': '',
    });
    expect(resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, { autoResize: false }).root).toEqual({});
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, { autoResize: null }, { autoResize: true }).root,
    ).toEqual({});
  });

  it('takes the provider override when the own option is left out, and the own option over it', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, {}, { autoResize: true }).root).toEqual({
      'data-auto-resize': '',
    });
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, textareaAnatomy, { autoResize: false }, { autoResize: true }).root,
    ).toEqual({});
  });
});

describe.each(['checkbox', 'switch', 'radio'] as const)('cocokitsThemeConfig %s', (name) => {
  const options = cocokitsThemeConfig.components[name];
  const anatomy = defineAnatomy({ block: name, parts: { root: { name: 'Root', description: 'The root.' } } });

  it.each([
    ['size', 'size', 'md', ['sm', 'md', 'lg']],
    ['color', 'cck-color', 'brand', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['labelPosition', 'label-position', 'after', ['after', 'before']],
  ] as const)('%s renders data-%s on the root, defaults to %s', (option, attrName, fallback, values) => {
    expect(options[option].attrName).toBe(attrName);
    expect(options[option].default).toBe(fallback);
    expect(options[option].values).toEqual(values);
    expect(options[option].partNames).toEqual(['root']);
  });

  it('resolves the defaults, an own option and null', () => {
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy).root).toEqual({
      'data-size': 'md',
      'data-cck-color': 'brand',
      'data-label-position': 'after',
    });
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: 'lg', labelPosition: 'before', color: null }).root,
    ).toEqual({ 'data-size': 'lg', 'data-label-position': 'before' });
  });

  it('takes the color values and default from the generated token modes', () => {
    expect(options.color.values).toBe(themeActiveColorModes);
    expect(options.color.default).toBe(themeActiveColorDefaultMode);
  });
});

describe('cocokitsThemeConfig accordion', () => {
  const options = cocokitsThemeConfig.components.accordion;
  const anatomy = defineAnatomy({
    block: 'accordion',
    parts: {
      root: { name: 'Root', description: 'The root.' },
      item: { name: 'Item', description: 'The item.' },
      header: { name: 'Header', description: 'The header.' },
      trigger: { name: 'Trigger', description: 'The trigger.' },
      content: { name: 'Content', description: 'The content.' },
    },
  });

  it.each([
    ['variant', 'variant', 'default', ['default', 'group', 'basic']],
    ['size', 'size', 'md', ['sm', 'md']],
    ['togglePosition', 'toggle-position', 'after', ['after', 'before']],
    ['hideToggle', 'hide-toggle', false, [true, false]],
  ] as const)('%s renders data-%s on the root only, defaults to %s', (option, attrName, fallback, values) => {
    expect(options[option].attrName).toBe(attrName);
    expect(options[option].default).toBe(fallback);
    expect(options[option].values).toEqual(values);
    expect(options[option].partNames).toEqual(['root']);
  });

  it('resolves the defaults, an own option and null, on the root and on no other part', () => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(resolved.root).toEqual({
      'data-variant': 'default',
      'data-size': 'md',
      'data-toggle-position': 'after',
    });
    for (const part of ['item', 'header', 'trigger', 'content'] as const) expect(resolved[part]).toEqual({});
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomy, { variant: 'group', hideToggle: true, size: null }).root,
    ).toEqual({
      'data-variant': 'group',
      'data-toggle-position': 'after',
      'data-hide-toggle': '',
    });
  });

  it('takes the size modes from the generated token modes', () => {
    expect(options.size.values).toBe(accordionSizeModes);
    expect(options.size.default).toBe(accordionSizeDefaultMode);
  });
});

describe('cocokitsThemeConfig tabs', () => {
  const options = cocokitsThemeConfig.components.tabs;
  const anatomy = defineAnatomy({
    block: 'tabs',
    parts: {
      root: { name: 'Root', description: 'The root.' },
      list: { name: 'List', description: 'The list.' },
      trigger: { name: 'Trigger', description: 'The trigger.' },
    },
  });

  it.each([
    ['variant', 'variant', 'border', ['border', 'fill', 'line', 'basic']],
    ['color', 'cck-color', 'neutral', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'size', 'md', ['sm', 'md', 'lg']],
    ['headerAlign', 'header-align', 'start', ['start', 'center', 'end', 'stretch']],
  ] as const)('%s renders data-%s on the root only, defaults to %s', (option, attrName, fallback, values) => {
    expect(options[option].attrName).toBe(attrName);
    expect(options[option].default).toBe(fallback);
    expect(options[option].values).toEqual(values);
    expect(options[option].partNames).toEqual(['root']);
  });

  it('resolves the defaults, an own option and null, on the root and on no other part', () => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(resolved.root).toEqual({
      'data-variant': 'border',
      'data-cck-color': 'neutral',
      'data-size': 'md',
      'data-header-align': 'start',
    });
    expect(resolved.list).toEqual({});
    expect(resolved.trigger).toEqual({});
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomy, { variant: 'line', size: 'lg', headerAlign: null }).root,
    ).toEqual({
      'data-variant': 'line',
      'data-cck-color': 'neutral',
      'data-size': 'lg',
    });
  });

  it('takes the color values and the size modes from the generated token modes', () => {
    expect(options.color.values).toBe(themeActiveColorModes);
    expect(options.size.values).toBe(tabsSizeModes);
    expect(options.size.default).toBe(tabsSizeDefaultMode);
  });
});

describe('cocokitsThemeConfig tab-nav', () => {
  const options = cocokitsThemeConfig.components['tab-nav'];
  const anatomy = defineAnatomy({
    block: 'tab-nav',
    parts: {
      root: { name: 'Root', description: 'The root.' },
      list: { name: 'List', description: 'The list.' },
      trigger: { name: 'Trigger', description: 'The trigger.' },
    },
  });

  it.each([
    ['variant', 'variant', 'border', ['border', 'fill', 'line', 'basic']],
    ['color', 'cck-color', 'neutral', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'size', 'md', ['sm', 'md', 'lg']],
    ['headerAlign', 'header-align', 'start', ['start', 'center', 'end', 'stretch']],
  ] as const)('%s renders data-%s on the root only, defaults to %s', (option, attrName, fallback, values) => {
    expect(options[option].attrName).toBe(attrName);
    expect(options[option].default).toBe(fallback);
    expect(options[option].values).toEqual(values);
    expect(options[option].partNames).toEqual(['root']);
  });

  it('shares the options of the tabs', () => {
    expect(options).toBe(cocokitsThemeConfig.components.tabs);
  });

  it('resolves the defaults, an own option and null, on the root and on no other part', () => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(resolved.root).toEqual({
      'data-variant': 'border',
      'data-cck-color': 'neutral',
      'data-size': 'md',
      'data-header-align': 'start',
    });
    expect(resolved.list).toEqual({});
    expect(resolved.trigger).toEqual({});
    expect(
      resolveThemeAttrs(cocokitsThemeConfig, anatomy, { variant: 'line', size: 'lg', headerAlign: null }).root,
    ).toEqual({
      'data-variant': 'line',
      'data-cck-color': 'neutral',
      'data-size': 'lg',
    });
  });

  it('takes the color values and the size modes from the generated token modes', () => {
    expect(options.color.values).toBe(themeActiveColorModes);
    expect(options.size.values).toBe(tabsSizeModes);
    expect(options.size.default).toBe(tabsSizeDefaultMode);
  });
});

describe('cocokitsThemeConfig select', () => {
  const options = cocokitsThemeConfig.components.select;
  const anatomy = defineAnatomy({
    block: 'select',
    parts: {
      root: { name: 'Root', description: 'The root.' },
      trigger: { name: 'Trigger', description: 'The trigger.' },
      content: { name: 'Content', description: 'The list.' },
    },
  });

  it('has the size option, rendered as data-size on the root only, default md', () => {
    expect(Object.keys(options)).toEqual(['size']);
    expect(options.size.attrName).toBe('size');
    expect(options.size.default).toBe('md');
    expect(options.size.values).toEqual(['sm', 'md', 'lg']);
    expect(options.size.partNames).toEqual(['root']);
  });

  it('takes the size modes from the generated token modes', () => {
    expect(options.size.values).toBe(selectSizeModes);
    expect(options.size.default).toBe(selectSizeDefaultMode);
  });

  it('resolves the default, an own size and null, on the root and on no other part', () => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(resolved.root).toEqual({ 'data-size': 'md' });
    expect(resolved.trigger).toEqual({});
    expect(resolved.content).toEqual({});
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: 'lg' }).root).toEqual({ 'data-size': 'lg' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: null }).root).toEqual({});
  });
});

describe('cocokitsThemeConfig overlays', () => {
  it.each(['dialog', 'popover', 'radio-group', 'tooltip'] as const)('supports %s with no options', (name) => {
    expect(cocokitsThemeConfig.components[name]).toEqual({});
  });
});

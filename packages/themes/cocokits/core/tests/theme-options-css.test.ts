import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

/** `px` is a literal value of the collection, anything else an alias of a Core or Theme token. */
const valueOf = (value: string): string => (value.endsWith('px') ? value : ref(value));

/** The `control-*` value per density mode (`normal`, `compact`, `comfortable`). */
const density = (name: string): (string | undefined)[] =>
  ['normal', 'compact', 'comfortable'].map((mode) => structureTokenOf(`[data-cck-spacing=${mode}]`, name));

/** The new Size modes of the theme options: every row is a token of a mode the design has and the theme lacked. */
describe('new size modes', () => {
  const text = (prefix: string, step: string): [string, string][] =>
    ['font-family', 'font-size', 'line-height', 'letter-spacing'].map((part) => [
      `${prefix}${part}`,
      `text-${step}-${part}`,
    ]);
  const rows: readonly [string, string, string, Record<string, string>][] = [
    [
      'Button xs',
      '.cck-button',
      'xs',
      {
        'button-height': 'control-xs',
        'button-padding-inline': 'spacing-4',
        'button-gap': 'spacing-3',
        'button-icon-size': 'size-14',
        ...Object.fromEntries(text('button-label-', 'xs')),
      },
    ],
    [
      'Button xl',
      '.cck-button',
      'xl',
      {
        'button-height': 'control-xl',
        'button-padding-inline': 'spacing-8',
        'button-gap': 'spacing-4',
        'button-icon-size': 'size-20',
        ...Object.fromEntries(text('button-label-', 'md')),
      },
    ],
    [
      'IconButton xs',
      '.cck-icon-button',
      'xs',
      { 'icon-button-size': 'control-xs', 'icon-button-icon-size': 'size-14' },
    ],
    [
      'IconButton xl',
      '.cck-icon-button',
      'xl',
      { 'icon-button-size': 'control-xl', 'icon-button-icon-size': 'size-20' },
    ],
    [
      'Avatar xl',
      '.cck-avatar',
      'xl',
      { 'avatar-size': 'control-xl', ...Object.fromEntries(text('avatar-fallback-', 'md')) },
    ],
    ['Avatar group xl', '.cck-avatar-group', 'xl', { 'avatar-group-overlap': 'spacing-4' }],
    [
      'Avatar label xl',
      '.cck-avatar-label',
      'xl',
      {
        'avatar-label-gap': 'spacing-5',
        'avatar-label-text-inline-gap': 'spacing-4',
        ...Object.fromEntries(text('avatar-label-name-', 'md')),
        ...Object.fromEntries(text('avatar-label-description-', 'sm')),
      },
    ],
    [
      'Accordion lg',
      '.cck-accordion',
      'lg',
      {
        'accordion-trigger-padding-block': 'spacing-7',
        'accordion-padding-inline': 'spacing-6',
        'accordion-content-padding-block-start': 'spacing-3',
        'accordion-content-padding-block-end': 'spacing-6',
        'accordion-icon-size': 'size-16',
        ...Object.fromEntries(text('accordion-', 'sm')),
      },
    ],
    [
      'Switch sm rail',
      '.cck-switch',
      'sm',
      { 'switch-rail-track-width': 'size-24', 'switch-rail-track-height': 'size-6' },
    ],
    [
      'Switch md rail',
      '.cck-switch',
      'md',
      { 'switch-rail-track-width': 'size-32', 'switch-rail-track-height': 'size-8' },
    ],
    [
      'Switch lg rail',
      '.cck-switch',
      'lg',
      { 'switch-rail-track-width': 'size-40', 'switch-rail-track-height': 'size-10' },
    ],
  ];

  it.each(rows)('%s', (_name, root, mode, tokens) => {
    for (const [name, value] of Object.entries(tokens))
      expect(sizeTokenOf(root, mode, name), `${mode} ${name}`).toBe(valueOf(value));
  });

  it('follows the density mode: control-xs and control-xl per Normal, Compact and Comfortable', () => {
    expect(density('control-xs')).toEqual([ref('size-24'), ref('size-24'), ref('size-28')]);
    expect(density('control-xl')).toEqual([ref('size-48'), ref('size-40'), ref('size-52')]);
  });

  it.each([
    ['.cck-avatar', 'xl', 'avatar-fallback-font-weight'],
    ['.cck-avatar-group', 'xl', 'avatar-group-ring-width'],
    ['.cck-avatar-group', 'xl', 'avatar-group-avatar-size'],
    ['.cck-avatar-label', 'xl', 'avatar-label-avatar-size'],
    ['.cck-avatar-label', 'xl', 'avatar-label-font-size'],
    ['.cck-avatar-label', 'xl', 'avatar-label-text-gap'],
    ['.cck-accordion', 'lg', 'accordion-trigger-height'],
    ['.cck-accordion', 'lg', 'accordion-trigger-padding-inline'],
    ['.cck-accordion', 'lg', 'accordion-content-padding-inline'],
    ['.cck-accordion', 'lg', 'accordion-gap'],
  ])('%s %s has no size token %s', (root, mode, name) => {
    expect(sizeTokenOf(root, mode, name)).toBeUndefined();
  });

  it.each([
    ['.cck-avatar', 'avatar-fallback-font-weight', 'font-weight-medium'],
    ['.cck-avatar-group', 'avatar-group-ring-width', 'border-width-2'],
    ['.cck-avatar-label', 'avatar-label-name-font-weight', 'font-weight-medium'],
  ])('%s holds %s, %s, in its structure collection', (root, name, value) => {
    expect(structureTokenOf(root, name)).toBe(ref(value));
  });
});

describe('avatar color', () => {
  it('colours the fallback with the Active Color container of its marker', () => {
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-bg')).toBe(ref('container'));
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-text-color')).toBe(ref('on-container'));
  });
});

describe('form field width', () => {
  const css = read('dist', 'components', 'form-field.css');

  it.each([
    ['xs', 'size-80'],
    ['sm', '160px'],
    ['md', '240px'],
    ['lg', '320px'],
    ['xl', '480px'],
  ])('mode %s holds the inline size', (mode, value) => {
    const block = new RegExp(String.raw`\[data-width=${mode}\]\s*\{([^}]*)\}`).exec(tokensCss)?.[1];
    expect(block).toContain(`--cck-form-field-inline-size: ${valueOf(value)}`);
  });

  it('sets the inline size and the minimum only under the width attribute, so xs computes 80px', () => {
    const rule = declarationsOf(css, '.cck-form-field[data-width]') ?? '';
    expect(rule).toContain('inline-size: min(var(--cck-form-field-inline-size), 100%)');
    expect(rule).toContain('min-inline-size: min(var(--cck-form-field-inline-size), 100%)');
    expect(declarationsOf(css, '.cck-form-field')).toContain('min-inline-size: var(--cck-form-field-min-inline-size)');
    expect(css.match(/var\(--cck-form-field-inline-size\)/g)).toHaveLength(2);
  });
});

describe('textarea resize', () => {
  const css = read('dist', 'components', 'textarea.css');

  it('draws no grip without the resize attribute, vertical by default and per direction', () => {
    expect(declarationsOf(css, '.cck-textarea')).toContain('resize: none');
    expect(declarationsOf(css, '.cck-textarea:where([data-resize])')).toContain('resize: vertical');
    expect(declarationsOf(css, '.cck-textarea:where([data-resize=horizontal])')).toContain('resize: horizontal');
    expect(declarationsOf(css, '.cck-textarea:where([data-resize=both])')).toContain('resize: both');
  });

  it('draws the six dot grip on the resizer, from the grip tokens', () => {
    const grip = declarationsOf(css, '.cck-textarea::-webkit-resizer') ?? '';
    expect(grip.match(/radial-gradient/g)).toHaveLength(6);
    expect(grip).toContain('var(--cck-textarea-grip-color)');
    expect(grip).toContain('var(--cck-textarea-grip-inset)');
    expect(grip).toContain('var(--cck-textarea-grip-gap)');
  });

  it('keeps the auto-resize rule, which has no handle either', () => {
    expect(declarationsOf(css, '.cck-textarea[data-auto-resize]')).toContain('resize: none');
  });
});

describe('switch rail variant', () => {
  const css = read('dist', 'components', 'switch.css');
  const track = '.cck-switch[data-variant=rail] > .cck-switch__label > .cck-switch__track';

  it('draws a rail-wide track and a rail-high pill, and the thumb at the edge', () => {
    expect(declarationsOf(css, track)).toContain('inline-size: var(--cck-switch-rail-track-width)');
    expect(declarationsOf(css, `${track}::before`)).toContain('block-size: var(--cck-switch-rail-track-height)');
    expect(declarationsOf(css, '.cck-switch[data-variant=rail]')).toContain('--cck-switch-thumb-offset: 0px');
  });

  it('adds no rule for contained, so it keeps the current look', () => {
    expect(css).not.toContain('data-variant=contained');
  });

  it('draws a thumb border on the rail thumb only, from the rail-thumb tokens', () => {
    expect(declarationsOf(css, `${track} > .cck-switch__thumb`)).toContain(
      'border: var(--cck-switch-rail-thumb-border-width) solid var(--cck-switch-rail-thumb-border-color)',
    );
    expect(declarationsOf(css, '.cck-switch__thumb')).not.toMatch(/(^|[\s;])border:/);
    expect(structureTokenOf('.cck-switch', 'switch-rail-thumb-border-width')).toBe(ref('border-width-1'));
    expect(structureTokenOf('.cck-switch', 'switch-rail-thumb-border-color')).toBe(ref('border-3'));
    expect(css).not.toContain('--cck-switch-thumb-border-');
  });
});

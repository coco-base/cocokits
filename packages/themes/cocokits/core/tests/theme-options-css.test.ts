import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

/** `px` is a literal value of the collection, anything else an alias of a Core or Theme token. */
const valueOf = (value: string): string => (value.endsWith('px') ? value : ref(value));

/** The new Size modes of the theme options: every row is a token of a mode the design has and the theme lacked. */
describe('new size modes', () => {
  const text = (step: string): [string, string][] =>
    ['font-family', 'font-size', 'line-height', 'letter-spacing'].map((part) => [part, `text-${step}-${part}`]);
  const rows: readonly [string, string, string, Record<string, string>][] = [
    [
      'Button xs',
      '.cck-button',
      'xs',
      {
        'button-height': 'size-32',
        'button-padding-inline': 'spacing-4',
        'button-gap': 'spacing-2',
        'button-icon-size': 'size-20',
        ...Object.fromEntries(text('sm').map(([part, value]) => [`button-label-${part}`, value])),
      },
    ],
    [
      'Button xl',
      '.cck-button',
      'xl',
      {
        'button-height': 'size-56',
        'button-padding-inline': 'spacing-6',
        'button-gap': 'spacing-4',
        'button-icon-size': 'size-32',
        ...Object.fromEntries(text('lg').map(([part, value]) => [`button-label-${part}`, value])),
      },
    ],
    ['IconButton xs', '.cck-icon-button', 'xs', { 'icon-button-size': 'size-32', 'icon-button-icon-size': 'size-20' }],
    ['IconButton xl', '.cck-icon-button', 'xl', { 'icon-button-size': 'size-56', 'icon-button-icon-size': 'size-32' }],
    [
      'Avatar xl',
      '.cck-avatar',
      'xl',
      {
        'avatar-size': 'size-56',
        'avatar-fallback-font-size': 'text-lg-font-size',
        'avatar-fallback-font-weight': 'font-weight-medium',
      },
    ],
    [
      'Avatar group xl',
      '.cck-avatar-group',
      'xl',
      {
        'avatar-group-overlap': 'size-16',
        'avatar-group-ring-width': 'border-width-2',
        'avatar-group-avatar-size': 'size-56',
        'avatar-group-avatar-font-size': 'text-lg-font-size',
      },
    ],
    [
      'Avatar label xl',
      '.cck-avatar-label',
      'xl',
      {
        'avatar-label-gap': 'spacing-5',
        'avatar-label-avatar-size': 'size-56',
        'avatar-label-avatar-font-size': 'text-lg-font-size',
        'avatar-label-font-size': 'text-lg-font-size',
        'avatar-label-text-gap': 'spacing-3',
        'avatar-label-text-inline-gap': 'spacing-4',
      },
    ],
    [
      'Accordion lg',
      '.cck-accordion',
      'lg',
      {
        'accordion-trigger-height': 'size-64',
        'accordion-trigger-padding-inline': 'spacing-5',
        'accordion-trigger-padding-inline-start': 'spacing-6',
        'accordion-content-padding-block-start': 'spacing-5',
        'accordion-content-padding-inline': 'spacing-6',
        'accordion-content-padding-block-end': 'spacing-7',
        'accordion-gap': 'spacing-6',
        'accordion-font-size': 'text-md-font-size',
      },
    ],
    [
      'Switch sm rail',
      '.cck-switch',
      'sm',
      { 'switch-rail-track-width': 'size-28', 'switch-rail-track-height': 'size-8' },
    ],
    [
      'Switch md rail',
      '.cck-switch',
      'md',
      { 'switch-rail-track-width': 'size-36', 'switch-rail-track-height': 'size-10' },
    ],
    [
      'Switch lg rail',
      '.cck-switch',
      'lg',
      { 'switch-rail-track-width': 'size-40', 'switch-rail-track-height': 'size-12' },
    ],
  ];

  it.each(rows)('%s', (_name, root, mode, tokens) => {
    for (const [name, value] of Object.entries(tokens))
      expect(sizeTokenOf(root, mode, name), `${mode} ${name}`).toBe(valueOf(value));
  });
});

describe('avatar color', () => {
  it('colours the fallback with the Active Color of its marker', () => {
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-bg')).toBe(ref('color'));
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-text-color')).toBe(ref('on-color'));
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
    expect(rule).toContain('inline-size: var(--cck-form-field-inline-size)');
    expect(rule).toContain('min-inline-size: var(--cck-form-field-inline-size)');
    expect(declarationsOf(css, '.cck-form-field')).toContain('min-inline-size: var(--cck-form-field-min-inline-size)');
    expect(css.match(/var\(--cck-form-field-inline-size\)/g)).toHaveLength(2);
  });
});

describe('textarea resize', () => {
  const css = read('dist', 'components', 'textarea.css');

  it('draws the handle by default and none when the resize attribute is absent', () => {
    expect(declarationsOf(css, '.cck-textarea')).toContain('resize: vertical');
    expect(declarationsOf(css, '.cck-textarea:not([data-resize])')).toContain('resize: none');
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

  it('keeps the thumb border in every state', () => {
    expect(declarationsOf(css, '.cck-switch__thumb')).toContain(
      'border: var(--cck-switch-thumb-border-width) solid var(--cck-switch-thumb-border-color)',
    );
  });
});

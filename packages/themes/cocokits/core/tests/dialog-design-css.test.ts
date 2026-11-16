import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'dialog.css');
const ROOT = '.cck-dialog__content';
const own = (name: string): string | undefined => structureTokenOf(ROOT, `dialog-${name}`);

describe('dialog design match', () => {
  it.each([
    ['border-color', 'border-2'],
    ['radius', 'radius-lg'],
    ['padding', 'spacing-6'],
    ['gap', 'spacing-4'],
    ['title-font-size', 'text-lg-font-size'],
    ['title-font-weight', 'font-weight-semibold'],
    ['close-color', 'text-3'],
    ['close-icon-size', 'size-24'],
    ['close-padding-inline', 'spacing-0'],
    ['close-padding-block', 'spacing-0'],
    ['close-hover-bg', 'surface-2'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('is 576px wide at most, keeping the viewport margin', () => {
    expect(own('max-inline-size')).toBe('576px');
    expect(declarationsOf(css, ROOT)).toContain('max-inline-size: var(--cck-dialog-max-inline-size)');
  });

  it('draws a plain Close as a bare 24px icon: no border, its own colour and icon size, at least 24 by 24', () => {
    const rule = declarationsOf(css, '.cck-dialog__close:not(.cck-button)') ?? '';
    expect(rule).toContain('border: 0');
    expect(rule).toContain('color: var(--cck-dialog-close-color)');
    expect(rule).toContain('font-size: var(--cck-dialog-close-icon-size)');
    expect(rule).toContain('min-block-size: 24px');
    expect(rule).toContain('min-inline-size: 24px');
    expect(rule).not.toContain('--cck-dialog-border');
    expect(rule).not.toContain('--cck-dialog-text-color');
  });

  it('keeps the hover fill and the focus ring of the Close', () => {
    expect(declarationsOf(css, '.cck-dialog__close:not(.cck-button):hover')).toContain(
      'background-color: var(--cck-dialog-close-hover-bg)',
    );
    expect(declarationsOf(css, '.cck-dialog__close:not(.cck-button):focus-visible')).toContain('outline:');
  });
});

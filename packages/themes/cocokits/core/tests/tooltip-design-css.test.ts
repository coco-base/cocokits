import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'tooltip.css');
const ROOT = '.cck-tooltip__content';
const own = (name: string): string | undefined => structureTokenOf(ROOT, `tooltip-${name}`);

describe('tooltip design match', () => {
  it.each([
    ['bg', 'contrast-color'],
    ['arrow-bg', 'contrast-color'],
    ['text-color', 'contrast-on-color'],
    ['radius', 'radius-sm'],
    ['shadow', 'shadow-none'],
    ['padding-inline', 'spacing-5'],
    ['padding-block', 'spacing-4'],
    ['font-weight', 'font-weight-medium'],
    ['font-family', 'text-sm-font-family'],
    ['font-size', 'text-sm-font-size'],
    ['line-height', 'text-sm-line-height'],
    ['letter-spacing', 'text-sm-letter-spacing'],
    ['arrow-width', 'size-14'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('is 320px wide at most with a 14 by 7 arrow', () => {
    expect(own('max-inline-size')).toBe('320px');
    expect(own('arrow-height')).toBe('7px');
  });

  it('weights the text from the new variable and sizes the arrow from the tokens', () => {
    expect(declarationsOf(css, ROOT)).toContain('font-weight: var(--cck-tooltip-font-weight)');
    const arrow = declarationsOf(css, '.cck-tooltip__arrow svg') ?? '';
    expect(arrow).toContain('inline-size: var(--cck-tooltip-arrow-width)');
    expect(arrow).toContain('block-size: var(--cck-tooltip-arrow-height)');
  });
});

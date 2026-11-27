import { describe, expect, it } from 'vitest';
import { declarationsInList, declarationsOf, read, ref, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'label.css');

describe('label children', () => {
  it('keeps the label gap in its structure, a step wider than the required marker gap', () => {
    expect(structureTokenOf('.cck-label', 'label-gap')).toBe(ref('spacing-4'));
    expect(structureTokenOf('.cck-label', 'label-required-marker-gap')).toBe(ref('spacing-2'));
  });

  it.each(['badge', 'tag'])('puts the gap before a trailing %s', (block) => {
    expect(declarationsInList(css, `.cck-label > .cck-${block}`)).toContain(
      'margin-inline-start: var(--cck-label-gap)',
    );
  });

  it('puts the gap after a leading SvgIcon', () => {
    expect(declarationsOf(css, '.cck-label > .cck-svg-icon')).toContain('margin-inline-end: var(--cck-label-gap)');
  });

  it('keeps the required marker at its own gap, so a label without children looks as before', () => {
    const label = declarationsOf(css, '.cck-label') ?? '';
    expect(label).not.toContain('gap:');
    expect(declarationsOf(css, '.cck-label__required-marker')).toContain(
      'margin-inline-start: var(--cck-label-required-marker-gap)',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'radio-group.css');

describe('radio-group output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-radio-group {');
  });

  it('emits the tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-radio-group {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-radio-group-');
  });

  it('stacks the radios in a column with a token gap', () => {
    const rule = declarationsOf(css, '.cck-radio-group') ?? '';
    expect(rule).toContain('display: flex');
    expect(rule).toContain('flex-direction: column');
    expect(rule).toContain('gap: var(--cck-radio-group-gap)');
  });

  it('lays a horizontal group in a row that wraps', () => {
    const rule = declarationsOf(css, '.cck-radio-group[data-orientation=horizontal]') ?? '';
    expect(rule).toContain('flex-direction: row');
    expect(rule).toContain('flex-wrap: wrap');
    expect(rule).toContain('column-gap: var(--cck-radio-group-inline-gap)');
  });

  it('selects only its own class and attributes', () => {
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim()).filter((s) => s.startsWith('.'));
    for (const selector of selectors) expect(selector).toMatch(/^\.cck-radio-group(\[[^\]]+\])*$/);
  });
});

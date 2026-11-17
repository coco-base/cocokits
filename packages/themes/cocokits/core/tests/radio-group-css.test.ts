import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, structureTokenOf, tokensCss } from './css-test-helpers';

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

describe('radio-group invalid look', () => {
  it('reaches the radios of the group with a child combinator, not across blocks', () => {
    const radioCss = read('dist', 'components', 'radio.css');
    expect(radioCss).toContain('.cck-radio-group:where([data-invalid]) > .cck-radio ');
    expect(radioCss).not.toMatch(/\.cck-radio-group:where\(\[data-invalid\]\) \.cck-radio/);
    const rule = declarationsOf(
      radioCss,
      '.cck-radio-group:where([data-invalid]) > .cck-radio > .cck-radio__wrapper > .cck-radio__input-wrapper > .cck-radio__background',
    );
    expect(rule ?? '').toContain('var(--cck-radio-box-invalid-border-color)');
  });
});

describe('radio-group design match', () => {
  it.each(['gap', 'inline-gap'])('sets the %s to spacing-5 in both orientations', (name) => {
    expect(structureTokenOf('.cck-radio-group', `radio-group-${name}`)).toBe(ref('spacing-5'));
  });
});

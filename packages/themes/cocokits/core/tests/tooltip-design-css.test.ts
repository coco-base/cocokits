import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'tooltip.css');
const ROOT = '.cck-tooltip__content';
const own = (name: string): string | undefined => structureTokenOf(ROOT, `tooltip-${name}`);

/** The tokens of a token file whose value in some mode is not an alias, as `<collection>#<token>`. */
const rawTokens = (file: string): string[] => {
  const json = JSON.parse(read('src', 'tokens', `${file}.tokens.json`)) as {
    collections: { name: string; tokens: { name: string; valuesByMode: Record<string, unknown> }[] }[];
  };
  return json.collections.flatMap((collection) =>
    collection.tokens
      .filter((token) => Object.values(token.valuesByMode).some((value) => !/^\{[^{}#]+#[^{}]+\}$/.test(String(value))))
      .map((token) => `${collection.name}#${token.name}`),
  );
};

describe('tooltip design match', () => {
  it.each([
    ['bg', 'contrast-color'],
    ['arrow-bg', 'contrast-color'],
    ['text-color', 'contrast-on-color'],
    ['radius', 'radius-sm'],
    ['shadow', 'shadow-md'],
    ['side-offset', 'spacing-3'],
    ['font-weight', 'font-weight-regular'],
    ['title-font-weight', 'font-weight-medium'],
    ['text-gap', 'spacing-2'],
    ['description-font-family', 'text-xs-font-family'],
    ['description-font-size', 'text-xs-font-size'],
    ['description-line-height', 'text-xs-line-height'],
    ['description-letter-spacing', 'text-xs-letter-spacing'],
    ['arrow-width', 'size-8'],
    ['arrow-height', 'size-4'],
    ['motion-distance', 'spacing-1'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([
    ['sm', 'spacing-4', 'spacing-2', 192, 'text-xs'],
    ['md', 'spacing-4', 'spacing-3', 320, 'text-xs'],
    ['lg', 'spacing-5', 'spacing-4', 384, 'text-sm'],
  ])('size %s: padding %s and %s, %ipx wide at most, %s text (TT9)', (mode, inline, block, width, text) => {
    const size = (name: string): string | undefined => sizeTokenOf(ROOT, mode, `tooltip-${name}`);
    expect(size('padding-inline')).toBe(ref(inline));
    expect(size('padding-block')).toBe(ref(block));
    expect(size('max-inline-size')).toBe(`${String(width)}px`);
    for (const name of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
      expect(size(name)).toBe(ref(`${text}-${name}`));
      expect(size(`description-${name}`), `description-${name}`).toBeUndefined();
    }
  });

  it('keeps every Component value an alias, with the widths and the motion duration the only exceptions', () => {
    expect(rawTokens('tooltip')).toEqual([
      'Tooltip__content / Size#max-inline-size',
      'Tooltip__content / Structure#motion-duration',
    ]);
    expect(own('motion-duration')).toBe('120ms');
    expect(own('description-font-weight')).toBeUndefined();
  });

  it('weights the text and the title from their variables and sizes the arrow from the tokens', () => {
    expect(declarationsOf(css, ROOT)).toContain('font-weight: var(--cck-tooltip-font-weight)');
    expect(declarationsOf(css, '.cck-tooltip__title')).toContain('font-weight: var(--cck-tooltip-title-font-weight)');
    const description = declarationsOf(css, '.cck-tooltip__description') ?? '';
    for (const name of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(description).toContain(`${name}: var(--cck-tooltip-description-${name})`);
    expect(declarationsOf(css, '.cck-tooltip__title + .cck-tooltip__description')).toContain(
      'padding-block-start: var(--cck-tooltip-text-gap)',
    );
    const arrow = declarationsOf(css, '.cck-tooltip__arrow svg') ?? '';
    expect(arrow).toContain('inline-size: var(--cck-tooltip-arrow-width)');
    expect(arrow).toContain('block-size: var(--cck-tooltip-arrow-height)');
  });
});

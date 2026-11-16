import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

interface Token {
  name: string;
  type: string;
  unit?: string;
  valuesByMode: Record<string, string | number>;
}
interface Collection {
  name: string;
  tokens: Token[];
}

const tokensDir = join(import.meta.dirname, '..', 'src', 'tokens');
const files = readdirSync(tokensDir).filter((file) => file.endsWith('.tokens.json'));
const collections: Collection[] = files.flatMap(
  (file) => (JSON.parse(readFileSync(join(tokensDir, file), 'utf8')) as { collections: Collection[] }).collections,
);
const collection = (name: string): Collection => {
  const found = collections.find((c) => c.name === name);
  if (!found) throw new Error(`no collection ${name}`);
  return found;
};
const token = (collectionName: string, name: string): Token => {
  const found = collection(collectionName).tokens.find((t) => t.name === name);
  if (!found) throw new Error(`no token ${collectionName}#${name}`);
  return found;
};
const value = (collectionName: string, name: string, mode = 'Default'): string | number =>
  token(collectionName, name).valuesByMode[mode] ?? '';
const allTokens = collections.flatMap((c) => c.tokens.map((t) => ({ collection: c.name, ...t })));
const styles = read('dist', 'styles.css');

describe('focus (C3)', () => {
  it.each(allTokens.filter((t) => t.name.endsWith('focus-color') || t.name.endsWith('option-highlight-ring-color')))(
    '$collection#$name is Theme / Color#focus/2',
    ({ valuesByMode }) => {
      expect(Object.values(valuesByMode)).toEqual(['{Theme / Color#focus/2}']);
    },
  );

  it.each([
    ['Form Field / Structure', 'size-1', 'size-3'],
    ['Input / Structure', 'size-1', 'spacing-0'],
    ['Textarea / Structure', 'size-1', 'spacing-0'],
  ])('%s draws a 1px ring: width %s, offset %s', (name, width, offset) => {
    expect(value(name, 'focus-width')).toBe(
      `{Core / Size#${width}}`.replace('{Core / Size#spacing', '{Theme / Spacing#spacing'),
    );
    expect(String(value(name, 'focus-offset'))).toMatch(new RegExp(`${offset}\\}$`));
  });

  it('draws the field ring on the box with no Active border', () => {
    const box = declarationsOf(
      styles,
      '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list):focus-within',
    );
    expect(box).toContain('outline: var(--cck-form-field-focus-width) solid var(--cck-form-field-focus-color)');
    expect(box).toContain('outline-offset: var(--cck-form-field-focus-offset)');
    expect(box).not.toContain('border');
    expect(structureTokenOf('.cck-form-field', 'form-field-focus-width')).toBe(ref('size-1'));
    expect(structureTokenOf('.cck-form-field', 'form-field-focus-offset')).toBe(ref('size-3'));
  });

  it('draws the highlighted Select option as a 1px inset ring', () => {
    const rule = declarationsOf(styles, '.cck-select__option[data-highlighted]') ?? '';
    expect(rule).toContain('outline: var(--cck-select-option-highlight-ring-width) solid');
    expect(rule).toContain('outline-offset: calc(-1 * var(--cck-select-option-highlight-ring-width))');
    expect(value('Select__content / Structure', 'option-highlight-ring-width')).toBe('{Core / Size#size-1}');
    expect(value('Select__content / Structure', 'option-highlight-ring-color')).toBe('{Theme / Color#focus/2}');
  });
});

describe('invalid (C4): only the colour of the existing 1px border changes', () => {
  const rules = [...styles.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].filter((match) =>
    match[1].includes('[data-invalid]'),
  );

  it('finds the invalid rules of the form controls', () => {
    expect(rules.length).toBeGreaterThanOrEqual(7);
  });

  it.each(rules.map((match) => [match[1], match[2]] as const))('%s sets only a border colour', (_selector, body) => {
    expect(body).not.toMatch(/box-shadow|outline|border-width|border-style|border:/);
    expect(body).toMatch(/border-color: var\(--cck-[\w-]+-invalid-border-color\)/);
  });

  it.each(allTokens.filter((t) => t.name.includes('invalid-border-width')))(
    '$collection has no $name token',
    ({ name }) => {
      expect(name).toBe('');
    },
  );

  it('has no invalid rule in forced colors', () => {
    const forced = styles.slice(styles.indexOf('@media (forced-colors'));
    expect(forced).not.toContain('invalid-border-width');
  });
});

describe('typography (C6)', () => {
  const typography = collection('Theme / Typography').tokens;
  const lineHeights = typography.filter((t) => t.name.endsWith('/line-height'));
  const letterSpacings = typography.filter((t) => t.name.endsWith('/letter-spacing'));

  it.each(lineHeights.map((t) => [t.name, t] as const))('%s is unitless', (name, t) => {
    expect(t.unit).toBe('unitless');
    expect(t.valuesByMode.Classic).toBe(/^(heading|display)-/.test(name) ? 1.1 : 1.5);
  });

  it.each(letterSpacings.map((t) => [t.name, t] as const))('%s is in em', (name, t) => {
    expect(t.unit).toBe('em');
    expect(t.valuesByMode.Classic).toBe(/^(heading|display)-/.test(name) ? -0.02 : 0);
  });

  it('covers the 5 text, 4 heading, 3 display and 3 code styles', () => {
    expect(lineHeights).toHaveLength(15);
    expect(letterSpacings).toHaveLength(15);
  });

  it.each(allTokens.filter((t) => t.name.endsWith('line-height') && t.collection !== 'Theme / Typography'))(
    '$collection#$name is unitless',
    ({ unit }) => {
      expect(unit).toBe('unitless');
    },
  );

  it.each(allTokens.filter((t) => t.name.endsWith('letter-spacing') && t.collection !== 'Theme / Typography'))(
    '$collection#$name is in em',
    ({ unit }) => {
      expect(unit).toBe('em');
    },
  );

  it('has no line-height: 1 and no px line height in the built CSS', () => {
    expect(styles).not.toMatch(/line-height:\s*1\s*[;}]/);
    expect(styles).not.toMatch(/line-height:\s*[\d.]+px/);
  });

  it('multiplies the label line height of a choice box by 1em', () => {
    const source = read('src', 'styles', '_choice-box.scss');
    expect(source).toContain('token($block, label-line-height)} * 1em');
  });
});

describe('container and hover (C7)', () => {
  const color = collection('Theme / Color');
  const families = ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast'];

  it.each(families)('%s container is its dark step, on-container its on-color', (family) => {
    const container = color.tokens.find((t) => t.name === `${family}/container`);
    const onContainer = color.tokens.find((t) => t.name === `${family}/on-container`);
    expect(container?.valuesByMode.Dark).toBe(`{Theme / Brand#${family}/dark}`);
    // The contrast color is already the darkest step in Light mode.
    expect(container?.valuesByMode.Light).toBe(
      `{Theme / Brand#${family}/${family === 'contrast' ? 'darker' : 'dark'}}`,
    );
    expect(onContainer?.valuesByMode).toEqual({
      Light: `{Theme / Color#${family}/on-color}`,
      Dark: `{Theme / Color#${family}/on-color}`,
    });
  });

  it.each(['neutral', 'warning'])('the %s edge reads the on-color in Light', (family) => {
    expect(color.tokens.find((t) => t.name === `${family}/edge`)?.valuesByMode.Light).toBe(
      `{Theme / Color#${family}/on-color}`,
    );
  });

  it('fills the primary Button and IconButton on hover with the container', () => {
    expect(value('Button / Structure', 'solid-hover-bg')).toBe('{Theme / Active Color#container}');
    expect(value('Icon Button / Structure', 'solid-hover-bg')).toBe('{Theme / Active Color#container}');
    for (const block of ['button', 'icon-button'])
      expect(
        declarationsOf(styles, `.cck-${block}[data-variant=primary]:hover:not([data-disabled], :disabled)`),
      ).toContain(`background-color: var(--cck-${block}-solid-hover-bg)`);
  });

  it('moves the users of the old tint', () => {
    expect(value('Select__content / Structure', 'option-selected-bg')).toBe('{Theme / Color#surface/2}');
    expect(value('Select__content / Structure', 'indicator-color')).toBe('{Theme / Color#brand/color}');
    expect(value('Switch / Structure', 'halo-bg')).toBe('{Theme / Color#surface/3}');
    expect(value('Button / Structure', 'outline-label-color')).toBe('{Theme / Active Color#color}');
    expect(value('Icon Button / Structure', 'outline-icon-color')).toBe('{Theme / Active Color#color}');
  });

  it('reads no container token in a soft variant, which no longer exists', () => {
    expect(styles).not.toContain('soft-bg');
    expect(styles).not.toContain('soft-label-color');
    expect(styles).not.toContain('data-variant=light');
  });
});

describe('disabled (C8)', () => {
  const disabled = allTokens.filter(
    (t) => t.type === 'color' && t.name.includes('disabled') && t.collection !== 'Theme / Color',
  );

  it('finds the disabled color tokens', () => {
    expect(disabled.length).toBeGreaterThan(25);
  });

  it.each(disabled)('$collection#$name aliases a disabled token', ({ valuesByMode }) => {
    expect(
      Object.values(valuesByMode).every((v) =>
        /^\{Theme \/ Color#disabled\/(surface|on-surface|border)\}$/.test(String(v)),
      ),
    ).toBe(true);
  });
});

describe('no hover (C9)', () => {
  it.each(['checkbox', 'radio', 'chip'])('the %s sheet has no hover rule and no halo', (block) => {
    const sheet = read('dist', 'components', `${block}.css`);
    expect(sheet).not.toContain(':hover');
    expect(sheet).not.toContain('halo');
  });

  it('removes the hover and halo tokens of the Checkbox, Radio and Chip', () => {
    for (const name of ['halo-bg', 'halo-size', 'box-hover-border-color'])
      for (const collectionName of ['Checkbox / Structure', 'Checkbox / Size', 'Radio / Structure', 'Radio / Size'])
        expect(collection(collectionName).tokens.some((t) => t.name === name)).toBe(false);
    expect(collection('Chip / Structure').tokens.some((t) => t.name === 'remove-hover-bg')).toBe(false);
  });

  it.each(['tabs', 'tab-nav'])('%s has no hover color rule and its trigger keeps the pointer cursor', (block) => {
    const sheet = read('dist', 'components', block === 'tabs' ? 'tabs.css' : 'tab-nav.css');
    const hovers = [...sheet.matchAll(/([^{}]*:hover[^{}]*)\{([^}]*)\}/g)];
    for (const hover of hovers) expect(hover[2]).not.toMatch(/background-color|color:/);
    expect(
      declarationsOf(
        sheet,
        `.cck-${block} > .cck-${block}__list > .cck-${block}__${block === 'tabs' ? 'trigger' : 'link'}`,
      ),
    ).toContain('cursor: pointer');
  });
});

describe('icon size (C13): the parent sets the size of its icon, per size mode, from Core / Size', () => {
  const SIZE_MODES = {
    'Button / Size': { token: 'icon-size', modes: ['xs', 'sm', 'md', 'lg', 'xl'] },
    'Icon Button / Size': { token: 'icon-size', modes: ['xs', 'sm', 'md', 'lg', 'xl'] },
    'Tabs / Size': { token: 'trigger-icon-size', modes: ['sm', 'md', 'lg'] },
    'Menu__content / Size': { token: 'item-icon-size', modes: ['sm', 'md', 'lg'] },
    'Select / Size': { token: 'icon-size', modes: ['sm', 'md', 'lg'] },
    'Chip / Size': { token: 'icon-size', modes: ['sm', 'md', 'lg'] },
    'Accordion / Size': { token: 'icon-size', modes: ['sm', 'md', 'lg'] },
    'Form Field / Size': { token: 'affix-icon-size', modes: ['sm', 'md', 'lg'] },
  } as const;

  it.each(Object.entries(SIZE_MODES))(
    '%s has %j per mode, each an alias of Core / Size',
    (name, { token: tokenName, modes }) => {
      const found = token(name, tokenName);
      expect(Object.keys(found.valuesByMode)).toEqual([...modes]);
      for (const mode of modes) expect(found.valuesByMode[mode]).toMatch(/^\{Core \/ Size#size-\d+\}$/);
    },
  );

  it('gives the Chip check and the Chip list check an icon size per mode, an alias of Core / Size', () => {
    for (const [collection, name] of [
      ['Chip / Size', 'check-icon-size'],
      ['Chip List / Size', 'chip-check-icon-size'],
    ] as const) {
      const found = token(collection, name);
      expect(Object.keys(found.valuesByMode)).toEqual(['sm', 'md', 'lg']);
      for (const mode of ['sm', 'md', 'lg']) expect(found.valuesByMode[mode]).toMatch(/^\{Core \/ Size#size-\d+\}$/);
    }
    expect(styles).toContain('font-size: var(--cck-chip-check-icon-size)');
  });

  it('gives the Hint of a field a 16px icon at md and a gap of 8px', () => {
    expect(value('Form Field / Size', 'hint-icon-size', 'md')).toBe('{Core / Size#size-16}');
    expect(value('Hint / Structure', 'gap')).toBe('{Theme / Spacing#spacing-4}');
    expect(sizeTokenOf('.cck-form-field', 'md', 'form-field-hint-icon-size')).toBe(ref('size-16'));
    const rule = declarationsOf(styles, '.cck-form-field__feedback-wrapper > .cck-hint:has(> .cck-svg-icon)') ?? '';
    expect(rule).toContain('align-items: center');
  });

  it('sizes the Tabs trigger icon, the Chip remove icon and the Select icon from their tokens', () => {
    expect(styles).toContain('font-size: var(--cck-tabs-trigger-icon-size)');
    expect(styles).toContain('font-size: var(--cck-chip-icon-size)');
    expect(styles).toContain('font-size: var(--cck-select-icon-size)');
    expect(styles).toContain('font-size: var(--cck-accordion-icon-size)');
    expect(styles).toContain('font-size: var(--cck-menu-item-icon-size)');
  });
});

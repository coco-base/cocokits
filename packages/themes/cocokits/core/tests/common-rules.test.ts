import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, structureTokenOf } from './css-test-helpers';

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
/** The selector and the declarations of every innermost rule of a sheet. */
const rulesOf = (css: string): { selector: string; body: string }[] =>
  [...css.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector, body }));
/** The sheet before its first forced-colors block: the forced-colors rules of the whole theme come after. */
const withoutForced = (css: string): string =>
  css
    .split('@media (forced-colors: active)')
    .map((part, index) => (index === 0 ? part : part.slice(part.indexOf('\n  }\n') + 5)))
    .join('');

describe('focus (C3)', () => {
  it.each(allTokens.filter((t) => t.name.endsWith('focus-color')))(
    '$collection#$name is Theme / Color#focus/2',
    ({ valuesByMode }) => {
      expect(Object.values(valuesByMode)).toEqual(['{Theme / Color#focus/2}']);
    },
  );

  const outlined = collections.filter((c) => c.tokens.some((t) => t.name === 'focus-width'));
  const haloed = collections.filter((c) => c.tokens.some((t) => t.name === 'focus-ring-width'));

  it('names the outline tokens for the button-like parts and the halo tokens for the five field boxes', () => {
    expect(outlined.map((c) => c.name).sort()).toEqual([
      'Accordion / Structure',
      'Button / Structure',
      'Checkbox / Structure',
      'Chip / Structure',
      'Dialog__content / Structure',
      'Icon Button / Structure',
      'Popover__content / Structure',
      'Radio / Structure',
      'Switch / Structure',
      'Tabs / Structure',
    ]);
    expect(haloed.map((c) => c.name).sort()).toEqual([
      'Chip List / Structure',
      'Form Field / Structure',
      'Input / Structure',
      'Select / Structure',
      'Textarea / Structure',
    ]);
  });

  it.each(outlined.map((c) => c.name))(
    '%s draws an outline: color focus/2, width border-width-2, offset spacing-2',
    (name) => {
      expect(value(name, 'focus-color')).toBe('{Theme / Color#focus/2}');
      expect(value(name, 'focus-width')).toBe('{Theme / Border Width#border-width-2}');
      expect(value(name, 'focus-offset')).toBe('{Theme / Spacing#spacing-2}');
      expect(collection(name).tokens.some((t) => t.name.startsWith('focus-ring-'))).toBe(false);
    },
  );

  it.each(haloed.map((c) => c.name))(
    '%s draws a halo: color focus/2, width size-3, mix opacity-20, no outline',
    (name) => {
      expect(value(name, 'focus-color')).toBe('{Theme / Color#focus/2}');
      expect(value(name, 'focus-ring-width')).toBe('{Core / Size#size-3}');
      expect(value(name, 'focus-ring-mix')).toBe('{Theme / Opacity#opacity-20}');
      for (const gone of ['focus-width', 'focus-offset'])
        expect(
          collection(name).tokens.some((t) => t.name === gone),
          gone,
        ).toBe(false);
    },
  );

  it.each(['form-field', 'input', 'textarea', 'select', 'chip-list'])(
    'draws the focus of the %s box as a --_focus border and a halo, and as an outline only in forced colors',
    (block) => {
      const halo = `box-shadow: 0 0 0 var(--cck-${block}-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-${block}-focus-ring-mix), transparent)`;
      const rules = rulesOf(styles).filter(({ body }) => body.includes(halo));
      expect(rules.length).toBeGreaterThan(0);
      for (const { selector, body } of rules) {
        expect(selector, selector).toMatch(/:focus-visible/);
        expect(body).toContain('border-color: var(--_focus)');
      }
      expect(withoutForced(styles)).not.toContain(`outline: var(--cck-${block}-focus`);
    },
  );

  it('marks the highlighted Select option with its fill and no ring', () => {
    const rule = declarationsOf(styles, '.cck-select__option[data-highlighted]') ?? '';
    expect(rule).toContain('background-color: var(--cck-select-option-highlight-bg)');
    expect(rule).not.toContain('outline');
    expect(value('Select__content / Structure', 'option-highlight-bg')).toBe('{Theme / Color#surface/2}');
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

  /** The pixels of the `font-size` of a text style, from Core / Typography. */
  const fontPx = (style: string): number => {
    const alias = String(typography.find((t) => t.name === `${style}/font-size`)?.valuesByMode.Classic);
    const step = /#(font-size\/[\w]+)\}$/.exec(alias)?.[1] ?? '';
    return Number(value('Core / Typography', step));
  };

  it.each(lineHeights.map((t) => [t.name, t] as const))('%s is unitless', (name, t) => {
    expect(t.unit).toBe('unitless');
    if (/^(heading|display)-/.test(name)) expect(t.valuesByMode.Classic).toBe(1.1);
  });

  it.each(lineHeights.filter((t) => /^(text-|code\/)/.test(t.name)).map((t) => [t.name, t] as const))(
    '%s puts the text on whole pixels',
    (name, t) => {
      const px = fontPx(name.replace('/line-height', '')) * Number(t.valuesByMode.Classic);
      expect(Math.abs(px - Math.round(px)), `${String(px)}px`).toBeLessThan(0.01);
    },
  );

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

  /**
   * Every control and label is `text-sm` at every size. The exceptions are the scales and small parts the component
   * guides name (css-controls.md, css-fields.md, css-surfaces.md).
   */
  const TEXT_EXCEPTIONS: Readonly<Record<string, string | Readonly<Record<string, string>>>> = {
    'Button / Size#label-font-size': { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-sm', xl: 'text-md' },
    'Avatar / Size#fallback-font-size': { xs: 'text-2xs', sm: 'text-xs', md: 'text-sm', lg: 'text-sm', xl: 'text-md' },
    'Avatar Label / Size#name-font-size': { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-sm', xl: 'text-md' },
    'Avatar Label / Size#description-font-size': {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-xs',
      xl: 'text-sm',
    },
    'Badge / Size#font-size': { sm: 'text-2xs', md: 'text-xs', lg: 'text-xs', xl: 'text-sm' },
    'Chip / Size#font-size': { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' },
    'Chip List / Size#chip-font-size': { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' },
    'Tooltip__content / Size#font-size': { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' },
    'Tooltip__content / Structure#description-font-size': 'text-xs',
    'Dialog__content / Structure#title-font-size': 'text-lg',
    'Field Error / Structure#font-size': 'text-xs',
    'Hint / Structure#font-size': 'text-xs',
    'Menu__content / Structure#item-secondary-font-size': 'text-xs',
    'Select__content / Structure#group-label-font-size': 'text-xs',
    'Select__content / Structure#option-description-font-size': 'text-xs',
  };
  const fontSizes = allTokens.filter((t) => t.name.endsWith('font-size') && t.collection !== 'Theme / Typography');

  it.each(fontSizes.map((t) => [`${t.collection}#${t.name}`, t] as const))('%s is its text style', (key, t) => {
    const expected = TEXT_EXCEPTIONS[key] ?? 'text-sm';
    for (const [mode, alias] of Object.entries(t.valuesByMode)) {
      const style = typeof expected === 'string' ? expected : expected[mode];
      expect(alias, mode).toBe(`{Theme / Typography#${style}/font-size}`);
    }
  });

  it('lists only exceptions that exist', () => {
    const keys = fontSizes.map((t) => `${t.collection}#${t.name}`);
    for (const key of Object.keys(TEXT_EXCEPTIONS)) expect(keys).toContain(key);
  });

  it('multiplies the label line height of a choice box by 1em', () => {
    const source = read('src', 'styles', '_choice-box.scss');
    expect(source).toContain('token($block, label-line-height)} * 1em');
  });
});

describe('container and hover (C7)', () => {
  const color = collection('Theme / Color');
  const at = (name: string): Record<string, string | number> | undefined =>
    color.tokens.find((t) => t.name === name)?.valuesByMode;
  const ramp = (step: string): string => `{Theme / Brand#${step}}`;

  it.each(['brand', 'info', 'success', 'warning', 'danger'])(
    '%s reads its ramp: container soft and darker, on-container dark and light, edge light and dark',
    (family) => {
      expect(at(`${family}/color`)).toEqual({ Light: ramp(`${family}/base`), Dark: ramp(`${family}/medium`) });
      expect(at(`${family}/container`)).toEqual({ Light: ramp(`${family}/soft`), Dark: ramp(`${family}/darker`) });
      expect(at(`${family}/on-container`)).toEqual({ Light: ramp(`${family}/dark`), Dark: ramp(`${family}/light`) });
      expect(at(`${family}/edge`)).toEqual({ Light: ramp(`${family}/light`), Dark: ramp(`${family}/dark`) });
    },
  );

  it('takes the neutral and contrast families from the contrast ramp', () => {
    expect(at('neutral/color')).toEqual({ Light: ramp('contrast/light'), Dark: ramp('contrast/base') });
    expect(at('neutral/edge')).toEqual({ Light: ramp('contrast/tone'), Dark: ramp('contrast/strong') });
    expect(at('neutral/container')).toEqual({ Light: ramp('contrast/soft'), Dark: ramp('contrast/deep') });
    expect(at('contrast/container')).toEqual({ Light: ramp('contrast/light'), Dark: ramp('contrast/base') });
  });

  it.each(allTokens.filter((t) => t.name.endsWith('hover-mix')))('$collection#$name is opacity-10', (t) => {
    expect(t.valuesByMode).toEqual({ Default: '{Theme / Opacity#opacity-10}' });
  });

  it.each(allTokens.filter((t) => t.name.endsWith('active-mix')))('$collection#$name is opacity-20', (t) => {
    expect(t.valuesByMode).toEqual({ Default: '{Theme / Opacity#opacity-20}' });
  });

  it('gives every control with a fill its hover and pressed mix', () => {
    for (const name of ['Button', 'Icon Button', 'Chip', 'Switch', 'Checkbox', 'Radio'])
      for (const mix of ['hover-mix', 'active-mix']) expect(value(`${name} / Structure`, mix)).toMatch(/opacity/);
  });

  // A row highlight (the boxed Accordion trigger) and a plain Close have no fill and no ink to mix, so they take a
  // neutral surface (css.md, Neutral roles; css-surfaces.md).
  const SURFACE_FILLS = [
    'Accordion / Structure#trigger-hover-bg',
    'Dialog__content / Structure#close-hover-bg',
    'Popover__content / Structure#close-hover-bg',
  ];

  it('has no hover colour token besides the neutral surface of a row and of a plain Close', () => {
    const hoverBg = allTokens.filter((t) => t.name.endsWith('hover-bg'));
    expect(hoverBg.map((t) => `${t.collection}#${t.name}`).sort()).toEqual(SURFACE_FILLS);
    for (const t of hoverBg) expect(t.valuesByMode).toEqual({ Default: '{Theme / Color#surface/2}' });
  });

  it('mixes the hover and pressed fills of the Button and the Icon button with color-mix()', () => {
    for (const block of ['button', 'icon-button'])
      for (const [state, mix] of [
        [':hover', 'hover-mix'],
        [':active', 'active-mix'],
      ])
        expect(
          declarationsOf(
            styles.replace(/, \.cck-[\w-]+\[data-state=open\][^{]*/g, ''),
            `.cck-${block}${state}:not([data-disabled], :disabled)`,
          ),
        ).toContain(`background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-${block}-${mix}))`);
  });

  it('uses the neutral roles for the highlight and the selected row', () => {
    expect(value('Select__content / Structure', 'option-highlight-bg')).toBe('{Theme / Color#surface/2}');
    expect(value('Select__content / Structure', 'option-selected-bg')).toBe('{Theme / Color#surface/3}');
    expect(value('Select__content / Structure', 'option-selected-highlight-bg')).toBe('{Theme / Color#surface/4}');
    expect(value('Menu__content / Structure', 'item-highlight-bg')).toBe('{Theme / Color#surface/2}');
    expect(value('Switch / Structure', 'track-bg')).toBe('{Theme / Color#surface/3}');
  });

  it('fills the soft variant of the Button and the Icon button with the container', () => {
    expect(value('Button / Structure', 'soft-bg')).toBe('{Theme / Active Color#container}');
    expect(value('Icon Button / Structure', 'soft-bg')).toBe('{Theme / Active Color#container}');
    for (const block of ['button', 'icon-button'])
      expect(declarationsOf(styles, `.cck-${block}[data-variant=soft]`)).toContain(
        `--_fill: var(--cck-${block}-soft-bg)`,
      );
    expect(styles).not.toContain('soft-label-color');
    expect(styles).not.toContain('data-variant=light');
  });
});

describe('disabled (C8)', () => {
  const opacities = allTokens.filter((t) => t.name.endsWith('disabled-opacity'));

  it('finds a disabled opacity per component', () => {
    expect(opacities.length).toBeGreaterThanOrEqual(15);
  });

  it.each(opacities)('$collection#$name is opacity-50', ({ valuesByMode }) => {
    expect(valuesByMode).toEqual({ Default: '{Theme / Opacity#opacity-50}' });
  });

  it('has no disabled colour token on the Component tier', () => {
    const colours = allTokens.filter(
      (t) =>
        t.collection !== 'Theme / Color' &&
        /disabled-(bg|text-color|border-color|label-color|icon-color|mark-color|color)$/.test(t.name),
    );
    expect(colours.map((t) => `${t.collection}#${t.name}`)).toEqual([]);
  });
});

describe('hover of the choice controls, the Chip and the Tabs (C9)', () => {
  it.each(['checkbox', 'radio'])('the %s box tints its border at rest and mixes its checked fill', (block) => {
    const sheet = read('dist', 'components', `${block}.css`);
    expect(sheet).toContain(`border-color: var(--cck-${block}-box-hover-border-color)`);
    expect(sheet).toContain(`var(--cck-${block}-box-mark-color) var(--cck-${block}-hover-mix)`);
    expect(sheet).toContain(`var(--cck-${block}-box-mark-color) var(--cck-${block}-active-mix)`);
    expect(value(`${block === 'radio' ? 'Radio' : 'Checkbox'} / Structure`, 'box-hover-border-color')).toBe(
      '{Theme / Color#text/3}',
    );
    for (const { selector } of rulesOf(sheet).filter(({ selector }) => /:hover|:active/.test(selector)))
      expect(selector, selector).toMatch(/:not\(\[data-disabled\]/);
    expect(sheet).not.toContain('halo');
  });

  it('removes the halo tokens of the Checkbox, the Radio and the Switch', () => {
    for (const name of ['halo-bg', 'halo-size'])
      for (const collectionName of [
        'Checkbox / Structure',
        'Checkbox / Size',
        'Radio / Structure',
        'Radio / Size',
        'Switch / Structure',
        'Switch / Size',
      ])
        expect(
          collection(collectionName).tokens.some((t) => t.name === name),
          `${collectionName}#${name}`,
        ).toBe(false);
    expect(collection('Chip / Structure').tokens.some((t) => t.name === 'remove-hover-bg')).toBe(false);
  });

  it('tints the chip remove button with its ink, which no colour token holds', () => {
    const sheet = read('dist', 'components', 'chip.css');
    expect(declarationsOf(sheet, '.cck-chip__remove:hover')).toContain(
      'background-color: color-mix(in srgb, var(--_ink) var(--cck-chip-hover-mix), transparent)',
    );
    expect(declarationsOf(sheet, '.cck-chip__remove:active')).toContain(
      'background-color: color-mix(in srgb, var(--_ink) var(--cck-chip-active-mix), transparent)',
    );
  });

  it.each(['tabs', 'tab-nav'])(
    '%s darkens the label on hover, never fills it, and its trigger keeps the pointer cursor',
    (block) => {
      const sheet = read('dist', 'components', `${block}.css`);
      const part = block === 'tabs' ? 'trigger' : 'link';
      const hovers = rulesOf(sheet).filter(({ selector }) => selector.includes(':hover'));
      for (const { body } of hovers) expect(body).not.toContain('background-color');
      expect(
        declarationsOf(
          sheet,
          `.cck-${block} > .cck-${block}__list > .cck-${block}__${part}:hover:not([data-disabled], :disabled)`,
        ),
      ).toContain('color: var(--cck-tabs-hover-label-color)');
      expect(value('Tabs / Structure', 'hover-label-color')).toBe('{Theme / Color#text/1}');
      expect(declarationsOf(sheet, `.cck-${block} > .cck-${block}__list > .cck-${block}__${part}`)).toContain(
        'cursor: pointer',
      );
    },
  );
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

  it('gives the Hint its own 14px icon size and a gap of spacing-3, with the icon centred on the text', () => {
    expect(value('Hint / Structure', 'icon-size')).toBe('{Core / Size#size-14}');
    expect(value('Hint / Structure', 'gap')).toBe('{Theme / Spacing#spacing-3}');
    expect(collection('Form Field / Size').tokens.some((t) => t.name === 'hint-icon-size')).toBe(false);
    expect(structureTokenOf('.cck-hint', 'hint-icon-size')).toBe(ref('size-14'));
    expect(declarationsOf(styles, '.cck-hint > .cck-svg-icon:not([data-size])')).toContain(
      'font-size: var(--cck-hint-icon-size)',
    );
    expect(declarationsOf(read('dist', 'components', 'hint.css'), '.cck-hint')).toContain('align-items: center');
  });

  it('sizes the Tabs trigger icon, the Chip remove icon and the Select icon from their tokens', () => {
    expect(styles).toContain('font-size: var(--cck-tabs-trigger-icon-size)');
    expect(styles).toContain('font-size: var(--cck-chip-icon-size)');
    expect(styles).toContain('font-size: var(--cck-select-icon-size)');
    expect(styles).toContain('font-size: var(--cck-accordion-icon-size)');
    expect(styles).toContain('font-size: var(--cck-menu-item-icon-size)');
  });
});

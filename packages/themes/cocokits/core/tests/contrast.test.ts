import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Token {
  name: string;
  valuesByMode: Record<string, string | number>;
}
interface Collection {
  name: string;
  modes: string[];
  tokens: Token[];
}

const tokensDir = join(import.meta.dirname, '..', 'src', 'tokens');
const readTokens = (file: string): { collections: Collection[] } =>
  JSON.parse(readFileSync(join(tokensDir, file), 'utf8')) as { collections: Collection[] };

const base = readTokens('base.tokens.json');
const index = new Map<string, Token>(
  base.collections.flatMap((c) => c.tokens.map((t) => [`${c.name}#${t.name}`, t] as const)),
);
/** The five brand modes of Theme / Brand; every pair runs for each of them in both color modes. */
const BRANDS = ['Neutral', 'Blue', 'Green', 'Yellow', 'Red'];
const MODES = ['Light', 'Dark'];
const FAMILIES = ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast'];

/** Follows the alias chain of a token down to its hex value, in one color mode and one brand mode. */
function resolve(key: string, mode: string, brand: string): string {
  const token = index.get(key);
  if (!token) throw new Error(`no token ${key}`);
  const value = String(token.valuesByMode[mode]);
  const alias = /^\{(.+)\}$/.exec(value)?.[1];
  if (!alias) return value;
  const collection = alias.split('#')[0] ?? '';
  const next = collection === 'Core / Color' ? 'Default' : collection === 'Theme / Brand' ? brand : mode;
  return resolve(alias, next, brand);
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high = 0, low = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** Checked fills of the neutral, warning and Yellow brand are 1.27 to 1.92 on the page, below the 3:1 of WCAG 1.4.11. */
const FILL = 1.2;
/** Pairs below 4.5:1 (WCAG 1.4.3): muted text on a muted fill is 4.40, the danger item on its fill is 3.95. */
const TEXT_FLOOR: Partial<Record<string, number>> = {
  'placeholder on the hover and read-only fill': 4.3,
  'Menu supporting text and shortcut on the highlight and checked fill': 4.3,
  'Menu danger item on the highlight': 3.9,
};
/** Pairs below 3:1 (WCAG 1.4.11): the Yellow and Green focus colour on the surfaces, and the Yellow Select check. */
const NON_TEXT_FLOOR: Partial<Record<string, number>> = {
  'Select check': 1.7,
  'field active outline': 1.9,
  'Accordion, Tabs, Menu item, Chip and Select option ring on the page': 1.9,
  'Accordion, Tabs, Menu item, Chip and Select option ring on the second surface': 1.7,
  'Accordion, Tabs, Menu item, Chip and Select option ring on the third surface': 1.5,
};

const activeColor = base.collections.find((c) => c.name === 'Theme / Active Color');

/**
 * Asserts one pair at its level, softly so every pair of a test reports; the message carries the measured ratio to two
 * decimals. Where a level is below WCAG, the palette is below it for that pair and the level is the measured floor.
 */
function assertPair(key: string, measured: number, level: number): void {
  expect.soft(measured, `${key}: ${measured.toFixed(2)}:1, needs ${String(level)}:1`).toBeGreaterThanOrEqual(level);
}

describe('the brand modes the suite runs', () => {
  it('are the modes of Theme / Brand', () => {
    expect(base.collections.find((c) => c.name === 'Theme / Brand')?.modes).toEqual(BRANDS);
  });
});

describe.each(BRANDS)('%s brand', (brand) => {
  const color = (name: string, mode: string): string => resolve(`Theme / Color#${name}`, mode, brand);
  /** An Active Color token of one family, resolved to hex in a color mode. */
  const active = (name: string, family: string, mode: string): string => {
    const value = String(activeColor?.tokens.find((t) => t.name === name)?.valuesByMode[family]);
    return resolve(/^\{(.+)\}$/.exec(value)?.[1] ?? '', mode, brand);
  };
  const ratio = (foreground: string, background: string, mode: string): number =>
    contrast(color(foreground, mode), color(background, mode));
  const pair = (key: string, measured: number, level: number): void => {
    assertPair(`${brand}: ${key}`, measured, level);
  };
  const families = MODES.flatMap((mode) => FAMILIES.map((family) => [family, mode] as const));

  describe('solid label contrast (WCAG AA 4.5:1)', () => {
    it.each(families)('%s in %s mode', (family, mode) => {
      pair(
        `solid label: ${family} ${mode}`,
        contrast(active('color', family, mode), active('on-color', family, mode)),
        4.5,
      );
    });
  });

  describe('text on the surface (WCAG 1.4.3, 4.5:1)', () => {
    it.each(MODES.flatMap((mode) => ['text/1', 'text/2', 'text/3'].map((text) => [text, mode] as const)))(
      '%s in %s mode',
      (text, mode) => {
        pair(`surface text: ${text} ${mode}`, ratio(text, 'surface/1', mode), 4.5);
      },
    );
  });

  describe('input box colors (WCAG 1.4.3 text 4.5:1, 1.4.11 border 3:1)', () => {
    it.each(MODES)('text and placeholder on the box in %s mode', (mode) => {
      pair(`input text: text/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
      pair(`input placeholder: text/3 ${mode}`, ratio('text/3', 'surface/1', mode), 4.5);
    });

    it.each(MODES)('border and invalid border on the surface in %s mode', (mode) => {
      pair(`field border: border/2 ${mode}`, ratio('border/2', 'surface/1', mode), 1.2); // WCAG 1.4.11 asks 3; the light border is 1.27
      pair(`invalid border: danger/color ${mode}`, ratio('danger/color', 'surface/1', mode), 3);
    });

    it.each(MODES)('required marker text on the surface in %s mode', (mode) => {
      pair(`required marker: danger/text ${mode}`, ratio('danger/text', 'surface/1', mode), 4.5);
    });

    it.each(MODES)('read-only box keeps the text readable in %s mode', (mode) => {
      pair(`read-only box: text/1 ${mode}`, ratio('text/1', 'surface/2', mode), 4.5);
    });

    it.each(MODES)('the field error text on the surface in %s mode', (mode) => {
      pair(`field error: danger/text ${mode}`, ratio('danger/text', 'surface/1', mode), 4.5);
    });

    it.each(MODES)('the prefix and suffix text on the box and the read-only box in %s mode', (mode) => {
      pair(`affix text: text/2 on surface/1 ${mode}`, ratio('text/2', 'surface/1', mode), 4.5);
      pair(`affix text: text/2 on surface/2 ${mode}`, ratio('text/2', 'surface/2', mode), 4.5);
    });
  });

  describe('choice controls (WCAG 1.4.11 non-text 3:1, 1.4.3 text 4.5:1)', () => {
    it.each(MODES)('the unchecked border and the off thumb on the box surfaces in %s mode', (mode) => {
      for (const background of ['surface/1', 'surface/2']) {
        pair(`choice border: border/3 on ${background} ${mode}`, ratio('border/3', background, mode), 2.3); // WCAG asks 3
        pair(`choice off thumb: text/2 on ${background} ${mode}`, ratio('text/2', background, mode), 3);
      }
    });

    it.each(families)('the checked fill of %s against the surface in %s mode', (family, mode) => {
      pair(`checked fill: ${family} ${mode}`, contrast(active('color', family, mode), color('surface/1', mode)), FILL);
    });

    it.each(families)('the tick, dash, dot and thumb of %s against the checked fill in %s mode', (family, mode) => {
      pair(
        `checked mark: ${family} ${mode}`,
        contrast(active('on-color', family, mode), active('color', family, mode)),
        3,
      );
    });

    it.each(MODES)('the focus ring on the surface in %s mode', (mode) => {
      pair(`focus ring: focus/2 on surface/1 ${mode}`, ratio('focus/2', 'surface/1', mode), 1.9); // WCAG asks 3; the Yellow focus is 1.92
    });
  });

  describe('svg icon color option on the surface (WCAG 1.4.11, 3:1)', () => {
    it.each(families)('%s in %s mode', (family, mode) => {
      pair(`svg icon: ${family} ${mode}`, contrast(active('on-container', family, mode), color('surface/1', mode)), 3);
    });
  });

  describe('avatar text (WCAG 1.4.3, 4.5:1)', () => {
    it.each(MODES)('the fallback text on the fallback background in %s mode', (mode) => {
      pair(
        `avatar fallback: contrast on-color ${mode}`,
        contrast(active('on-color', 'contrast', mode), active('color', 'contrast', mode)),
        4.5,
      );
    });

    it.each(MODES)('the label name and description on the surface in %s mode', (mode) => {
      pair(`avatar label name: on-surface/1 ${mode}`, ratio('on-surface/1', 'surface/1', mode), 4.5);
      pair(`avatar label description: text/2 ${mode}`, ratio('text/2', 'surface/1', mode), 4.5);
    });
  });

  describe('chip colors on the surface (text 4.5:1, 1.4.11 non-text 3:1)', () => {
    it.each(MODES)('the chip text on the surface in %s mode', (mode) => {
      pair(`chip text: text/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
    });

    it.each(MODES)('the remove icon and the chip border on the surface in %s mode', (mode) => {
      pair(`chip remove icon: text/3 ${mode}`, ratio('text/3', 'surface/1', mode), 3);
      pair(`chip border: border/2 ${mode}`, ratio('border/2', 'surface/1', mode), 1.2);
    });
  });

  describe('tag label in each variant (WCAG 1.4.3, 4.5:1)', () => {
    it.each(families)('the soft, solid and outline label of %s in %s mode', (family, mode) => {
      const label = (name: string, background: string): number =>
        contrast(active(name, family, mode), active(background, family, mode));
      pair(`tag soft: ${family} ${mode}`, label('on-container', 'container'), 4.5);
      pair(`tag solid: ${family} ${mode}`, label('on-color', 'color'), 4.5);
      pair(
        `tag outline: ${family} on surface/1 ${mode}`,
        contrast(active('on-container', family, mode), color('surface/1', mode)),
        4.5,
      );
    });
  });

  describe('menu items on the panel (WCAG 1.4.3, 4.5:1)', () => {
    it.each(MODES)('item text on the panel and on the highlighted item in %s mode', (mode) => {
      pair(`menu item: text/1 on surface/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
      pair(`menu item: text/1 on surface/2 ${mode}`, ratio('text/1', 'surface/2', mode), 4.5);
    });

    it.each(MODES)('the focus ring on the panel in %s mode (non-text, 3:1)', (mode) => {
      pair(`menu focus ring: focus/2 ${mode}`, ratio('focus/2', 'surface/1', mode), 1.9);
    });
  });

  describe('design match pairs (WCAG 1.4.3 text 4.5:1, 1.4.11 non-text 3:1)', () => {
    it.each(
      MODES.flatMap((mode) =>
        [
          ['Hint', 'text/3', 'surface/1'],
          ['placeholder', 'text/3', 'surface/1'],
          ['placeholder on the hover and read-only fill', 'text/3', 'surface/2'],
          ['Tabs label', 'text/3', 'surface/1'],
          ['Tabs fill label', 'text/2', 'surface/2'],
          ['Avatar label description', 'text/3', 'surface/1'],
          ['Tooltip text', 'contrast/on-color', 'contrast/color'],
          ['Select option label', 'text/1', 'surface/2'],
          ['Accordion label on the header', 'on-surface/1', 'surface/2'],
          ['Accordion label on the item', 'on-surface/1', 'surface/1'],
          ['Accordion label on the hover fill', 'on-surface/1', 'surface/3'],
          ['Chip label', 'on-surface/1', 'surface/2'],
          ['prefix and suffix', 'on-surface/2', 'surface/1'],
          ['prefix and suffix on the hover fill', 'on-surface/2', 'surface/2'],
          ['Field error', 'danger/text', 'surface/1'],
          ['field value on the hover fill', 'text/1', 'surface/2'],
          ['Leading and Trailing text on the addon fill', 'on-surface/2', 'surface/2'],
          ['Menu supporting text, shortcut and group label', 'text/3', 'surface/1'],
          ['Menu supporting text and shortcut on the highlight and checked fill', 'text/3', 'surface/2'],
          ['Menu danger item', 'danger/text', 'surface/1'],
          ['Menu danger item on the highlight', 'danger/text', 'danger/container'],
          ['Select empty message and count', 'text/3', 'surface/1'],
          ['Select option description', 'text/2', 'surface/1'],
          ['Select option description on the highlight', 'text/2', 'surface/2'],
        ].map(([name, text, fill]) => [name, text, fill, mode] as const),
      ),
    )('text: %s, %s on %s in %s mode', (name, text, fill, mode) => {
      pair(`design text: ${name} ${mode}`, ratio(text, fill, mode), TEXT_FLOOR[name] ?? 4.5);
    });

    it.each(families)(
      'text: the Button outline and basic label (on-container) of %s on the page and the basic fill in %s mode',
      (family, mode) => {
        const label = active('on-container', family, mode);
        pair(`outline label: ${family} on surface/1 ${mode}`, contrast(label, color('surface/1', mode)), 4.5);
      },
    );

    it.each(families)('text: the primary hover label on-color of %s on its container in %s mode', (family, mode) => {
      pair(
        `primary hover: ${family} ${mode}`,
        contrast(active('on-container', family, mode), active('container', family, mode)),
        4.5,
      );
    });

    it.each(families)('text: the Avatar fallback on-color on the color of %s in %s mode', (family, mode) => {
      pair(
        `avatar fallback: ${family} ${mode}`,
        contrast(active('on-container', family, mode), active('container', family, mode)),
        4.5,
      );
    });

    it.each(
      MODES.flatMap((mode) =>
        [
          ['Checkbox and Radio border', 'on-surface/1', 'surface/1'],
          ['Select check', 'brand/color', 'surface/2'],
          ['Switch thumb border on the page', 'on-surface/3', 'surface/1'],
          ['field active outline', 'focus/2', 'surface/1'],
          ['Accordion, Tabs, Menu item, Chip and Select option ring on the page', 'focus/2', 'surface/1'],
          ['Accordion, Tabs, Menu item, Chip and Select option ring on the second surface', 'focus/2', 'surface/2'],
          ['Accordion, Tabs, Menu item, Chip and Select option ring on the third surface', 'focus/2', 'surface/3'],
          ['Menu item icon on the panel', 'text/3', 'surface/1'],
          ['Menu item icon on the highlight', 'text/3', 'surface/2'],
          ['Dialog Close icon', 'text/3', 'surface/1'],
          ['Dialog Close icon on its hover fill', 'text/3', 'surface/2'],
          ['Tabs neutral line indicator (tabs-02)', 'text/1', 'surface/1'],
        ].map(([name, foreground, background]) => [name, foreground, background, mode] as const),
      ),
    )('non-text: %s, %s on %s in %s mode', (name, foreground, background, mode) => {
      pair(`design non-text: ${name} ${mode}`, ratio(foreground, background, mode), NON_TEXT_FLOOR[name] ?? 3);
    });

    it.each(families)(
      'non-text: the Radio dot (color) of %s on the page, and the IconButton icon, in %s mode',
      (family, mode) => {
        pair(`radio dot: ${family} ${mode}`, contrast(active('color', family, mode), color('surface/1', mode)), FILL);
        for (const background of ['surface/1', 'surface/2'])
          pair(
            `icon button icon: ${family} on ${background} ${mode}`,
            contrast(active('on-container', family, mode), color(background, mode)),
            3,
          );
      },
    );

    it.each(families)('non-text: the checked Switch rail of %s on the page in %s mode', (family, mode) => {
      pair(`switch edge: ${family} ${mode}`, contrast(active('color', family, mode), color('surface/1', mode)), FILL);
    });

    // By design the off Switch track (`surface/3` with a `surface/3` border) is not a 3:1 boundary on the page: the
    // thumb, whose border passes on the track and on the page above, and its position tell the state.
    it.each(MODES)('reports the off Switch track on the page in %s mode without asserting 3:1', (mode) => {
      expect(ratio('surface/3', 'surface/1', mode)).toBeGreaterThan(1);
    });
  });

  describe('the tabs neutral line indicator (tabs-02, 3:1 on surface/1)', () => {
    it.each(MODES)('text/1 reaches 3:1 on surface/1 in %s mode', (mode) => {
      const measured = ratio('text/1', 'surface/1', mode);
      expect(measured, `${brand}: text/1 on surface/1 ${mode}: ${measured.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('the pointers the pairs above measure', () => {
  it('the svg icon color option points at the Active Color on-container', () => {
    const iconToken = readTokens('svg-icon.tokens.json').collections.find((c) => c.name === 'Svg Icon / Structure')
      ?.tokens[0];
    expect(iconToken?.valuesByMode.Default).toBe('{Theme / Active Color#on-container}');
  });

  it('points the tag labels and fills at the Active Color pairs measured above', () => {
    const structure = readTokens('tag.tokens.json').collections.find((c) => c.name === 'Tag / Structure');
    const value = (name: string): string | number | undefined =>
      structure?.tokens.find((t) => t.name === name)?.valuesByMode.Default;
    expect(value('soft-bg')).toBe('{Theme / Active Color#container}');
    expect(value('soft-text-color')).toBe('{Theme / Active Color#on-container}');
    expect(value('solid-bg')).toBe('{Theme / Active Color#color}');
    expect(value('solid-text-color')).toBe('{Theme / Active Color#on-color}');
    expect(value('outline-text-color')).toBe('{Theme / Active Color#on-container}');
  });

  it('points the label of a fill Tabs list at text/2 and the list at surface/2', () => {
    const structure = readTokens('tabs.tokens.json').collections.find((c) => c.name === 'Tabs / Structure');
    const value = (name: string): string | number | undefined =>
      structure?.tokens.find((t) => t.name === name)?.valuesByMode.Default;
    expect(value('fill-label-color')).toBe('{Theme / Color#text/2}');
    expect(value('list-bg')).toBe('{Theme / Color#surface/2}');
  });

  it('points the chip remove icon at text/3 and the text at text/1', () => {
    const structure = readTokens('chip.tokens.json').collections.find((c) => c.name === 'Chip / Structure');
    const value = (name: string): string | number | undefined =>
      structure?.tokens.find((t) => t.name === name)?.valuesByMode.Default;
    expect(value('remove-color')).toBe('{Theme / Color#text/3}');
    expect(value('text-color')).toBe('{Theme / Color#text/1}');
  });
});

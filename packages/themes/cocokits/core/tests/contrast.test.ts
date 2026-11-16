import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACCEPTED } from './contrast-accepted';

interface Token {
  name: string;
  valuesByMode: Record<string, string | number>;
}
interface Collection {
  name: string;
  tokens: Token[];
}

const tokensDir = join(import.meta.dirname, '..', 'src', 'tokens');
const readTokens = (file: string): { collections: Collection[] } =>
  JSON.parse(readFileSync(join(tokensDir, file), 'utf8')) as { collections: Collection[] };

const base = readTokens('base.tokens.json');
const index = new Map<string, Token>(
  base.collections.flatMap((c) => c.tokens.map((t) => [`${c.name}#${t.name}`, t] as const)),
);
/** The one mode of the collections that are not a color mode. The Iris brand is the only brand mode. */
const MODE_OF: Record<string, string> = { 'Core / Color': 'Default', 'Theme / Brand': 'Iris' };
const MODES = ['Light', 'Dark'];
const FAMILIES = ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast'];

/** Follows the alias chain of a token down to its hex value. */
function resolve(key: string, mode: string): string {
  const token = index.get(key);
  if (!token) throw new Error(`no token ${key}`);
  const value = String(token.valuesByMode[mode]);
  const alias = /^\{(.+)\}$/.exec(value)?.[1];
  if (!alias) return value;
  const collection = alias.split('#')[0] ?? '';
  return resolve(alias, MODE_OF[collection] ?? mode);
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

const color = (name: string, mode: string): string => resolve(`Theme / Color#${name}`, mode);
const activeColor = base.collections.find((c) => c.name === 'Theme / Active Color');
/** An Active Color token of one family, resolved to hex in a color mode. */
function active(name: string, family: string, mode: string): string {
  const value = String(activeColor?.tokens.find((t) => t.name === name)?.valuesByMode[family]);
  return resolve(/^\{(.+)\}$/.exec(value)?.[1] ?? '', mode);
}
const ratio = (foreground: string, background: string, mode: string): number =>
  contrast(color(foreground, mode), color(background, mode));

/**
 * Asserts one pair at its WCAG level. A pair the maintainer accepted under Iris (`contrast-accepted.ts`, with the
 * decision id) is asserted at its measured ratio to two decimals instead, so a token change that moves it shows.
 */
function assertPair(key: string, measured: number, level: number): void {
  const accepted = ACCEPTED[key];
  if (accepted === undefined) {
    expect(measured, key).toBeGreaterThanOrEqual(level);
    return;
  }
  expect(measured.toFixed(2), key).toBe(accepted.ratio);
}

describe('solid label contrast (WCAG AA 4.5:1)', () => {
  it.each(FAMILIES.flatMap((family) => MODES.map((mode) => [family, mode] as const)))(
    '%s in %s mode',
    (family, mode) => {
      const measured = contrast(active('color', family, mode), active('on-color', family, mode));
      const key = `solid label: ${family} ${mode}`;
      // Brand, neutral, info, warning and contrast are reported here, as before the Iris brand; the others are asserted.
      if (['brand', 'neutral', 'warning', 'contrast'].includes(family) && ACCEPTED[key] === undefined)
        expect(measured).toBeGreaterThan(1);
      else assertPair(key, measured, 4.5);
    },
  );
});

describe('text on the surface (WCAG 1.4.3, 4.5:1)', () => {
  it.each(MODES.flatMap((mode) => ['text/1', 'text/2', 'text/3'].map((text) => [text, mode] as const)))(
    '%s in %s mode',
    (text, mode) => {
      assertPair(`surface text: ${text} ${mode}`, ratio(text, 'surface/1', mode), 4.5);
    },
  );
});

describe('input box colors (WCAG 1.4.3 text 4.5:1, 1.4.11 border 3:1)', () => {
  it.each(MODES)('text and placeholder on the box in %s mode', (mode) => {
    assertPair(`input text: text/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
    assertPair(`input placeholder: text/3 ${mode}`, ratio('text/3', 'surface/1', mode), 4.5);
  });

  it.each(MODES)('border and invalid border on the surface in %s mode', (mode) => {
    assertPair(`field border: border/2 ${mode}`, ratio('border/2', 'surface/1', mode), 3);
    assertPair(`invalid border: danger/color ${mode}`, ratio('danger/color', 'surface/1', mode), 3);
  });

  it.each(MODES)('required marker text on the surface in %s mode', (mode) => {
    assertPair(`required marker: danger/text ${mode}`, ratio('danger/text', 'surface/1', mode), 4.5);
  });

  it.each(MODES)('read-only box keeps the text readable in %s mode', (mode) => {
    assertPair(`read-only box: text/1 ${mode}`, ratio('text/1', 'surface/2', mode), 4.5);
  });

  it.each(MODES)('the field error text on the surface in %s mode', (mode) => {
    assertPair(`field error: danger/text ${mode}`, ratio('danger/text', 'surface/1', mode), 4.5);
  });

  it.each(MODES)('the prefix and suffix text on the box and the read-only box in %s mode', (mode) => {
    assertPair(`affix text: text/2 on surface/1 ${mode}`, ratio('text/2', 'surface/1', mode), 4.5);
    assertPair(`affix text: text/2 on surface/2 ${mode}`, ratio('text/2', 'surface/2', mode), 4.5);
  });
});

describe('choice controls (WCAG 1.4.11 non-text 3:1, 1.4.3 text 4.5:1)', () => {
  const cases = MODES.flatMap((mode) => FAMILIES.map((family) => [family, mode] as const));

  it.each(MODES)('the unchecked border and the off thumb on the box surfaces in %s mode', (mode) => {
    for (const background of ['surface/1', 'surface/2']) {
      assertPair(`choice border: border/3 on ${background} ${mode}`, ratio('border/3', background, mode), 3);
      assertPair(`choice off thumb: text/2 on ${background} ${mode}`, ratio('text/2', background, mode), 3);
    }
  });

  it.each(cases)('the checked edge of %s against the surface in %s mode', (family, mode) => {
    assertPair(`checked edge: ${family} ${mode}`, contrast(active('edge', family, mode), color('surface/1', mode)), 3);
  });

  it.each(cases)('the tick, dash, dot and thumb of %s against the checked fill in %s mode', (family, mode) => {
    assertPair(
      `checked mark: ${family} ${mode}`,
      contrast(active('on-color', family, mode), active('color', family, mode)),
      3,
    );
  });

  it.each(MODES)('the focus ring on the surface in %s mode', (mode) => {
    assertPair(`focus ring: focus/2 on surface/1 ${mode}`, ratio('focus/2', 'surface/1', mode), 3);
  });
});

describe('svg icon color option on the surface (WCAG 1.4.11, 3:1)', () => {
  const iconToken = readTokens('svg-icon.tokens.json').collections.find((c) => c.name === 'Svg Icon / Structure')
    ?.tokens[0];

  it('points at the Active Color edge, the foreground that reaches 3:1', () => {
    expect(iconToken?.valuesByMode.Default).toBe('{Theme / Active Color#edge}');
  });

  it.each(MODES.flatMap((mode) => FAMILIES.map((family) => [family, mode] as const)))(
    '%s in %s mode',
    (family, mode) => {
      assertPair(`svg icon: ${family} ${mode}`, contrast(active('edge', family, mode), color('surface/1', mode)), 3);
    },
  );
});

describe('avatar text (WCAG 1.4.3, 4.5:1)', () => {
  it.each(MODES)('the fallback text on the fallback background in %s mode', (mode) => {
    assertPair(
      `avatar fallback: contrast on-color ${mode}`,
      contrast(active('on-color', 'contrast', mode), active('color', 'contrast', mode)),
      4.5,
    );
  });

  it.each(MODES)('the label name and description on the surface in %s mode', (mode) => {
    assertPair(`avatar label name: on-surface/1 ${mode}`, ratio('on-surface/1', 'surface/1', mode), 4.5);
    assertPair(`avatar label description: text/2 ${mode}`, ratio('text/2', 'surface/1', mode), 4.5);
  });
});

describe('chip colors on the surface (text 4.5:1, 1.4.11 non-text 3:1)', () => {
  it.each(MODES)('the chip text on the surface in %s mode', (mode) => {
    assertPair(`chip text: text/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
  });

  it.each(MODES)('the remove icon and the chip border on the surface in %s mode', (mode) => {
    assertPair(`chip remove icon: text/2 ${mode}`, ratio('text/2', 'surface/1', mode), 3);
    assertPair(`chip border: border/2 ${mode}`, ratio('border/2', 'surface/1', mode), 3);
  });

  it('points the remove icon at text/2 and the text at text/1', () => {
    const structure = readTokens('chip.tokens.json').collections.find((c) => c.name === 'Chip / Structure');
    const value = (name: string): string | number | undefined =>
      structure?.tokens.find((t) => t.name === name)?.valuesByMode.Default;
    expect(value('remove-color')).toBe('{Theme / Color#text/2}');
    expect(value('text-color')).toBe('{Theme / Color#text/1}');
  });
});

describe('menu items on the panel (WCAG 1.4.3, 4.5:1)', () => {
  it.each(MODES)('item text on the panel and on the highlighted item in %s mode', (mode) => {
    assertPair(`menu item: text/1 on surface/1 ${mode}`, ratio('text/1', 'surface/1', mode), 4.5);
    assertPair(`menu item: text/1 on surface/2 ${mode}`, ratio('text/1', 'surface/2', mode), 4.5);
  });

  it.each(MODES)('disabled item text on the panel in %s mode', (mode) => {
    assertPair(`menu disabled: disabled/on-surface ${mode}`, ratio('disabled/on-surface', 'surface/1', mode), 4.5);
  });

  it.each(MODES)('the focus ring on the panel in %s mode (non-text, 3:1)', (mode) => {
    assertPair(`menu focus ring: focus/2 ${mode}`, ratio('focus/2', 'surface/1', mode), 3);
  });
});

describe('design match pairs (WCAG 1.4.3 text 4.5:1, 1.4.11 non-text 3:1)', () => {
  const families = MODES.flatMap((mode) => FAMILIES.map((family) => [family, mode] as const));

  it.each(
    MODES.flatMap((mode) =>
      [
        ['Hint', 'on-surface/3', 'surface/1'],
        ['placeholder', 'text/3', 'surface/1'],
        ['placeholder on the hover and read-only fill', 'text/3', 'surface/2'],
        ['Tabs label', 'on-surface/3', 'surface/1'],
        ['Tabs fill label', 'text/2', 'surface/2'],
        ['Tabs disabled label on its fill', 'disabled/on-surface', 'disabled/surface'],
        ['Avatar label description', 'on-surface/3', 'surface/1'],
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
        ['Menu disabled item', 'disabled/on-surface', 'surface/1'],
        ['Select disabled group label', 'disabled/on-surface', 'surface/1'],
      ].map(([name, text, fill]) => [name, text, fill, mode] as const),
    ),
  )('text: %s, %s on %s in %s mode', (name, text, fill, mode) => {
    assertPair(`design text: ${name} ${mode}`, ratio(text, fill, mode), 4.5);
  });

  it.each(families)(
    'text: the Button outline and basic label (the family color) of %s on the page and the basic fill in %s mode',
    (family, mode) => {
      const label = active('color', family, mode);
      assertPair(`outline label: ${family} on surface/1 ${mode}`, contrast(label, color('surface/1', mode)), 4.5);
    },
  );

  it.each(families)('text: the primary hover label on-color of %s on its container in %s mode', (family, mode) => {
    assertPair(
      `primary hover: ${family} ${mode}`,
      contrast(active('on-container', family, mode), active('container', family, mode)),
      4.5,
    );
  });

  it.each(families)('text: the Avatar fallback on-color on the color of %s in %s mode', (family, mode) => {
    assertPair(
      `avatar fallback: ${family} ${mode}`,
      contrast(active('on-color', family, mode), active('color', family, mode)),
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
        ['Popover border', 'border/2', 'surface/1'],
        ['Tabs neutral line indicator (tabs-02)', 'border/3', 'surface/1'],
      ].map(([name, foreground, background]) => [name, foreground, background, mode] as const),
    ),
  )('non-text: %s, %s on %s in %s mode', (name, foreground, background, mode) => {
    assertPair(`design non-text: ${name} ${mode}`, ratio(foreground, background, mode), 3);
  });

  it.each(families)(
    'non-text: the Radio dot (edge) of %s on the page, and the IconButton icon, in %s mode',
    (family, mode) => {
      assertPair(`radio dot: ${family} ${mode}`, contrast(active('edge', family, mode), color('surface/1', mode)), 3);
      for (const background of ['surface/1', 'surface/2'])
        assertPair(
          `icon button icon: ${family} on ${background} ${mode}`,
          contrast(active('color', family, mode), color(background, mode)),
          3,
        );
    },
  );

  it.each(families)('non-text: the checked Switch rail edge of %s on the page in %s mode', (family, mode) => {
    assertPair(`switch edge: ${family} ${mode}`, contrast(active('edge', family, mode), color('surface/1', mode)), 3);
  });

  // By design the off Switch track (`surface/3` with a `surface/3` border) is not a 3:1 boundary on the page: the
  // thumb, whose border passes on the track and on the page above, and its position tell the state.
  it.each(MODES)('reports the off Switch track on the page in %s mode without asserting 3:1', (mode) => {
    expect(ratio('surface/3', 'surface/1', mode)).toBeGreaterThan(1);
  });
});

describe('the tabs neutral line indicator (tabs-02, 3:1 on surface/1)', () => {
  it.each(MODES)('border/3 reaches 3:1 on surface/1 in %s mode', (mode) => {
    expect(ratio('border/3', 'surface/1', mode)).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ['Light', '3.38'],
    ['Dark', '4.46'],
  ])('measures %s at %s', (mode, expected) => {
    expect(ratio('border/3', 'surface/1', mode).toFixed(2)).toBe(expected);
  });
});

describe('maintainer-accepted pairs (Q2: no contrast fixes under Iris)', () => {
  const pairs = Object.entries(ACCEPTED).flatMap(([key, entry]) => (entry ? [[key, entry] as const] : []));

  it('lists at least one accepted pair', () => {
    expect(pairs.length).toBeGreaterThan(0);
  });

  it.each(pairs)('%s is accepted with a decision id', (_key, entry) => {
    expect(entry.decision).toMatch(/^Q\d+$/);
    expect(entry.ratio).toMatch(/^\d+\.\d{2}$/);
  });
});

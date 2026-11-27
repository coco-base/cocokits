import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { modeCollections } from '../src/index';
import { tokensCss } from './css-test-helpers';

interface Token {
  name: string;
  valuesByMode: Record<string, string | number>;
}
interface Collection {
  name: string;
  defaultMode: string;
  modes: string[];
  tokens: Token[];
}

const { collections } = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'tokens', 'base.tokens.json'), 'utf8'),
) as { collections: Collection[] };
const collection = (name: string): Collection => {
  const found = collections.find((c) => c.name === name);
  if (!found) throw new Error(`no collection ${name}`);
  return found;
};

const MODES = ['Neutral', 'Blue', 'Green', 'Yellow', 'Red'] as const;
type Mode = (typeof MODES)[number];

/** The seven `brand/*` steps of each mode: the token, the Core / Color step it names and that step's hex. */
const BRAND: Readonly<Record<Mode, readonly (readonly [string, string, string])[]>> = {
  Neutral: [
    ['brand/lighter', 'charcoal/50', '#fafafa'],
    ['brand/soft', 'charcoal/100', '#f4f4f5'],
    ['brand/light', 'charcoal/200', '#e4e4e7'],
    ['brand/medium', 'charcoal/200', '#e4e4e7'],
    ['brand/base', 'charcoal/900', '#18181b'],
    ['brand/dark', 'charcoal/700', '#3f3f46'],
    ['brand/darker', 'charcoal/800', '#27272a'],
  ],
  Blue: [
    ['brand/lighter', 'white', '#ffffff'],
    ['brand/soft', 'cobalt/100', '#dbeafe'],
    ['brand/light', 'cobalt/200', '#bfdbfe'],
    ['brand/medium', 'cobalt/400', '#60a5fa'],
    ['brand/base', 'cobalt/700', '#1d4ed8'],
    ['brand/dark', 'cobalt/800', '#1e40af'],
    ['brand/darker', 'cobalt/950', '#172554'],
  ],
  Green: [
    ['brand/lighter', 'white', '#ffffff'],
    ['brand/soft', 'jade/100', '#d1fae5'],
    ['brand/light', 'jade/200', '#a7f3d0'],
    ['brand/medium', 'jade/400', '#34d399'],
    ['brand/base', 'jade/700', '#047857'],
    ['brand/dark', 'jade/800', '#065f46'],
    ['brand/darker', 'jade/950', '#022c22'],
  ],
  Yellow: [
    ['brand/lighter', 'amber/950', '#422006'],
    ['brand/soft', 'amber/100', '#fef9c3'],
    ['brand/light', 'amber/200', '#fef08a'],
    ['brand/medium', 'amber/400', '#facc15'],
    ['brand/base', 'amber/500', '#eab308'],
    ['brand/dark', 'amber/800', '#854d0e'],
    ['brand/darker', 'amber/950', '#422006'],
  ],
  Red: [
    ['brand/lighter', 'white', '#ffffff'],
    ['brand/soft', 'crimson/100', '#fee2e2'],
    ['brand/light', 'crimson/200', '#fecaca'],
    ['brand/medium', 'crimson/400', '#f87171'],
    ['brand/base', 'crimson/700', '#b91c1c'],
    ['brand/dark', 'crimson/800', '#991b1b'],
    ['brand/darker', 'crimson/950', '#450a0a'],
  ],
};

/** The 48 tokens outside `brand/*`: one Core / Color step in all five modes. */
const SHARED: readonly (readonly [string, string])[] = [
  ['info/lighter', 'cerulean/50'],
  ['info/light', 'cerulean/200'],
  ['info/base', 'cerulean/700'],
  ['info/dark', 'cerulean/800'],
  ['info/darker', 'cerulean/950'],
  ['success/lighter', 'jade/50'],
  ['success/light', 'jade/200'],
  ['success/base', 'jade/700'],
  ['success/dark', 'jade/800'],
  ['success/darker', 'jade/950'],
  ['warning/lighter', 'amber/50'],
  ['warning/light', 'amber/200'],
  ['warning/base', 'amber/500'],
  ['warning/dark', 'amber/800'],
  ['warning/darker', 'amber/950'],
  ['danger/lighter', 'crimson/50'],
  ['danger/light', 'crimson/200'],
  ['danger/base', 'crimson/700'],
  ['danger/dark', 'crimson/800'],
  ['danger/darker', 'crimson/950'],
  ['contrast/lighter', 'charcoal/50'],
  ['contrast/light', 'charcoal/200'],
  ['contrast/base', 'charcoal/700'],
  ['contrast/dark', 'charcoal/900'],
  ['contrast/darker', 'charcoal/950'],
  ['neutral/lighter', 'ash/50'],
  ['neutral/light', 'ash/200'],
  ['neutral/base', 'ash/500'],
  ['neutral/dark', 'ash/800'],
  ['neutral/darker', 'ash/950'],
  ['info/soft', 'cerulean/100'],
  ['info/medium', 'cerulean/400'],
  ['success/soft', 'jade/100'],
  ['success/medium', 'jade/400'],
  ['warning/soft', 'amber/100'],
  ['warning/medium', 'amber/400'],
  ['danger/soft', 'crimson/100'],
  ['danger/medium', 'crimson/400'],
  ['contrast/soft', 'charcoal/100'],
  ['contrast/medium', 'charcoal/400'],
  ['neutral/soft', 'ash/100'],
  ['neutral/medium', 'ash/400'],
  ['neutral/color-light', 'charcoal/200'],
  ['neutral/color-dark', 'charcoal/600'],
  ['contrast/tone', 'charcoal/300'],
  ['contrast/hint', 'charcoal/500'],
  ['contrast/strong', 'charcoal/600'],
  ['contrast/deep', 'charcoal/800'],
];

/** The Core / Color steps the five modes use, with their hex values. */
const PALETTES: Readonly<Record<string, string>> = {
  'amber/100': '#fef9c3',
  'amber/200': '#fef08a',
  'amber/400': '#facc15',
  'amber/50': '#fefce8',
  'amber/500': '#eab308',
  'amber/800': '#854d0e',
  'amber/950': '#422006',
  'ash/100': '#f4f4f5',
  'ash/200': '#e4e4e7',
  'ash/400': '#a1a1aa',
  'ash/50': '#fafafa',
  'ash/500': '#71717a',
  'ash/800': '#27272a',
  'ash/950': '#09090b',
  'cerulean/100': '#e0f2fe',
  'cerulean/200': '#bae6fd',
  'cerulean/400': '#38bdf8',
  'cerulean/50': '#f0f9ff',
  'cerulean/700': '#0369a1',
  'cerulean/800': '#075985',
  'cerulean/950': '#082f49',
  'charcoal/100': '#f4f4f5',
  'charcoal/200': '#e4e4e7',
  'charcoal/300': '#d4d4d8',
  'charcoal/400': '#a1a1aa',
  'charcoal/50': '#fafafa',
  'charcoal/500': '#71717a',
  'charcoal/600': '#52525b',
  'charcoal/700': '#3f3f46',
  'charcoal/800': '#27272a',
  'charcoal/900': '#18181b',
  'charcoal/950': '#09090b',
  'cobalt/100': '#dbeafe',
  'cobalt/200': '#bfdbfe',
  'cobalt/400': '#60a5fa',
  'cobalt/700': '#1d4ed8',
  'cobalt/800': '#1e40af',
  'cobalt/950': '#172554',
  'crimson/100': '#fee2e2',
  'crimson/200': '#fecaca',
  'crimson/400': '#f87171',
  'crimson/50': '#fef2f2',
  'crimson/700': '#b91c1c',
  'crimson/800': '#991b1b',
  'crimson/950': '#450a0a',
  'jade/100': '#d1fae5',
  'jade/200': '#a7f3d0',
  'jade/400': '#34d399',
  'jade/50': '#ecfdf5',
  'jade/700': '#047857',
  'jade/800': '#065f46',
  'jade/950': '#022c22',
  white: '#ffffff',
};

describe('Theme / Brand has five brand modes', () => {
  const brand = collection('Theme / Brand');
  const core = collection('Core / Color');
  const hexOf = (step: string): string | number | undefined =>
    core.tokens.find((t) => t.name === step)?.valuesByMode.Default;

  it('has the modes Neutral, Blue, Green, Yellow and Red, with Neutral as the default', () => {
    expect(brand.modes).toEqual([...MODES]);
    expect(brand.defaultMode).toBe('Neutral');
  });

  it('has the 7 brand steps and the 48 shared tokens, 55 in all', () => {
    expect(brand.tokens).toHaveLength(55);
    expect(brand.tokens.filter((t) => t.name.startsWith('brand/'))).toHaveLength(7);
    expect(SHARED).toHaveLength(48);
  });

  it.each(MODES.flatMap((mode) => BRAND[mode].map(([name, step, hex]) => [mode, name, step, hex] as const)))(
    '%s: %s is %s (%s)',
    (mode, name, step, hex) => {
      const token = brand.tokens.find((t) => t.name === name);
      expect(token?.valuesByMode[mode]).toBe(`{Core / Color#${step}}`);
      expect(hexOf(step)).toBe(hex);
    },
  );

  it.each(SHARED)('%s is %s in all five modes', (name, step) => {
    const token = brand.tokens.find((t) => t.name === name);
    expect(token?.valuesByMode).toEqual(Object.fromEntries(MODES.map((mode) => [mode, `{Core / Color#${step}}`])));
  });

  it('lists every token of the collection in one of the two tables', () => {
    const listed = [...BRAND.Neutral.map(([name]) => name), ...SHARED.map(([name]) => name)].sort();
    expect(brand.tokens.map((t) => t.name).sort()).toEqual(listed);
  });

  it.each(Object.entries(PALETTES))('Core / Color holds %s as %s', (step, hex) => {
    expect(hexOf(step)).toBe(hex);
  });

  it('uses only the Core / Color steps of the palette table', () => {
    const used = new Set(
      brand.tokens.flatMap((t) => Object.values(t.valuesByMode).map((v) => /#(.+)\}$/.exec(String(v))?.[1])),
    );
    expect([...used].sort()).toEqual(Object.keys(PALETTES).sort());
  });

  it.each(['violet', 'azure', 'moss', 'marigold', 'ember', 'silver', 'slate'])('Core / Color drops %s', (palette) => {
    expect(core.tokens.filter((t) => t.name.startsWith(`${palette}/`))).toEqual([]);
    expect(tokensCss).not.toContain(`--cck-${palette}-`);
  });

  it('emits the Neutral brand on the root and a block per brand mode, with no Iris or Dahlia', () => {
    expect(tokensCss).toContain(':root, [data-cck-brand=neutral] {');
    for (const mode of ['blue', 'green', 'yellow', 'red']) expect(tokensCss).toContain(`[data-cck-brand=${mode}] {`);
    expect(tokensCss).not.toMatch(/iris|dahlia/i);
  });

  it('lists the five modes in the modes index', () => {
    const entry = modeCollections.find((c) => c.name === 'Theme / Brand');
    expect(entry?.modes).toEqual(MODES.map((name) => ({ name, value: name.toLowerCase() })));
    expect(entry?.defaultMode).toBe('Neutral');
  });
});

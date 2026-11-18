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

/** The 55 values of the Iris mode of Theme / Brand: the token, the Core / Color step it names and that step's hex. */
const IRIS: readonly (readonly [string, string, string])[] = [
  ['brand/lighter', 'cobalt/50', '#eff6ff'],
  ['brand/light', 'cobalt/200', '#bfdbfe'],
  ['brand/base', 'cobalt/600', '#2563eb'],
  ['brand/dark', 'cobalt/800', '#1e40af'],
  ['brand/darker', 'cobalt/950', '#172554'],
  ['info/lighter', 'cerulean/50', '#edf8ff'],
  ['info/light', 'cerulean/200', '#b5e3ff'],
  ['info/base', 'cerulean/600', '#0678f5'],
  ['info/dark', 'cerulean/800', '#054fb6'],
  ['info/darker', 'cerulean/950', '#062958'],
  ['success/lighter', 'jade/50', '#edfdf5'],
  ['success/light', 'jade/200', '#aaf4d3'],
  ['success/base', 'jade/600', '#0a9e63'],
  ['success/dark', 'jade/800', '#0c6542'],
  ['success/darker', 'jade/950', '#042e1e'],
  ['warning/lighter', 'amber/50', '#fefce8'],
  ['warning/light', 'amber/200', '#fef08a'],
  ['warning/base', 'amber/500', '#eab308'],
  ['warning/dark', 'amber/800', '#854d0e'],
  ['warning/darker', 'amber/950', '#422006'],
  ['danger/lighter', 'crimson/50', '#fff1f1'],
  ['danger/light', 'crimson/200', '#ffc5c5'],
  ['danger/base', 'crimson/600', '#e51010'],
  ['danger/dark', 'crimson/800', '#a00e0e'],
  ['danger/darker', 'crimson/950', '#480404'],
  ['contrast/lighter', 'charcoal/50', '#f6f6f7'],
  ['contrast/light', 'charcoal/200', '#d3d5da'],
  ['contrast/base', 'charcoal/700', '#464b54'],
  ['contrast/dark', 'charcoal/900', '#33373d'],
  ['contrast/darker', 'charcoal/950', '#1e2026'],
  ['neutral/lighter', 'ash/50', '#f9fafb'],
  ['neutral/light', 'ash/200', '#e5e7eb'],
  ['neutral/base', 'ash/500', '#6b7280'],
  ['neutral/dark', 'ash/800', '#1f2937'],
  ['neutral/darker', 'ash/950', '#030712'],
  ['brand/soft', 'cobalt/100', '#dbeafe'],
  ['brand/medium', 'cobalt/400', '#60a5fa'],
  ['info/soft', 'cerulean/100', '#d6efff'],
  ['info/medium', 'cerulean/400', '#48b8ff'],
  ['success/soft', 'jade/100', '#d3fae8'],
  ['success/medium', 'jade/400', '#3ad896'],
  ['warning/soft', 'amber/100', '#fef9c3'],
  ['warning/medium', 'amber/400', '#facc15'],
  ['danger/soft', 'crimson/100', '#ffdfdf'],
  ['danger/medium', 'crimson/400', '#ff6b6b'],
  ['contrast/soft', 'charcoal/100', '#e9eaec'],
  ['contrast/medium', 'charcoal/400', '#888e9a'],
  ['neutral/soft', 'ash/100', '#f3f4f6'],
  ['neutral/medium', 'ash/400', '#9ca3af'],
  ['neutral/color-light', 'charcoal/200', '#d3d5da'],
  ['neutral/color-dark', 'charcoal/600', '#565b66'],
  ['contrast/tone', 'charcoal/300', '#b0b4bd'],
  ['contrast/hint', 'charcoal/500', '#6b7280'],
  ['contrast/strong', 'charcoal/600', '#565b66'],
  ['contrast/deep', 'charcoal/800', '#3b3f47'],
];

/** The Core / Color steps Iris uses, with their hex values. */
const PALETTES: Readonly<Record<string, string>> = {
  'amber/100': '#fef9c3',
  'amber/200': '#fef08a',
  'amber/400': '#facc15',
  'amber/50': '#fefce8',
  'amber/500': '#eab308',
  'amber/800': '#854d0e',
  'amber/950': '#422006',
  'ash/100': '#f3f4f6',
  'ash/200': '#e5e7eb',
  'ash/400': '#9ca3af',
  'ash/50': '#f9fafb',
  'ash/500': '#6b7280',
  'ash/800': '#1f2937',
  'ash/950': '#030712',
  'cerulean/100': '#d6efff',
  'cerulean/200': '#b5e3ff',
  'cerulean/400': '#48b8ff',
  'cerulean/50': '#edf8ff',
  'cerulean/600': '#0678f5',
  'cerulean/800': '#054fb6',
  'cerulean/950': '#062958',
  'charcoal/100': '#e9eaec',
  'charcoal/200': '#d3d5da',
  'charcoal/300': '#b0b4bd',
  'charcoal/400': '#888e9a',
  'charcoal/50': '#f6f6f7',
  'charcoal/500': '#6b7280',
  'charcoal/600': '#565b66',
  'charcoal/700': '#464b54',
  'charcoal/800': '#3b3f47',
  'charcoal/900': '#33373d',
  'charcoal/950': '#1e2026',
  'cobalt/100': '#dbeafe',
  'cobalt/200': '#bfdbfe',
  'cobalt/400': '#60a5fa',
  'cobalt/50': '#eff6ff',
  'cobalt/600': '#2563eb',
  'cobalt/800': '#1e40af',
  'cobalt/950': '#172554',
  'crimson/100': '#ffdfdf',
  'crimson/200': '#ffc5c5',
  'crimson/400': '#ff6b6b',
  'crimson/50': '#fff1f1',
  'crimson/600': '#e51010',
  'crimson/800': '#a00e0e',
  'crimson/950': '#480404',
  'jade/100': '#d3fae8',
  'jade/200': '#aaf4d3',
  'jade/400': '#3ad896',
  'jade/50': '#edfdf5',
  'jade/600': '#0a9e63',
  'jade/800': '#0c6542',
  'jade/950': '#042e1e',
};

describe('Theme / Brand has the Iris brand only', () => {
  const brand = collection('Theme / Brand');
  const core = collection('Core / Color');

  it('has one mode, Iris, as the default', () => {
    expect(brand.modes).toEqual(['Iris']);
    expect(brand.defaultMode).toBe('Iris');
  });

  it('has the 55 tokens of the Iris mode', () => {
    expect(brand.tokens).toHaveLength(55);
    expect(IRIS).toHaveLength(55);
  });

  it.each(IRIS)('%s is %s (%s)', (name, step, hex) => {
    const token = brand.tokens.find((t) => t.name === name);
    expect(token?.valuesByMode).toEqual({ Iris: `{Core / Color#${step}}` });
    expect(core.tokens.find((t) => t.name === step)?.valuesByMode.Default).toBe(hex);
  });

  it.each(Object.entries(PALETTES))('Core / Color holds %s as %s', (step, hex) => {
    expect(core.tokens.find((t) => t.name === step)?.valuesByMode.Default).toBe(hex);
  });

  it.each(['violet', 'azure', 'moss', 'marigold', 'ember', 'silver', 'slate'])('Core / Color drops %s', (palette) => {
    expect(core.tokens.filter((t) => t.name.startsWith(`${palette}/`))).toEqual([]);
    expect(tokensCss).not.toContain(`--cck-${palette}-`);
  });

  it('emits the Iris brand on the root and no Dahlia', () => {
    expect(tokensCss).toContain(':root, [data-cck-brand=iris] {');
    expect(tokensCss).not.toMatch(/dahlia/i);
  });

  it('lists the Iris mode in the modes index', () => {
    const entry = modeCollections.find((c) => c.name === 'Theme / Brand');
    expect(entry?.modes.map((m) => m.name)).toEqual(['Iris']);
    expect(entry?.defaultMode).toBe('Iris');
  });
});

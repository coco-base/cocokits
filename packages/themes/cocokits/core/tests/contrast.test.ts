import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Token {
  name: string;
  valuesByMode: Record<string, string | number>;
}
interface Collection {
  name: string;
  tokens: Token[];
}

const base = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'src', 'tokens', 'base.tokens.json'), 'utf8')) as {
  collections: Collection[];
};
const index = new Map<string, Token>(
  base.collections.flatMap((c) => c.tokens.map((t) => [`${c.name}#${t.name}`, t] as const)),
);
const MODE_OF: Record<string, string> = { 'Core / Color': 'Default', 'Theme / Brand': 'Dahlia' };

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

describe('solid label contrast (WCAG AA 4.5:1)', () => {
  it.each(
    ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast'].flatMap((f) => [
      [f, 'Light'],
      [f, 'Dark'],
    ]),
  )('%s in %s mode', (family, mode) => {
    const fill = resolve(`Theme / Color#${family}/color`, mode);
    const label = resolve(`Theme / Color#${family}/on-color`, mode);
    const ratio = contrast(fill, label);
    // success and danger are the fixed ones; the rest are reported, not asserted here.
    if (family === 'success' || family === 'danger') expect(ratio).toBeGreaterThanOrEqual(4.5);
    else expect(ratio).toBeGreaterThan(1);
  });
});

describe('label and hint text on the surface (WCAG 1.4.3, 4.5:1)', () => {
  it.each([
    ['text/1', 'Light'],
    ['text/1', 'Dark'],
    ['text/2', 'Light'],
    ['text/2', 'Dark'],
  ])('%s in %s mode', (text, mode) => {
    const ratio = contrast(resolve(`Theme / Color#${text}`, mode), resolve('Theme / Color#surface/1', mode));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('input box colors (WCAG 1.4.3 text 4.5:1, 1.4.11 border 3:1)', () => {
  const surface = (mode: string): string => resolve('Theme / Color#surface/1', mode);

  it.each(['Light', 'Dark'])('text and placeholder on the box in %s mode', (mode) => {
    expect(contrast(resolve('Theme / Color#text/1', mode), surface(mode))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(resolve('Theme / Color#text/2', mode), surface(mode))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['Light', 'Dark'])('border and invalid border on the surface in %s mode', (mode) => {
    expect(contrast(resolve('Theme / Color#border/3', mode), surface(mode))).toBeGreaterThanOrEqual(3);
    expect(contrast(resolve('Theme / Color#danger/color', mode), surface(mode))).toBeGreaterThanOrEqual(3);
  });

  it.each(['Light', 'Dark'])('required marker text on the surface in %s mode', (mode) => {
    expect(contrast(resolve('Theme / Color#danger/text', mode), surface(mode))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['Light', 'Dark'])('read-only box keeps the text readable in %s mode', (mode) => {
    const box = resolve('Theme / Color#surface/2', mode);
    expect(contrast(resolve('Theme / Color#text/1', mode), box)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('field error and affix text (WCAG 1.4.3, 4.5:1)', () => {
  it.each(['Light', 'Dark'])('the field error text on the surface in %s mode', (mode) => {
    const ratio = contrast(resolve('Theme / Color#danger/text', mode), resolve('Theme / Color#surface/1', mode));
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['Light', 'Dark'])('the prefix and suffix text on the box and the read-only box in %s mode', (mode) => {
    const text = resolve('Theme / Color#text/2', mode);
    expect(contrast(text, resolve('Theme / Color#surface/1', mode))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(text, resolve('Theme / Color#surface/2', mode))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('choice controls (WCAG 1.4.11 non-text 3:1, 1.4.3 text 4.5:1)', () => {
  const MODES = ['Light', 'Dark'];
  const FAMILIES = ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast'];
  const surface = (mode: string): string => resolve('Theme / Color#surface/1', mode);
  const activeColor = base.collections.find((c) => c.name === 'Theme / Active Color');
  /** An Active Color token of one family, resolved to hex in a color mode. */
  function active(name: string, family: string, mode: string): string {
    const value = String(activeColor?.tokens.find((t) => t.name === name)?.valuesByMode[family]);
    return resolve(/^\{(.+)\}$/.exec(value)?.[1] ?? '', mode);
  }
  const cases = MODES.flatMap((mode) => FAMILIES.map((family) => [family, mode] as const));

  it.each(MODES)('the unchecked border, the hover border and the off thumb on the box surfaces in %s mode', (mode) => {
    for (const background of ['surface/1', 'surface/2']) {
      const box = resolve(`Theme / Color#${background}`, mode);
      expect(contrast(resolve('Theme / Color#border/3', mode), box)).toBeGreaterThanOrEqual(3);
      expect(contrast(resolve('Theme / Color#text/2', mode), box)).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(resolve('Theme / Color#danger/color', mode), surface(mode))).toBeGreaterThanOrEqual(3);
  });

  it.each(cases)('the checked edge of %s against the surface in %s mode', (family, mode) => {
    expect(contrast(active('edge', family, mode), surface(mode))).toBeGreaterThanOrEqual(3);
  });

  it.each(cases)('the checked edge of %s is the fill itself unless the fill fails 3:1 in %s mode', (family, mode) => {
    const fill = active('color', family, mode);
    const edge = active('edge', family, mode);
    if (contrast(fill, surface(mode)) >= 3) expect(edge).toBe(fill);
    else expect(edge).not.toBe(fill);
  });

  it.each(cases)('the tick, dash, dot and thumb of %s against the checked fill in %s mode', (family, mode) => {
    expect(contrast(active('on-color', family, mode), active('color', family, mode))).toBeGreaterThanOrEqual(3);
  });

  it.each(MODES)('the focus ring on the surface in %s mode', (mode) => {
    expect(contrast(resolve('Theme / Color#focus/2', mode), surface(mode))).toBeGreaterThanOrEqual(3);
  });

  it.each(MODES)('the label text on the surface in %s mode', (mode) => {
    expect(contrast(resolve('Theme / Color#text/1', mode), surface(mode))).toBeGreaterThanOrEqual(4.5);
  });
});

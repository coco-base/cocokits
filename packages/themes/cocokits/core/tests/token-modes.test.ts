import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/generated/token-modes';

interface Collection {
  name: string;
  defaultMode: string;
  modes: string[];
}

const dir = join(__dirname, '../src/tokens');
const collections = ['base', 'button', 'badge'].flatMap(
  (file) =>
    (JSON.parse(readFileSync(join(dir, `${file}.tokens.json`), 'utf8')) as { collections: Collection[] }).collections,
);
const multiMode = collections.filter((collection) => collection.modes.length > 1);

describe('generated token modes', () => {
  it('cover the known collections', () => {
    expect(multiMode.map((collection) => collection.name)).toEqual([
      'Theme / Brand',
      'Theme / Color',
      'Theme / Active Color',
      'Theme / Spacing',
      'Theme / Radius',
      'Button / Size',
      'Badge / Size',
    ]);
  });

  it.each(multiMode.map((collection) => [collection.name, collection] as const))(
    '%s matches the token JSON',
    (_name, collection) => {
      const stem = collection.name
        .split(/[^A-Za-z0-9]+/)
        .map((word, index) => (index === 0 ? word.toLowerCase() : word))
        .map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
        .join('');
      const exports = generated as Record<string, unknown>;
      expect(exports[`${stem}Modes`]).toEqual(collection.modes);
      expect(exports[`${stem}DefaultMode`]).toBe(collection.defaultMode);
    },
  );

  it.each([
    ['Theme / Brand', 'cck-brand', ['neutral', 'blue', 'green', 'yellow', 'red']],
    ['Theme / Radius', 'cck-radius', ['medium', 'sharp', 'round', 'pill']],
    ['Theme / Spacing', 'cck-spacing', ['normal', 'compact', 'comfortable']],
  ] as const)('%s has the attribute %s and the modes %j', (name, attrName, values) => {
    const collection = generated.modeCollections.find((entry) => entry.name === name);
    expect(collection?.attrName).toBe(attrName);
    expect(collection?.modes.map((mode) => mode.value)).toEqual(values);
  });

  // The mode blocks have the specificity of :root, so a mode listed before the default would lose to it.
  it.each(
    generated.modeCollections
      .filter((collection) => collection.name.startsWith('Theme / '))
      .map((collection) => [collection.name, collection] as const),
  )('%s lists its default mode first', (_name, collection) => {
    expect(collection.modes[0]?.name).toBe(collection.defaultMode);
  });
});

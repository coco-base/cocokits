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
      'Theme / Color',
      'Theme / Active Color',
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
});

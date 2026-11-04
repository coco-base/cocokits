// @vitest-environment node
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceDir = fileURLToPath(new URL('../src/', import.meta.url));

describe('the TSDoc of the theme options', () => {
  // A theme option has a one-sentence summary only. Its default and its values live in the theme's `ThemeConfig`, so the
  // layer does not restate them (docs/style-guides/docs/api-extraction.md, "TSDoc rules").
  it('has no @defaultValue in the layer source', () => {
    const files = readdirSync(sourceDir, { recursive: true, encoding: 'utf8' }).filter((name) =>
      /\.(ts|tsx|vue)$/.test(name),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(readFileSync(`${sourceDir}${file}`, 'utf8'), file).not.toContain('@defaultValue');
    }
  });
});

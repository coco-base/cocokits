// @vitest-environment node
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceDir = fileURLToPath(new URL('../src/', import.meta.url));

describe('the TSDoc of the theme options', () => {
  // A theme option has a one-sentence summary only. Its default and its values live in the theme's `ThemeConfig`, so the
  // layer does not restate them.
  it('has no @defaultValue in the layer source', () => {
    const files = readdirSync(sourceDir, { recursive: true, encoding: 'utf8' }).filter((name) =>
      /\.(ts|tsx|vue)$/.test(name),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(readFileSync(`${sourceDir}${file}`, 'utf8'), file).not.toContain('@defaultValue');
    }
  });

  // The site builds the API rows of the overlay options from these texts (the Angular limits of the two options).
  it.each([
    ['dialog-theme.ts', 'dialogSize', 'dialog.size', 'A dialog opened by `CckDialogService` has no root directive'],
    ['tooltip-theme.ts', 'tooltipSize', 'tooltip.size', 'a size needs a `cck-tooltip-content`'],
  ])('documents %s: the %s description holds its limit and the @cckSemantic %s tag', (file, input, id, sentence) => {
    const source = readFileSync(`${sourceDir}${file}`, 'utf8');
    const end = source.indexOf(`readonly ${input} =`);
    const comment = source
      .slice(source.lastIndexOf('/**', end), end)
      .split('\n')
      .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*)\s?/, ''))
      .join(' ')
      .replace(/\s+/g, ' ');
    expect(comment).toContain(sentence);
    expect(comment).toContain(`@cckSemantic ${id}`);
  });
});

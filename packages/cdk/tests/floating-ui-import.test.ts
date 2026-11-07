/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = join(import.meta.dirname, '..', 'src');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : sourceFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

describe('@floating-ui/dom', () => {
  it('is imported only by the positioning module', () => {
    const importers = sourceFiles(SOURCE)
      .filter((file) => readFileSync(file, 'utf8').includes('@floating-ui/dom'))
      .map((file) => relative(SOURCE, file).replaceAll('\\', '/').split('/')[0]);
    expect(importers.length).toBeGreaterThan(0);
    expect(new Set(importers)).toEqual(new Set(['positioning']));
  });
});

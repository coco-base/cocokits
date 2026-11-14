// @vitest-environment node
/// <reference types="node" />
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsdown';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
let outDir = '';
const emitted = new Map<string, string>();

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])),
  );
  return nested.flat();
}

beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'cck-theme-react-'));
  await build({
    config: false,
    cwd: packageRoot,
    entry: ['src/index.{ts,tsx}'],
    root: 'src',
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    unbundle: true,
    dts: false,
    hash: false,
    fixedExtension: false,
    clean: false,
    outDir,
    tsconfig: 'tsconfig.lib.json',
    logLevel: 'silent',
  });
  for (const file of await walk(outDir)) {
    if (file.endsWith('.js')) emitted.set(relative(outDir, file).split(sep).join('/'), await readFile(file, 'utf8'));
  }
}, 60_000);

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true });
});

const startsWithDirective = (code: string): boolean => /^["']use client["'];?/.test(code.trimStart());

describe('emitted modules keep their "use client"', () => {
  it('has the directive first in the Button module', () => {
    expect(startsWithDirective(emitted.get('button.js') ?? '')).toBe(true);
  });

  it('has it in no barrel', () => {
    const withDirective = [...emitted].filter(([, code]) => startsWithDirective(code)).map(([name]) => name);
    expect(withDirective).toEqual([
      'accordion-root.js',
      'badge.js',
      'button.js',
      'checkbox.js',
      'divider.js',
      'form-field.js',
      'icon-button.js',
      'radio.js',
      'select-root.js',
      'svg-icon.js',
      'switch.js',
      'tab-nav-root.js',
      'tabs-root.js',
      'textarea.js',
    ]);
    expect(emitted.has('index.js')).toBe(true);
  });
});

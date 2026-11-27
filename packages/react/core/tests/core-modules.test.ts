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
  outDir = await mkdtemp(join(tmpdir(), 'cck-react-core-'));
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

describe('emitted react-core modules keep their "use client"', () => {
  it('has the directive first in the context, provider and hook modules', () => {
    expect(startsWithDirective(emitted.get('theme-context.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('direction.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('portal.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('use-theme-attrs.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('use-theme-config.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('icon-registry.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('use-form-participation.js') ?? '')).toBe(true);
  });

  it('has it in no barrel and no pure module', () => {
    const withDirective = [...emitted].filter(([, code]) => startsWithDirective(code)).map(([name]) => name);
    expect(withDirective.sort()).toEqual([
      'direction.js',
      'icon-registry.js',
      'portal.js',
      'theme-context.js',
      'use-form-participation.js',
      'use-theme-attrs.js',
      'use-theme-config.js',
    ]);
    expect(emitted.has('index.js')).toBe(true);
    expect(emitted.has('to-react-props.js')).toBe(true);
  });
});

// @vitest-environment node
/// <reference types="node" />
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const repo = resolve(root, '..', '..', '..', '..');
const out = mkdtempSync(join(tmpdir(), 'theme-cocokits-vue-d-ts-'));

afterAll(() => {
  rmSync(out, { recursive: true, force: true });
});

describe('the declaration emit of the layer', () => {
  // vue-tsc skips a .vue file silently (exit 0) when its inferred type cannot be named (TS2883); `index.d.ts` then
  // re-exports a type that does not exist and a consumer gets no types for the component.
  it('emits a .vue.d.ts for every .vue file of src', () => {
    const bin = join(repo, 'node_modules', '.bin', process.platform === 'win32' ? 'vue-tsc.cmd' : 'vue-tsc');
    const result = spawnSync(
      bin,
      [
        '-p',
        'tsconfig.lib.json',
        '--declaration',
        '--emitDeclarationOnly',
        '--noEmit',
        'false',
        '--outDir',
        out,
        '--rootDir',
        'src',
      ],
      { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' },
    );
    expect(result.stdout + result.stderr).toBe('');
    const components = readdirSync(join(root, 'src')).filter((name) => name.endsWith('.vue'));
    expect(components.length).toBeGreaterThan(0);
    for (const name of components) expect(existsSync(join(out, `${name}.d.ts`)), name).toBe(true);
  }, 120_000);

  it.each(['Textarea', 'Checkbox', 'Radio', 'Switch'])('types the update:modelValue event of %s', (name) => {
    const declaration = readFileSync(join(out, `${name}.vue.d.ts`), 'utf8');
    expect(declaration).toMatch(/"update:modelValue": \(\w+: (string|boolean)\) => any/);
    expect(declaration).not.toContain('unknown[]');
  });
});

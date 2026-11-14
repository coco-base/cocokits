// @vitest-environment node
/// <reference types="node" />
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const repo = resolve(root, '..', '..');
const out = mkdtempSync(join(tmpdir(), 'vue-d-ts-'));

beforeAll(emitDeclarations, 120_000);

afterAll(() => {
  rmSync(out, { recursive: true, force: true });
});

function emitDeclarations(): void {
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
  expect(result.status, result.stdout + result.stderr).toBe(0);
}

describe('the declaration emit of the model components', () => {
  // The model is declared as a wide `modelValue` prop and a narrow `update:modelValue` event (`useModel`), so a
  // `ref('')` binds with `v-model` and the event hands back the type the component emits.
  it.each([
    ['input/Input', 'string'],
    ['textarea/Textarea', 'string'],
    ['checkbox/Checkbox', 'boolean'],
    ['radio/Radio', 'boolean'],
    ['switch/Switch', 'boolean'],
  ])('types the update:modelValue event of %s', (file, emitted) => {
    const declaration = readFileSync(join(out, `${file}.vue.d.ts`), 'utf8');
    expect(declaration).toMatch(new RegExp(String.raw`"update:modelValue": \(\w+: ${emitted}\) => any`));
    expect(declaration).not.toContain('unknown[]');
  });
});

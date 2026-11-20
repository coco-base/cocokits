// @vitest-environment node
/// <reference types="node" />
import { execFile } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'tsdown';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
// Inside the package, so the build output resolves `@cocokits/react` and the other dependencies.
const outDir = join(packageRoot, 'node_modules', '.cache', 'server-components-test');

beforeAll(async () => {
  await mkdir(outDir, { recursive: true });
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
    clean: true,
    outDir,
    tsconfig: 'tsconfig.lib.json',
    logLevel: 'silent',
  });
}, 60_000);

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true });
});

describe('Select, Tabs and TabNav in a Server Component', () => {
  it('renders the parts of the built base and theme packages under the react-server condition', async () => {
    const page = fileURLToPath(new URL('./rsc/server-page.mjs', import.meta.url));
    const register = fileURLToPath(new URL('./rsc/register.mjs', import.meta.url));
    const { stdout } = await run(
      process.execPath,
      ['--conditions', 'react-server', '--import', pathToFileURL(register).href, page, join(outDir, 'index.js')],
      { cwd: packageRoot },
    );
    expect(JSON.parse(stdout)).toEqual({
      base: { moduleRows: 18 },
      theme: { moduleRows: 18 },
    });
  }, 60_000);
});

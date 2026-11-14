import { updateJson } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import { createWorkspace, generate } from './testing/workspace';

type Options = Parameters<typeof generate>[1];

async function expectError(options: Options, message: RegExp, setup: Options[] = []): Promise<void> {
  const tree = createWorkspace();
  for (const step of setup) await generate(tree, step);
  await expect(generate(tree, options)).rejects.toThrow(message);
}

describe('library generator: validation', () => {
  it('rejects an unknown kind and lists the valid ones', async () => {
    await expectError({ kind: 'component', name: 'x' }, /Unknown kind "component".*shared-lib/);
  });

  it.each(['Utils', '1abc', 'a_b', 'with space', '.', ''])('rejects the name "%s"', async (name) => {
    await expectError({ kind: 'cdk-module', name }, /Invalid name|needs a name/, [{ kind: 'cdk' }]);
  });

  it('rejects an invalid theme name', async () => {
    await expectError({ kind: 'theme-core', theme: 'Bad_Theme' }, /Invalid theme name/);
  });

  it.each(['fw-core', 'fw'])('%s needs --framework', async (kind) => {
    await expectError({ kind }, /needs --framework/);
  });

  it('theme-fw needs --framework and --theme', async () => {
    await expectError({ kind: 'theme-fw', theme: 'cocokits' }, /needs --framework/);
    await expectError({ kind: 'theme-fw', framework: 'react' }, /needs --theme/);
    await expectError({ kind: 'theme-core' }, /needs --theme/);
  });

  it('fw-entry needs --framework and a name', async () => {
    await expectError({ kind: 'fw-entry', name: 'tabs' }, /needs --framework/);
    await expectError({ kind: 'fw-entry', framework: 'react' }, /needs a name/);
  });

  it('rejects an unknown framework', async () => {
    await expectError({ kind: 'fw', framework: 'svelte' }, /Unknown framework "svelte"/);
  });

  it('rejects options a kind does not take', async () => {
    await expectError({ kind: 'cdk', framework: 'react' }, /does not take --framework/);
    await expectError({ kind: 'fw', framework: 'react', theme: 'x' }, /does not take --theme/);
    await expectError({ kind: 'cdk-module', name: 'x', theme: 'x' }, /does not take --theme/, [{ kind: 'cdk' }]);
  });

  it('rejects a shared-lib that is not utils, shared or icons', async () => {
    await expectError({ kind: 'shared-lib', name: 'helpers' }, /utils, shared, icons/);
    await expectError({ kind: 'shared-lib' }, /utils, shared, icons/);
  });

  it('rejects a name that differs from the canonical project name', async () => {
    await expectError({ kind: 'cdk', name: 'toolkit' }, /must be "cdk"/);
    await expectError({ kind: 'theme-core', theme: 'cocokits', name: 'x' }, /must be "theme-cocokits"/);
  });

  it('angular-testing is only for angular', async () => {
    await expectError({ kind: 'angular-testing', name: 'tabs', framework: 'react' }, /only for --framework=angular/);
  });

  it.each([
    [{ kind: 'cdk-module', name: 'positioning' }, /@cocokits\/cdk does not exist/],
    [{ kind: 'machine', name: 'tabs' }, /@cocokits\/machines does not exist/],
    [{ kind: 'fw-entry', name: 'tabs', framework: 'react' }, /@cocokits\/react does not exist/],
    [{ kind: 'angular-testing', name: 'tabs' }, /@cocokits\/angular does not exist/],
  ] as [Options, RegExp][])('rejects %j when the parent package is missing', async (options, message) => {
    await expectError(options, message);
  });

  it('angular-testing needs the component entry point', async () => {
    await expectError({ kind: 'angular-testing', name: 'tabs' }, /add the component entry point first/, [
      { kind: 'fw', framework: 'angular' },
    ]);
  });

  it.each(['index', 'dist', 'src', 'tests', 'api', 'coverage', 'scripts'])(
    'rejects the reserved cdk module name "%s"',
    async (name) => {
      await expectError({ kind: 'cdk-module', name }, /reserved/, [{ kind: 'cdk' }]);
    },
  );

  it('allows "testing" as a cdk module but not as a machine', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'cdk' });
    await generate(tree, { kind: 'cdk-module', name: 'testing' });
    expect(tree.exists('packages/cdk/src/testing/index.ts')).toBe(true);
    await generate(tree, { kind: 'machines' });
    await expect(generate(tree, { kind: 'machine', name: 'testing' })).rejects.toThrow(/reserved/);
  });

  it.each(['index', 'core', 'testing', 'dist'])('rejects the reserved entry name "%s"', async (name) => {
    await expectError({ kind: 'fw-entry', name, framework: 'react' }, /reserved/, [{ kind: 'fw', framework: 'react' }]);
  });

  it.each(['cdk', 'machines'] as const)('rejects a "." export on %s', async (kind) => {
    const tree = createWorkspace();
    await generate(tree, { kind });
    updateJson(tree, `packages/${kind}/package.json`, (json: { exports: Record<string, unknown> }) => {
      json.exports['.'] = { types: './dist/index.d.ts', default: './dist/index.js' };
      return json;
    });
    await expect(generate(tree, { kind })).rejects.toThrow(/must not have a "\." export/);
    const entry = kind === 'cdk' ? 'cdk-module' : 'machine';
    await expect(generate(tree, { kind: entry, name: 'x' })).rejects.toThrow(/must not have a "\." export/);
  });

  it('requires compatibility.json for framework packages', async () => {
    const tree = createWorkspace();
    tree.delete('compatibility.json');
    await expect(generate(tree, { kind: 'fw-core', framework: 'react' })).rejects.toThrow(
      /compatibility.json not found/,
    );
  });

  it('rejects a compatibility.json without the framework peers', async () => {
    const tree = createWorkspace();
    tree.write('compatibility.json', JSON.stringify({ peers: { vue: { low: '3.5.0', high: '3.5.1' } } }));
    await expect(generate(tree, { kind: 'fw-core', framework: 'react' })).rejects.toThrow(/no peers\["react"\]/);
  });
});

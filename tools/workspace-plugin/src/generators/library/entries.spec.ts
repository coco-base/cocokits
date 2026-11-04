import { readJson, type Tree } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import {
  createWorkspace,
  generate,
  missingFiles,
  readPackage,
  rootDevDependencies,
  sizeEntries,
  snapshot,
  tsconfigPaths,
} from './testing/workspace';

async function workspaceWith(...setup: Parameters<typeof generate>[1][]): Promise<Tree> {
  const tree = createWorkspace();
  for (const options of setup) await generate(tree, options);
  return tree;
}

describe('library generator: entry points', () => {
  it('cdk-module: folder, export, path, size entry; removes the placeholder', async () => {
    const tree = await workspaceWith({ kind: 'cdk' });
    expect(tree.exists('packages/cdk/src/placeholder.ts')).toBe(true);
    await generate(tree, { kind: 'cdk-module', name: 'positioning' });
    expect(missingFiles(tree, 'packages/cdk/src/positioning', ['index.ts', 'tests/positioning.test.ts'])).toEqual([]);
    expect(tree.exists('packages/cdk/src/placeholder.ts')).toBe(false);
    expect(readPackage(tree, 'packages/cdk').exports).toEqual({
      './positioning': { types: './dist/positioning/index.d.ts', default: './dist/positioning/index.js' },
    });
    expect(tsconfigPaths(tree)['@cocokits/cdk/positioning']).toEqual(['./packages/cdk/src/positioning/index.ts']);
    expect(sizeEntries(tree)).toEqual(['@cocokits/cdk/positioning']);
    expect(tree.read('size-limit.config.mjs', 'utf-8')).toContain("path: 'packages/cdk/dist/positioning/index.js'");
  });

  it('machine: only index.ts and a placeholder test, plus the subpath export', async () => {
    const tree = await workspaceWith({ kind: 'machines' });
    await generate(tree, { kind: 'machine', name: 'tabs' });
    expect(tree.children('packages/machines/tabs').sort()).toEqual(['index.ts', 'tests']);
    expect(tree.children('packages/machines/tabs/tests')).toEqual(['tabs.test.ts']);
    expect(tree.exists('packages/machines/placeholder.ts')).toBe(false);
    const pkg = readPackage(tree, 'packages/machines');
    expect(pkg.exports).toEqual({ './tabs': { types: './dist/tabs/index.d.ts', default: './dist/tabs/index.js' } });
    expect(tsconfigPaths(tree)['@cocokits/machines/tabs']).toEqual(['./packages/machines/tabs/index.ts']);
    expect(sizeEntries(tree)).toEqual(['@cocokits/machines/tabs']);
  });

  it('keeps exports sorted when entries are added out of order', async () => {
    const tree = await workspaceWith({ kind: 'machines' });
    await generate(tree, { kind: 'machine', name: 'tabs' });
    await generate(tree, { kind: 'machine', name: 'switch' });
    expect(Object.keys(readPackage(tree, 'packages/machines').exports)).toEqual(['./switch', './tabs']);
  });

  it.each(['react', 'vue'] as const)('fw-entry %s: src/<component>/index.ts and subpath', async (fw) => {
    const tree = await workspaceWith({ kind: 'fw', framework: fw });
    await generate(tree, { kind: 'fw-entry', name: 'switch', framework: fw });
    const dir = `packages/${fw}/src/switch`;
    expect(missingFiles(tree, dir, ['index.ts', 'tests/switch.test.ts'])).toEqual([]);
    expect(tree.read(`${dir}/index.ts`, 'utf-8')?.trim()).toBe('export {};');
    expect(tree.exists(`packages/${fw}/src/placeholder.ts`)).toBe(false);
    expect(readPackage(tree, `packages/${fw}`).exports).toEqual({
      './switch': { types: './dist/switch/index.d.ts', default: './dist/switch/index.js' },
    });
    expect(tsconfigPaths(tree)[`@cocokits/${fw}/switch`]).toEqual([`./packages/${fw}/src/switch/index.ts`]);
    expect(sizeEntries(tree)).toEqual([`@cocokits/${fw}/switch`]);
  });

  it('fw-entry angular: secondary entry point with ng-package.json', async () => {
    const tree = await workspaceWith({ kind: 'fw', framework: 'angular' });
    await generate(tree, { kind: 'fw-entry', name: 'tabs', framework: 'angular' });
    expect(missingFiles(tree, 'packages/angular/tabs', ['ng-package.json', 'index.ts', 'tests/tabs.test.ts'])).toEqual(
      [],
    );
    expect(readJson(tree, 'packages/angular/tabs/ng-package.json')).toEqual({ lib: { entryFile: 'index.ts' } });
    expect(tree.exists('packages/angular/src/index.ts')).toBe(true);
    // ng-packagr generates the exports of the output package.json; a source entry would only trigger its warning.
    expect(readPackage(tree, 'packages/angular').exports).toEqual({});
    expect(tsconfigPaths(tree)['@cocokits/angular/tabs']).toEqual(['./packages/angular/tabs/index.ts']);
    expect(tree.read('size-limit.config.mjs', 'utf-8')).toContain(
      "path: 'dist/packages/angular/fesm2022/cocokits-angular-tabs.mjs'",
    );
  });

  it('angular-testing: <component>/testing secondary entry point', async () => {
    const tree = await workspaceWith(
      { kind: 'fw', framework: 'angular' },
      { kind: 'fw-entry', name: 'tabs', framework: 'angular' },
    );
    await generate(tree, { kind: 'angular-testing', name: 'tabs' });
    const expected = ['ng-package.json', 'index.ts', 'tests/testing.test.ts'];
    expect(missingFiles(tree, 'packages/angular/tabs/testing', expected)).toEqual([]);
    expect(readPackage(tree, 'packages/angular').exports).toEqual({});
    expect(tsconfigPaths(tree)['@cocokits/angular/tabs/testing']).toEqual(['./packages/angular/tabs/testing/index.ts']);
    expect(sizeEntries(tree)).toEqual(['@cocokits/angular/tabs', '@cocokits/angular/tabs/testing']);
  });

  it('angular-testing: @angular/cdk is an optional peer following @angular/core, and a root devDependency', async () => {
    const tree = await workspaceWith(
      { kind: 'fw', framework: 'angular' },
      { kind: 'fw-entry', name: 'tabs', framework: 'angular' },
      { kind: 'fw-entry', name: 'radio', framework: 'angular' },
    );
    expect(readPackage(tree, 'packages/angular').peerDependencies).not.toHaveProperty('@angular/cdk');
    await generate(tree, { kind: 'angular-testing', name: 'tabs' });
    await generate(tree, { kind: 'angular-testing', name: 'radio' });
    const pkg = readPackage(tree, 'packages/angular');
    expect(pkg.peerDependencies?.['@angular/cdk']).toBe(pkg.peerDependencies?.['@angular/core']);
    expect(pkg.peerDependencies?.['@angular/cdk']).toBe('^20.1.0');
    expect(pkg.peerDependenciesMeta?.['@angular/cdk']).toEqual({ optional: true });
    expect(rootDevDependencies(tree)['@angular/cdk']).toBe('20.4.2');
  });
});

const SEQUENCE: Parameters<typeof generate>[1][] = [
  { kind: 'shared-lib', name: 'utils' },
  { kind: 'shared-lib', name: 'shared' },
  { kind: 'cdk' },
  { kind: 'cdk-module', name: 'reactive' },
  { kind: 'machines' },
  { kind: 'machine', name: 'switch' },
  { kind: 'fw-core', framework: 'angular' },
  { kind: 'fw', framework: 'angular' },
  { kind: 'fw-entry', name: 'tabs', framework: 'angular' },
  { kind: 'angular-testing', name: 'tabs' },
  { kind: 'fw-core', framework: 'react' },
  { kind: 'fw', framework: 'react' },
  { kind: 'fw-entry', name: 'switch', framework: 'react' },
  { kind: 'fw-core', framework: 'vue' },
  { kind: 'fw', framework: 'vue' },
  { kind: 'fw-entry', name: 'switch', framework: 'vue' },
  { kind: 'theme-core', theme: 'cocokits' },
  { kind: 'theme-fw', theme: 'cocokits', framework: 'angular' },
  { kind: 'theme-fw', theme: 'cocokits', framework: 'react' },
  { kind: 'theme-fw', theme: 'cocokits', framework: 'vue' },
];

describe('library generator: size-limit.config.mjs separators', () => {
  it('adds a comma when the last existing entry has none', async () => {
    const tree = createWorkspace();
    tree.write('size-limit.config.mjs', "export default [\n  { name: '@cocokits/old', path: 'old.js' }\n];\n");
    await generate(tree, { kind: 'shared-lib', name: 'utils' });
    const content = tree.read('size-limit.config.mjs', 'utf-8') ?? '';
    expect(content).toContain("{ name: '@cocokits/old', path: 'old.js' },\n  { name: '@cocokits/utils'");
    expect(content.trimEnd().endsWith('},\n];')).toBe(true);
    expect(sizeEntries(tree)).toEqual(['@cocokits/old', '@cocokits/utils']);
  });

  it('fills an empty array', async () => {
    const tree = createWorkspace();
    tree.write('size-limit.config.mjs', 'export default [];\n');
    await generate(tree, { kind: 'shared-lib', name: 'utils' });
    expect(tree.read('size-limit.config.mjs', 'utf-8')).toBe(
      "export default [\n  { name: '@cocokits/utils', path: 'packages/utils/dist/index.js' },\n];\n",
    );
  });
});

describe('library generator: size-limit.config.mjs', () => {
  it('keeps existing entries and their custom options when another library is added', async () => {
    const tree = await workspaceWith({ kind: 'shared-lib', name: 'utils' });
    const custom = tree
      .read('size-limit.config.mjs', 'utf-8')
      ?.replace(
        "path: 'packages/utils/dist/index.js' }",
        "path: 'packages/utils/dist/index.js', limit: '1 kB', brotli: true }",
      );
    expect(custom).toContain("limit: '1 kB'");
    tree.write('size-limit.config.mjs', custom ?? '');
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'cdk' });
    await generate(tree, { kind: 'cdk-module', name: 'reactive' });
    const content = tree.read('size-limit.config.mjs', 'utf-8') ?? '';
    expect(content).toContain(
      "{ name: '@cocokits/utils', path: 'packages/utils/dist/index.js', limit: '1 kB', brotli: true },",
    );
    expect(sizeEntries(tree)).toEqual(['@cocokits/utils', '@cocokits/shared', '@cocokits/cdk/reactive']);
  });
});

describe('library generator: idempotence', () => {
  it.each(SEQUENCE.map((options) => [JSON.stringify(options), options] as const))(
    'rerunning %s changes nothing',
    async (_label, options) => {
      const tree = createWorkspace();
      for (const step of SEQUENCE) {
        await generate(tree, step);
        if (step === options) break;
      }
      const before = snapshot(tree);
      await generate(tree, options);
      expect(snapshot(tree)).toEqual(before);
    },
  );

  it('does not overwrite edits to an existing entry', async () => {
    const tree = await workspaceWith({ kind: 'cdk' }, { kind: 'cdk-module', name: 'reactive' });
    tree.write('packages/cdk/src/reactive/index.ts', 'export const edited = true;\n');
    await generate(tree, { kind: 'cdk-module', name: 'reactive' });
    expect(tree.read('packages/cdk/src/reactive/index.ts', 'utf-8')).toBe('export const edited = true;\n');
  });
});

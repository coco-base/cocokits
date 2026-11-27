import { readJson } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import {
  COMMON_FILES,
  createWorkspace,
  generate,
  missingFiles,
  readPackage,
  readTags,
  rootDevDependencies,
  sizeEntries,
  tsconfigPaths,
} from './testing/workspace';

describe('library generator: shared packages', () => {
  it.each(['utils', 'shared', 'icons'])('shared-lib %s: root entry, strict, tsdown', async (name) => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name });
    const root = `packages/${name}`;
    const expected = [...COMMON_FILES, 'src/index.ts', 'tests/index.test.ts', 'tsdown.config.mjs'];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readTags(tree, root)).toEqual([
      name === 'icons' ? 'layer:shared' : `layer:${name}`,
      'scope:shared',
      'type:lib',
    ]);
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({
      name: `@cocokits/${name}`,
      version: '2.0.0',
      license: 'Apache-2.0',
      type: 'module',
      sideEffects: false,
    });
    expect(pkg.repository).toEqual({
      type: 'git',
      url: 'https://github.com/coco-base/cocokits.git',
      directory: root,
    });
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.publishConfig.access).toBe('public');
    expect(pkg.exports).toEqual({ '.': { types: './dist/index.d.ts', default: './dist/index.js' } });
    expect(pkg.peerDependencies).toBeUndefined();
    expect(readJson<{ extends: string }>(tree, `${root}/tsconfig.json`).extends).toBe('../../tsconfig.strict.json');
    expect(readJson<{ name: string }>(tree, `${root}/project.json`).name).toBe(name);
    expect(Object.keys(readJson<{ targets: object }>(tree, `${root}/project.json`).targets)).toEqual([
      'build',
      'typecheck',
      'pack',
      'publint',
      'attw',
    ]);
    expect(tsconfigPaths(tree)[`@cocokits/${name}`]).toEqual([`./${root}/src/index.ts`]);
    expect(sizeEntries(tree)).toEqual([`@cocokits/${name}`]);
    expect(rootDevDependencies(tree)).toHaveProperty('tsdown');
  });

  it('utils compiles without DOM types; builds resolve internal packages through node_modules', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'utils' });
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    interface Tsconfig {
      compilerOptions: { lib?: string[]; paths?: Record<string, string[]> };
    }
    expect(readJson<Tsconfig>(tree, 'packages/utils/tsconfig.json').compilerOptions.lib).toEqual(['ES2023']);
    expect(readJson<Tsconfig>(tree, 'packages/shared/tsconfig.json').compilerOptions.lib).toBeUndefined();
    for (const name of ['utils', 'shared']) {
      expect(readJson<Tsconfig>(tree, `packages/${name}/tsconfig.lib.json`).compilerOptions.paths).toEqual({});
    }
    expect(tree.read('packages/utils/vitest.config.mjs', 'utf-8')).toContain('tsconfigPaths: true');
  });

  it('cdk: no root entry, optional peers, alien-signals', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'cdk' });
    const expected = [...COMMON_FILES, 'src/placeholder.ts', 'tests/exports.test.ts', 'tsdown.config.mjs'];
    expect(missingFiles(tree, 'packages/cdk', expected)).toEqual([]);
    expect(readTags(tree, 'packages/cdk')).toEqual(['layer:cdk', 'scope:shared', 'type:lib']);
    const pkg = readPackage(tree, 'packages/cdk');
    expect(pkg.name).toBe('@cocokits/cdk');
    expect(pkg.exports).toEqual({});
    expect(Object.keys(pkg.peerDependencies ?? {})).toEqual([
      '@floating-ui/dom',
      '@internationalized/date',
      '@internationalized/number',
    ]);
    expect(Object.values(pkg.peerDependenciesMeta ?? {})).toEqual(Array(3).fill({ optional: true }));
    expect(pkg.dependencies).toHaveProperty('alien-signals');
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
  });

  it('cdk declares the internal packages that exist', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'utils' });
    await generate(tree, { kind: 'cdk' });
    const { dependencies } = readPackage(tree, 'packages/cdk');
    expect(dependencies).toMatchObject({ '@cocokits/utils': 'workspace:*' });
    expect(dependencies).not.toHaveProperty('@cocokits/shared');
    expect(dependencies).not.toHaveProperty('@cocokits/icons');
    const withIcons = createWorkspace();
    await generate(withIcons, { kind: 'shared-lib', name: 'icons' });
    await generate(withIcons, { kind: 'cdk' });
    expect(readPackage(withIcons, 'packages/cdk').dependencies).toMatchObject({ '@cocokits/icons': 'workspace:*' });
  });

  it('machines: one project, no root entry, no "." export', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'machines' });
    const expected = [...COMMON_FILES, 'placeholder.ts', 'tests/exports.test.ts', 'tsdown.config.mjs'];
    expect(missingFiles(tree, 'packages/machines', expected)).toEqual([]);
    expect(readTags(tree, 'packages/machines')).toEqual(['layer:machine', 'scope:shared', 'type:lib']);
    expect(readPackage(tree, 'packages/machines').exports).toEqual({});
    expect(tree.exists('packages/machines/index.ts')).toBe(false);
    expect(tree.read('packages/machines/tsdown.config.mjs', 'utf-8')).toContain("'*/index.ts'");
  });

  it('adds the package to an explicit Changesets fixed group', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'shared-lib', name: 'utils' });
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([
      ['@cocokits/cdk', '@cocokits/utils'],
    ]);
  });
});

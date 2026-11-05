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

type Fw = 'angular' | 'react' | 'vue';

/** Peer ranges derived from testing/workspace.ts TEST_COMPATIBILITY. */
const PEERS: Record<Fw, Record<string, string>> = {
  angular: { '@angular/core': '^20.1.0' },
  react: { react: '>=18.2.0 <20.0.0', 'react-dom': '>=18.2.0 <20.0.0' },
  vue: { vue: '^3.4.0' },
};

const BUILD_FILES: Record<Fw, string[]> = {
  angular: ['ng-package.json'],
  react: ['tsdown.config.mjs'],
  vue: ['vite.config.lib.mjs'],
};

const FRAMEWORKS: Fw[] = ['angular', 'react', 'vue'];

/** ng-packagr packages list no exports in the source package.json; ng-packagr generates them. */
function rootExport(): Record<string, unknown> {
  return { types: './dist/index.d.ts', default: './dist/index.js' };
}

describe('library generator: framework core', () => {
  it.each(FRAMEWORKS)('fw-core %s', async (fw) => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'fw-core', framework: fw });
    const root = `packages/${fw}/core`;
    const build = fw === 'angular' ? ['ng-package.build.json'] : BUILD_FILES[fw];
    const expected = [...COMMON_FILES, 'src/index.ts', 'tests/index.test.ts', ...build];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readJson<{ name: string }>(tree, `${root}/project.json`).name).toBe(`${fw}-core`);
    expect(readTags(tree, root)).toEqual(['layer:fw-core', `scope:${fw}`, 'type:lib']);
    const pkg = readPackage(tree, root);
    expect(pkg.name).toBe(`@cocokits/${fw}-core`);
    expect(pkg.sideEffects).toBe(false);
    expect(pkg.peerDependencies).toEqual(PEERS[fw]);
    expect(pkg.exports).toEqual(fw === 'angular' ? {} : { '.': rootExport() });
    expect(readJson<{ extends: string }>(tree, `${root}/tsconfig.json`).extends).toBe('../../../tsconfig.strict.json');
    expect(tsconfigPaths(tree)[`@cocokits/${fw}-core`]).toEqual([`./${root}/src/index.ts`]);
    expect(sizeEntries(tree)).toEqual([`@cocokits/${fw}-core`]);
  });

  it.each(FRAMEWORKS)('fw %s: one subpath per component, no root entry', async (fw) => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'fw-core', framework: fw });
    await generate(tree, { kind: 'fw', framework: fw });
    const root = `packages/${fw}`;
    const placeholder = fw === 'angular' ? 'src/index.ts' : 'src/placeholder.ts';
    expect(
      missingFiles(tree, root, [...COMMON_FILES, placeholder, 'tests/exports.test.ts', ...BUILD_FILES[fw]]),
    ).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:fw-component', `scope:${fw}`, 'type:lib']);
    const pkg = readPackage(tree, root);
    expect(pkg.name).toBe(`@cocokits/${fw}`);
    expect(pkg.exports).toEqual({});
    expect(pkg.peerDependencies).toEqual(PEERS[fw]);
    expect(pkg.dependencies).toEqual({ [`@cocokits/${fw}-core`]: 'workspace:*' });
    expect(tsconfigPaths(tree)).not.toHaveProperty(`@cocokits/${fw}`);
    expect(readJson<{ extends: string }>(tree, `${root}/tsconfig.json`).extends).toBe('../../tsconfig.base.json');
    expect(tree.read(`${root}/eslint.config.mjs`, 'utf-8')).toContain("ignores: ['core/**']");
    expect(tree.read(`${root}/vitest.config.mjs`, 'utf-8')).toContain("'core/**'");
  });

  it('angular uses ng-packagr via @nx/angular:package and publishes from the output directory', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'fw', framework: 'angular' });
    const project = readJson<{ targets: Record<string, { executor: string; dependsOn?: string[] }> }>(
      tree,
      'packages/angular/project.json',
    );
    expect(project.targets['package']?.executor).toBe('@nx/angular:package');
    expect(project.targets['build']).toMatchObject({ executor: 'nx:run-commands', dependsOn: ['^build', 'package'] });
    expect(project.targets['build']).toMatchObject({
      options: { command: 'node ../../tools/scripts/finalize-ng-package.mjs --strip-root' },
    });
    const pkg = readPackage(tree, 'packages/angular');
    expect(pkg.files).toBeUndefined();
    expect(
      readJson<{ angularCompilerOptions: { compilationMode: string } }>(tree, 'packages/angular/tsconfig.lib.json')
        .angularCompilerOptions.compilationMode,
    ).toBe('partial');
    expect(pkg.publishConfig).toEqual({ access: 'public', directory: '../../dist/packages/angular' });
    expect(
      readJson<{ allowedNonPeerDependencies: string[] }>(tree, 'packages/angular/ng-package.json')
        .allowedNonPeerDependencies,
    ).toEqual(['^@cocokits/']);
    expect(readJson<{ dest: string }>(tree, 'packages/angular/ng-package.json').dest).toBe(
      '../../dist/packages/angular',
    );
    expect(rootDevDependencies(tree)).toMatchObject({
      '@angular/core': '20.4.2',
      '@angular/compiler-cli': '20.4.2',
      'ng-packagr': expect.any(String) as string,
    });
  });

  it('react builds with tsdown and jsx; vue with vite library mode and vue-tsc', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'fw', framework: 'react' });
    await generate(tree, { kind: 'fw', framework: 'vue' });
    expect(
      readJson<{ compilerOptions: { jsx: string } }>(tree, 'packages/react/tsconfig.json').compilerOptions.jsx,
    ).toBe('react-jsx');
    expect(rootDevDependencies(tree)).toMatchObject({ react: '19.1.0', 'react-dom': '19.1.0', vue: '3.4.9' });
    const vueBuild = readJson<{ targets: { build: { options: { commands: string[] } } } }>(
      tree,
      'packages/vue/project.json',
    ).targets.build.options.commands;
    expect(vueBuild.join(' ')).toContain('vue-tsc');
    expect(
      readJson<{ targets: { typecheck: { options: { commands: string[] } } } }>(tree, 'packages/vue/project.json')
        .targets.typecheck.options.commands[0],
    ).toContain('vue-tsc');
  });
});

describe('library generator: themes', () => {
  it('theme-core: a docs-data target', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'theme-core', theme: 'acme' });
    const { targets } = readJson<{ targets: Record<string, unknown> }>(tree, 'packages/themes/acme/core/project.json');
    expect(Object.keys(targets)).toEqual(['build', 'docs-data', 'typecheck', 'pack', 'publint', 'attw']);
    expect(targets['docs-data']).toEqual({
      executor: '@cocokits/workspace:docs-data',
      options: { source: 'theme' },
    });
  });

  it('theme-core: asset exports, sideEffects css, sass build', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'theme-core', theme: 'cocokits' });
    const root = 'packages/themes/cocokits/core';
    const expected = [...COMMON_FILES, 'src/index.ts', 'tests/index.test.ts', 'tsdown.config.mjs'];
    expect(missingFiles(tree, root, [...expected, 'scripts/build-css.mjs', 'src/styles/styles.scss'])).toEqual([]);
    expect(missingFiles(tree, root, ['src/styles/tokens.scss'])).toEqual([]);
    expect(readJson<{ name: string }>(tree, `${root}/project.json`).name).toBe('theme-cocokits');
    expect(readTags(tree, root)).toEqual(['layer:theme', 'scope:shared', 'type:lib']);
    const pkg = readPackage(tree, root);
    expect(pkg.name).toBe('@cocokits/theme-cocokits');
    expect(pkg.sideEffects).toEqual(['*.css']);
    expect(pkg.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './styles.css': './dist/styles.css',
      './tokens.css': './dist/tokens.css',
      './components/*.css': './dist/components/*.css',
    });
    expect(pkg.peerDependencies).toEqual({ '@cocokits/shared': 'workspace:*' });
    expect(readJson<{ extends: string }>(tree, `${root}/tsconfig.json`).extends).toBe('../../../../tsconfig.base.json');
    const build = readJson<{ targets: { build: { options: { commands: string[] } } } }>(tree, `${root}/project.json`);
    expect(build.targets.build.options.commands).toEqual([
      'tsdown -c tsdown.config.mjs --config-loader native',
      'node scripts/build-css.mjs',
    ]);
    expect(rootDevDependencies(tree)).toHaveProperty('sass');
    expect(sizeEntries(tree)).toEqual([
      '@cocokits/theme-cocokits',
      '@cocokits/theme-cocokits/styles.css',
      '@cocokits/theme-cocokits/tokens.css',
    ]);
  });

  it.each(FRAMEWORKS)('theme-fw %s: peers on core, framework packages and the framework', async (fw) => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'theme-fw', theme: 'cocokits', framework: fw });
    const root = `packages/themes/cocokits/${fw}`;
    expect(missingFiles(tree, root, [...COMMON_FILES, 'src/index.ts', ...BUILD_FILES[fw]])).toEqual([]);
    expect(readJson<{ name: string }>(tree, `${root}/project.json`).name).toBe(`theme-cocokits-${fw}`);
    expect(readTags(tree, root)).toEqual(['layer:theme', `scope:${fw}`, 'type:lib']);
    const pkg = readPackage(tree, root);
    expect(pkg.name).toBe(`@cocokits/theme-cocokits-${fw}`);
    expect(pkg.sideEffects).toBe(false);
    expect(pkg.peerDependencies).toEqual({
      '@cocokits/theme-cocokits': 'workspace:*',
      [`@cocokits/${fw}-core`]: 'workspace:*',
      [`@cocokits/${fw}`]: 'workspace:*',
      ...PEERS[fw],
    });
    expect(Object.keys(pkg.exports)).toEqual(fw === 'angular' ? [] : ['.']);
    expect(tsconfigPaths(tree)[`@cocokits/theme-cocokits-${fw}`]).toEqual([`./${root}/src/index.ts`]);
  });
});

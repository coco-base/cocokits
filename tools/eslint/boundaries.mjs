import nx from '@nx/eslint-plugin';

/**
 * Executable form of the dependency table: the tags of a project decide what it may import.
 * Tags: one layer:*, one scope:* (shared or a framework) and one type:* per project.
 * FRAMEWORKS lists the framework scopes that get their own constraints.
 */
const FRAMEWORKS = ['angular', 'react', 'vue'];

const TEST_FILES = ['**/tests/**', '**/*.test.*', '**/*.spec.ts', '**/*.ssr.test.*', '**/*.conformance.ts'];

/** External packages that scope:shared layers may import (a lint rule narrows each to its one module). */
const SHARED_EXTERNALS = ['alien-signals', '@floating-ui/dom', '@internationalized/*'];
const TEST_EXTERNALS = ['vitest', '@vitest/*', '@testing-library/*', 'vitest-axe'];
/** Build and test tools that tooling files (*.config.mjs, scripts/**) of any package may import; internal checks still apply. */
const TOOLING_FILES = ['**/*.config.mjs', '**/*.config.*.mjs', '**/scripts/**'];
const TOOLING_EXTERNALS = [
  'tsdown',
  'vite',
  '@vitejs/*',
  'vitest',
  'vitest/*',
  '@vitest/*',
  'sass',
  'ng-packagr',
  'eslint',
];

/** @param {{ test: boolean, tooling?: boolean }} options */
function createDepConstraints({ test, tooling = false }) {
  // Test files: @cocokits/cdk/testing (layer:cdk) for every lib; conformance tests for framework components and
  // framework themes.
  const cdkForTests = test ? ['layer:cdk'] : [];
  const fwTestExtras = test ? ['type:test'] : [];
  const testExternals = [...(test ? TEST_EXTERNALS : []), ...(tooling ? TOOLING_EXTERNALS : [])];

  const sharedLayer = (layer, allowed) => ({
    sourceTag: layer,
    onlyDependOnLibsWithTags: allowed,
    allowedExternalImports: [...SHARED_EXTERNALS, ...testExternals],
  });

  return [
    // layer:utils, layer:shared: nothing internal
    sharedLayer('layer:utils', [...cdkForTests]),
    sharedLayer('layer:shared', [...cdkForTests]),
    // layer:cdk: utils, shared, sibling cdk modules
    sharedLayer('layer:cdk', ['layer:utils', 'layer:shared', 'layer:cdk']),
    // layer:machine: utils, shared, cdk (never fw-core, never a framework package)
    sharedLayer('layer:machine', ['layer:utils', 'layer:shared', 'layer:cdk', 'layer:machine']),
    // layer:fw-core: utils, shared, cdk and its own framework; never a concrete machine
    {
      sourceTag: 'layer:fw-core',
      onlyDependOnLibsWithTags: ['layer:utils', 'layer:shared', 'layer:cdk', 'layer:fw-core'],
    },
    // layer:fw-component: utils, shared, cdk, machines, fw-core of the same scope; never a theme
    {
      sourceTag: 'layer:fw-component',
      onlyDependOnLibsWithTags: [
        'layer:utils',
        'layer:shared',
        'layer:cdk',
        'layer:machine',
        'layer:fw-core',
        'layer:fw-component',
        ...fwTestExtras,
      ],
    },
    // layer:theme + scope:shared (theme core): shared only
    {
      allSourceTags: ['layer:theme', 'scope:shared'],
      onlyDependOnLibsWithTags: ['layer:shared', ...cdkForTests],
    },
    // layer:theme + scope:<fw>: its core, fw-core, fw components, shared; never machines, cdk, another framework
    ...FRAMEWORKS.map((fw) => ({
      allSourceTags: ['layer:theme', `scope:${fw}`],
      onlyDependOnLibsWithTags: [
        'layer:theme',
        'layer:fw-core',
        'layer:fw-component',
        'layer:shared',
        ...cdkForTests,
        ...fwTestExtras,
      ],
    })),
    // type:test (conformance): shared, machines (spec only), cdk/testing; no framework package
    { sourceTag: 'type:test', onlyDependOnLibsWithTags: ['layer:shared', 'layer:machine', 'layer:cdk'] },
    // type:tool (the workspace plugin, the only tool project): no package of the library, only other tooling.
    { sourceTag: 'type:tool', onlyDependOnLibsWithTags: ['type:tool'] },
    // Scope rules: shared never reaches a framework; a framework project reaches itself and shared.
    // Test files of scope:shared projects may reach the framework packages.
    {
      sourceTag: 'scope:shared',
      onlyDependOnLibsWithTags: ['scope:shared', ...(test ? FRAMEWORKS.map((fw) => `scope:${fw}`) : [])],
    },
    ...FRAMEWORKS.map((fw) => ({
      sourceTag: `scope:${fw}`,
      onlyDependOnLibsWithTags: [`scope:${fw}`, 'scope:shared'],
    })),
  ];
}

/** Flat config blocks: production boundaries, then the test-file block with the additional allowances. */
export function createBoundariesConfig() {
  const rule = (/** @type {boolean} */ test, /** @type {boolean} */ tooling = false) => [
    'error',
    {
      enforceBuildableLibDependency: false,
      allow: [],
      banTransitiveDependencies: false,
      depConstraints: createDepConstraints({ test, tooling }),
    },
  ];
  return [
    {
      files: ['**/*.{ts,tsx,mts,cts,js,mjs,cjs,vue}'],
      plugins: { '@nx': nx },
      rules: { '@nx/enforce-module-boundaries': rule(false) },
    },
    {
      files: TOOLING_FILES,
      rules: { '@nx/enforce-module-boundaries': rule(false, true) },
    },
    {
      // Every package config imports the root config by relative path.
      files: ['**/eslint.config.mjs'],
      rules: { '@nx/enforce-module-boundaries': 'off' },
    },
    {
      files: TEST_FILES,
      rules: { '@nx/enforce-module-boundaries': rule(true) },
    },
  ];
}

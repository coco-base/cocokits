import nx from '@nx/eslint-plugin';

/**
 * Executable form of docs/style-guides/workspace/nx-tags-and-boundaries.md (dependency table).
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
  // Test files: @cocokits/cdk/testing (layer:cdk) for every lib; conformance, docs-stories and the preview apps
  // for framework components and framework themes; preview app story ids for the theme core.
  const cdkForTests = test ? ['layer:cdk'] : [];
  const fwTestExtras = test ? ['type:test', 'type:tool', 'type:app'] : [];
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
    // layer:theme + scope:shared (theme core): shared only (screenshot tests: preview apps)
    {
      allSourceTags: ['layer:theme', 'scope:shared'],
      onlyDependOnLibsWithTags: ['layer:shared', ...cdkForTests, ...(test ? ['type:app'] : [])],
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
    // type:tool (docs tooling with layer:docs, such as story-compiler, docs-stories and docs-shared: shared and other
    // docs tooling; workspace: nothing internal). The type tag cannot tell them apart, so both are allowed for all.
    { sourceTag: 'type:tool', onlyDependOnLibsWithTags: ['layer:shared', 'layer:docs'] },
    // type:e2e (docs-e2e): browser tests of the built site; imports no workspace project. Like every app it carries
    // layer:app, which no list above contains, so nothing imports it.
    { sourceTag: 'type:e2e', onlyDependOnLibsWithTags: [] },
    // Apps carry layer:app, which no list above contains, so no package imports an app.
    // type:app + scope:<fw> (preview-<fw>): fw, fw-core, themes, docs tooling, shared; no machines directly.
    // Consumer fixtures install packed tarballs and declare no workspace dependencies.
    ...FRAMEWORKS.map((fw) => ({
      allSourceTags: ['type:app', `scope:${fw}`],
      onlyDependOnLibsWithTags: ['layer:fw-component', 'layer:fw-core', 'layer:theme', 'layer:shared', 'type:tool'],
    })),
    // type:app + scope:shared (docs): shared, docs tooling, machines, theme core; no framework package
    {
      allSourceTags: ['type:app', 'scope:shared'],
      onlyDependOnLibsWithTags: ['layer:shared', 'type:tool', 'layer:machine', 'layer:theme'],
    },
    // Scope rules: shared never reaches a framework; a framework project reaches itself and shared.
    // Test files of scope:shared projects may reach the preview apps of every framework.
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

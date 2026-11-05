/**
 * Config of the `cycles` target (dependency-cruiser): a layer imports only from the layers to its left, and the tags of the project decide the rest.
 * Run from the repository root: `depcruise <projectRoot> --config .dependency-cruiser.cjs`.
 *
 * Rules:
 * - no-circular: no import cycle. `import type` counts as an edge (tsPreCompilationDeps).
 * - no-relative-cross-component: a component folder imports another component folder only through that folder's
 *   entry (`index.ts`, or `testing/index.ts`). Aliases resolve to the entry, so they pass; a deeper path fails.
 *
 * Component folders: one per machine, per framework component and per cdk module. `internal/` (React, Vue) holds
 * package helpers, not components, so importing it is allowed. A nested project (`<fw>/core`) is excluded.
 */

/** Root of the folders that hold components, and the folders under it that are not components. */
const COMPONENT_ROOTS = [
  { root: 'packages/machines', notComponent: ['tests'] },
  { root: 'packages/cdk/src', notComponent: [] },
  { root: 'packages/angular', notComponent: ['core', 'src', 'tests', 'scripts'] },
  { root: 'packages/react/src', notComponent: ['internal'] },
  { root: 'packages/vue/src', notComponent: ['internal'] },
  // Fixtures of the check itself: tools/workspace-plugin/src/checks/dependency-cycles.spec.ts
  { root: 'tools/workspace-plugin/test-fixtures/dependency-cycles/[^/]+/components', notComponent: ['internal'] },
];

const ENTRY = String.raw`/(testing/)?index\.ts$`;

/** Regex for a file inside any component folder of one root. */
function inComponent(root, notComponent) {
  const skip = notComponent.length > 0 ? `(?!(?:${notComponent.join('|')})/)` : '';
  return `^${root}/${skip}([^/]+)/`;
}

const crossComponentRules = COMPONENT_ROOTS.map(({ root, notComponent }) => ({
  name: 'no-relative-cross-component',
  comment:
    'A component folder imports another component folder only through its entry (index.ts). Import the entry, never a file inside the folder.',
  severity: 'error',
  from: { path: inComponent(root, notComponent) },
  to: {
    path: inComponent(root, notComponent),
    // Same folder: `$1` is the folder name captured in `from.path`.
    pathNot: [`^${root}/$1/`, `^${root}/[^/]+${ENTRY}`],
  },
}));

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Components may import each other as long as no cycle forms. Type-only imports count. Break the cycle: the contract stays with the component that owns it.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    ...crossComponentRules,
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.base.json' },
    tsPreCompilationDeps: true,
    doNotFollow: { path: 'node_modules' },
    // Build output is not source, and a build running at the same time rewrites it under the check.
    exclude: { path: ['^packages/(angular|react|vue)/core/', '/dist/'] },
    includeOnly: '^(packages|tools/workspace-plugin/test-fixtures)/',
    moduleSystems: ['es6', 'cjs'],
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.mts', '.js', '.mjs', '.cjs', '.vue', '.json'],
    },
    reporterOptions: { text: { highlightFocused: false } },
  },
};

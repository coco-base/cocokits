/**
 * Entry-point rule, independent of module resolution: it works on the import
 * specifier, so it holds before a package has any entry point or tsconfig path.
 *  - No root import of the packages without a root entry (cdk, machines, angular, react, vue).
 *  - No deep import beyond the listed subpaths: `@cocokits/<pkg>/src/...`, `@cocokits/cdk/<module>/...`,
 *    `@cocokits/machines/<name>/...`, `@cocokits/<fw>/<component>/...` (except `@cocokits/angular/<component>/testing`),
 *    any subpath of the root-only packages; theme packages only expose their CSS asset files.
 */
const ROOTLESS = ['cdk', 'machines', 'angular', 'react', 'vue'];
const ROOT_ONLY = ['utils', 'shared', 'icons', 'angular-core', 'react-core', 'vue-core'];

const MESSAGE_ROOT = (name) =>
  `@cocokits/${name} has no root entry. Import a subpath: @cocokits/${name}/<${name === 'cdk' ? 'module' : name === 'machines' ? 'name' : 'component'}>.`;

/** Restricted-import patterns (gitignore syntax, later negations win). */
const DEEP_PATTERNS = [
  {
    group: ['@cocokits/*/src', '@cocokits/*/src/**', '@cocokits/*/dist', '@cocokits/*/dist/**'],
    message: 'Import the package entry point, never its source or build folders.',
  },
  { group: ROOT_ONLY.map((name) => `@cocokits/${name}/**`), message: 'This package has a root entry only.' },
  { group: ['@cocokits/cdk/*/**'], message: 'Import @cocokits/cdk/<module>, not a file inside it.' },
  { group: ['@cocokits/machines/*/**'], message: 'Import @cocokits/machines/<name>, not a file inside it.' },
  {
    group: ['@cocokits/react/*/**', '@cocokits/vue/*/**'],
    message: 'Import @cocokits/<fw>/<component>, not a file inside it.',
  },
  {
    group: ['@cocokits/angular/*/**', '!@cocokits/angular/*/testing'],
    message: 'Import @cocokits/angular/<component> or @cocokits/angular/<component>/testing only.',
  },
  {
    group: [
      '@cocokits/theme-*/*',
      '!@cocokits/theme-*/styles.css',
      '!@cocokits/theme-*/tokens.css',
      '!@cocokits/theme-*/components',
    ],
    message: 'Themes expose only styles.css, tokens.css and components/<component>.css.',
  },
  {
    group: ['@cocokits/theme-*/*/*', '!@cocokits/theme-*/components/*.css'],
    message: 'Themes expose only styles.css, tokens.css and components/<component>.css.',
  },
];

export function createEntryPointConfig() {
  return [
    {
      files: ['**/*.{ts,tsx,mts,cts,js,mjs,cjs,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ROOTLESS.map((name) => ({ name: `@cocokits/${name}`, message: MESSAGE_ROOT(name) })),
            patterns: DEEP_PATTERNS,
          },
        ],
      },
    },
  ];
}

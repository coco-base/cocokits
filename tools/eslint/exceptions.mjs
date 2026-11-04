/**
 * Every lint exception of the repo: docs/style-guides/workspace/targets.md#lint-exceptions.
 * Listed last in eslint.config.mjs, so an entry wins over the rule it turns off.
 */
const EXCEPTIONS = [
  {
    files: ['packages/angular/core/src/listen-last.ts'],
    rules: ['no-restricted-properties'],
    reason:
      'listenLast runs an overlay trigger or Close activation after the consumer listeners so their preventDefault vetoes it; listenFirst runs a disabled link click guard before them (RouterLink). Host listeners can do neither.',
  },
  {
    files: ['packages/angular/button/tests/button-anchor.test.ts', 'packages/angular/button/tests/button-rtl.test.ts'],
    rules: ['no-restricted-properties'],
    reason: 'The test registers a consumer click listener on the host element, as a consumer would.',
  },
  {
    files: ['packages/themes/cocokits/angular/tests/button-theme.test.ts'],
    rules: ['no-restricted-syntax'],
    reason: 'Asserts the public class name; a theme layer cannot import the machine anatomy (layer rules).',
  },
  {
    files: ['packages/themes/cocokits/angular/tests/ssr.test.ts'],
    rules: ['@typescript-eslint/no-extraneous-class'],
    reason: 'A template-only test component: the decorator is its only content.',
  },
];

/** Files ESLint does not read at all, each with its reason. */
const IGNORED = [
  {
    files: ['tools/workspace-plugin/test-fixtures/**'],
    reason: 'Fixtures of the cycle check: deliberate cycles and .vue imports.',
  },
];

/** @param {{ rootDir: string }} options */
export function createExceptionsConfig({ rootDir }) {
  return [
    ...IGNORED.map(({ files, reason }) => ({ name: `cocokits/ignored: ${reason}`, basePath: rootDir, ignores: files })),
    ...EXCEPTIONS.map(({ files, rules, reason }) => ({
      name: `cocokits/exception: ${reason}`,
      basePath: rootDir,
      files,
      rules: Object.fromEntries(rules.map((rule) => [rule, 'off'])),
    })),
  ];
}

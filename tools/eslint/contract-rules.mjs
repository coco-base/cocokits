/**
 * Lint form of two Angular rules: no `cck-` class string literal and no manual `addEventListener` or
 * `removeEventListener`.
 *
 * Covers the Angular packages, and the Angular theme layers (ANGULAR_FILES), tests included. Exceptions are
 * entries in `tools/eslint/exceptions.mjs`.
 * Not covered: templates (`.html` files and inline templates), `Renderer2.listen`, `@HostListener`; review owns them.
 */
const ANGULAR_FILES = ['packages/angular/**/*.ts', 'packages/themes/*/angular/**/*.ts'];

const CLASS_LITERAL_MESSAGE =
  'Typed "cck-" class string. Bind the class the machine returns; never restate it as a literal.';
const LISTENER_MESSAGE =
  'Manual event listener. Use a host binding or a template listener; a justified exception is an entry in tools/eslint/exceptions.mjs.';

const CLASS_LITERAL_SELECTORS = [
  "Property[key.name='class'] > Literal[value=/^cck-/]",
  "Property[key.value='class'] > Literal[value=/^cck-/]",
  "CallExpression[callee.object.property.name='classList'] > Literal[value=/^cck-/]",
  'CallExpression[callee.property.name=/^(addClass|removeClass)$/] > Literal[value=/^cck-/]',
];

/**
 * Flat config block. Patterns are relative to `rootDir`, so they match from any project's own config.
 *
 * @param {{ rootDir: string }} options
 */
export function createContractConfig({ rootDir }) {
  return [
    {
      name: 'cocokits/contract: rules for Angular code',
      basePath: rootDir,
      files: ANGULAR_FILES,
      rules: {
        'no-restricted-syntax': [
          'error',
          ...CLASS_LITERAL_SELECTORS.map((selector) => ({ selector, message: CLASS_LITERAL_MESSAGE })),
        ],
        'no-restricted-properties': [
          'error',
          { property: 'addEventListener', message: LISTENER_MESSAGE },
          { property: 'removeEventListener', message: LISTENER_MESSAGE },
        ],
      },
    },
  ];
}

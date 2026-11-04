/**
 * Lint form of two Angular rules: no `cck-` class string literal (architecture §10) and no manual `addEventListener` or
 * `removeEventListener` (docs/style-guides/angular/host-bindings-and-data-attrs.md).
 *
 * Covers the Angular packages, the Angular theme layers and the Angular preview app (ANGULAR_FILES), tests included. Exceptions:
 * docs/style-guides/workspace/targets.md#lint-exceptions.
 * Not covered: templates (`.html` files and inline templates), `Renderer2.listen`, `@HostListener`; review owns them.
 */
const ANGULAR_FILES = ['packages/angular/**/*.ts', 'packages/themes/*/angular/**/*.ts', 'apps/preview-angular/**/*.ts'];

const CLASS_LITERAL_MESSAGE = 'Typed "cck-" class string. Rule: docs/architecture.md section 10 item 3.';
const LISTENER_MESSAGE =
  'Manual event listener. Rule: docs/style-guides/angular/host-bindings-and-data-attrs.md. Exceptions: docs/style-guides/workspace/targets.md#lint-exceptions.';

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

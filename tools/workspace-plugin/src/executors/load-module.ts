import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

/**
 * The executors are compiled to CommonJS by Nx, so a plain `import()` would become a `require()` of the wrong
 * kind. `require` loads an ES module that has no top-level `await`, which a built package and the Angular
 * compiler have not. The root only gives `require` a base path.
 */
function requireFrom(root: string): NodeJS.Require {
  return createRequire(resolve(root, 'package.json'));
}

/**
 * Loads a built ES module (a package's `dist` file) and returns its exports.
 *
 * @param root - The workspace root.
 * @param file - The absolute path of the module.
 * @param hint - What to run when the file is missing, for example `run the build first`.
 */
export function loadBuiltModule(root: string, file: string, hint: string): Record<string, unknown> {
  if (!existsSync(file)) throw new Error(`${file} does not exist; ${hint}`);
  return requireFrom(root)(file) as Record<string, unknown>;
}

/** Loads an installed package by name, resolved from the workspace root. */
export function loadPackage(root: string, name: string): unknown {
  return requireFrom(root)(name);
}

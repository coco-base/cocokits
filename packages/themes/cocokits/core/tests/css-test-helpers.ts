import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

/** Reads a file below the theme package root, for example `read('dist', 'styles.css')`. */
export const read = (...path: string[]): string => readFileSync(join(root, ...path), 'utf8');

/** The declarations of the rule whose selector is exactly `selector`, or undefined. */
export function declarationsOf(css: string, selector: string): string | undefined {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
}

/** The compiled token stylesheet. */
export const tokensCss: string = read('dist', 'tokens.css');

/** The value of `--cck-<name>` in the declarations `block`, or undefined. */
const valueIn = (block: string | undefined, name: string): string | undefined =>
  block
    ?.split(';')
    .flatMap((line) => (line.trim().startsWith(`--cck-${name}:`) ? [line.slice(line.indexOf(':') + 1).trim()] : []))[0];

/**
 * The value of `--cck-<name>` in the size mode block of `root` (`.cck-button`, mode `md`), or undefined. The default
 * mode's block also holds the bare root selector.
 */
export function sizeTokenOf(root: string, mode: string, name: string): string | undefined {
  const selector = `${root}[data-size=${mode}]`;
  return valueIn(declarationsOf(tokensCss, selector) ?? declarationsOf(tokensCss, `${root}, ${selector}`), name);
}

/** The value of `--cck-<name>` in the structure block of `root`, or undefined. */
export const structureTokenOf = (root: string, name: string): string | undefined =>
  valueIn(declarationsOf(tokensCss, root), name);

/** A token reference as the generated sheet writes an alias: `ref('size-36')` is `var(--cck-size-36)`. */
export const ref = (name: string): string => `var(--cck-${name})`;

/** The selectors of every rule that names a CocoKits class. */
export const selectorsOf = (css: string): string[] =>
  [...css.matchAll(/(?:^|[{}])\s*([^{}@]+?)\s*\{/g)].map((match) => match[1]).filter((s) => s.includes('.cck-'));

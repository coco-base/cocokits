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
export const tokensCss = read('dist', 'tokens.css');

/** The selectors of every rule that names a CocoKits class. */
export const selectorsOf = (css: string): string[] =>
  [...css.matchAll(/(?:^|[{}])\s*([^{}@]+?)\s*\{/g)].map((match) => match[1]).filter((s) => s.includes('.cck-'));

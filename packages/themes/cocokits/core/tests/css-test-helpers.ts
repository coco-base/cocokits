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

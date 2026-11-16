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

/** The selector list and the declarations of every token rule whose list holds `selector` as one of its items. */
const tokenRules = (selector: string): { selectors: string; body: string }[] =>
  [...tokensCss.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^}]*)\}/g)]
    .filter((match) => match[1].split(',').some((item) => item.trim() === selector))
    .map((match) => ({ selectors: match[1], body: match[2] }));

/**
 * The value of `--cck-<name>` in the size mode block of `root` (`.cck-button`, mode `md`), or undefined. The block
 * may share its selector list with the default mode (the bare root) or with another root (`alsoFor`).
 */
export const sizeTokenOf = (root: string, mode: string, name: string): string | undefined =>
  valueIn(tokenRules(`${root}[data-size=${mode}]`)[0]?.body, name);

/** The value of `--cck-<name>` in the structure block of `root` (the rule with no size mode), or undefined. */
export const structureTokenOf = (root: string, name: string): string | undefined =>
  tokenRules(root)
    .filter((rule) => !rule.selectors.includes('[data-size='))
    .map((rule) => valueIn(rule.body, name))
    .find((value) => value !== undefined);

/** A token reference as the generated sheet writes an alias: `ref('size-36')` is `var(--cck-size-36)`. */
export const ref = (name: string): string => `var(--cck-${name})`;

/** The selectors of every rule that names a CocoKits class. */
export const selectorsOf = (css: string): string[] =>
  [...css.matchAll(/(?:^|[{}])\s*([^{}@]+?)\s*\{/g)].map((match) => match[1]).filter((s) => s.includes('.cck-'));

/**
 * The declarations of the rule whose selector list holds `selector` as one item, or undefined. The parts that share a
 * look (the four kinds of Menu item, the Menu content and the submenu content) are written as one rule with a list.
 */
export function declarationsInList(css: string, selector: string): string | undefined {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*(?:[^{}]*,\\s*)?${escaped}\\s*(?:,[^{}]*)?\\{([^}]*)\\}`).exec(css)?.[1];
}

/** The declarations of every rule whose selector list holds `selector` as one item, joined (the rules of one part). */
export function declarationsOfAll(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = `(?:^|[{}])\\s*(?:[^{}]*,\\s*)?${escaped}\\s*(?:,[^{}]*)?\\{([^}]*)\\}`;
  return [...css.matchAll(new RegExp(pattern, 'g'))].map((match) => match[1]).join('\n');
}

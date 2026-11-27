import { describe, expect, it } from 'vitest';
import { read } from './css-test-helpers';

/** One rule of the built sheet: its selector items and its declarations. Keyframe steps and at-rule headers are no rules. */
interface Rule {
  readonly selectors: readonly string[];
  readonly body: string;
}

const css = read('dist', 'styles.css').replace(/\/\*[\s\S]*?\*\//g, '');

/** The innermost `selector { declarations }` blocks, outside `@keyframes` and `@property`. */
function rulesOf(source: string): Rule[] {
  const withoutKeyframes = source.replace(/@(?:keyframes|property)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  return [...withoutKeyframes.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].map((match) => ({
    selectors: splitTopLevel(match[1], ','),
    body: match[2],
  }));
}

/** Splits at `separator` outside parentheses and brackets. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char === '(' || char === '[') depth += 1;
    if (char === ')' || char === ']') depth -= 1;
    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts.filter(Boolean);
}

/** The subject of a selector item: its last compound, with every functional pseudo-class (`:is()`, `:not()`) removed. */
function subjectOf(item: string): string {
  let flat = item;
  for (let before = ''; before !== flat;) {
    before = flat;
    flat = flat.replace(/:[\w-]+\([^()]*\)/g, '');
  }
  const compounds = flat
    .replace(/\[[^\]]*\]/g, (attr) => attr.replace(/[\s>+~]/g, '_'))
    .split(/\s*[>+~]\s*|\s+/)
    .filter(Boolean);
  return compounds[compounds.length - 1] ?? '';
}

/** `.cck-chip__remove` or `.cck-chip::after`: the part class and the pseudo-element a rule styles, or undefined. */
function elementKey(item: string): string | undefined {
  const subject = subjectOf(item);
  const part = /\.cck-[\w-]+/.exec(subject)?.[0];
  if (part === undefined) return undefined;
  const pseudo = /::(?:before|after)/.exec(subject)?.[0];
  if (pseudo === undefined && subject.includes('::')) return undefined;
  return `${part}${pseudo ?? ''}`;
}

const rules = rulesOf(css);
const BORDER_BOX = /(?:^|;|\s)box-sizing:\s*border-box/;

/** Every selector item that styles a `.cck-*` part, by the key of its subject. */
const sites = new Map<string, { item: string; declares: boolean; content: boolean }[]>();
for (const rule of rules)
  for (const item of rule.selectors) {
    const key = elementKey(item);
    if (key === undefined) continue;
    sites.set(key, [
      ...(sites.get(key) ?? []),
      { item, declares: BORDER_BOX.test(rule.body), content: /(?:^|;|\s)content:/.test(rule.body) },
    ]);
  }

/** A part class is styled when a rule has it as its subject; a pseudo-element only counts with `content`. */
const elements = [...sites.entries()].filter(([key, list]) => !key.includes('::') || list.some((site) => site.content));

describe('box-sizing', () => {
  it('finds the elements the theme styles', () => {
    expect(elements.length).toBeGreaterThan(80);
  });

  it.each(elements.map(([key]) => key))('%s declares box-sizing: border-box', (key) => {
    expect(sites.get(key)?.some((site) => site.declares)).toBe(true);
  });

  it('declares box-sizing once per element', () => {
    const twice = elements
      .map(([key, list]) => [key, [...new Set(list.filter((site) => site.declares).map((site) => site.item))]] as const)
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => `${key}: ${items.join(' | ')}`);
    expect(twice).toEqual([]);
  });
});

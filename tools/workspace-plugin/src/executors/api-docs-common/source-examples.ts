import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { oneLine, readTsDoc } from './jsdoc';
import type { ApiDocJson, ApiMemberJson } from './types';

const SOURCE_FILE = /\.(?:tsx?|vue)$/;
const NOT_SOURCE = /\.d\.ts$|\.(?:spec|test)\./;
const SKIPPED_FOLDERS = new Set(['node_modules', 'dist', 'tests', 'test', '__tests__']);
const COMMENT = /\/\*\*[\s\S]*?\*\//g;

function sourceFilesOf(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : sourceFilesOf(path);
    return SOURCE_FILE.test(entry.name) && !NOT_SOURCE.test(entry.name) ? [path] : [];
  });
}

/**
 * Every `@example` of the `.ts`, `.tsx` and `.vue` files under `<root>/packages/`, read to its end ({@link readTsDoc})
 * with its white space folded ({@link oneLine}). Tests, `.d.ts` files, `dist` and `node_modules` are not read. A
 * member can be declared in any package, so the whole folder is read. `more` are further folders to read, such as the
 * project of the run when it is not below `packages/`.
 */
export function sourceExamplesOf(root: string, ...more: string[]): Set<string> {
  const examples = new Set<string>();
  const files = [join(root, 'packages'), ...more].filter((folder) => existsSync(folder)).flatMap(sourceFilesOf);
  for (const file of files) {
    for (const [comment] of readFileSync(file, 'utf8').matchAll(COMMENT)) {
      for (const tag of readTsDoc(comment).tags) if (tag.name === 'example') examples.add(oneLine(tag.comment));
    }
  }
  return examples;
}

function checkExamples(
  label: string,
  examples: readonly string[] | undefined,
  known: ReadonlySet<string>,
  problems: string[],
): void {
  for (const example of examples ?? []) {
    if (!known.has(oneLine(example)))
      problems.push(`${label}: @example is not the whole source example: "${example.slice(0, 40)}"`);
  }
}

/**
 * One problem per `examples` entry of the `ApiDoc` (parts, members, slots, symbols) that is no whole `@example` of the
 * source (`known`, from {@link sourceExamplesOf}), such as a text the TypeScript parser cut at an `@`.
 */
export function exampleProblems(doc: ApiDocJson, known: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const members = (label: string, list: readonly ApiMemberJson[], suffix = ''): void => {
    for (const member of list) checkExamples(`${label}.${member.name}${suffix}`, member.examples, known, problems);
  };
  const base = `${doc.framework}/${doc.component}`;
  for (const part of doc.parts) {
    const label = `${base} ${part.name}`;
    checkExamples(label, part.examples, known, problems);
    members(label, part.props);
    members(label, part.events);
    members(label, part.methods, '()');
    for (const slot of part.slots) checkExamples(`${label} slot ${slot.name}`, slot.examples, known, problems);
  }
  for (const symbol of doc.symbols ?? []) {
    const label = `${base} ${symbol.kind} ${symbol.name}`;
    checkExamples(label, symbol.examples, known, problems);
    members(label, symbol.props);
    members(label, symbol.methods, '()');
  }
  for (const type of doc.types ?? []) members(`${base} type ${type.name}`, type.fields);
  return problems;
}

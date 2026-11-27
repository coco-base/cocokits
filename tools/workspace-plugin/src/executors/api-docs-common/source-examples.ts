import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { insideRoot } from '../inside-root';
import { oneLine, readTsDoc } from './jsdoc';
import type { ApiDocJson, ApiMemberJson } from './types';

const SOURCE_FILE = /\.(?:tsx?|vue)$/;
const NOT_SOURCE = /\.d\.ts$|\.(?:spec|test)\./;
const SKIPPED_FOLDERS = new Set(['node_modules', 'dist', 'tests', 'test', '__tests__']);

/** The regular source files below a folder; a symbolic link is neither a file nor a folder here, so it is skipped. */
function sourceFilesOf(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : sourceFilesOf(path);
    return entry.isFile() && SOURCE_FILE.test(entry.name) && !NOT_SOURCE.test(entry.name) ? [path] : [];
  });
}

/** The `/** *\/` comments of a text, found by two searches for each: no regular expression retries on a long text. */
function* docCommentsOf(text: string): Generator<string> {
  let from = 0;
  for (;;) {
    const start = text.indexOf('/**', from);
    if (start === -1) return;
    const end = text.indexOf('*/', start + 2);
    if (end === -1) return;
    yield text.slice(start, end + 2);
    from = end + 2;
  }
}

/**
 * Every `@example` of the `.ts`, `.tsx` and `.vue` files under `<root>/packages/`, read to its end ({@link readTsDoc})
 * with its white space folded ({@link oneLine}). Tests, `.d.ts` files, `dist`, `node_modules` and symbolic links are
 * not read. A member can be declared in any package, so the whole folder is read. `additionalSourceFolders` are
 * further folders to read, such as the project of the run when it is not below `packages/`. Each folder must stay
 * inside the workspace `root` ({@link insideRoot}).
 */
export function sourceExamplesOf(root: string, ...additionalSourceFolders: string[]): Set<string> {
  const examples = new Set<string>();
  const folders = [join(root, 'packages'), ...additionalSourceFolders]
    .filter((folder) => existsSync(folder))
    .map((folder) => insideRoot(root, folder, 'source folder'));
  for (const file of folders.flatMap(sourceFilesOf)) {
    for (const comment of docCommentsOf(readFileSync(file, 'utf8'))) {
      for (const tag of readTsDoc(comment).tags) if (tag.name === 'example') examples.add(oneLine(tag.comment));
    }
  }
  return examples;
}

function checkExamples(
  label: string,
  examples: readonly string[] | undefined,
  sourceExamples: ReadonlySet<string>,
  problems: string[],
): void {
  for (const example of examples ?? []) {
    if (!sourceExamples.has(oneLine(example)))
      problems.push(`${label}: @example is not the whole source example: "${example.slice(0, 40)}"`);
  }
}

/**
 * One problem per `examples` entry of the `ApiDoc` (parts, members, slots, symbols) that is no whole `@example` of the
 * source (`sourceExamples`, from {@link sourceExamplesOf}), such as a text the TypeScript parser cut at an `@`.
 */
export function exampleProblems(doc: ApiDocJson, sourceExamples: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const members = (label: string, list: readonly ApiMemberJson[], suffix = ''): void => {
    for (const member of list)
      checkExamples(`${label}.${member.name}${suffix}`, member.examples, sourceExamples, problems);
  };
  const base = `${doc.framework}/${doc.component}`;
  for (const part of doc.parts) {
    const label = `${base} ${part.name}`;
    checkExamples(label, part.examples, sourceExamples, problems);
    members(label, part.props);
    members(label, part.events);
    members(label, part.methods, '()');
    for (const slot of part.slots) checkExamples(`${label} slot ${slot.name}`, slot.examples, sourceExamples, problems);
  }
  for (const symbol of doc.symbols ?? []) {
    const label = `${base} ${symbol.kind} ${symbol.name}`;
    checkExamples(label, symbol.examples, sourceExamples, problems);
    members(label, symbol.props);
    members(label, symbol.methods, '()');
  }
  for (const type of doc.types ?? []) members(`${base} type ${type.name}`, type.fields);
  return problems;
}

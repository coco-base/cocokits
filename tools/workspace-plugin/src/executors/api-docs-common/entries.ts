import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { posix } from '../posix-path';

/** Folders of `src` that are never component entry points. */
const NOT_ENTRY_POINTS = new Set(['internal', 'generated']);

/** A component name is kebab-case: it becomes the file name of its `ApiDoc` and a semantic id prefix. */
const ENTRY_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/**
 * The component entry points of a React or Vue package: the kebab-case folders of `<projectRoot>/src` that hold an
 * `index.ts`, by name. A folder with another name is not an entry point, so a folder name never reaches a file path.
 */
export function srcEntryPointsOf(projectRoot: string): { name: string; dir: string; file: string }[] {
  const src = join(projectRoot, 'src');
  if (!existsSync(src)) return [];
  return readdirSync(src, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !NOT_ENTRY_POINTS.has(item.name) && ENTRY_NAME.test(item.name))
    .filter((item) => existsSync(join(src, item.name, 'index.ts')))
    .map((item) => ({
      name: item.name,
      dir: posix(join(src, item.name)),
      file: posix(join(src, item.name, 'index.ts')),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** An entry point of a framework-free package: the module that is read, and the export names it lists (none: all). */
export interface ModuleEntry {
  name: string;
  file: string;
  only?: ReadonlySet<string>;
}

/**
 * The entry points of a framework-free package (`cdk`, `utils`): the folders of `src` with an `index.ts` (one entry
 * each, all its exports), else the files that `src/index.ts` re-exports from (`export { a } from './a'`, one entry
 * each, the names that line exports). A file with a name that is not kebab-case is none, so a name never reaches a
 * file path.
 */
export function moduleEntryPointsOf(projectRoot: string): ModuleEntry[] {
  const folders = srcEntryPointsOf(projectRoot);
  if (folders.length > 0) return folders.map(({ name, file }) => ({ name, file }));
  const index = join(projectRoot, 'src', 'index.ts');
  if (!existsSync(index)) return [];
  const source = ts.createSourceFile(index, readFileSync(index, 'utf8'), ts.ScriptTarget.Latest);
  const found = new Map<string, { file: string; names: Set<string> | undefined }>();
  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement) || statement.moduleSpecifier === undefined) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.startsWith('./')) continue;
    const name = basename(statement.moduleSpecifier.text);
    if (!ENTRY_NAME.test(name))
      throw new Error(`${index}: "${statement.moduleSpecifier.text}" is not a kebab-case file`);
    const entry = found.get(name) ?? { file: posix(join(projectRoot, 'src', `${name}.ts`)), names: new Set<string>() };
    const clause = statement.exportClause;
    if (clause !== undefined && ts.isNamedExports(clause) && entry.names !== undefined) {
      for (const element of clause.elements) entry.names.add(element.name.text);
    } else entry.names = undefined;
    found.set(name, entry);
  }
  return [...found]
    .map(([name, { file, names }]) => ({ name, file, ...(names === undefined ? {} : { only: names }) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

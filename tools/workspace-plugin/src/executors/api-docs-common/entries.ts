import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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

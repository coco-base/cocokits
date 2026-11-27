import { lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const isInside = (root: string, path: string): boolean => {
  const rel = relative(root, path);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
};

function existsAsLink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

/** The real path of `path`, or of its nearest existing ancestor; a dangling link fails. */
function realAncestor(path: string): string {
  let probe = path;
  for (;;) {
    try {
      lstatSync(probe);
      return realpathSync(probe);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !isAbsolute(probe) || dirname(probe) === probe) {
        throw error;
      }
      // A dangling link reports ENOENT from realpath but exists for lstat.
      if (existsAsLink(probe)) throw error;
      probe = dirname(probe);
    }
  }
}

/**
 * Resolves a configured path against the workspace root and fails when it leaves the root, by its text
 * or through a symlink or junction (the real path of the path, or of its nearest existing ancestor).
 * Every path option of every executor goes through it.
 */
export function insideRoot(root: string, path: string, option: string): string {
  const resolved = resolve(root, path);
  if (!isInside(resolve(root), resolved) || !isInside(realpathSync(root), realAncestor(resolved))) {
    throw new Error(`${option}: "${path}" is outside the workspace`);
  }
  return resolved;
}

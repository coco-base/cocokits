import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { posix } from '../../posix-path';

export const REPO = resolve(import.meta.dirname, '..', '..', '..', '..', '..', '..');
const PLUGIN = resolve(REPO, 'tools', 'workspace-plugin');

/** A scratch area of one spec, in the plugin's `tmp` folder: ignored by git, ESLint and the type check, and below the
 * workspace, so `react` and `vue` resolve. Each spec has its own area, because the specs run in parallel. */
export function scratchArea(spec: string): {
  dir: string;
  clean: () => void;
  create: (name: string, files: Record<string, string>, tsConfig: object) => { project: string; tsConfig: string };
  context: (name: string) => never;
} {
  const dir = join(PLUGIN, 'tmp', spec);
  return {
    dir,
    clean: () => {
      rmSync(dir, { recursive: true, force: true });
    },
    /** A package `pkg` with the given files (paths relative to it) and a `tsconfig.lib.json`. */
    create: (name, files, tsConfig) => {
      const project = join(dir, name, 'pkg');
      rmSync(join(dir, name), { recursive: true, force: true });
      for (const [path, text] of Object.entries(files)) {
        mkdirSync(join(project, path, '..'), { recursive: true });
        writeFileSync(join(project, path), text);
      }
      const file = join(project, 'tsconfig.lib.json');
      writeFileSync(file, JSON.stringify({ extends: posix(join(REPO, 'tsconfig.base.json')), ...tsConfig }));
      return { project, tsConfig: file };
    },
    /** The executor context of the package `pkg` of a scratch package. */
    context: (name) =>
      ({
        root: REPO,
        projectName: 'fixture',
        projectsConfigurations: {
          projects: { fixture: { root: posix(`tools/workspace-plugin/tmp/${spec}/${name}/pkg`) } },
        },
      }) as never,
  };
}

/**
 * Runs `check` with a junction at `link` that points to an empty folder outside the workspace. Returns without a check
 * when the OS refuses to create the link.
 */
export async function withJunction(link: string, check: (outside: string) => Promise<void>): Promise<void> {
  const outside = mkdtempSync(join(tmpdir(), 'api-docs-outside-'));
  try {
    try {
      symlinkSync(outside, link, 'junction');
    } catch {
      return;
    }
    await check(outside);
  } finally {
    rmSync(link, { force: true });
    rmSync(outside, { recursive: true, force: true });
  }
}

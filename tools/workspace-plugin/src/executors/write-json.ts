import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** One file an executor writes: its name in the output folder and the value to serialize. */
export interface JsonFile {
  readonly name: string;
  readonly data: unknown;
}

/**
 * Replaces the JSON files of an output folder with `files`: two-space JSON with a final line feed, so the same data
 * gives the same bytes, and a removed component leaves no stale file. A file whose bytes would not change is not
 * written, so a dev server that watches the folder sees no change from a run that changed nothing. Other files of the
 * folder are left alone.
 */
export function writeJsonFiles(dir: string, files: readonly JsonFile[]): void {
  mkdirSync(dir, { recursive: true });
  const names = new Set(files.map((file) => file.name));
  for (const existing of readdirSync(dir)) {
    if (existing.endsWith('.json') && !names.has(existing)) rmSync(join(dir, existing));
  }
  for (const file of files) {
    const path = join(dir, file.name);
    const text = `${JSON.stringify(file.data, null, 2)}\n`;
    if (!existsSync(path) || readFileSync(path, 'utf8') !== text) writeFileSync(path, text);
  }
}

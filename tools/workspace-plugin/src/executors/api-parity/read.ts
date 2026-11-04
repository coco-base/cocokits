import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiDocJson } from '../api-docs-common/types';

const MAX_BYTES = 5_000_000;
const FRAMEWORKS = new Set(['angular', 'react', 'vue']);
const KINDS = ['props', 'events', 'slots', 'methods'] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function memberProblem(kind: string, member: unknown): string | undefined {
  if (!isObject(member) || typeof member['semanticId'] !== 'string') return `a ${kind} member has no semanticId`;
  if (typeof member['required'] !== 'boolean') return `a ${kind} member has no required flag`;
  if (typeof member['type'] !== 'string') return `a ${kind} member has no type`;
  if (member['default'] !== undefined && typeof member['default'] !== 'string') return 'a default is not a string';
  return undefined;
}

/** The first thing wrong with the parsed JSON as an `ApiDoc`, or `undefined` when what the check reads is sound. The shape is owned by the `apiDocs` schema in `apps/docs/src/content.config.ts`. */
function shapeProblem(value: unknown): string | undefined {
  if (!isObject(value)) return 'not an object';
  if (typeof value['component'] !== 'string' || value['component'] === '') return 'component is not a string';
  if (typeof value['framework'] !== 'string' || !FRAMEWORKS.has(value['framework'])) return 'unknown framework';
  if (!Array.isArray(value['parts'])) return 'parts is not an array';
  for (const part of value['parts'] as unknown[]) {
    if (!isObject(part) || typeof part['semanticId'] !== 'string') return 'a part has no semanticId';
    for (const kind of KINDS) {
      const members = part[kind];
      if (!Array.isArray(members)) return `a part has no ${kind} array`;
      for (const member of members as unknown[]) {
        const problem = memberProblem(kind, member);
        if (problem !== undefined) return problem;
      }
    }
  }
  return undefined;
}

function readOne(path: string): ApiDocJson {
  const stat = lstatSync(path);
  if (!stat.isFile()) throw new Error('not a regular file');
  if (stat.size > MAX_BYTES) throw new Error('file is too large');
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const problem = shapeProblem(value);
  if (problem !== undefined) throw new Error(problem);
  return value as ApiDocJson;
}

/**
 * Reads every `*.json` file of the folders as an `ApiDoc`. Nothing is skipped silently: a missing folder, a link, a
 * file that is too large or not JSON, a wrong shape, and two files for one component and framework are problems.
 */
export function readApiDocs(apiDocsDirs: readonly string[]): { docs: ApiDocJson[]; problems: string[] } {
  const docs: ApiDocJson[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const dir of apiDocsDirs) {
    let names: string[];
    try {
      names = readdirSync(dir).filter((name) => name.endsWith('.json'));
    } catch {
      problems.push(`${dir}: the folder cannot be read; run the api-docs targets first`);
      continue;
    }
    for (const name of names.sort()) {
      const path = join(dir, name);
      try {
        const doc = readOne(path);
        const key = `${doc.component}/${doc.framework}`;
        if (seen.has(key)) throw new Error(`a second ApiDoc for ${doc.component} in ${doc.framework}`);
        seen.add(key);
        docs.push(doc);
      } catch (error) {
        problems.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  return { docs, problems };
}

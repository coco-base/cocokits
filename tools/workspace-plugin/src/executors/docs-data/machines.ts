import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBuiltModule } from '../load-module';
import type { JsonFile } from '../write-json';

const camel = (name: string): string => name.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The subpaths of a package.json `exports` that name a component (`./button`), with their built file. */
export function machineSubpaths(packageJson: unknown): { name: string; file: string }[] {
  const exportsField = isRecord(packageJson) ? packageJson['exports'] : undefined;
  if (!isRecord(exportsField)) throw new Error('package.json has no "exports"');
  const found: { name: string; file: string }[] = [];
  for (const [key, target] of Object.entries(exportsField)) {
    const name = /^\.\/([a-z][a-z0-9-]*)$/.exec(key)?.[1];
    if (name === undefined) continue;
    const file = isRecord(target) ? target['default'] : target;
    if (typeof file !== 'string') throw new Error(`exports["${key}"] has no "default" file`);
    found.push({ name, file });
  }
  return found;
}

function checkAnatomy(subpath: string, anatomy: unknown): Record<string, unknown> {
  if (
    !isRecord(anatomy) ||
    typeof anatomy['block'] !== 'string' ||
    !isRecord(anatomy['parts']) ||
    !isRecord(anatomy['classes'])
  ) {
    throw new Error(`${subpath}: the anatomy export is not made by defineAnatomy (block, parts and classes)`);
  }
  return anatomy;
}

function checkMeta(subpath: string, meta: unknown): Record<string, unknown> {
  if (
    !isRecord(meta) ||
    (meta['apg'] !== undefined && typeof meta['apg'] !== 'string') ||
    !isRecord(meta['dataAttrs']) ||
    !isRecord(meta['roles']) ||
    !Array.isArray(meta['keyboard']) ||
    typeof meta['form'] !== 'string'
  ) {
    throw new Error(
      `${subpath}: the meta export is not a ComponentMeta (dataAttrs, roles, keyboard, form, and apg when it is set)`,
    );
  }
  return meta;
}

/**
 * `ComponentDocData` of every component subpath of the machines package, from its built output. Each subpath must
 * export `<name>Anatomy` and `<name>Meta`; a missing one fails and names the subpath.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the machines package.
 */
export function machinesDocsData(root: string, projectRoot: string): JsonFile[] {
  const packageJson: unknown = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  const subpaths = machineSubpaths(packageJson);
  if (subpaths.length === 0) throw new Error('package.json "exports" lists no component subpath');
  return subpaths.map(({ name, file }) => {
    const subpath = `./${name}`;
    const exported = loadBuiltModule(root, join(projectRoot, file), 'run the build first');
    const anatomyName = `${camel(name)}Anatomy`;
    const metaName = `${camel(name)}Meta`;
    for (const exportName of [anatomyName, metaName]) {
      if (!(exportName in exported)) throw new Error(`${subpath}: ${file} does not export ${exportName}`);
    }
    const data = {
      kind: 'component',
      componentName: name,
      anatomy: checkAnatomy(subpath, exported[anatomyName]),
      meta: checkMeta(subpath, exported[metaName]),
    };
    return { name: `${name}.json`, data };
  });
}

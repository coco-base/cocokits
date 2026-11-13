import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isFramework } from '../../generators/library/kinds';
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

/** A keyboard row `frameworks` list must be absent or a non-empty list of known framework names. */
function checkKeyboardFrameworks(subpath: string, keyboard: readonly unknown[]): void {
  for (const row of keyboard) {
    if (!isRecord(row) || row['frameworks'] === undefined) continue;
    const frameworks = row['frameworks'];
    const label = String(row['key']);
    if (!Array.isArray(frameworks) || frameworks.length === 0) {
      throw new Error(`${subpath}: the keyboard row "${label}" has an empty or invalid "frameworks" list`);
    }
    for (const name of frameworks) {
      if (typeof name !== 'string' || !isFramework(name)) {
        throw new Error(`${subpath}: the keyboard row "${label}" names an unknown framework "${String(name)}"`);
      }
    }
  }
}

/** A `default` must be one of the `values`, so an attribute with no `values` has none. */
function checkDefault(subpath: string, attr: string, fallback: unknown, values: unknown): void {
  if (fallback === undefined) return;
  if (typeof fallback !== 'string' || !Array.isArray(values) || !values.includes(fallback)) {
    throw new Error(`${subpath}: dataAttrDetails ${attr} has a default that is not one of its values`);
  }
}

/** `dataAttrDetails` must hold one entry, with a `setWhen` and no empty `values`, for each attribute some part lists. */
function checkDataAttrDetails(subpath: string, meta: Record<string, unknown>): void {
  const listed = new Set(
    Object.values(meta['dataAttrs'] as Record<string, unknown>).flatMap((names) => names as string[]),
  );
  const details = meta['dataAttrDetails'];
  if (details !== undefined && !isRecord(details)) {
    throw new Error(`${subpath}: dataAttrDetails is not a record by attribute name`);
  }
  const entries = details ?? {};
  for (const attr of listed) {
    if (!Object.hasOwn(entries, attr)) {
      throw new Error(`${subpath}: ${attr} is named in dataAttrs but has no entry in dataAttrDetails`);
    }
  }
  for (const [attr, detail] of Object.entries(entries)) {
    if (!listed.has(attr)) {
      throw new Error(`${subpath}: dataAttrDetails has an entry for ${attr}, which no part lists in dataAttrs`);
    }
    if (!isRecord(detail) || typeof detail['setWhen'] !== 'string' || detail['setWhen'].trim() === '') {
      throw new Error(`${subpath}: dataAttrDetails ${attr} has an empty setWhen`);
    }
    const values = detail['values'];
    if (values !== undefined && (!Array.isArray(values) || values.length === 0)) {
      throw new Error(`${subpath}: dataAttrDetails ${attr} has an empty values list`);
    }
    checkDefault(subpath, attr, detail['default'], values);
  }
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
  checkKeyboardFrameworks(subpath, meta['keyboard'] as unknown[]);
  checkDataAttrDetails(subpath, meta);
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

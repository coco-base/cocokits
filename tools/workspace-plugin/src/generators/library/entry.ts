import {
  addDependenciesToPackageJson,
  generateFiles,
  updateJson,
  writeJson,
  type GeneratorCallback,
  type Tree,
} from '@nx/devkit';
import { join } from 'node:path';
import { peerRange, readCompatibility } from './compat';
import { sortKeys } from './package-json';
import type { EntrySpec } from './resolve';
import { addPackageExport, addSizeEntries, addTsconfigPath, sizeEntriesOf } from './register';
import { entryPoint } from './spec';

/** Removes the package placeholder once a real entry point exists. */
function removePlaceholder(tree: Tree, root: string): void {
  for (const file of [`${root}/src/placeholder.ts`, `${root}/placeholder.ts`]) {
    if (tree.exists(file)) tree.delete(file);
  }
}

const CDK_PACKAGE = '@angular/cdk';

interface PeerJson {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
}

/**
 * The `/testing` entries import `@angular/cdk/testing`, so the package declares `@angular/cdk` as an optional peer
 * (runtime entries never import it) and the workspace installs it. It follows the `@angular/core` range.
 */
function addCdkPeer(tree: Tree, spec: EntrySpec): GeneratorCallback {
  const core = readCompatibility(tree)['@angular/core'];
  if (core === undefined) throw new Error('compatibility.json has no peers["@angular/core"].');
  updateJson<PeerJson>(tree, `${spec.parent.root}/package.json`, (json) => {
    const peers = (json.peerDependencies ??= {});
    if (peers[CDK_PACKAGE] === undefined)
      json.peerDependencies = sortKeys({ ...peers, [CDK_PACKAGE]: peerRange(core) });
    const meta = (json.peerDependenciesMeta ??= {});
    meta[CDK_PACKAGE] = { optional: true };
    json.peerDependenciesMeta = sortKeys(meta);
    return json;
  });
  return addDependenciesToPackageJson(tree, {}, { [CDK_PACKAGE]: core.high });
}

/**
 * Adds an entry point to an existing package: its folder (skipped when index.ts exists, so reruns keep
 * edits), the `exports` key, the tsconfig path and the size-limit entry.
 */
export function addEntry(tree: Tree, spec: EntrySpec): GeneratorCallback {
  const entry = entryPoint(spec.parent, spec.sub);
  if (!tree.exists(`${spec.dir}/index.ts`)) {
    const leaf = spec.sub.split('/').pop() ?? spec.name;
    generateFiles(tree, join(__dirname, 'files', 'entry-sub'), spec.dir, {
      name: leaf,
      specifier: entry.specifier,
      tmpl: '',
    });
    if (spec.parent.builder === 'ng-packagr') {
      writeJson(tree, `${spec.dir}/ng-package.json`, { lib: { entryFile: 'index.ts' } });
    }
  }
  removePlaceholder(tree, spec.parent.root);
  addPackageExport(tree, spec.parent, entry);
  addTsconfigPath(tree, entry);
  addSizeEntries(tree, sizeEntriesOf([entry]));
  return spec.kind === 'angular-testing' ? addCdkPeer(tree, spec) : () => undefined;
}

import { addDependenciesToPackageJson, formatFiles, type GeneratorCallback, type Tree } from '@nx/devkit';
import { readCompatibility, type Compatibility } from './compat';
import { installedNxVersion, toolingFor } from './dependencies';
import { addEntry } from './entry';
import {
  addSizeEntries,
  addToChangesetGroup,
  addTsconfigPath,
  cssSizeEntries,
  rootEntryOf,
  sizeEntriesOf,
} from './register';
import { resolveOptions } from './resolve';
import type { LibraryGeneratorSchema } from './schema';
import { scaffoldPackage } from './scaffold';
import type { PackageSpec } from './spec';

function createPackage(tree: Tree, spec: PackageSpec): GeneratorCallback {
  const compat: Compatibility | undefined = spec.framework ? readCompatibility(tree) : undefined;
  scaffoldPackage(tree, spec, compat);
  const entries = rootEntryOf(spec);
  for (const entry of entries) addTsconfigPath(tree, entry);
  if (!spec.private) {
    addSizeEntries(tree, [...sizeEntriesOf(entries), ...(spec.css ? cssSizeEntries(spec) : [])]);
    addToChangesetGroup(tree, spec.packageName);
  }
  return addDependenciesToPackageJson(tree, {}, toolingFor(spec, compat, installedNxVersion(tree)));
}

/**
 * Scaffolds a package or an entry point. Idempotent: existing projects and entry folders are
 * left untouched, and the registrations (`exports`, tsconfig paths, size-limit) are only added when missing.
 */
export default async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema,
): Promise<GeneratorCallback> {
  const resolved = resolveOptions(tree, options);
  const installTask = resolved.type === 'package' ? createPackage(tree, resolved.spec) : addEntry(tree, resolved.spec);
  if (options.skipFormat !== true) await formatFiles(tree);
  return installTask;
}

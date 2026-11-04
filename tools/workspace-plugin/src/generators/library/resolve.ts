import { readJson, type Tree } from '@nx/devkit';
import {
  KINDS,
  NAME_PATTERN,
  isEntryKind,
  isFramework,
  isPackageKind,
  type EntryKind,
  type Framework,
  type PackageKind,
} from './kinds';
import type { LibraryGeneratorSchema } from './schema';
import { buildPackageSpec, type PackageSpec } from './spec';

export interface EntrySpec {
  readonly kind: EntryKind;
  readonly name: string;
  readonly parent: PackageSpec;
  /** Subpath below the package, e.g. `positioning` or `tabs/testing`. */
  readonly sub: string;
  /** Workspace-relative folder of the entry's index.ts. */
  readonly dir: string;
  /** Folder that must exist before this entry can be added (the component of a `testing` entry). */
  readonly requires: string | undefined;
}

export type Resolved =
  { readonly type: 'package'; readonly spec: PackageSpec } | { readonly type: 'entry'; readonly spec: EntrySpec };

const SHARED_LIB_NAMES = ['utils', 'shared'];
/** Folder names with a meaning in a package (sources, outputs, tooling); no entry point may use them. */
const RESERVED_ENTRY_NAMES = [
  'index',
  'src',
  'dist',
  'node_modules',
  'tests',
  'api',
  'coverage',
  'scripts',
  'types',
  'fesm2022',
  'dom-contract',
];
/** Additionally reserved where the folder sits next to framework sub-packages or harness folders. */
const RESERVED_COMPONENT_NAMES = ['core', 'testing'];
/** Folders of `tools/` and the names of existing projects (the plugin is the `workspace` project) a tool cannot take. */
const RESERVED_TOOL_NAMES = [
  'eslint',
  'scripts',
  'workspace-plugin',
  'workspace',
  'utils',
  'shared',
  'cdk',
  'machines',
  'angular',
  'react',
  'vue',
  'docs',
  'docs-stories',
  'docs-shared',
  'docs-e2e',
  'preview-angular',
  'preview-react',
  'preview-vue',
];

const USES: Record<PackageKind, { framework: boolean; theme: boolean }> = {
  'shared-lib': { framework: false, theme: false },
  cdk: { framework: false, theme: false },
  machines: { framework: false, theme: false },
  'fw-core': { framework: true, theme: false },
  fw: { framework: true, theme: false },
  'theme-core': { framework: false, theme: true },
  'theme-fw': { framework: true, theme: true },
  tool: { framework: false, theme: false },
  app: { framework: true, theme: false },
  'docs-stories': { framework: false, theme: false },
  'docs-shared': { framework: false, theme: false },
  'docs-e2e': { framework: false, theme: false },
};

function checkName(value: string, label: string): void {
  if (!NAME_PATTERN.test(value)) {
    throw new Error(`Invalid ${label} "${value}": use lowercase letters, digits and dashes, starting with a letter.`);
  }
}

function requireFramework(kind: string, value: string | undefined): Framework {
  if (value === undefined) throw new Error(`Kind "${kind}" needs --framework=angular|react|vue.`);
  if (!isFramework(value)) throw new Error(`Unknown framework "${value}"; use angular, react or vue.`);
  return value;
}

function requireTheme(kind: string, value: string | undefined): string {
  if (value === undefined) throw new Error(`Kind "${kind}" needs --theme=<name>.`);
  checkName(value, 'theme name');
  return value;
}

/** The folders of every project below the workspace roots that hold projects: where a project.json is. */
function projectRoots(tree: Tree, folder: string): string[] {
  if (!tree.exists(folder) || tree.isFile(folder)) return [];
  const own = tree.exists(`${folder}/project.json`) ? [folder] : [];
  const below = tree
    .children(folder)
    .filter((child) => child !== 'node_modules' && child !== 'dist')
    .flatMap((child) => projectRoots(tree, `${folder}/${child}`));
  return [...own, ...below];
}

/** A private project must not take the project name or the package name of any other project of the workspace. */
function assertNoCollision(tree: Tree, root: string, name: string): void {
  for (const project of ['apps', 'packages', 'tools'].flatMap((folder) => projectRoots(tree, folder))) {
    if (project === root) continue;
    const projectName = readJson<{ name?: string }>(tree, `${project}/project.json`).name;
    const file = `${project}/package.json`;
    const packageName = tree.exists(file) ? readJson<{ name?: string }>(tree, file).name : undefined;
    if (projectName === name || packageName === `@cocokits/${name}`) {
      throw new Error(`"${name}" is already the name of the project in ${project}; a project needs a name of its own.`);
    }
  }
}

function checkToolName(tree: Tree, name: string | undefined): void {
  if (name === undefined) {
    throw new Error('Kind "tool" needs a name: nx g @cocokits/workspace:library <name> --kind=tool.');
  }
  if (RESERVED_TOOL_NAMES.includes(name)) throw new Error(`"${name}" is reserved and cannot name a tool.`);
  assertNoCollision(tree, `tools/${name}`, name);
}

/** The framework of an app: none for the Astro site `docs`, the framework of the preview app `preview-<framework>`. */
function resolveAppFramework(options: LibraryGeneratorSchema): Framework | undefined {
  if (options.framework === undefined) {
    if (options.name !== 'docs') {
      throw new Error(
        'Kind "app" needs the name "docs" (the Astro site) or --framework=angular|react|vue (a preview app).',
      );
    }
    return undefined;
  }
  if (options.name === 'docs') throw new Error('The app "docs" does not take --framework.');
  return requireFramework('app', options.framework);
}

/** Checks the name rules that belong to one kind (the names of tools, shared libraries and private projects). */
function checkKindName(tree: Tree, kind: PackageKind, spec: PackageSpec, options: LibraryGeneratorSchema): void {
  if (kind === 'shared-lib' && !SHARED_LIB_NAMES.includes(options.name ?? '')) {
    throw new Error(`Kind "shared-lib" needs a name: ${SHARED_LIB_NAMES.join(' or ')}.`);
  }
  if (options.name !== undefined && options.name !== spec.projectName) {
    throw new Error(`The name for kind "${kind}" must be "${spec.projectName}" (or omitted), got "${options.name}".`);
  }
  if (kind === 'app' || kind === 'docs-stories' || kind === 'docs-shared' || kind === 'docs-e2e')
    assertNoCollision(tree, spec.root, spec.projectName);
}

function frameworkOf(kind: PackageKind, options: LibraryGeneratorSchema): Framework | undefined {
  if (kind === 'app') return resolveAppFramework(options);
  return USES[kind].framework ? requireFramework(kind, options.framework) : undefined;
}

function resolvePackage(tree: Tree, kind: PackageKind, options: LibraryGeneratorSchema): PackageSpec {
  const uses = USES[kind];
  if (!uses.framework && options.framework !== undefined) {
    throw new Error(`Kind "${kind}" does not take --framework.`);
  }
  if (!uses.theme && options.theme !== undefined) throw new Error(`Kind "${kind}" does not take --theme.`);
  if (options.name !== undefined) checkName(options.name, 'name');
  const framework = frameworkOf(kind, options);
  const theme = uses.theme ? requireTheme(kind, options.theme) : undefined;
  if (kind === 'tool') checkToolName(tree, options.name);
  const spec = buildPackageSpec(kind, { name: options.name, framework, theme });
  checkKindName(tree, kind, spec, options);
  return spec;
}

function parentFor(kind: EntryKind, framework: Framework | undefined): PackageSpec {
  switch (kind) {
    case 'cdk-module':
      return buildPackageSpec('cdk', {});
    case 'machine':
      return buildPackageSpec('machines', {});
    default:
      return buildPackageSpec('fw', { framework });
  }
}

function entryFolder(kind: EntryKind, parent: PackageSpec, name: string): string {
  switch (kind) {
    case 'cdk-module':
      return `${parent.root}/src/${name}`;
    case 'angular-testing':
      return `${parent.root}/${name}/testing`;
    case 'fw-entry':
      return parent.shape === 'ng-subdirs' ? `${parent.root}/${name}` : `${parent.root}/src/${name}`;
    default:
      return `${parent.root}/${name}`;
  }
}

function resolveEntry(tree: Tree, kind: EntryKind, options: LibraryGeneratorSchema): EntrySpec {
  const { name } = options;
  if (name === undefined)
    throw new Error(`Kind "${kind}" needs a name: nx g @cocokits/workspace:library <name> --kind=${kind}.`);
  checkName(name, 'name');
  if (options.theme !== undefined) throw new Error(`Kind "${kind}" does not take --theme.`);
  const reserved =
    kind === 'cdk-module' ? RESERVED_ENTRY_NAMES : [...RESERVED_ENTRY_NAMES, ...RESERVED_COMPONENT_NAMES];
  if (reserved.includes(name)) throw new Error(`"${name}" is reserved and cannot name an entry point.`);
  let framework: Framework | undefined;
  if (kind === 'angular-testing') {
    framework = requireFramework(kind, options.framework ?? 'angular');
    if (framework !== 'angular') throw new Error('Kind "angular-testing" is only for --framework=angular.');
  } else if (kind === 'fw-entry') {
    framework = requireFramework(kind, options.framework);
  } else if (options.framework !== undefined) {
    throw new Error(`Kind "${kind}" does not take --framework.`);
  }
  const parent = parentFor(kind, framework);
  const dir = entryFolder(kind, parent, name);
  const requires = kind === 'angular-testing' ? `${parent.root}/${name}/index.ts` : undefined;
  assertParentExists(tree, parent, kind, requires);
  assertNoRootExport(tree, parent);
  return { kind, name, parent, sub: kind === 'angular-testing' ? `${name}/testing` : name, dir, requires };
}

function assertParentExists(tree: Tree, parent: PackageSpec, kind: EntryKind, requires: string | undefined): void {
  if (!tree.exists(`${parent.root}/project.json`) || !tree.exists(`${parent.root}/package.json`)) {
    const fw = parent.framework ? ` --framework=${parent.framework}` : '';
    const kindOfParent = parent.kind === 'fw' ? 'fw' : parent.kind;
    throw new Error(
      `${parent.packageName} does not exist (${parent.root}). Create it first: ` +
        `nx g @cocokits/workspace:library ${parent.projectName} --kind=${kindOfParent}${fw} (needed by kind "${kind}").`,
    );
  }
  if (requires !== undefined && !tree.exists(requires)) {
    throw new Error(`${requires} does not exist; add the component entry point first (--kind=fw-entry).`);
  }
}

/** D-005 and D-019: packages without a root entry never get a `.` export. */
export function assertNoRootExport(tree: Tree, spec: PackageSpec): void {
  const file = `${spec.root}/package.json`;
  if (spec.rootEntry || !tree.exists(file)) return;
  const pkg = readJson<{ exports?: Record<string, unknown> }>(tree, file);
  if (pkg.exports && '.' in pkg.exports) {
    throw new Error(`${file}: ${spec.packageName} must not have a "." export (D-005, D-019); remove it.`);
  }
}

export function resolveOptions(tree: Tree, options: LibraryGeneratorSchema): Resolved {
  const { kind } = options;
  if (isPackageKind(kind)) {
    const spec = resolvePackage(tree, kind, options);
    assertNoRootExport(tree, spec);
    return { type: 'package', spec };
  }
  if (isEntryKind(kind)) return { type: 'entry', spec: resolveEntry(tree, kind, options) };
  throw new Error(`Unknown kind "${kind}". Use one of: ${KINDS.join(', ')}.`);
}

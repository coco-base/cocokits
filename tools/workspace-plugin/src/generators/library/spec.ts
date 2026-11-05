import { FRAMEWORK_INFO, type Builder, type Framework, type PackageKind } from './kinds';

/** Where the entry modules of a package live. */
export type Shape = 'src-root' | 'src-subdirs' | 'root-subdirs' | 'ng-subdirs';

export interface PackageSpec {
  readonly kind: PackageKind;
  /** Nx project name: the package name without `@cocokits/`. */
  readonly projectName: string;
  readonly packageName: string;
  readonly root: string;
  readonly layer: string;
  readonly scope: string;
  readonly builder: Builder;
  readonly shape: Shape;
  readonly framework: Framework | undefined;
  readonly theme: string | undefined;
  /** Extends tsconfig.strict.json (layers utils, shared, cdk, machine, fw-core). */
  readonly strict: boolean;
  readonly description: string;
  /** The package has a "." export. */
  readonly rootEntry: boolean;
  /** Theme core: CSS asset exports and the interim sass build. */
  readonly css: boolean;
  /** Other packages live in subfolders of this project (packages/<fw>/core). */
  readonly nested: boolean;
}

export interface PackageInput {
  readonly name?: string | undefined;
  readonly framework?: Framework | undefined;
  readonly theme?: string | undefined;
}

type Parts = Pick<PackageSpec, 'projectName' | 'root' | 'layer' | 'scope' | 'description'> &
  Partial<Pick<PackageSpec, 'shape' | 'strict' | 'css' | 'nested'>>;

const SHARED_LIBS: Record<string, string> = {
  utils: 'Stateless helpers used by every other layer.',
  shared: 'Shared contracts: anatomy, meta, theme and mode types.',
};

function sharedLibParts(name: string): Parts {
  return {
    projectName: name,
    root: `packages/${name}`,
    layer: `layer:${name}`,
    scope: 'scope:shared',
    description: SHARED_LIBS[name] ?? '',
    strict: true,
  };
}

function frameworkParts(kind: PackageKind, { framework, theme }: PackageInput): Parts {
  const fw = framework ?? 'angular';
  const label = FRAMEWORK_INFO[fw].label;
  switch (kind) {
    case 'fw-core':
      return {
        projectName: `${fw}-core`,
        root: `packages/${fw}/core`,
        layer: 'layer:fw-core',
        scope: `scope:${fw}`,
        description: `${label} adapter runtime: binds machines to ${label} and provides the theme runtime.`,
        strict: true,
      };
    case 'fw':
      return {
        projectName: fw,
        root: `packages/${fw}`,
        layer: 'layer:fw-component',
        scope: `scope:${fw}`,
        description: `Unstyled ${label} components, one subpath per component.`,
        shape: fw === 'angular' ? 'ng-subdirs' : 'src-subdirs',
        nested: true,
      };
    default:
      return {
        projectName: `theme-${theme ?? ''}-${fw}`,
        root: `packages/themes/${theme ?? ''}/${fw}`,
        layer: 'layer:theme',
        scope: `scope:${fw}`,
        description: `Typed ${theme ?? ''} theme layer for ${label}.`,
      };
  }
}

function partsFor(kind: PackageKind, input: PackageInput): Parts {
  switch (kind) {
    case 'shared-lib':
      return sharedLibParts(input.name ?? '');
    case 'cdk':
      return {
        projectName: 'cdk',
        root: 'packages/cdk',
        layer: 'layer:cdk',
        scope: 'scope:shared',
        description: 'Framework-free primitives and stateful runtime, one subpath per module.',
        shape: 'src-subdirs',
        strict: true,
      };
    case 'machines':
      return {
        projectName: 'machines',
        root: 'packages/machines',
        layer: 'layer:machine',
        scope: 'scope:shared',
        description: 'Framework-agnostic component behaviour, one subpath per component.',
        shape: 'root-subdirs',
        strict: true,
      };
    case 'theme-core':
      return {
        projectName: `theme-${input.theme ?? ''}`,
        root: `packages/themes/${input.theme ?? ''}/core`,
        layer: 'layer:theme',
        scope: 'scope:shared',
        description: `The ${input.theme ?? ''} theme: ThemeConfig, CSS and tokens, framework-free.`,
        css: true,
      };
    default:
      return frameworkParts(kind, input);
  }
}

/** Derives everything about a package from its kind; the input is already validated. */
export function buildPackageSpec(kind: PackageKind, input: PackageInput): PackageSpec {
  const parts = partsFor(kind, input);
  const shape = parts.shape ?? 'src-root';
  return {
    kind,
    framework: input.framework,
    theme: input.theme,
    builder: input.framework ? FRAMEWORK_INFO[input.framework].builder : 'tsdown',
    strict: false,
    css: false,
    nested: false,
    rootEntry: shape === 'src-root',
    ...parts,
    shape,
    packageName: `@cocokits/${parts.projectName}`,
  };
}

export interface EntryPoint {
  /** Key in `exports` and size-limit, `.` or `./<sub>`. */
  readonly key: string;
  readonly specifier: string;
  /** Value for tsconfig `paths`. */
  readonly source: string;
  readonly types: string;
  readonly default: string;
  readonly sizePath: string;
}

function sourceFile(spec: PackageSpec, sub: string | undefined): string {
  if (sub === undefined) return 'src/index.ts';
  return spec.shape === 'src-subdirs' ? `src/${sub}/index.ts` : `${sub}/index.ts`;
}

/** The entry point of a package (`sub` undefined = root) with its built file locations. */
export function entryPoint(spec: PackageSpec, sub: string | undefined): EntryPoint {
  const common = {
    key: sub === undefined ? '.' : `./${sub}`,
    specifier: sub === undefined ? spec.packageName : `${spec.packageName}/${sub}`,
    source: `./${spec.root}/${sourceFile(spec, sub)}`,
  };
  if (spec.builder === 'ng-packagr') {
    const flat = common.specifier.replace('@', '').replaceAll('/', '-');
    return {
      ...common,
      types: `./types/${flat}.d.ts`,
      default: `./fesm2022/${flat}.mjs`,
      sizePath: `dist/packages/${spec.projectName}/fesm2022/${flat}.mjs`,
    };
  }
  const dist = sub === undefined ? 'index' : `${sub}/index`;
  return {
    ...common,
    types: `./dist/${dist}.d.ts`,
    default: `./dist/${dist}.js`,
    sizePath: `${spec.root}/dist/${dist}.js`,
  };
}

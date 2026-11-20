import { frameworkPeerRanges, type Compatibility } from './compat';
import { entryPoint, type PackageSpec } from './spec';
import { TOOL_VERSIONS, majorRange } from './versions';

export const WORKSPACE_RANGE = 'workspace:*';
/** The version every publishable package starts at: one version for all of them. */
export const PACKAGE_VERSION = '2.0.0';
const REPOSITORY_URL = 'https://github.com/coco-base/cocokits.git';

export type ExportValue = string | { readonly types: string; readonly default: string };

/** Optional peers of @cocokits/cdk, each imported by exactly one module. */
const CDK_OPTIONAL_PEERS = ['@floating-ui/dom', '@internationalized/date', '@internationalized/number'] as const;

/** Internal packages a layer may import; only those that exist in the workspace are declared. */
export function internalDependencyNames(spec: PackageSpec): string[] {
  switch (spec.kind) {
    case 'cdk':
      return ['utils', 'shared', 'icons'];
    case 'machines':
    case 'fw-core':
      return ['utils', 'shared', 'icons', 'cdk'];
    case 'fw':
      return ['utils', 'shared', 'icons', 'cdk', 'machines', `${spec.framework ?? ''}-core`];
    default:
      return [];
  }
}

function themePeers(spec: PackageSpec): Record<string, string> {
  if (spec.kind === 'theme-core') return { '@cocokits/shared': WORKSPACE_RANGE };
  const fw = spec.framework ?? '';
  return {
    [`@cocokits/theme-${spec.theme ?? ''}`]: WORKSPACE_RANGE,
    [`@cocokits/${fw}-core`]: WORKSPACE_RANGE,
    [`@cocokits/${fw}`]: WORKSPACE_RANGE,
  };
}

export function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

export function peerDependencies(spec: PackageSpec, compat: Compatibility | undefined): Record<string, string> {
  const peers: Record<string, string> = {};
  if (spec.kind === 'theme-core' || spec.kind === 'theme-fw') Object.assign(peers, themePeers(spec));
  if (spec.kind === 'cdk') {
    for (const name of CDK_OPTIONAL_PEERS) peers[name] = majorRange(TOOL_VERSIONS[name]);
  }
  if (spec.framework && compat) Object.assign(peers, frameworkPeerRanges(compat, spec.framework));
  return sortKeys(peers);
}

/** `.` first, then alphabetical. */
export function sortExports(exportsMap: Record<string, ExportValue>): Record<string, ExportValue> {
  const rank = (key: string): number => (key === '.' ? 0 : 1);
  return Object.fromEntries(Object.entries(exportsMap).sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b)));
}

/** Theme core asset exports. */
const CSS_EXPORTS: Record<string, string> = {
  './styles.css': './dist/styles.css',
  './tokens.css': './dist/tokens.css',
  './components/*.css': './dist/components/*.css',
};

function initialExports(spec: PackageSpec): Record<string, ExportValue> {
  // ng-packagr writes every JS entry of its output package.json itself and warns about a source entry that
  // already has `types`/`default`, so a source `exports` of an ng-packagr package never lists them.
  if (spec.builder === 'ng-packagr') return {};
  const result: Record<string, ExportValue> = {};
  if (spec.rootEntry) {
    const root = entryPoint(spec, undefined);
    result[root.key] = { types: root.types, default: root.default };
  }
  return spec.css ? { ...result, ...CSS_EXPORTS } : result;
}

export interface PackageJsonContext {
  readonly compat: Compatibility | undefined;
  /** Internal dependencies that exist in the workspace, name to range. */
  readonly internal: Readonly<Record<string, string>>;
  readonly offset: string;
}

/** The package.json of a new package. Key order is fixed so reruns and reviews stay stable. */
export function buildPackageJson(spec: PackageSpec, context: PackageJsonContext): Record<string, unknown> {
  const dependencies: Record<string, string> = { ...context.internal };
  if (spec.kind === 'cdk') dependencies['alien-signals'] = `^${TOOL_VERSIONS['alien-signals']}`;
  const peers = peerDependencies(spec, context.compat);
  const ng = spec.builder === 'ng-packagr';
  const publishConfig: Record<string, unknown> = { access: 'public' };
  // ng-packagr copies this package.json into its output and publishing runs from there.
  if (ng) publishConfig['directory'] = `${context.offset}dist/packages/${spec.projectName}`;
  return {
    name: spec.packageName,
    version: PACKAGE_VERSION,
    description: spec.description,
    license: 'Apache-2.0',
    repository: { type: 'git', url: REPOSITORY_URL, directory: spec.root },
    type: 'module',
    sideEffects: spec.css ? ['*.css'] : false,
    // `files: ["dist"]` would hide everything in the ng-packagr output directory.
    ...(ng ? {} : { files: ['dist'] }),
    exports: initialExports(spec),
    ...(Object.keys(dependencies).length > 0 ? { dependencies: sortKeys(dependencies) } : {}),
    ...(Object.keys(peers).length > 0 ? { peerDependencies: peers } : {}),
    ...(spec.kind === 'cdk'
      ? { peerDependenciesMeta: Object.fromEntries(CDK_OPTIONAL_PEERS.map((name) => [name, { optional: true }])) }
      : {}),
    publishConfig,
  };
}

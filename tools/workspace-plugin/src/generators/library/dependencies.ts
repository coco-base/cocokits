import { readJson, type Tree } from '@nx/devkit';
import { frameworkHighVersions, type Compatibility } from './compat';
import type { Framework } from './kinds';
import { WORKSPACE_RANGE } from './package-json';
import type { PackageSpec } from './spec';
import { NX_FALLBACK_VERSION, TOOL_VERSIONS } from './versions';

type Versions = Record<string, string>;

function pick(...names: (keyof typeof TOOL_VERSIONS)[]): Versions {
  return Object.fromEntries(names.map((name) => [name, TOOL_VERSIONS[name]]));
}

function frameworkTooling(framework: Framework, compat: Compatibility, nxVersion: string): Versions {
  const high = frameworkHighVersions(compat, framework);
  if (framework === 'react') {
    return { ...high, ...pick('@types/react', '@types/react-dom') };
  }
  if (framework === 'vue') {
    return { ...high, ...pick('vite', '@vitejs/plugin-vue', 'vue-tsc') };
  }
  const angularHigh = high['@angular/core'] ?? '';
  return {
    ...high,
    '@angular/common': angularHigh,
    '@angular/compiler': angularHigh,
    '@angular/compiler-cli': angularHigh,
    '@nx/angular': nxVersion,
    ...pick('ng-packagr', 'rxjs', 'tslib'),
  };
}

/** Root devDependencies a kind needs to build and test (the next step installs them). */
export function toolingFor(spec: PackageSpec, compat: Compatibility | undefined, nxVersion: string): Versions {
  const tooling: Versions = {};
  // Nx finds the executors of a tool through the workspace link in the root package.json.
  if (spec.kind === 'tool') return { [spec.packageName]: WORKSPACE_RANGE };
  if (spec.private) return {};
  if (spec.builder === 'tsdown') Object.assign(tooling, pick('tsdown'));
  if (spec.css) Object.assign(tooling, pick('sass'));
  if (spec.kind === 'cdk') {
    Object.assign(tooling, pick('@floating-ui/dom', '@internationalized/date', '@internationalized/number'));
    Object.assign(tooling, pick('alien-signals'));
  }
  if (spec.framework && compat) Object.assign(tooling, frameworkTooling(spec.framework, compat, nxVersion));
  return tooling;
}

export function installedNxVersion(tree: Tree): string {
  const pkg = readJson<{ devDependencies?: Record<string, string> }>(tree, 'package.json');
  return pkg.devDependencies?.['nx'] ?? NX_FALLBACK_VERSION;
}

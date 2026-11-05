import type { PackageSpec } from './spec';

type Target = Record<string, unknown>;

/**
 * Name of the ng-packagr config of the primary entry point. packages/angular/core is nested in the
 * folder of the angular package, whose ng-packagr run would treat a file named ng-package.json there
 * as a secondary entry point; the core therefore uses another file name.
 */
export function ngPackageFile(spec: PackageSpec): string {
  return spec.kind === 'fw-core' ? 'ng-package.build.json' : 'ng-package.json';
}

function typecheckTarget(spec: PackageSpec): Target {
  const tsc = spec.builder === 'vite-vue' ? 'vue-tsc' : 'tsc';
  return {
    executor: 'nx:run-commands',
    options: {
      commands: [`${tsc} --noEmit -p tsconfig.lib.json`, `${tsc} --noEmit -p tsconfig.spec.json`],
      cwd: '{projectRoot}',
      parallel: false,
    },
  };
}

function commandTarget(commands: string[]): Target {
  return {
    executor: 'nx:run-commands',
    outputs: ['{projectRoot}/dist'],
    options: { commands, cwd: '{projectRoot}', parallel: false },
  };
}

/** A build that runs a workspace script rebuilds the package when the script changes. */
function withScriptInput(target: Target, script: string): Target {
  return { ...target, inputs: ['production', '^production', `{workspaceRoot}/tools/scripts/${script}`] };
}

/** Angular packages without a root entry strip the primary entry that ng-packagr always builds. */
export function stripsRootExport(spec: PackageSpec): boolean {
  return spec.builder === 'ng-packagr' && !spec.rootEntry && spec.kind === 'fw';
}

function packageTarget(spec: PackageSpec): Target {
  return {
    executor: '@nx/angular:package',
    dependsOn: ['^build'],
    outputs: [`{workspaceRoot}/dist/packages/${spec.projectName}`],
    options: { project: `{projectRoot}/${ngPackageFile(spec)}`, tsConfig: '{projectRoot}/tsconfig.lib.json' },
  };
}

function buildTarget(spec: PackageSpec, offset: string): Target {
  switch (spec.builder) {
    case 'ng-packagr':
      // ng-packagr copies the source package.json; the script makes the output publishable as it is.
      return withScriptInput(
        {
          executor: 'nx:run-commands',
          dependsOn: ['^build', 'package'],
          outputs: [`{workspaceRoot}/dist/packages/${spec.projectName}`],
          options: {
            command: `node ${offset}tools/scripts/finalize-ng-package.mjs${stripsRootExport(spec) ? ' --strip-root' : ''}`,
            cwd: '{projectRoot}',
          },
        },
        'finalize-ng-package.mjs',
      );
    case 'vite-vue':
      return withScriptInput(
        commandTarget([
          'vite build -c vite.config.lib.mjs',
          'vue-tsc -p tsconfig.lib.json --declaration --emitDeclarationOnly --noEmit false --outDir dist --rootDir src',
          `node ${offset}tools/scripts/fix-declaration-imports.mjs dist`,
        ]),
        'fix-declaration-imports.mjs',
      );
    default:
      return commandTarget(
        spec.css
          ? ['tsdown -c tsdown.config.mjs --config-loader native', 'node scripts/build-css.mjs']
          : ['tsdown -c tsdown.config.mjs --config-loader native'],
      );
  }
}

/**
 * The docs data of a theme: the `ThemeConfig` and the `modeCollections` its built entry exports. `dependsOn`,
 * `outputs` and the cache come from the `docs-data` default in nx.json. The theme makes its modes index itself (the
 * cocokits theme through its `tokens` target), so the target fails until it exports one.
 */
function docsDataTarget(): Target {
  return { executor: '@cocokits/workspace:docs-data', options: { source: 'theme' } };
}

/** The publish checks; their command, cache and `dependsOn` come from the defaults in nx.json. */
const PUBLISH_CHECKS: Record<string, Target> = { pack: {}, publint: {}, attw: {} };

function targetsFor(spec: PackageSpec, offset: string): Record<string, Target> {
  return {
    ...(spec.builder === 'ng-packagr' ? { package: packageTarget(spec) } : {}),
    build: buildTarget(spec, offset),
    ...(spec.kind === 'theme-core' ? { 'docs-data': docsDataTarget() } : {}),
    typecheck: typecheckTarget(spec),
    ...PUBLISH_CHECKS,
  };
}

function sourceRootOf(spec: PackageSpec): string {
  return spec.shape === 'src-root' || spec.shape === 'src-subdirs' ? `${spec.root}/src` : spec.root;
}

/** project.json; `lint` and `test` are inferred by the @nx/eslint and @nx/vitest plugins of nx.json. */
export function buildProjectJson(spec: PackageSpec, offset: string): Record<string, unknown> {
  return {
    $schema: `${offset}node_modules/nx/schemas/project-schema.json`,
    name: spec.projectName,
    projectType: 'library',
    sourceRoot: sourceRootOf(spec),
    tags: [spec.layer, spec.scope, 'type:lib'],
    targets: targetsFor(spec, offset),
  };
}

function includeGlobs(spec: PackageSpec): string[] {
  if (spec.framework === 'react') return ['**/*.ts', '**/*.tsx'];
  if (spec.framework === 'vue') return ['**/*.ts', '**/*.vue'];
  return ['**/*.ts'];
}

function baseExcludes(spec: PackageSpec): string[] {
  return ['dist', 'node_modules', ...(spec.nested ? ['core'] : [])];
}

const TEST_GLOBS = ['**/tests/**', '**/*.test.ts', '**/*.test.tsx'];

/** tsconfig.json (all files, for the editor and ESLint), tsconfig.lib.json and tsconfig.spec.json. */
export function buildTsconfigs(spec: PackageSpec, offset: string): Record<string, Record<string, unknown>> {
  const options: Record<string, unknown> = {};
  if (spec.framework === 'react') options['jsx'] = 'react-jsx';
  if (spec.framework === 'angular') options['experimentalDecorators'] = true;
  // tsdown emits declarations without a type checker only with isolatedDeclarations (strict config already has it).
  if (spec.builder === 'tsdown' && !spec.strict) {
    Object.assign(options, { declaration: true, isolatedDeclarations: true });
  }
  // No DOM types in generic utils (its `dom/` and `env/` folders opt in later).
  if (spec.projectName === 'utils') options['lib'] = ['ES2023'];
  const lib: Record<string, unknown> = {
    extends: './tsconfig.json',
    // Builds resolve internal packages through node_modules (workspace links to the built output, ng-packagr
    // packages through publishConfig.directory). The base `paths` point at source files outside the package
    // (TS6059 with vue-tsc --rootDir, inlining by bundlers); typecheck of tests, the editor and ESLint keep them.
    compilerOptions: { outDir: 'dist', types: [], paths: {} },
    include: includeGlobs(spec),
    exclude: [...baseExcludes(spec), ...TEST_GLOBS],
  };
  if (spec.builder === 'ng-packagr') {
    lib['angularCompilerOptions'] = {
      compilationMode: 'partial',
      strictInjectionParameters: true,
      strictTemplates: true,
    };
  }
  return {
    'tsconfig.json': {
      extends: `${offset}tsconfig.${spec.strict ? 'strict' : 'base'}.json`,
      compilerOptions: options,
      include: includeGlobs(spec),
      exclude: baseExcludes(spec),
    },
    'tsconfig.lib.json': lib,
    'tsconfig.spec.json': {
      extends: './tsconfig.json',
      compilerOptions: { types: ['node'] },
      include: ['**/tests/**/*.ts', '**/tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      exclude: baseExcludes(spec),
    },
  };
}

import type { Framework } from './kinds';
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

/** Angular packages without a root entry (D-019) strip the primary entry that ng-packagr always builds. */
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

function buildTarget(spec: PackageSpec): Target {
  switch (spec.builder) {
    case 'ng-packagr':
      if (stripsRootExport(spec)) {
        return {
          executor: 'nx:run-commands',
          dependsOn: ['^build', 'package'],
          outputs: [`{workspaceRoot}/dist/packages/${spec.projectName}`],
          options: { command: 'node scripts/strip-root-export.mjs', cwd: '{projectRoot}' },
        };
      }
      return {
        executor: '@nx/angular:package',
        outputs: [`{workspaceRoot}/dist/packages/${spec.projectName}`],
        options: { project: `{projectRoot}/${ngPackageFile(spec)}`, tsConfig: '{projectRoot}/tsconfig.lib.json' },
      };
    case 'vite-vue':
      return commandTarget([
        'vite build -c vite.config.lib.mjs',
        'vue-tsc -p tsconfig.lib.json --declaration --emitDeclarationOnly --noEmit false --outDir dist --rootDir src',
      ]);
    default:
      return commandTarget(
        spec.css
          ? ['tsdown -c tsdown.config.mjs --config-loader native', 'node scripts/build-css.mjs']
          : ['tsdown -c tsdown.config.mjs --config-loader native'],
      );
  }
}

/** The default dev port of each preview app; the dev port can be overridden with `--port`. */
const PREVIEW_PORTS = { angular: 4301, react: 4302, vue: 4303 } as const;

/** The base path the docs build serves a preview app from; the docs site copies the build there. */
export function previewBaseHref(framework: Framework): string {
  return `/preview/${framework}/`;
}

/** `astro check` type-checks `.astro` files and the TypeScript around them. */
function astroTypecheckTarget(): Target {
  return {
    executor: 'nx:run-commands',
    options: { command: 'astro check', cwd: '{projectRoot}' },
  };
}

/** The Angular preview app: an esbuild application build, a dev server on a fixed port and a type check. */
function previewAngularTargets(spec: PackageSpec): Record<string, Target> {
  const outputPath = `dist/apps/${spec.projectName}`;
  return {
    build: {
      executor: '@nx/angular:application',
      outputs: [`{workspaceRoot}/${outputPath}`],
      options: {
        // The build output is flat (no `browser` folder), so the docs build copies it as it is.
        outputPath: { base: outputPath, browser: '' },
        browser: '{projectRoot}/src/main.ts',
        index: '{projectRoot}/src/index.html',
        tsConfig: '{projectRoot}/tsconfig.app.json',
        baseHref: previewBaseHref('angular'),
        styles: ['{projectRoot}/src/styles.scss'],
        outputHashing: 'all',
      },
      configurations: {
        production: { optimization: true, sourceMap: false, extractLicenses: false },
        // The dev server serves the app at the root (the docs site and the standalone mode use that URL).
        development: { optimization: false, sourceMap: true, outputHashing: 'none', baseHref: '/' },
      },
      defaultConfiguration: 'production',
    },
    dev: {
      // The dev server of the esbuild application builder. `@nx/angular:dev-server` needs the webpack stack of
      // `@angular-devkit/build-angular`, which this workspace does not install.
      executor: '@angular/build:dev-server',
      continuous: true,
      options: { buildTarget: `${spec.projectName}:build:development`, port: PREVIEW_PORTS.angular },
    },
    typecheck: {
      executor: 'nx:run-commands',
      options: {
        commands: ['tsc --noEmit -p tsconfig.app.json', 'tsc --noEmit -p tsconfig.spec.json'],
        cwd: '{projectRoot}',
        parallel: false,
      },
    },
  };
}

/**
 * The React and Vue preview apps: a Vite build served at the base path of the framework, a dev server on a fixed
 * port (the option `port`, which `docs:dev` passes on) and a type check (`vue-tsc` for Vue).
 */
function previewViteTargets(spec: PackageSpec, framework: 'react' | 'vue'): Record<string, Target> {
  const tsc = framework === 'vue' ? 'vue-tsc' : 'tsc';
  return {
    build: {
      executor: 'nx:run-commands',
      outputs: [`{workspaceRoot}/dist/apps/${spec.projectName}`],
      options: { command: 'vite build', cwd: '{projectRoot}' },
    },
    dev: {
      executor: 'nx:run-commands',
      continuous: true,
      options: {
        command: 'vite --port {args.port} --strictPort',
        cwd: '{projectRoot}',
        port: PREVIEW_PORTS[framework],
      },
    },
    typecheck: {
      executor: 'nx:run-commands',
      options: {
        commands: [`${tsc} --noEmit -p tsconfig.app.json`, `${tsc} --noEmit -p tsconfig.spec.json`],
        cwd: '{projectRoot}',
        parallel: false,
      },
    },
  };
}

/** The targets of a preview app by framework. */
function previewTargets(spec: PackageSpec): Record<string, Target> {
  return spec.framework === 'react' || spec.framework === 'vue'
    ? previewViteTargets(spec, spec.framework)
    : previewAngularTargets(spec);
}

/**
 * The docs data of a theme: the `ThemeConfig` and the `modeCollections` its built entry exports. `dependsOn`,
 * `outputs` and the cache come from the `docs-data` default in nx.json. The theme makes its modes index itself (the
 * cocokits theme through its `tokens` target), so the target fails until it exports one.
 */
function docsDataTarget(): Target {
  return { executor: '@cocokits/workspace:docs-data', options: { source: 'theme' } };
}

/**
 * The browser tests of the docs site. `e2e` runs Playwright Test against the built site and is never cached. `typecheck`
 * does not build the site: the project imports no repo source.
 */
function docsE2eTargets(): Record<string, Target> {
  return {
    e2e: {
      executor: 'nx:run-commands',
      cache: false,
      dependsOn: ['docs:build'],
      options: { command: 'playwright test', cwd: '{projectRoot}' },
    },
    typecheck: {
      executor: 'nx:run-commands',
      dependsOn: [],
      options: { command: 'tsc --noEmit -p tsconfig.json', cwd: '{projectRoot}' },
    },
  };
}

function targetsFor(spec: PackageSpec): Record<string, Target> {
  if (spec.kind === 'docs-e2e') return docsE2eTargets();
  if (spec.kind === 'app') {
    return spec.framework === undefined ? { typecheck: astroTypecheckTarget() } : previewTargets(spec);
  }
  return {
    ...(stripsRootExport(spec) ? { package: packageTarget(spec) } : {}),
    ...(spec.type === 'tool' ? {} : { build: buildTarget(spec) }),
    ...(spec.kind === 'theme-core' ? { 'docs-data': docsDataTarget() } : {}),
    typecheck: typecheckTarget(spec),
  };
}

/** The docs-e2e scaffold keeps its config and `tests/` at the project root: it has no `src/`. */
function sourceRootOf(spec: PackageSpec): string {
  if (spec.kind === 'docs-e2e') return spec.root;
  return spec.shape === 'src-root' || spec.shape === 'src-subdirs' ? `${spec.root}/src` : spec.root;
}

/**
 * project.json; `lint` and `test` are inferred by the @nx/eslint and @nx/vitest plugins of nx.json. A tool has
 * no `build`: Nx runs its sources as they are. An app is an `application` with the targets of its kind.
 */
export function buildProjectJson(spec: PackageSpec, offset: string): Record<string, unknown> {
  return {
    $schema: `${offset}node_modules/nx/schemas/project-schema.json`,
    name: spec.projectName,
    projectType: spec.kind === 'app' || spec.kind === 'docs-e2e' ? 'application' : 'library',
    sourceRoot: sourceRootOf(spec),
    tags: [spec.layer, spec.scope, `type:${spec.type}`],
    ...(spec.kind === 'docs-e2e' ? { implicitDependencies: ['docs'] } : {}),
    targets: targetsFor(spec),
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

/**
 * A tool runs from source and emits nothing: the strict config without declaration output, Node types in every
 * config, and the project's `tmp` scratch folder (compile checks of generated code) outside the type check. The
 * docs stories are the same, with JSX kept as written (the compiler reads the story language and never runs it)
 * and the `.tsx` story files and the generated typings (`src/generated/jsx.d.ts`) in the program.
 */
function buildToolTsconfigs(spec: PackageSpec, offset: string): Record<string, Record<string, unknown>> {
  const excludes = ['dist', 'node_modules', 'tmp'];
  const stories = spec.kind === 'docs-stories';
  const sources = stories ? ['**/*.ts', '**/*.tsx'] : ['**/*.ts'];
  return {
    'tsconfig.json': {
      extends: `${offset}tsconfig.strict.json`,
      compilerOptions: {
        isolatedDeclarations: false,
        declaration: false,
        declarationMap: false,
        types: ['node'],
        ...(stories ? { jsx: 'preserve' } : {}),
      },
      include: sources,
      exclude: excludes,
    },
    'tsconfig.lib.json': {
      extends: './tsconfig.json',
      include: sources,
      exclude: [...excludes, ...TEST_GLOBS],
    },
    'tsconfig.spec.json': {
      extends: './tsconfig.json',
      include: ['**/tests/**/*.ts', '**/*.test.ts'],
      exclude: excludes,
    },
  };
}

/** Compiler options of an app: strict, nothing emitted by `tsc` (Astro or the application build compiles it). */
const APP_COMPILER_OPTIONS = {
  isolatedDeclarations: false,
  declaration: false,
  declarationMap: false,
} as const;

/**
 * The Astro site: one `tsconfig.json` for `astro check`, the editor and ESLint. Astro's own strict config comes
 * first, so its JSX and import settings apply; the workspace strict config adds the repo's flags.
 */
function buildAstroTsconfigs(offset: string): Record<string, Record<string, unknown>> {
  return {
    'tsconfig.json': {
      extends: ['astro/tsconfigs/strict', `${offset}tsconfig.strict.json`],
      compilerOptions: { ...APP_COMPILER_OPTIONS, types: ['node'] },
      include: ['.astro/types.d.ts', '**/*'],
      exclude: ['dist', 'node_modules'],
    },
  };
}

/**
 * The Angular preview app: `tsconfig.json` (everything, for the editor and ESLint), `tsconfig.app.json` (what the
 * application build compiles, with `strictTemplates`) and `tsconfig.spec.json` (the tests).
 */
function buildPreviewAngularTsconfigs(offset: string): Record<string, Record<string, unknown>> {
  const excludes = ['dist', 'node_modules', '.angular'];
  return {
    'tsconfig.json': {
      extends: `${offset}tsconfig.strict.json`,
      compilerOptions: { ...APP_COMPILER_OPTIONS, experimentalDecorators: true, types: [] },
      include: ['**/*.ts'],
      exclude: excludes,
    },
    'tsconfig.app.json': {
      extends: './tsconfig.json',
      include: ['src/**/*.ts'],
      exclude: [...excludes, ...TEST_GLOBS],
      angularCompilerOptions: {
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
        strictTemplates: true,
      },
    },
    'tsconfig.spec.json': {
      extends: './tsconfig.json',
      compilerOptions: { types: ['node'] },
      include: ['**/tests/**/*.ts', '**/*.test.ts'],
      exclude: excludes,
    },
  };
}

/**
 * The React and Vue preview apps: `tsconfig.json` (everything, for the editor and ESLint), `tsconfig.app.json` (what
 * the build type-checks) and `tsconfig.spec.json` (the tests). Vite and its client types come from `vite/client`.
 */
function buildPreviewViteTsconfigs(
  framework: 'react' | 'vue',
  offset: string,
): Record<string, Record<string, unknown>> {
  const excludes = ['dist', 'node_modules'];
  const sources = framework === 'react' ? ['**/*.ts', '**/*.tsx'] : ['**/*.ts', '**/*.vue'];
  const tests = framework === 'react' ? ['**/tests/**/*.ts', '**/tests/**/*.tsx'] : ['**/tests/**/*.ts'];
  return {
    'tsconfig.json': {
      extends: `${offset}tsconfig.strict.json`,
      compilerOptions: {
        ...APP_COMPILER_OPTIONS,
        types: ['vite/client'],
        ...(framework === 'react' ? { jsx: 'react-jsx' } : {}),
      },
      include: sources,
      exclude: excludes,
    },
    'tsconfig.app.json': {
      extends: './tsconfig.json',
      include: framework === 'react' ? ['src/**/*.ts', 'src/**/*.tsx'] : ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [...excludes, ...TEST_GLOBS],
    },
    'tsconfig.spec.json': {
      extends: './tsconfig.json',
      compilerOptions: { types: ['node', 'vite/client'] },
      include: [...tests, '**/*.test.ts', '**/*.test.tsx'],
      exclude: excludes,
    },
  };
}

/** The e2e project: one `tsconfig.json` for the tests, the config and the editor; Playwright runs the TypeScript itself. */
function buildDocsE2eTsconfigs(offset: string): Record<string, Record<string, unknown>> {
  return {
    'tsconfig.json': {
      extends: `${offset}tsconfig.strict.json`,
      compilerOptions: { ...APP_COMPILER_OPTIONS, types: ['node'] },
      include: ['**/*.ts'],
      exclude: ['node_modules', 'test-results', 'playwright-report'],
    },
  };
}

function buildPreviewTsconfigs(framework: Framework, offset: string): Record<string, Record<string, unknown>> {
  return framework === 'angular' ? buildPreviewAngularTsconfigs(offset) : buildPreviewViteTsconfigs(framework, offset);
}

/** tsconfig.json (all files, for the editor and ESLint), tsconfig.lib.json and tsconfig.spec.json. */
export function buildTsconfigs(spec: PackageSpec, offset: string): Record<string, Record<string, unknown>> {
  if (spec.kind === 'docs-e2e') return buildDocsE2eTsconfigs(offset);
  if (spec.type === 'tool') return buildToolTsconfigs(spec, offset);
  if (spec.kind === 'app') {
    return spec.framework === undefined ? buildAstroTsconfigs(offset) : buildPreviewTsconfigs(spec.framework, offset);
  }
  const options: Record<string, unknown> = {};
  if (spec.framework === 'react') options['jsx'] = 'react-jsx';
  if (spec.framework === 'angular') options['experimentalDecorators'] = true;
  // tsdown emits declarations without a type checker only with isolatedDeclarations (strict config already has it).
  if (spec.builder === 'tsdown' && !spec.strict) {
    Object.assign(options, { declaration: true, isolatedDeclarations: true });
  }
  // utils-guide: no DOM types in generic utils (its `dom/` and `env/` folders opt in later).
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

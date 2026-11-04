import { readJson } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import {
  COMMON_FILES,
  createWorkspace,
  generate,
  missingFiles,
  readPackage,
  readTags,
  rootDevDependencies,
  sizeEntries,
  snapshot,
  tsconfigPaths,
} from './testing/workspace';

interface Tsconfig {
  extends: string | string[];
  compilerOptions?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
  angularCompilerOptions?: Record<string, unknown>;
}

interface Project {
  name: string;
  projectType: string;
  sourceRoot: string;
  targets: Record<string, { executor: string; continuous?: boolean; options?: Record<string, unknown> }>;
}

function readProject(tree: Parameters<typeof readJson>[0], root: string): Project {
  return readJson<Project>(tree, `${root}/project.json`);
}

function expectPrivateAndUnpublished(pkg: Record<string, unknown>): void {
  expect(pkg['private']).toBe(true);
  expect(pkg).not.toHaveProperty('exports');
  expect(pkg).not.toHaveProperty('files');
  expect(pkg).not.toHaveProperty('publishConfig');
}

describe('library generator: app docs (Astro)', () => {
  it('creates a private application with the app tags, no exports and an Astro check', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'app', name: 'docs' });
    const root = 'apps/docs';
    const expected = [
      ...COMMON_FILES.filter((file) => file !== 'tsconfig.lib.json' && file !== 'tsconfig.spec.json'),
      'astro.config.mjs',
      'src/config.ts',
      'src/pages/index.astro',
      'tests/config.test.ts',
    ];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:app', 'scope:shared', 'type:app']);
    const project = readProject(tree, root);
    expect(project).toMatchObject({ name: 'docs', projectType: 'application', sourceRoot: `${root}/src` });
    expect(Object.keys(project.targets)).toEqual(['typecheck']);
    expect(project.targets['typecheck']?.options).toMatchObject({ command: 'astro check', cwd: '{projectRoot}' });
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: '@cocokits/docs', version: '0.0.0', type: 'module' });
    expectPrivateAndUnpublished(pkg as unknown as Record<string, unknown>);
    expect(pkg.dependencies).toEqual({ '@cocokits/shared': 'workspace:*' });
  });

  it('registers nothing for publishing and adds no root dependency', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'app', name: 'docs' });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
    expect(rootDevDependencies(tree)).toEqual({});
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([['@cocokits/cdk']]);
  });

  it('extends the Astro strict config and the workspace strict config', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', name: 'docs' });
    const tsconfig = readJson<Tsconfig>(tree, 'apps/docs/tsconfig.json');
    expect(tsconfig.extends).toEqual(['astro/tsconfigs/strict', '../../tsconfig.strict.json']);
    expect(tsconfig.compilerOptions).toMatchObject({ declaration: false, isolatedDeclarations: false });
    expect(tsconfig.include).toEqual(['.astro/types.d.ts', '**/*']);
    expect(tsconfig.exclude).toEqual(['dist', 'node_modules']);
  });

  it('writes a placeholder page, config and test', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', name: 'docs' });
    expect(tree.read('apps/docs/src/pages/index.astro', 'utf-8')).toContain('<h1>docs</h1>');
    expect(tree.read('apps/docs/tests/config.test.ts', 'utf-8')).toContain("describe('@cocokits/docs'");
    expect(tree.read('apps/docs/vitest.config.mjs', 'utf-8')).toContain("name: 'docs'");
    expect(tree.read('apps/docs/vitest.config.mjs', 'utf-8')).toContain("environment: 'node'");
  });

  it('leaves an existing app untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', name: 'docs' });
    tree.write('apps/docs/src/pages/index.astro', '<h1>kept</h1>\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'app', name: 'docs' });
    expect(snapshot(tree)).toEqual(before);
    expect(tree.read('apps/docs/src/pages/index.astro', 'utf-8')).toBe('<h1>kept</h1>\n');
  });
});

describe('library generator: app preview-angular', () => {
  it('creates a private application with the Angular scope, build, dev server and typecheck', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework: 'angular' });
    const root = 'apps/preview-angular';
    const expected = [
      ...COMMON_FILES.filter((file) => file !== 'tsconfig.lib.json'),
      'tsconfig.app.json',
      'src/main.ts',
      'src/index.html',
      'src/styles.scss',
      'src/app/app.ts',
      'tests/setup.ts',
      'tests/app.test.ts',
    ];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:app', 'scope:angular', 'type:app']);
    const project = readProject(tree, root);
    expect(project).toMatchObject({ name: 'preview-angular', projectType: 'application' });
    expect(Object.keys(project.targets)).toEqual(['build', 'dev', 'typecheck']);
    expect(project.targets['build']).toMatchObject({
      executor: '@nx/angular:application',
      options: {
        baseHref: '/preview/angular/',
        tsConfig: '{projectRoot}/tsconfig.app.json',
        outputPath: { base: 'dist/apps/preview-angular', browser: '' },
      },
    });
    expect(project.targets['dev']).toMatchObject({
      executor: '@angular/build:dev-server',
      continuous: true,
      options: { buildTarget: 'preview-angular:build:development', port: 4301 },
    });
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: '@cocokits/preview-angular', type: 'module' });
    expectPrivateAndUnpublished(pkg as unknown as Record<string, unknown>);
  });

  it('compiles the app with strictTemplates and runs the tests in jsdom with the Analog plugin', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework: 'angular' });
    const root = 'apps/preview-angular';
    const app = readJson<Tsconfig>(tree, `${root}/tsconfig.app.json`);
    expect(app.angularCompilerOptions).toMatchObject({ strictTemplates: true });
    expect(app.exclude).toEqual(expect.arrayContaining(['**/tests/**']));
    expect(readJson<Tsconfig>(tree, `${root}/tsconfig.json`).extends).toBe('../../tsconfig.strict.json');
    const vitest = tree.read(`${root}/vitest.config.mjs`, 'utf-8') ?? '';
    expect(vitest).toContain('@analogjs/vite-plugin-angular');
    expect(vitest).toContain("environment: 'jsdom'");
    expect(vitest).toContain("name: 'preview-angular'");
  });

  it('registers nothing for publishing', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework: 'angular' });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
  });

  it('leaves an existing app untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework: 'angular' });
    tree.write('apps/preview-angular/src/main.ts', 'export {};\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'app', framework: 'angular', name: 'preview-angular' });
    expect(snapshot(tree)).toEqual(before);
  });
});

describe.each([
  {
    framework: 'react',
    port: 4302,
    plugin: '@vitejs/plugin-react',
    tsc: 'tsc',
    main: 'src/main.tsx',
    ui: 'src/app/app.tsx',
    test: 'tests/app.test.tsx',
  },
  {
    framework: 'vue',
    port: 4303,
    plugin: '@vitejs/plugin-vue',
    tsc: 'vue-tsc',
    main: 'src/main.ts',
    ui: 'src/app/App.vue',
    test: 'tests/app.test.ts',
  },
] as const)('library generator: app preview-$framework', ({ framework, port, plugin, tsc, main, ui, test }) => {
  const root = `apps/preview-${framework}`;

  it('creates a private application with the framework scope, a Vite build, a dev server and a typecheck', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework });
    const expected = [
      ...COMMON_FILES.filter((file) => file !== 'tsconfig.lib.json'),
      'tsconfig.app.json',
      'index.html',
      'vite.config.mjs',
      main,
      ui,
      'src/styles.scss',
      test,
      ...(framework === 'vue' ? ['src/vue-shim.d.ts'] : []),
    ];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:app', `scope:${framework}`, 'type:app']);
    const project = readProject(tree, root);
    expect(project).toMatchObject({ name: `preview-${framework}`, projectType: 'application' });
    expect(Object.keys(project.targets)).toEqual(['build', 'dev', 'typecheck']);
    expect(project.targets['build']).toMatchObject({
      executor: 'nx:run-commands',
      options: { command: 'vite build', cwd: '{projectRoot}' },
    });
    expect(project.targets['dev']).toMatchObject({
      continuous: true,
      options: { command: 'vite --port {args.port} --strictPort', port },
    });
    expect(Object.keys(project.targets['dev']?.options ?? {}).sort()).toEqual(['command', 'cwd', 'port']);
    expect(project.targets['typecheck']?.options).toMatchObject({
      commands: [`${tsc} --noEmit -p tsconfig.app.json`, `${tsc} --noEmit -p tsconfig.spec.json`],
    });
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: `@cocokits/preview-${framework}`, type: 'module' });
    expectPrivateAndUnpublished(pkg as unknown as Record<string, unknown>);
  });

  it('serves the build at /preview/<framework>/ and tests in jsdom with the framework plugin', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework });
    const vite = tree.read(`${root}/vite.config.mjs`, 'utf-8') ?? '';
    expect(vite).toContain(`'/preview/${framework}/'`);
    expect(vite).toContain(plugin);
    expect(vite).toContain(`dist/apps/preview-${framework}`);
    const vitest = tree.read(`${root}/vitest.config.mjs`, 'utf-8') ?? '';
    expect(vitest).toContain(plugin);
    expect(vitest).toContain("environment: 'jsdom'");
    expect(vitest).toContain(`name: 'preview-${framework}'`);
    expect(tree.read(`${root}/index.html`, 'utf-8')).toContain(`src="/${main}"`);
  });

  it('type-checks the sources with the strict config and not the tests in the app config', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework });
    expect(readJson<Tsconfig>(tree, `${root}/tsconfig.json`)).toMatchObject({
      extends: '../../tsconfig.strict.json',
      compilerOptions: { declaration: false, types: ['vite/client'] },
    });
    expect(readJson<Tsconfig>(tree, `${root}/tsconfig.app.json`).exclude).toEqual(
      expect.arrayContaining(['**/tests/**']),
    );
    expect(readJson<Tsconfig>(tree, `${root}/tsconfig.json`).compilerOptions?.['jsx']).toBe(
      framework === 'react' ? 'react-jsx' : undefined,
    );
  });

  it('declares the preview kit when it exists and adds the framework tooling to the root', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'docs-shared' });
    await generate(tree, { kind: 'app', framework });
    expect(readPackage(tree, root).dependencies).toEqual({
      '@cocokits/docs-shared': 'workspace:*',
      '@cocokits/shared': 'workspace:*',
    });
    const dev = rootDevDependencies(tree);
    expect(dev).toHaveProperty('jsdom');
    expect(dev).toHaveProperty(framework);
    expect(dev).toHaveProperty(plugin === '@vitejs/plugin-react' ? plugin : '@testing-library/vue');
  });

  it('registers nothing for publishing', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
  });

  it('leaves an existing app untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'app', framework });
    tree.write(`${root}/${main}`, 'export {};\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'app', framework, name: `preview-${framework}` });
    expect(snapshot(tree)).toEqual(before);
  });
});

describe('library generator: app validation', () => {
  it('needs the name docs or a --framework', async () => {
    await expect(generate(createWorkspace(), { kind: 'app' })).rejects.toThrow(/needs the name "docs"/);
    await expect(generate(createWorkspace(), { kind: 'app', name: 'site' })).rejects.toThrow(/needs the name "docs"/);
  });

  it('does not take a framework for docs, or a theme', async () => {
    await expect(generate(createWorkspace(), { kind: 'app', name: 'docs', framework: 'angular' })).rejects.toThrow(
      /does not take --framework/,
    );
    await expect(generate(createWorkspace(), { kind: 'app', framework: 'angular', theme: 'acme' })).rejects.toThrow(
      /does not take --theme/,
    );
  });

  it('rejects an unknown framework', async () => {
    await expect(generate(createWorkspace(), { kind: 'app', framework: 'svelte' })).rejects.toThrow(
      /Unknown framework/,
    );
  });

  it('rejects another name for the preview app', async () => {
    await expect(generate(createWorkspace(), { kind: 'app', framework: 'angular', name: 'preview' })).rejects.toThrow(
      /must be "preview-angular"/,
    );
  });

  it('rejects the name of a project that exists', async () => {
    const tree = createWorkspace();
    tree.write('tools/other/project.json', JSON.stringify({ name: 'docs' }));
    await expect(generate(tree, { kind: 'app', name: 'docs' })).rejects.toThrow(/already the name/);
    expect(tree.exists('apps/docs')).toBe(false);
  });

  it('keeps the names of the apps and the stories out of tools', async () => {
    for (const name of ['docs', 'docs-stories', 'preview-angular', 'preview-react', 'preview-vue']) {
      await expect(generate(createWorkspace(), { kind: 'tool', name })).rejects.toThrow(/reserved/);
    }
  });
});

describe('library generator: docs-stories', () => {
  it('creates a private tool-typed project in packages/docs-stories with the docs layer', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'docs-stories' });
    const root = 'packages/docs-stories';
    expect(missingFiles(tree, root, [...COMMON_FILES, 'src/placeholder.ts', 'tests/placeholder.test.ts'])).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:docs', 'scope:shared', 'type:tool']);
    const project = readProject(tree, root);
    expect(project).toMatchObject({ name: 'docs-stories', projectType: 'library', sourceRoot: `${root}/src` });
    expect(Object.keys(project.targets)).toEqual(['typecheck']);
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: '@cocokits/docs-stories', version: '0.0.0' });
    expect(pkg).not.toHaveProperty('type');
    expectPrivateAndUnpublished(pkg as unknown as Record<string, unknown>);
    expect(pkg.dependencies).toEqual({ '@cocokits/shared': 'workspace:*' });
  });

  it('registers nothing: no tsconfig path, size entry, changeset group or root dependency', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'docs-stories' });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
    expect(rootDevDependencies(tree)).toEqual({});
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([['@cocokits/cdk']]);
  });

  it('keeps JSX as written, includes the story files and the generated typings, and emits nothing', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-stories' });
    const root = 'packages/docs-stories';
    const base = readJson<Tsconfig>(tree, `${root}/tsconfig.json`);
    expect(base.extends).toBe('../../tsconfig.strict.json');
    expect(base.compilerOptions).toEqual({
      isolatedDeclarations: false,
      declaration: false,
      declarationMap: false,
      types: ['node'],
      jsx: 'preserve',
    });
    expect(base.include).toEqual(['**/*.ts', '**/*.tsx']);
    const lib = readJson<Tsconfig>(tree, `${root}/tsconfig.lib.json`);
    expect(lib.include).toEqual(['**/*.ts', '**/*.tsx']);
    expect(lib.exclude).toEqual(expect.arrayContaining(['tmp', '**/tests/**']));
    expect(base.exclude).not.toContain('src/generated');
  });

  it('does not take a name other than its own, a framework or a theme', async () => {
    await expect(generate(createWorkspace(), { kind: 'docs-stories', name: 'stories' })).rejects.toThrow(
      /must be "docs-stories"/,
    );
    await expect(generate(createWorkspace(), { kind: 'docs-stories', framework: 'react' })).rejects.toThrow(
      /does not take --framework/,
    );
    await expect(generate(createWorkspace(), { kind: 'docs-stories', theme: 'acme' })).rejects.toThrow(
      /does not take --theme/,
    );
  });

  it('leaves an existing project untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-stories' });
    tree.write('packages/docs-stories/src/placeholder.ts', 'export const kept = 1;\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'docs-stories' });
    expect(snapshot(tree)).toEqual(before);
  });
});

describe('library generator: docs-shared', () => {
  it('creates a private tool-typed project in packages/docs-shared with the docs layer and a root entry', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'docs-shared' });
    const root = 'packages/docs-shared';
    expect(missingFiles(tree, root, [...COMMON_FILES, 'src/index.ts', 'tests/index.test.ts'])).toEqual([]);
    expect(tree.exists(`${root}/src/placeholder.ts`)).toBe(false);
    expect(readTags(tree, root)).toEqual(['layer:docs', 'scope:shared', 'type:tool']);
    const project = readProject(tree, root);
    expect(project).toMatchObject({ name: 'docs-shared', projectType: 'library', sourceRoot: `${root}/src` });
    expect(Object.keys(project.targets)).toEqual(['typecheck']);
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: '@cocokits/docs-shared', version: '0.0.0' });
    expectPrivateAndUnpublished(pkg as unknown as Record<string, unknown>);
    expect(pkg.dependencies).toEqual({ '@cocokits/shared': 'workspace:*' });
  });

  it('registers only its tsconfig path: no size entry, changeset group or root dependency', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'docs-shared' });
    expect(tsconfigPaths(tree)).toEqual({ '@cocokits/docs-shared': ['./packages/docs-shared/src/index.ts'] });
    expect(sizeEntries(tree)).toEqual([]);
    expect(rootDevDependencies(tree)).toEqual({});
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([['@cocokits/cdk']]);
  });

  it('does not take a name other than its own, and its name is not free for a tool', async () => {
    await expect(generate(createWorkspace(), { kind: 'docs-shared', name: 'shared-docs' })).rejects.toThrow(
      /must be "docs-shared"/,
    );
    await expect(generate(createWorkspace(), { kind: 'tool', name: 'docs-shared' })).rejects.toThrow(/reserved/);
  });
});

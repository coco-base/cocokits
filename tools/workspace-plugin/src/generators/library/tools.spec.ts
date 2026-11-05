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
  extends: string;
  compilerOptions?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
}

describe('library generator: tool', () => {
  it('creates a private project with the three tags, no exports and no build', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'shared-lib', name: 'shared' });
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    const root = 'tools/sample-tool';
    const expected = [...COMMON_FILES, 'src/placeholder.ts', 'tests/placeholder.test.ts'];
    expect(missingFiles(tree, root, expected)).toEqual([]);
    expect(readTags(tree, root)).toEqual(['layer:tool', 'scope:shared', 'type:tool']);
    const project = readJson<{ name: string; sourceRoot: string; targets: Record<string, unknown> }>(
      tree,
      `${root}/project.json`,
    );
    expect(project.name).toBe('sample-tool');
    expect(project.sourceRoot).toBe(`${root}/src`);
    expect(Object.keys(project.targets)).toEqual(['typecheck']);
    const pkg = readPackage(tree, root);
    expect(pkg).toMatchObject({ name: '@cocokits/sample-tool', version: '0.0.0', private: true });
    expect(pkg).not.toHaveProperty('exports');
    expect(pkg).not.toHaveProperty('files');
    expect(pkg).not.toHaveProperty('publishConfig');
    expect(pkg).not.toHaveProperty('type');
    expect(pkg.dependencies).toEqual({ '@cocokits/shared': 'workspace:*' });
  });

  it('registers nothing for publishing: no tsconfig path, size entry or changeset group', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([['@cocokits/cdk']]);
  });

  it('links the tool in the root package.json so Nx finds its executors', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    expect(rootDevDependencies(tree)).toMatchObject({ '@cocokits/sample-tool': 'workspace:*' });
    expect(rootDevDependencies(tree)).not.toHaveProperty('tsdown');
  });

  it('declares @cocokits/shared only when the package exists', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    expect(readPackage(tree, 'tools/sample-tool')).not.toHaveProperty('dependencies');
  });

  it('writes strict tsconfigs without declaration output, with Node types and the scratch folder excluded', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    const root = 'tools/sample-tool';
    const base = readJson<Tsconfig>(tree, `${root}/tsconfig.json`);
    expect(base.extends).toBe('../../tsconfig.strict.json');
    expect(base.compilerOptions).toEqual({
      isolatedDeclarations: false,
      declaration: false,
      declarationMap: false,
      types: ['node'],
    });
    expect(base.exclude).toContain('tmp');
    const lib = readJson<Tsconfig>(tree, `${root}/tsconfig.lib.json`);
    expect(lib.exclude).toEqual(expect.arrayContaining(['tmp', '**/tests/**']));
    const spec = readJson<Tsconfig>(tree, `${root}/tsconfig.spec.json`);
    expect(spec.include).toContain('**/tests/**/*.ts');
  });

  it('writes the file-size lint config, a vitest config that skips tmp, and a placeholder test', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    const root = 'tools/sample-tool';
    expect(tree.read(`${root}/eslint.config.mjs`, 'utf-8')).toContain("from '../../eslint.config.mjs'");
    const vitest = tree.read(`${root}/vitest.config.mjs`, 'utf-8') ?? '';
    expect(vitest).toContain("name: 'sample-tool'");
    expect(vitest).toContain("'**/tmp/**'");
    expect(tree.read(`${root}/tests/placeholder.test.ts`, 'utf-8')).toContain("describe('@cocokits/sample-tool'");
    expect(tree.read(`${root}/README.md`, 'utf-8')).toContain('# @cocokits/sample-tool');
  });

  it('leaves an existing tool untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    tree.write('tools/sample-tool/src/placeholder.ts', 'export const kept = 1;\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    expect(snapshot(tree)).toEqual(before);
    expect(tree.read('tools/sample-tool/src/placeholder.ts', 'utf-8')).toBe('export const kept = 1;\n');
  });
});

describe('library generator: tool validation', () => {
  it('needs a name', async () => {
    await expect(generate(createWorkspace(), { kind: 'tool' })).rejects.toThrow(/Kind "tool" needs a name/);
  });

  it.each(['Story', '1tool', 'a_b'])('rejects the name "%s"', async (name) => {
    await expect(generate(createWorkspace(), { kind: 'tool', name })).rejects.toThrow(/Invalid name/);
  });

  it.each(['eslint', 'scripts', 'workspace-plugin', 'workspace', 'shared'])(
    'rejects the reserved name "%s"',
    async (name) => {
      await expect(generate(createWorkspace(), { kind: 'tool', name })).rejects.toThrow(/reserved/);
    },
  );

  it('does not take --framework or --theme', async () => {
    const tree = createWorkspace();
    await expect(generate(tree, { kind: 'tool', name: 'x', framework: 'react' })).rejects.toThrow(
      /does not take --framework/,
    );
    await expect(generate(tree, { kind: 'tool', name: 'x', theme: 'acme' })).rejects.toThrow(/does not take --theme/);
  });
});

describe('library generator: tool name collisions', () => {
  it('rejects the name of a package that exists, whatever its folder', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'fw-core', framework: 'angular' });
    await generate(tree, { kind: 'theme-core', theme: 'cocokits' });
    await expect(generate(tree, { kind: 'tool', name: 'angular-core' })).rejects.toThrow(
      /already the name of the project in packages\/angular\/core/,
    );
    await expect(generate(tree, { kind: 'tool', name: 'theme-cocokits' })).rejects.toThrow(/already the name/);
    expect(tree.exists('tools/angular-core')).toBe(false);
  });

  it('rejects the name of an existing package.json even when the project has another name', async () => {
    const tree = createWorkspace();
    tree.write('packages/odd/project.json', JSON.stringify({ name: 'odd', root: 'packages/odd' }));
    tree.write('packages/odd/package.json', JSON.stringify({ name: '@cocokits/clash' }));
    await expect(generate(tree, { kind: 'tool', name: 'clash' })).rejects.toThrow(/already the name/);
  });

  it('still reruns for the tool itself', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'tool', name: 'sample-tool' });
    await expect(generate(tree, { kind: 'tool', name: 'sample-tool' })).resolves.toBeDefined();
  });
});

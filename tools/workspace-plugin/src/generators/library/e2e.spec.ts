import { readJson } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import {
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

interface Project {
  name: string;
  projectType: string;
  implicitDependencies?: string[];
  targets: Record<
    string,
    { executor: string; cache?: boolean; dependsOn?: string[]; options?: Record<string, unknown> }
  >;
}

const ROOT = 'apps/docs-e2e';

describe('library generator: docs-e2e', () => {
  it('creates a private application with the e2e tag, the Playwright config and a smoke test', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-e2e' });
    const expected = [
      'project.json',
      'package.json',
      'tsconfig.json',
      'eslint.config.mjs',
      'README.md',
      'playwright.config.ts',
      'tests/home.spec.ts',
    ];
    expect(missingFiles(tree, ROOT, expected)).toEqual([]);
    expect(missingFiles(tree, ROOT, ['vitest.config.mjs', 'tsconfig.lib.json', 'tsconfig.spec.json'])).toEqual([
      'vitest.config.mjs',
      'tsconfig.lib.json',
      'tsconfig.spec.json',
    ]);
    expect(readTags(tree, ROOT)).toEqual(['layer:app', 'scope:shared', 'type:e2e']);
    const pkg = readPackage(tree, ROOT);
    expect(pkg).toMatchObject({ name: '@cocokits/docs-e2e', version: '0.0.0', private: true, type: 'module' });
    expect(pkg).not.toHaveProperty('exports');
    expect(pkg).not.toHaveProperty('dependencies');
  });

  it('tests the built docs site: an implicit dependency, an uncached e2e target that builds it, a cheap typecheck', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-e2e' });
    const project = readJson<Project>(tree, `${ROOT}/project.json`);
    expect(project).toMatchObject({
      name: 'docs-e2e',
      projectType: 'application',
      implicitDependencies: ['docs'],
      sourceRoot: ROOT,
    });
    expect(Object.keys(project.targets)).toEqual(['e2e', 'typecheck']);
    expect(project.targets['e2e']).toMatchObject({
      cache: false,
      dependsOn: ['docs:build'],
      options: { command: 'playwright test', cwd: '{projectRoot}' },
    });
    expect(project.targets['typecheck']?.dependsOn).toEqual([]);
  });

  it('serves the built site with the docs script on one worker, without retries', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-e2e' });
    const config = tree.read(`${ROOT}/playwright.config.ts`, 'utf-8') ?? '';
    expect(config).toContain('node apps/docs/scripts/serve-dist.mjs --port');
    expect(config).toContain("cwd: '../../'");
    expect(config).toContain('workers: 1');
    expect(config).toContain('retries: 0');
    expect(config).toContain('timeout: 90_000');
    expect(config).toContain('CHROME_PATH');
  });

  it('registers nothing for publishing and adds only Playwright to the root dependencies', async () => {
    const tree = createWorkspace();
    tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/cdk']] }));
    await generate(tree, { kind: 'docs-e2e' });
    expect(tsconfigPaths(tree)).toEqual({});
    expect(sizeEntries(tree)).toEqual([]);
    expect(Object.keys(rootDevDependencies(tree))).toEqual(['@playwright/test']);
    expect(readJson<{ fixed: string[][] }>(tree, '.changeset/config.json').fixed).toEqual([['@cocokits/cdk']]);
  });

  it('does not take a name other than its own, a framework or a theme, and its name is not free for a tool', async () => {
    await expect(generate(createWorkspace(), { kind: 'docs-e2e', name: 'site-tests' })).rejects.toThrow(
      /must be "docs-e2e"/,
    );
    await expect(generate(createWorkspace(), { kind: 'docs-e2e', framework: 'react' })).rejects.toThrow(
      /does not take --framework/,
    );
    await expect(generate(createWorkspace(), { kind: 'docs-e2e', theme: 'acme' })).rejects.toThrow(
      /does not take --theme/,
    );
    await expect(generate(createWorkspace(), { kind: 'tool', name: 'docs-e2e' })).rejects.toThrow(/reserved/);
  });

  it('leaves an existing project untouched on a rerun', async () => {
    const tree = createWorkspace();
    await generate(tree, { kind: 'docs-e2e' });
    tree.write(`${ROOT}/tests/home.spec.ts`, 'export {};\n');
    const before = snapshot(tree);
    await generate(tree, { kind: 'docs-e2e' });
    expect(snapshot(tree)).toEqual(before);
  });
});

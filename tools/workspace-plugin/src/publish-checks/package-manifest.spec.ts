import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Manifest = Record<string, unknown>;
interface PackageManifest {
  problemsOf: (manifest: Manifest, packed: Set<string>) => string[];
}

// The publish checks are plain .mjs scripts of the repository (tools/scripts), run by the publint target.
const { problemsOf } = (await import(
  pathToFileURL(join(__dirname, '../../../scripts/package-manifest.mjs')).href
)) as PackageManifest;

const FILES = new Set(['LICENSE', 'README.md', 'fesm2022/a.mjs']);
const MANIFEST: Manifest = {
  name: '@cocokits/a',
  version: '2.0.0',
  license: 'Apache-2.0',
  exports: { '.': { default: './fesm2022/a.mjs' } },
  dependencies: { '@cocokits/b': '2.0.0' },
};

// The check reads the manifest of the tarball and, for the ng-packagr packages, the one in dist/packages/<name>; both
// go through problemsOf, with the files of that tarball or folder.
describe.each([
  ['tarball manifest', FILES],
  ['Angular dist manifest', new Set([...FILES, 'package.json'])],
])('publishable check: %s', (_where, files) => {
  it('accepts a semantic version', () => {
    for (const version of ['2.0.0', '2.0.0-rc.1', '10.20.30+build.5']) {
      expect(problemsOf({ ...MANIFEST, version }, files)).toEqual([]);
    }
  });

  it.each([
    'banana',
    '2.0',
    'v2.0.0',
    '02.0.0',
    '2.0.0-',
    ' 2.0.0',
    '9007199254740992.0.0',
    `1.0.0-${'a'.repeat(300)}`,
  ])('rejects the version %j', (version) => {
    expect(problemsOf({ ...MANIFEST, version }, files)).toEqual([`"version" is "${version}", not a semantic version`]);
  });

  it.each(['invalid name', 'UpperCase', '@scope name/pkg', '@scope/Upper', '@scope', '.hidden', `a${'b'.repeat(214)}`])(
    'rejects the name %j',
    (name) => {
      const [problem, ...others] = problemsOf({ ...MANIFEST, name }, files);
      expect(problem).toContain(`"name" is "${name}", not a valid package name`);
      expect(others).toEqual([]);
    },
  );

  it.each(['@cocokits/angular-core', 'cocokits', '@scope/pkg.name'])('accepts the name %s', (name) => {
    expect(problemsOf({ ...MANIFEST, name }, files)).toEqual([]);
  });

  it('rejects a missing or empty version', () => {
    expect(problemsOf({ ...MANIFEST, version: '' }, files)).toEqual(['no "version" field']);
    expect(problemsOf({ ...MANIFEST, version: undefined }, files)).toEqual(['no "version" field']);
    expect(problemsOf({ ...MANIFEST, name: undefined }, files)).toEqual(['no "name" field']);
  });

  it('rejects a workspace range and a leftover publishConfig.directory', () => {
    const problems = problemsOf(
      { ...MANIFEST, dependencies: { '@cocokits/b': 'workspace:*' }, publishConfig: { directory: '../dist' } },
      files,
    );
    expect(problems).toEqual([
      'dependencies.@cocokits/b is "workspace:*", not a version range',
      'publishConfig.directory is still set',
    ]);
  });
});

import { resolve } from 'node:path';
import { cruise, type ICruiseResult, type IViolation } from 'dependency-cruiser';
import extractDepcruiseConfig from 'dependency-cruiser/config-utl/extract-depcruise-config';
import extractTsConfig from 'dependency-cruiser/config-utl/extract-ts-config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/** The `cycles` target: .dependency-cruiser.cjs. Fixtures: tools/workspace-plugin/test-fixtures/dependency-cycles. */
const REPO = resolve(import.meta.dirname, '..', '..', '..', '..');
const FIXTURES = 'tools/workspace-plugin/test-fixtures/dependency-cycles';

async function cruiseWithRootConfig(target: string): Promise<ICruiseResult> {
  const config = await extractDepcruiseConfig(resolve(REPO, '.dependency-cruiser.cjs'));
  const tsConfigFile = resolve(REPO, 'tsconfig.base.json');
  const tsConfig = extractTsConfig(tsConfigFile);
  const { output } = await cruise(
    [target],
    {
      ...config.options,
      // The path aliases of tsconfig.base.json only resolve with the repository root as working directory (see beforeAll).
      tsConfig: { fileName: 'tsconfig.base.json' },
      ruleSet: { forbidden: config.forbidden },
      validate: true,
      baseDir: REPO,
    },
    undefined,
    { tsConfig },
  );
  return output as ICruiseResult;
}

function first(violations: IViolation[]): IViolation {
  const [violation] = violations;
  if (!violation) throw new Error('expected a violation');
  return violation;
}

const violationsOf = (result: ICruiseResult): IViolation[] => result.summary.violations;

/** The folder names of a cycle, in order (`a`, `b`, `a`). */
const cycleFolders = (violation: IViolation): string[] =>
  (violation.cycle ?? []).map(({ name }) => name.split('/components/')[1]?.split('/')[0] ?? name);

describe('dependency cycles check', () => {
  const projectDir = process.cwd();
  // Like the `cycles` target, which runs from the repository root.
  beforeAll(() => {
    process.chdir(REPO);
  });
  afterAll(() => {
    process.chdir(projectDir);
  });

  it('reports a cycle between two component folders with its path', async () => {
    const violations = violationsOf(await cruiseWithRootConfig(`${FIXTURES}/two-folder`));
    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule.name).toBe('no-circular');
    expect(cycleFolders(first(violations))).toEqual(['b', 'a']);
  });

  it('reports a cycle between three component folders with its path', async () => {
    const violations = violationsOf(await cruiseWithRootConfig(`${FIXTURES}/three-folder`));
    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule.name).toBe('no-circular');
    expect(cycleFolders(first(violations))).toEqual(['b', 'c', 'a']);
  });

  it('reports a cycle made only of import type', async () => {
    const violations = violationsOf(await cruiseWithRootConfig(`${FIXTURES}/type-only`));
    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule.name).toBe('no-circular');
    expect(cycleFolders(first(violations))).toEqual(['b', 'a']);
  });

  it('reports a cycle that goes through a .vue file', async () => {
    const result = await cruiseWithRootConfig(`${FIXTURES}/vue`);
    const violations = violationsOf(result);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule.name).toBe('no-circular');
    const names = (violations[0]?.cycle ?? []).map(({ name }) => name);
    expect(names.some((name) => name.endsWith('/a/A.vue'))).toBe(true);
  });

  it('rejects a relative import into another component folder but allows internal', async () => {
    const violations = violationsOf(await cruiseWithRootConfig(`${FIXTURES}/relative-imports`));
    expect(violations.map(({ rule, from, to }) => [rule.name, from, to])).toEqual([
      [
        'no-relative-cross-component',
        `${FIXTURES}/relative-imports/components/a/index.ts`,
        `${FIXTURES}/relative-imports/components/b/hidden.ts`,
      ],
    ]);
  });

  it('passes an acyclic chain that imports each folder through its entry', async () => {
    const result = await cruiseWithRootConfig(`${FIXTURES}/acyclic`);
    expect(violationsOf(result)).toEqual([]);
    expect(result.modules).toHaveLength(3);
  });

  it('parses .vue files of the real Vue package, so a missing parser fails here', async () => {
    const result = await cruiseWithRootConfig('packages/vue/src');
    const button = result.modules.find(({ source }) => source.endsWith('button/Button.vue'));
    expect(button, 'Button.vue is not in the result: no Vue parser is installed').toBeDefined();
    expect(
      button?.dependencies.some(
        ({ module, resolved }) =>
          module === '@cocokits/machines/button' && resolved === 'packages/machines/button/index.ts',
      ),
    ).toBe(true);
    expect(violationsOf(result)).toEqual([]);
  });
});

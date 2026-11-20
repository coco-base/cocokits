import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractAngularApiDocs } from './extract';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');
const area = scratchArea('api-docs-angular-redeclared');

/** The `ApiDoc` of the fixture `inherit` with a change of its text. */
function extract(name: string, fixture: string, change: (text: string) => string): ApiDocJson[] {
  const { project, tsConfig } = area.create(
    name,
    {
      'thing/index.ts': change(readFileSync(join(FIXTURES, `${fixture}.ts.txt`), 'utf8')),
      'thing/ng-package.json': JSON.stringify({ lib: { entryFile: 'index.ts' } }),
    },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  return extractAngularApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

// Not here: row D of the merge (an intersection). A class member is declared once in a class, so no two types of an
// intersection can both declare it.
describe('extractAngularApiDocs: the text of a redeclared member', () => {
  const SAVE = '<button thing @click="save">Save</button>';
  const REDECLARED = 'override readonly disabled = input(false, { transform: booleanAttribute });';
  const part = (name: string, change: (text: string) => string): ApiDocJson['parts'][number] | undefined =>
    extract(name, 'inherit', change)[0]?.parts[0];

  it('A: keeps the base text, read to its end, and the example of the override', () => {
    const disabled = part('redeclare-a', (text) =>
      text
        .replace('   * Whether the thing is disabled.\n', '   * Whether the thing is disabled. Use @click to listen.\n')
        .replace(
          "  protected readonly tag = 'button';",
          `  protected readonly tag = 'button';\n\n  /**\n   * @example\n   * <button thing disabled>Save</button>\n   */\n  ${REDECLARED}`,
        ),
    )?.props.find((prop) => prop.name === 'disabled');
    expect(disabled?.description).toBe('Whether the thing is disabled. Use @click to listen.');
    expect(disabled?.examples).toEqual(['<button thing disabled>Save</button>']);
  });

  it('B: keeps the base text and reads the example of the override to its end', () => {
    const toggled = part('redeclare-b', (text) =>
      text.replace(
        "  protected readonly tag = 'button';",
        `  protected readonly tag = 'button';\n\n  /**\n   * @example\n   * ${SAVE}\n   */\n  override readonly toggled = output<boolean>();`,
      ),
    )?.events.find((event) => event.name === 'toggled');
    expect(toggled?.description).toBe('Emits when the thing is toggled.');
    expect(toggled?.examples).toEqual([SAVE]);
  });

  it('C: reads the own text with an @click and keeps the example and default of the base', () => {
    const disabled = part('redeclare-c', (text) =>
      text
        .replace(
          '   * @defaultValue false\n   */',
          '   * @defaultValue false\n   * @example\n   * <button thing disabled>Save</button>\n   */',
        )
        .replace(
          "  protected readonly tag = 'button';",
          `  protected readonly tag = 'button';\n\n  /** Use @click to listen. */\n  ${REDECLARED}`,
        ),
    )?.props.find((prop) => prop.name === 'disabled');
    expect(disabled?.description).toBe('Use @click to listen.');
    expect(disabled?.examples).toEqual(['<button thing disabled>Save</button>']);
    expect(disabled?.default).toBe('false');
  });

  it('H: takes the text of an implemented interface for a member with no comment', () => {
    const hinted = part('implements-h', (text) =>
      text
        .replace(
          '/** The base class: it is not exported, so it has no part. */',
          '/**\n * The hints of a thing.\n */\ninterface ThingHints {\n  /**\n   * The hint text.\n   * @example\n   * <button thing>Save</button>\n   */\n  readonly hinted: string;\n}\n\n/** The base class: it is not exported, so it has no part. */',
        )
        .replace(
          'export class Thing extends ThingBase {',
          'export class Thing extends ThingBase implements ThingHints {\n  readonly hinted = "";\n',
        ),
    )?.methods.find((method) => method.name === 'hinted');
    expect(hinted?.description).toBe('The hint text.');
    expect(hinted?.examples).toEqual(['<button thing>Save</button>']);
  });
});

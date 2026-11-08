import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractAngularApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const area = scratchArea('api-docs-angular-doc-fields');

function extract(name: string, change: (text: string) => string = (text) => text): ApiDocJson {
  const { project, tsConfig } = area.create(
    name,
    {
      'thing/index.ts': change(readFileSync(join(FIXTURES, 'doc-fields.ts.txt'), 'utf8')),
      'thing/ng-package.json': '{ "lib": { "entryFile": "index.ts" } }\n',
    },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  const [doc] = extractAngularApiDocs(REPO, project, tsConfig);
  if (doc === undefined) throw new Error('no ApiDoc');
  return doc;
}

afterEach(() => {
  area.clean();
});

describe('extractAngularApiDocs: the fields of the API page', () => {
  // One extraction serves the cases that read the same package: the Angular compiler is slow to start.
  let cached: ApiDocJson | undefined;
  const doc = (): ApiDocJson => (cached ??= extract('fields'));

  it('writes the example of a part and the text after its first paragraph', () => {
    const part = doc().parts[0];
    expect(part?.remarks).toBe('Put it where the thing shows.');
    expect(part?.examples).toEqual(['<cck-thing side="start" />']);
  });

  it('writes @cckGroup and the @cckValue meanings of an input', () => {
    const props = doc().parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'side')?.values).toEqual([
      { value: 'start', description: 'Before the trigger.' },
      { value: 'end', description: 'After the trigger.' },
    ]);
    expect(props.find((prop) => prop.name === 'touched')?.group).toBe('forms');
  });

  it('writes the non-part exports as symbols: a service, a class and constants, never an @internal one', () => {
    const symbols = doc().symbols ?? [];
    expect(symbols.map((symbol) => [symbol.kind, symbol.name])).toEqual([
      ['service', 'ThingOpener'],
      ['class', 'ThingRef'],
      ['constant', 'THING_CONFIG'],
      ['constant', 'ThingImports'],
    ]);
    const [opener, ref, config, imports] = symbols;
    expect(opener?.props.map((prop) => prop.name)).toEqual(['isOpen']);
    expect(opener?.methods.map((method) => [method.name, method.examples])).toEqual([['open', ['opener.open();']]]);
    expect(ref?.methods.map((method) => method.name)).toEqual(['close']);
    expect(config).toMatchObject({
      type: 'ThingConfig',
      examples: ["providers: [{ provide: THING_CONFIG, useValue: { side: 'end' } }]"],
    });
    expect(imports?.type).toBe('readonly [Thing]');
  });

  it('writes a defaulted method parameter as optional and the @param text in the remarks', () => {
    const ref = extract('params', (text) =>
      text.replace(
        '  /** Closes the thing. */\n  close(): void {}',
        [
          '  /**',
          '   * Closes the thing.',
          '   * @param reason - Why it closes. When not set, the reason is `done`.',
          '   * @param later - Whether it waits.',
          '   */',
          "  close(reason: string = 'done', later?: boolean): void {}",
        ].join('\n'),
      ),
    ).symbols?.find((symbol) => symbol.name === 'ThingRef');
    expect(ref?.methods[0]).toMatchObject({
      type: '(reason?: string, later?: boolean) => void',
      remarks: '`reason`: Why it closes. When not set, the reason is `done`.\n\n`later`: Whether it waits.',
    });
  });

  it('lists every documented interface and alias the entry point exports, except @internal ones', () => {
    const types = doc().types ?? [];
    expect(types.map((type) => [type.name, type.kind])).toEqual([
      ['ThingConfig', 'interface'],
      ['ThingSide', 'alias'],
    ]);
    expect(types[1]?.values?.map((value) => value.value)).toEqual(['start', 'end']);
  });

  it('fails on a malformed @cckValue', () => {
    expect(() =>
      extract('bad-value', (text) =>
        text.replace('   * @cckValue end - After the trigger.\n   */', '   * @cckValue end\n   */'),
      ),
    ).toThrow(/Thing\.side: "@cckValue end" needs the shape/);
  });
});

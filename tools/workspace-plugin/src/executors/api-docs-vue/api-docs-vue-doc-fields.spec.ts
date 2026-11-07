import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractVueApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-vue-doc-fields');

function extract(name: string): ApiDocJson {
  const { project, tsConfig } = area.create(
    name,
    {
      'src/thing/Thing.vue': fixture('doc-fields.vue'),
      'src/thing/thing.types.ts': fixture('doc-fields.types.ts'),
      'src/thing/index.ts': fixture('doc-fields-index.ts'),
    },
    { compilerOptions: { strict: true, types: [], noEmit: true, paths: {} }, include: ['**/*.ts', '**/*.vue'] },
  );
  const [doc] = extractVueApiDocs(REPO, project, tsConfig);
  if (doc === undefined) throw new Error('no ApiDoc');
  return doc;
}

afterEach(() => {
  area.clean();
});

describe('extractVueApiDocs: the fields of the API page', () => {
  // One extraction serves every case: vue-component-meta is slow to start.
  let cached: ApiDocJson | undefined;
  const doc = (): ApiDocJson => (cached ??= extract('fields'));

  it('writes the example of a part and the text after its first paragraph', () => {
    const part = doc().parts[0];
    expect(part?.remarks).toBe('Put it where the thing shows.');
    expect(part?.examples).toEqual(['<Thing v-model="value" size="small" />']);
  });

  it('writes @cckShared, @cckGroup and the @cckValue meanings of a prop', () => {
    const props = doc().parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'as')).toMatchObject({ shared: true });
    expect(props.find((prop) => prop.name === 'side')).toMatchObject({
      group: 'forms',
      values: [
        { value: 'start', description: 'Before the trigger.' },
        { value: 'end', description: 'After the trigger.' },
      ],
    });
  });

  it('leaves out a prop tagged @internal', () => {
    expect(doc().parts[0]?.props.map((prop) => prop.name)).toEqual(['as', 'side', 'modelValue']);
  });

  it('lists the exported interfaces and aliases, except the Props and Emits types of a part', () => {
    const types = doc().types ?? [];
    expect(types.map((type) => type.name)).toEqual(['ThingChange', 'ThingSize']);
    expect(types[1]?.values).toEqual([
      { value: 'small', description: 'A small thing.' },
      { value: 'large', description: 'A large thing.' },
    ]);
  });
});

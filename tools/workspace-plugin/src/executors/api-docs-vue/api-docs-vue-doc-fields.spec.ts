import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractVueApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-vue-doc-fields');

function extract(
  name: string,
  prefix = 'doc-fields',
  change: (text: string) => string = (text) => text,
  changeVue: (text: string) => string = (text) => text,
): ApiDocJson {
  const { project, tsConfig } = area.create(
    name,
    {
      'src/thing/Thing.vue': changeVue(fixture(`${prefix}.vue`)),
      'src/thing/thing.types.ts': change(fixture(`${prefix}.types.ts`)),
      'src/thing/index.ts': fixture(`${prefix}-index.ts`),
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

describe('extractVueApiDocs: an @ that is no tag', () => {
  const EXAMPLE = '<Thing @click="save">Save</Thing>';

  it('reads the text of a part, a prop, an event, an exposed member and a slot to its end', () => {
    const part = extract('at-sign', 'at-sign').parts[0];
    expect(part?.description).toBe('Props of the Thing. Use @click to listen.');
    expect(part?.examples).toEqual([EXAMPLE]);
    expect(part?.props.find((prop) => prop.name === 'side')).toMatchObject({
      description: 'The side the thing opens on. Use @click to listen.',
      examples: [EXAMPLE],
    });
    expect(part?.events[0]).toMatchObject({
      description: 'Emitted with the new value. Use @click to listen.',
      examples: [EXAMPLE],
    });
    expect(part?.methods[0]).toMatchObject({
      name: 'focus',
      description: 'Moves focus into the thing. Use @click to listen.',
      examples: [EXAMPLE],
    });
    expect(part?.slots[0]).toMatchObject({
      description: 'The content of the thing. Use @click to listen. When not set, the thing is empty.',
      examples: [EXAMPLE],
    });
  });

  it('reads an example whole when a line of it holds a tag name', () => {
    const part = extract('at-sign-tag', 'at-sign', (text) =>
      text.replaceAll('<Thing @click="save">', '<Thing @see @param>'),
    ).parts[0];
    expect(part?.examples).toEqual(['<Thing @see @param>Save</Thing>']);
    expect(part?.props.find((prop) => prop.name === 'side')?.examples).toEqual(['<Thing @see @param>Save</Thing>']);
  });

  it('merges the texts of a prop that redeclares a base prop (A, B, C)', () => {
    const props = extract('at-sign-merge', 'at-sign').parts[0]?.props ?? [];
    const prop = (name: string) => props.find((candidate) => candidate.name === name);
    expect(prop('baseCut')).toMatchObject({
      description: 'The first text. Use @click to listen.',
      examples: ['<Thing />'],
    });
    expect(prop('overrideCut')).toMatchObject({
      description: 'The second text.',
      examples: ['<Thing @click="save" />'],
    });
    expect(prop('keepsExample')).toMatchObject({ description: 'Use @click to listen.', examples: ['<Thing />'] });
  });

  it('reports an exposed member that has no comment, and does not read the checker text for it', () => {
    expect(() =>
      extract('at-sign-bare', 'at-sign', undefined, (text) =>
        text.replace('defineExpose({', 'defineExpose({ plain: () => undefined,'),
      ),
    ).toThrow(/Thing\.plain: no TSDoc description/);
  });
});

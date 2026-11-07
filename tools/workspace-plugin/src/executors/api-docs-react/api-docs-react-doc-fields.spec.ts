import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractReactApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-react-doc-fields');

function extract(name: string, change: (text: string) => string = (text) => text): ApiDocJson {
  const { project, tsConfig } = area.create(
    name,
    { 'src/thing/thing.ts': change(fixture('doc-fields.ts')), 'src/thing/index.ts': fixture('doc-fields-index.ts') },
    { compilerOptions: { jsx: 'react-jsx', strict: true, types: [], noEmit: true, paths: {} }, include: ['**/*.ts'] },
  );
  const [doc] = extractReactApiDocs(REPO, project, tsConfig);
  if (doc === undefined) throw new Error('no ApiDoc');
  return doc;
}

afterEach(() => {
  area.clean();
});

describe('extractReactApiDocs: the fields of the API page', () => {
  it('writes the example of a part and the text after its first paragraph', () => {
    const part = extract('part').parts[0];
    expect(part?.description).toBe('Renders a thing.');
    expect(part?.remarks).toBe('Put it where the thing shows.\n\nIt needs a label.');
    expect(part?.examples).toEqual(['<Thing size="small" />']);
  });

  it('writes @cckGroup, @cckShared and the @cckValue meanings of a member', () => {
    const props = extract('member').parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'size')).toMatchObject({
      group: 'forms',
      values: [
        { value: 'small', description: 'A small thing.' },
        { value: 'large', description: 'A large thing.' },
      ],
    });
    expect(props.find((prop) => prop.name === 'render')).toMatchObject({ shared: true });
    expect(props.find((prop) => prop.name === 'render')).not.toHaveProperty('values');
    expect(props.find((prop) => prop.name === 'size')).not.toHaveProperty('shared');
  });

  it('gives a member typed by a documented alias the meanings of the alias', () => {
    const side = extract('alias-values').parts[0]?.props.find((prop) => prop.name === 'side');
    expect(side).toMatchObject({
      type: "'start' | 'end'",
      values: [
        { value: 'start', description: 'Before the trigger.' },
        { value: 'end', description: 'After the trigger.' },
      ],
    });
  });

  it('lists every documented interface and alias the entry point exports, except the props type and @internal', () => {
    const types = extract('types').types ?? [];
    expect(types.map((type) => [type.name, type.kind])).toEqual([
      ['ThingChange', 'interface'],
      ['ThingSide', 'alias'],
    ]);
    expect(types[1]).toEqual({
      kind: 'alias',
      name: 'ThingSide',
      description: 'Where the thing opens.',
      text: "'start' | 'end'",
      fields: [],
      values: [
        { value: 'start', description: 'Before the trigger.' },
        { value: 'end', description: 'After the trigger.' },
      ],
    });
    expect(types[0]?.fields.find((field) => field.name === 'reason')?.values).toEqual([
      { value: 'user', description: 'The user changed it.' },
    ]);
  });

  it('reads a slot typed ReactNode or a render function: the object fields, or one field from @param', () => {
    const slots = extract('scope').parts[0]?.slots ?? [];
    expect(slots.find((slot) => slot.name === 'default')?.scope).toEqual([
      { name: 'open', type: 'boolean', description: 'Whether the thing is open.' },
    ]);
    expect(slots.find((slot) => slot.name === 'label')?.scope).toEqual([
      { name: 'value', type: 'string', description: 'The value the thing holds.' },
    ]);
  });

  it('marks the @param field of a render function framework-only when the prop has a @cckParity reason', () => {
    const doc = extract('scope-parity', (text) =>
      text.replace('   * @param value -', '   * @cckParity A node or a function of the value.\n   * @param value -'),
    );
    expect(doc.parts[0]?.slots.find((slot) => slot.name === 'label')?.scope).toEqual([
      { name: 'value', type: 'string', description: 'The value the thing holds.', semanticId: 'none' },
    ]);
  });

  it('fails on a malformed @cckValue on a member and on an alias', () => {
    expect(() =>
      extract('bad-member', (text) => text.replace('@cckValue small - A small thing.', '@cckValue small')),
    ).toThrow(/Thing\.size: "@cckValue small" needs the shape/);
    expect(() =>
      extract('bad-alias', (text) => text.replace('@cckValue start - Before', '@cckValue start Before')),
    ).toThrow(/ThingSide: "@cckValue start Before the trigger\." needs the shape/);
  });
});

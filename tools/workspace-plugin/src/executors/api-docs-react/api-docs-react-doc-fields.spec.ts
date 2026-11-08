import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractReactApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-react-doc-fields');

function extract(
  name: string,
  change: (text: string) => string = (text) => text,
  more: Record<string, string> = {},
): ApiDocJson {
  const { project, tsConfig } = area.create(
    name,
    {
      'src/thing/thing.ts': change(fixture('doc-fields.ts')),
      'src/thing/index.ts': fixture('doc-fields-index.ts'),
      ...more,
    },
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

  it('expands an alias made from the items of a const list, in the order of the list', () => {
    const order = [
      "const orders = ['end', 'start'] as const;",
      '/**',
      ' * An order.',
      ' * @cckValue end - The end first.',
      ' * @cckValue start - The start first.',
      ' */',
      'type ThingOrder = (typeof orders)[number];',
      '',
    ].join('\n');
    const props =
      extract('const-list', (text) =>
        `${text}\n${order}`.replace(
          '  /** The content, or a function of the state that returns it. */',
          '  /** The order of the thing. */\n  readonly order: ThingOrder;\n  /** The content, or a function of the state that returns it. */',
        ),
      ).parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'order')).toMatchObject({
      type: "'end' | 'start'",
      values: [
        { value: 'end', description: 'The end first.' },
        { value: 'start', description: 'The start first.' },
      ],
    });
  });

  it('lists every documented interface and alias the entry point exports, except the props type and @internal', () => {
    const types = extract('types').types ?? [];
    expect(types.map((type) => [type.name, type.kind])).toEqual([
      ['ThingChange', 'interface'],
      ['ThingSide', 'alias'],
      ['ThingState', 'interface'],
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

  it('adds a documented own type that a member names and the entry point does not export, and the types it names', () => {
    // A name a row writes is read in the scope of the row, so a type parameter is no type of the program.
    const anchor = [
      '/** A point the thing can open from. */',
      "interface ThingAnchor<Reason extends string = 'near'> {",
      '  /** The corner of the point. */',
      '  readonly corner: ThingCorner;',
      '  /** Why it opens there. */',
      '  readonly why?: Reason;',
      '  readonly bare?: Bare;',
      '}',
      '/**',
      ' * A corner.',
      ' * @cckValue top - The top corner.',
      ' * @cckValue bottom - The bottom corner.',
      ' */',
      "type ThingCorner = 'top' | 'bottom';",
      '/** A type parameter of ThingAnchor has the same name, so this alias gets no row. */',
      "type Reason = 'x' | 'y';",
      'interface Bare {',
      '  readonly x: 1;',
      '}',
      '',
    ].join('\n');
    const types =
      extract('referenced', (text) =>
        `${text}\n${anchor}`.replace(
          '  /** The side the thing opens on. */',
          '  /** The point the thing opens from. */\n  readonly anchor?: ThingAnchor;\n  /** The side the thing opens on. */',
        ),
      ).types ?? [];
    expect(types.map((type) => type.name)).toEqual([
      'ThingAnchor',
      'ThingChange',
      'ThingCorner',
      'ThingSide',
      'ThingState',
    ]);
    expect(types.find((type) => type.name === 'ThingCorner')?.values).toHaveLength(2);
    expect(types.find((type) => type.name === 'ThingAnchor')?.fields.map((field) => field.name)).toEqual([
      'corner',
      'why',
    ]);
  });

  it('lists the inherited fields of an interface, without the omitted ones, and names a native base', () => {
    const bases = [
      '/** What every change sends. */',
      'interface ThingBase<R extends string> {',
      '  /** Why it changed. */',
      '  readonly cause: R;',
      '  /** The event that changed it. */',
      '  readonly source?: Event;',
      '}',
      '',
    ].join('\n');
    const types =
      extract('inherited', (text) =>
        `${text}\n${bases}`
          .replace(
            'export interface ThingChange {',
            "export interface ThingChange extends Omit<ThingBase<'user'>, 'source'>, Pick<HTMLAttributes<HTMLElement>, 'id'> {",
          )
          .replace(
            "import type { ReactElement, ReactNode } from 'react';",
            "import type { HTMLAttributes, ReactElement, ReactNode } from 'react';",
          ),
      ).types ?? [];
    const change = types.find((type) => type.name === 'ThingChange');
    expect(change?.fields.map((field) => [field.name, field.type])).toEqual([
      ['value', 'string'],
      ['reason', "'user'"],
      ['cause', "'user'"],
    ]);
    expect(change?.remarks).toBe("It also has the native attributes of `Pick<HTMLAttributes<HTMLElement>, 'id'>`.");
  });

  it('reads a name of a member type where the member is declared, also when another folder has the same name', () => {
    const doc = extract(
      'placed',
      (text) =>
        `import type { ThingRender } from '../internal/render';\nimport '../other/render';\n${text}`.replace(
          '  /** The side the thing opens on. */',
          '  /** How the thing renders. */\n  readonly look?: ThingRender;\n  /** The side the thing opens on. */',
        ),
      {
        'src/internal/render.ts':
          '/** How a thing renders: a name or a tag. */\nexport type ThingRender = string | number;\n',
        'src/other/render.ts': '/** Another type of the same name. */\nexport type ThingRender = boolean;\n',
      },
    );
    expect(doc.types?.find((type) => type.name === 'ThingRender')?.text).toBe('string | number');
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

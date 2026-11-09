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

  it('names the native bases an own base extends, never the own base', () => {
    const bases = [
      '/** What every change has. */',
      "interface ThingRootBase extends Omit<HTMLAttributes<HTMLElement>, 'color'> {",
      '  /** The name of the base. */',
      '  readonly base?: string;',
      '}',
      '',
    ].join('\n');
    const change = (
      extract('native-of-base', (text) =>
        `${text}\n${bases}`
          .replace('export interface ThingChange {', 'export interface ThingChange extends Omit<ThingRootBase, "id"> {')
          .replace(
            "import type { ReactElement, ReactNode } from 'react';",
            "import type { HTMLAttributes, ReactElement, ReactNode } from 'react';",
          ),
      ).types ?? []
    ).find((type) => type.name === 'ThingChange');
    expect(change?.fields.map((field) => field.name)).toContain('base');
    // The outer `Omit` of the own base also leaves its key out of the native attributes.
    expect(change?.remarks).toBe(
      'It also has the native attributes of `Omit<Omit<HTMLAttributes<HTMLElement>, \'color\'>, "id">`.',
    );
  });

  it('says what a type parameter of a row stands for', () => {
    const generic = [
      '/** A change of some kind. */',
      "interface ThingKind<Kind extends string, Size = 'md'> {",
      '  /** The kind. */',
      '  readonly kind: Kind;',
      '  /** The size. */',
      '  readonly size?: Size;',
      '}',
      '/**',
      ' * A change with a name.',
      ' * @typeParam Name - The name of the change.',
      ' */',
      'interface ThingNamed<Name> {',
      '  /** The name. */',
      '  readonly name: Name;',
      '}',
      '',
    ].join('\n');
    const types =
      extract('type-params', (text) =>
        `${text}\n${generic}`.replace(
          '  /** The side the thing opens on. */',
          "  /** A kind. */\n  readonly kind?: ThingKind<'a'>;\n  /** A name. */\n  readonly named?: ThingNamed<string>;\n  /** The side the thing opens on. */",
        ),
      ).types ?? [];
    expect(types.find((type) => type.name === 'ThingKind')?.remarks).toBe(
      '`Kind`: the type you write in its place in `ThingKind<Kind, Size>`. It must be a `string`.\n\n' +
        "`Size`: the type you write in its place in `ThingKind<Kind, Size>`. When not set, it is `'md'`.",
    );
    expect(types.find((type) => type.name === 'ThingNamed')?.remarks).toBe('`Name`: The name of the change.');
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

  it('fails on an @example of a type, which no page can show', () => {
    expect(() =>
      extract('type-example', (text) =>
        text.replace(
          ' * Where the thing opens.',
          " * Where the thing opens.\n * @example\n * const side: ThingSide = 'start';",
        ),
      ),
    ).toThrow(/ThingSide: a Types row cannot show an @example/);
  });
});

describe('extractReactApiDocs: an @ that is no tag in a redeclared member', () => {
  /** `ThingProps` extends a base that documents `extra`, and redeclares `extra` with the given comment. */
  const withBase = (baseComment: string, overrideComment: string) => (text: string) =>
    text.replace(
      '/** Props of the {@link Thing}. */\nexport interface ThingProps {',
      `interface ThingBase {\n  ${baseComment}\n  readonly extra?: string;\n}\n\n/** Props of the {@link Thing}. */\nexport interface ThingProps extends ThingBase {\n  ${overrideComment}\n  readonly extra?: string;`,
    );

  it('keeps the base description, read to its end, and the tags of the override', () => {
    const extra = extract(
      'inherited-cut',
      withBase('/** The extra text. Use @click to listen. */', '/**\n   * @example\n   * <Thing />\n   */'),
    ).parts[0]?.props.find((prop) => prop.name === 'extra');
    expect(extra?.description).toBe('The extra text. Use @click to listen.');
    expect(extra?.examples).toEqual(['<Thing />']);
  });

  it('keeps the base description and reads the example of the override to its end', () => {
    const extra = extract(
      'override-cut',
      withBase('/** The extra text. */', '/**\n   * @example\n   * <Thing @click="save" />\n   */'),
    ).parts[0]?.props.find((prop) => prop.name === 'extra');
    expect(extra?.description).toBe('The extra text.');
    expect(extra?.examples).toEqual(['<Thing @click="save" />']);
  });
});

describe('extractReactApiDocs: the merge of the texts of a member', () => {
  const extra = (change: (text: string) => string, name: string) =>
    extract(name, change).parts[0]?.props.find((prop) => prop.name === 'extra');

  it('C: reads an override text with an @click and keeps the example of the base', () => {
    const member = extra(
      (text) =>
        text.replace(
          '/** Props of the {@link Thing}. */\nexport interface ThingProps {',
          '/** Base props. */\ninterface ThingBase {\n  /**\n   * Base text.\n   * @example\n   * <Thing />\n   */\n  readonly extra?: string;\n}\n\n/** Props of the {@link Thing}. */\nexport interface ThingProps extends ThingBase {\n  /** Use @click to listen. */\n  readonly extra?: string;',
        ),
      'merge-c',
    );
    expect(member?.description).toBe('Use @click to listen.');
    expect(member?.examples).toEqual(['<Thing />']);
  });

  it('D: joins both texts of an intersection, each read to its end', () => {
    const member = extra(
      (text) =>
        text
          .replace(
            '/** Props of the {@link Thing}. */\nexport interface ThingProps {',
            'interface ExtraA {\n  /** First. Use @click here. */\n  readonly extra?: string;\n}\n\ninterface ExtraB {\n  /** Second. */\n  readonly extra?: string;\n}\n\n/** Props of the {@link Thing}. */\nexport interface ThingProps {',
          )
          .replace(
            'export function Thing(props: ThingProps)',
            'export function Thing(props: ThingProps & ExtraA & ExtraB)',
          ),
      'merge-d',
    );
    expect(member?.description).toBe('First. Use @click here. Second.');
  });
});

describe('extractReactApiDocs: an @ that is no tag in a scoped slot', () => {
  it('reads the text of an object scope field and of a primitive scope field to its end', () => {
    const slots =
      extract('at-sign-scope', (text) =>
        text
          .replace('/** Whether the thing is open. */', '/** Whether the thing is open. Use @click to listen. */')
          .replace(
            '@param value - The value the thing holds.',
            '@param value - The value the thing holds. Use @click to listen.',
          ),
      ).parts[0]?.slots ?? [];
    expect(slots.find((slot) => slot.name === 'default')?.scope?.[0]?.description).toBe(
      'Whether the thing is open. Use @click to listen.',
    );
    expect(slots.find((slot) => slot.name === 'label')?.scope?.[0]?.description).toBe(
      'The value the thing holds. Use @click to listen.',
    );
  });
});

describe('extractReactApiDocs: an @ that is no tag', () => {
  it('reads the text of a part and a prop to its end', () => {
    const EXAMPLE = '<Thing @click="save">Save</Thing>';
    const part = extract('at-sign', (text) =>
      text
        .replace(' * Renders a thing.\n', ' * Renders a thing. Use @click to listen.\n')
        .replace(' * <Thing size="small" />', ` * ${EXAMPLE}`)
        .replace(
          '   * The size of the thing.\n',
          `   * The size of the thing. Use @click to listen.\n   * @example\n   * ${EXAMPLE}\n`,
        ),
    ).parts[0];
    expect(part?.description).toBe('Renders a thing. Use @click to listen.');
    expect(part?.examples).toEqual([EXAMPLE]);
    expect(part?.props.find((prop) => prop.name === 'size')).toMatchObject({
      description: 'The size of the thing. Use @click to listen.',
      examples: [EXAMPLE],
    });
  });
});

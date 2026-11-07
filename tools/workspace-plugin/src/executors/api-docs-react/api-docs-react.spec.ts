import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REPO, scratchArea, withJunction } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import executor from './executor';
import { extractReactApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-react');

const TSCONFIG = {
  compilerOptions: {
    jsx: 'react-jsx',
    strict: true,
    types: [],
    noEmit: true,
    paths: {},
    exactOptionalPropertyTypes: true,
  },
  include: ['**/*.ts', '**/*.tsx'],
};

const LABEL_DOC = '  /** The accessible label. */\n';

function createPackage(name: string, thing = fixture('thing.ts')): { project: string; tsConfig: string } {
  return area.create(name, { 'src/thing/thing.ts': thing, 'src/thing/index.ts': fixture('index.ts') }, TSCONFIG);
}

function extract(name: string, thing?: string): ApiDocJson[] {
  const { project, tsConfig } = createPackage(name, thing);
  return extractReactApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractReactApiDocs', () => {
  it('writes one part per exported component, with its anatomy part and semantic id', () => {
    const [doc, ...more] = extract('part');
    expect(more).toEqual([]);
    expect(doc).toMatchObject({ component: 'thing', framework: 'react' });
    expect(doc?.parts).toHaveLength(1);
    expect(doc?.parts[0]).toMatchObject({ name: 'Thing', semanticId: 'thing.root', anatomyPart: 'root' });
    expect(doc?.parts[0]?.selector).toBeUndefined();
  });

  it('lists only the props a CocoKits file declares, with no native, DOM or ref member', () => {
    const names = extract('props')[0]?.parts[0]?.props.map((prop) => prop.name);
    expect(names?.sort()).toEqual(['disabled', 'label', 'native', 'render']);
  });

  it('lists a ReactNode prop as a slot, and children as the slot default', () => {
    const part = extract('slots')[0]?.parts[0];
    expect(part?.slots).toEqual([
      {
        name: 'default',
        semanticId: 'thing.default',
        type: 'ReactNode',
        required: false,
        description: 'The content of the thing.',
      },
      { name: 'hint', semanticId: 'thing.hint', type: 'ReactNode', required: false, description: 'A hint zone.' },
    ]);
    expect(part?.props.map((prop) => prop.name)).not.toContain('children');
  });

  it('writes the part description on every part', () => {
    const parts = extract('description')[0]?.parts ?? [];
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) expect(part.description).not.toBe('');
    expect(parts[0]?.description).toBe('Renders a thing.');
  });

  it('counts React.ReactNode and ReactNode | null as slots, keeps an explicit @cckSemantic, and not a union', () => {
    const thing = fixture('thing.ts')
      .replace('readonly hint?: ReactNode;', 'readonly hint?: React.ReactNode;')
      .replace(
        '  /** The content of the thing. */\n  readonly children?: ReactNode | undefined;',
        '  /**\n   * The content of the thing.\n   * @cckSemantic thing.body\n   */\n  readonly children?: ReactNode | null;\n  /** Text or a number. */\n  readonly either?: ReactNode | number;',
      )
      .replace(
        'import type { ButtonHTMLAttributes, ReactElement, ReactNode }',
        "import type * as React from 'react';\nimport type { ButtonHTMLAttributes, ReactElement, ReactNode }",
      );
    const part = extract('qualified', thing)[0]?.parts[0];
    expect(part?.slots.map((slot) => [slot.name, slot.semanticId])).toEqual([
      ['default', 'thing.body'],
      ['hint', 'thing.hint'],
    ]);
    expect(part?.props.map((prop) => prop.name)).toContain('either');
  });

  it('keeps the TSDoc a Pick brings from the machine type, and reads the default and the type as written', () => {
    const props = extract('picked')[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'disabled')).toEqual({
      name: 'disabled',
      semanticId: 'thing.disabled',
      type: 'boolean',
      default: 'false',
      required: false,
      description: 'Whether the thing is disabled.',
    });
    expect(props.find((prop) => prop.name === 'native')).toMatchObject({ type: 'boolean', default: 'true' });
  });

  it('writes @cckSemantic none and @remarks, a required prop and the element type without its default arguments', () => {
    const props = extract('semantic')[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'render')).toMatchObject({
      semanticId: 'none',
      remarks: 'The element override.',
      required: false,
      type: 'ReactElement | ((props: ThingProps) => ReactElement)',
    });
    expect(props.find((prop) => prop.name === 'label')).toMatchObject({ required: true, type: 'string' });
  });

  it('lists a callback named on<Thing> as an event, with its @cckSemantic id, and not as a prop', () => {
    const thing = fixture('thing.ts').replace(
      '  /** The accessible label. */',
      '  /**\n   * Called when the thing changes.\n   * @cckSemantic thing.change\n   */\n  readonly onThingChange?: (() => void) | undefined;\n  /** The accessible label. */',
    );
    const part = extract('events', thing)[0]?.parts[0];
    expect(part?.events.map((event) => [event.name, event.semanticId])).toEqual([['onThingChange', 'thing.change']]);
    expect(part?.props.map((prop) => prop.name)).not.toContain('onThingChange');
  });

  it('skips an @internal component and a hook', () => {
    expect(extract('skipped')[0]?.parts.map((part) => part.name)).toEqual(['Thing']);
  });

  it('fails on a prop without TSDoc, naming the file that declares it', () => {
    const thing = fixture('thing.ts').replace(LABEL_DOC, '');
    expect(() => extract('missing', thing)).toThrow(/Thing\.label: no TSDoc description \(declared in thing\.ts\)/);
  });

  it('fails on a prop of the machine type without TSDoc', () => {
    const thing = fixture('thing.ts').replace(
      '  /**\n   * Whether the thing is disabled.\n   * @defaultValue false\n   */\n',
      '',
    );
    expect(() => extract('missing-machine', thing)).toThrow(/Thing\.disabled: no TSDoc description/);
  });

  it('lists every problem in one error: a component without @cckPart and description, and a prop without TSDoc', () => {
    const thing = fixture('thing.ts')
      .replace('/**\n * Renders a thing.\n * @cckPart root\n */', '/** */')
      .replace(LABEL_DOC, '');
    try {
      extract('no-part', thing);
      expect.unreachable();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      expect(message).toContain('3 problem(s)');
      expect(message).toContain('Thing: the TSDoc needs "@cckPart <part>"');
      expect(message).toContain('Thing: no TSDoc description');
      expect(message).toContain('Thing.label: no TSDoc description');
    }
  });

  it('fails on a package without an entry point and on an entry that exports no component', () => {
    const empty = area.create('empty', { 'src/internal/index.ts': 'export {};\n' }, TSCONFIG);
    expect(() => extractReactApiDocs(REPO, empty.project, empty.tsConfig)).toThrow(/no React entry point/);
    const none = area.create('no-component', { 'src/thing/index.ts': 'export const answer = 42;\n' }, TSCONFIG);
    expect(() => extractReactApiDocs(REPO, none.project, none.tsConfig)).toThrow(
      /thing: the entry point exports no component/,
    );
  });
});

describe('extractReactApiDocs: hostile input', () => {
  it('lists only kebab-case folders as entry points, so a folder name never reaches a file path', () => {
    const { project, tsConfig } = createPackage('names');
    for (const name of ['Weird Name', 'a.b', '-x', 'x_y', 'UPPER', 'internal', 'generated']) {
      mkdirSync(join(project, 'src', name), { recursive: true });
      writeFileSync(join(project, 'src', name, 'index.ts'), 'export {};\n');
    }
    expect(extractReactApiDocs(REPO, project, tsConfig).map((doc) => doc.component)).toEqual(['thing']);
  });

  it('keeps quotes, backslashes, markup and path text in TSDoc as JSON data', () => {
    const hostile = 'He said "hi" \\" </script><img src=x onerror=1> ../../etc/passwd   end';
    const thing = fixture('thing.ts')
      .replace(LABEL_DOC, `  /** ${hostile} */\n`)
      .replace('@cckPart root', '@cckPart ../../escape');
    const doc = extract('hostile', thing)[0];
    const label = doc?.parts[0]?.props.find((prop) => prop.name === 'label');
    expect(label?.description).toContain('</script><img src=x onerror=1> ../../etc/passwd');
    expect(label?.description).toContain('He said "hi" \\"');
    expect(doc?.parts[0]?.anatomyPart).toBe('../../escape');
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });
});

describe('api-docs-react executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes one ApiDoc file per entry point into the project, deterministically', async () => {
    createPackage('run');
    const out = join(area.dir, 'run', 'out');
    const outputDir = `tools/workspace-plugin/tmp/api-docs-react/run/out`;
    expect((await executor({ outputDir }, area.context('run'))).success).toBe(true);
    expect(readdirSync(out)).toEqual(['thing.json']);
    const first = readFileSync(join(out, 'thing.json'), 'utf8');
    expect(JSON.parse(first)).toMatchObject({ component: 'thing', framework: 'react' });
    expect(first.endsWith('}\n')).toBe(true);
    await executor({ outputDir }, area.context('run'));
    expect(readFileSync(join(out, 'thing.json'), 'utf8')).toBe(first);
  });

  it('fails on a prop without TSDoc and writes nothing', async () => {
    createPackage('fail', fixture('thing.ts').replace(LABEL_DOC, ''));
    expect(
      (await executor({ outputDir: 'tools/workspace-plugin/tmp/api-docs-react/fail/out' }, area.context('fail')))
        .success,
    ).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/Thing\.label/);
    expect(existsSync(join(area.dir, 'fail', 'out'))).toBe(false);
  });

  it('fails for an outputDir or a tsConfig outside the workspace', async () => {
    createPackage('paths');
    for (const options of [
      { outputDir: '../outside' },
      { outputDir: '../../../../../../x' },
      { tsConfig: '../tsconfig.json' },
    ]) {
      expect((await executor(options, area.context('paths'))).success).toBe(false);
    }
    const errors = vi.mocked(console.error).mock.calls.join('\n');
    expect(errors).toMatch(/outputDir: .* is outside the workspace/);
    expect(errors).toMatch(/tsConfig: .* is outside the workspace/);
  });

  it('fails for an outputDir through a junction to a folder outside the workspace', async () => {
    const { project } = createPackage('junction');
    await withJunction(join(project, 'link'), async (outside) => {
      const options = { outputDir: 'tools/workspace-plugin/tmp/api-docs-react/junction/pkg/link/out' };
      expect((await executor(options, area.context('junction'))).success).toBe(false);
      expect(readdirSync(outside)).toEqual([]);
    });
  });
});

describe('extractReactApiDocs: scoped slots', () => {
  const withScope = (field: string): string =>
    fixture('thing.ts')
      .replace(
        '  /** A hint zone. */',
        '  /** What the thing shows. */\n  readonly preview?: (scope: PreviewScope) => ReactNode;\n  /** A hint zone. */',
      )
      .replace(
        '/** Props of the {@link Thing}.',
        `interface PreviewScope {
${field}
}

/** Props of the {@link Thing}.`,
      );

  it('lists a prop typed (scope) => ReactNode as a slot with the members of the scope', () => {
    const thing = withScope('  /** The chosen ones. */\n  readonly selected: readonly string[];');
    const slot = extract('scoped', thing)[0]?.parts[0]?.slots.find((item) => item.name === 'preview');
    expect(slot?.scope).toEqual([{ name: 'selected', type: 'readonly string[]', description: 'The chosen ones.' }]);
    expect(extract('scoped-props', thing)[0]?.parts[0]?.props.map((prop) => prop.name)).not.toContain('preview');
  });

  it('writes a type parameter of the scope with its default', () => {
    const thing = withScope(['  /** The chosen ones. */', '  readonly selected: readonly T[];'].join('\n'))
      .replace('interface PreviewScope {', 'interface PreviewScope<T = string> {')
      .replace('(scope: PreviewScope)', '(scope: PreviewScope<T>)')
      .replace('export interface ThingProps extends', 'export interface ThingProps<T = string> extends');
    const slot = extract('scoped-generic', thing)[0]?.parts[0]?.slots.find((item) => item.name === 'preview');
    expect(slot?.scope?.[0]?.type).toBe('readonly string[]');
  });

  it('fails on a scope field without TSDoc', () => {
    expect(() => extract('scoped-bare', withScope('  readonly selected: readonly string[];'))).toThrow(
      /scope field "selected" has no TSDoc/,
    );
  });
});

describe('extractReactApiDocs: scope field parity', () => {
  const withNone = (tags: string): string =>
    fixture('thing.ts')
      .replace(
        '  /** A hint zone. */',
        '  /** What the thing shows. */\n  readonly preview?: (scope: PreviewScope) => ReactNode;\n  /** A hint zone. */',
      )
      .replace(
        '/** Props of the {@link Thing}.',
        `interface PreviewScope {
  /**
   * The chosen ones.
   * @cckSemantic none
${tags}
   */
  readonly selected: readonly string[];
}

/** Props of the {@link Thing}.`,
      );

  it('writes semanticId none on a field with a @cckParity reason and keeps the reason out of the JSON', () => {
    const docs = extract('scope-parity', withNone('   * @cckParity A field only React has.'));
    const slot = docs[0]?.parts[0]?.slots.find((item) => item.name === 'preview');
    expect(slot?.scope).toEqual([
      { name: 'selected', type: 'readonly string[]', description: 'The chosen ones.', semanticId: 'none' },
    ]);
  });

  it('fails on a none field without @cckParity, with only @remarks, or with an empty one', () => {
    const missing = /scope field "selected".*@cckParity/;
    expect(() => extract('scope-no-parity', withNone(''))).toThrow(missing);
    expect(() => extract('scope-remarks', withNone('   * @remarks A reason.'))).toThrow(missing);
    expect(() => extract('scope-empty', withNone('   * @cckParity'))).toThrow(/scope field "selected"/);
  });
});

describe('extractReactApiDocs: generic components', () => {
  it('reads a prop typed by a type parameter with the default of the parameter', () => {
    const thing = fixture('thing.ts')
      .replace('export interface ThingProps extends', 'export interface ThingProps<T = string> extends')
      .replace(
        '  /** The accessible label. */',
        '  /** The chosen values. */\n  readonly picked?: readonly T[];\n  /** The accessible label. */',
      );
    const props = extract('generic', thing)[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'picked')?.type).toBe('readonly string[]');
  });

  it('reads a prop typed by a type parameter that defaults to a boolean literal as a boolean', () => {
    const thing = fixture('thing.ts')
      .replace('export interface ThingProps extends', 'export interface ThingProps<M extends boolean = false> extends')
      .replace(
        '  /** The accessible label. */',
        '  /** Whether several can be chosen. */\n  readonly many?: M | undefined;\n  /** The accessible label. */',
      );
    const props = extract('generic-flag', thing)[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'many')?.type).toBe('boolean');
  });
});

describe('extractReactApiDocs: a props type that is a union', () => {
  const union = [
    "import type { ReactElement } from 'react';",
    '',
    'interface BaseProps {',
    '  /** Whether the thing is disabled. */',
    '  readonly disabled?: boolean | undefined;',
    '}',
    'interface SingleProps extends BaseProps {',
    '  /** The mode. */',
    "  readonly type: 'single';",
    '  /** Whether the open one can close. */',
    '  readonly collapsible?: boolean | undefined;',
    '}',
    'interface MultipleProps extends BaseProps {',
    '  /** The mode. */',
    "  readonly type: 'multiple';",
    '}',
    '',
    '/**',
    ' * Renders a thing.',
    ' * @cckPart root',
    ' */',
    'export function Thing(props: SingleProps | MultipleProps): ReactElement {',
    '  return props as unknown as ReactElement;',
    '}',
  ].join('\n');

  it('merges the branches: the types joined, a member of some branches optional', () => {
    const props = extract('union', union)[0]?.parts[0]?.props ?? [];
    const rows = props.map((prop) => [prop.name, prop.type, prop.required]).sort();
    expect(rows).toEqual([
      ['collapsible', 'boolean', false],
      ['disabled', 'boolean', false],
      ['type', "'single' | 'multiple'", true],
    ]);
  });
});

describe('extractReactApiDocs: parts and defaults that differ by design', () => {
  const differs = (reason: string): string =>
    fixture('thing.ts').replace(
      '  /** The accessible label. */',
      `  /**\n   * The accessible label.\n   * @cckDefaultDiffers${reason}\n   */`,
    );

  it('writes the reason of @cckDefaultDiffers on the member, and fails on the tag without a reason', () => {
    const label = extract('differs', differs(' Read from a token.'))[0]?.parts[0]?.props.find(
      (prop) => prop.name === 'label',
    );
    expect(label?.defaultDiffers).toBe('Read from a token.');
    expect(() => extract('differs-empty', differs(''))).toThrow(/Thing\.label: "@cckDefaultDiffers" needs a reason/);
  });

  it('marks a component tagged @cckSemantic none as framework-only, and needs its @cckParity', () => {
    const tagged = (reason: string): string =>
      fixture('thing.ts').replace(
        ' * @cckPart root\n */\nexport function Thing',
        ` * @cckPart root\n * @cckSemantic none\n${reason} */\nexport function Thing`,
      );
    const part = extract('only', tagged(' * @cckParity One framework only.\n'))[0]?.parts[0];
    expect(part?.frameworkOnly).toBe(true);
    expect(JSON.stringify(part)).not.toMatch(/parity|One framework only/i);
    expect(() => extract('only-remarks', tagged(' * @remarks The part.\n'))).toThrow(/needs a "@cckParity"/);
    expect(() => extract('only-empty', tagged(''))).toThrow(
      /Thing: the part is "@cckSemantic none" and needs a "@cckParity"/,
    );
  });

  it('checks @cckParity on a prop and keeps it out of the JSON', () => {
    const source = (tags: string): string =>
      fixture('thing.ts').replace(
        '   * @cckSemantic none\n   * @remarks The element override.\n   * @cckParity Another framework has no override.\n',
        tags,
      );
    const props = extract('parity', source('   * @cckSemantic none\n   * @cckParity Other has it.\n'))[0]?.parts[0]
      ?.props;
    const render = props?.find((prop) => prop.name === 'render');
    expect(render).toMatchObject({ semanticId: 'none', description: 'Replaces the element.' });
    expect(JSON.stringify(render)).not.toMatch(/parity|Other has it/i);
    expect(() => extract('parity-none', source('   * @cckSemantic none\n'))).toThrow(
      /Thing\.render is "@cckSemantic none" and needs a "@cckParity" reason/,
    );
    expect(() => extract('parity-empty', source('   * @cckParity\n'))).toThrow(
      /Thing\.render: "@cckParity" needs a reason/,
    );
  });

  it('writes {@link} in the description, remarks and deprecated text as plain text', () => {
    const linked = fixture('thing.ts').replace(
      '   * Whether it is native.\n',
      '   * Whether it is {@link Thing | native}.\n   *\n   * Read {@link ThingProps}.\n   * @deprecated Use {@link Thing}.\n',
    );
    const native = extract('links', linked)[0]?.parts[0]?.props.find((prop) => prop.name === 'native');
    expect(native).toMatchObject({
      description: 'Whether it is native.',
      remarks: 'Read `ThingProps`.',
      deprecated: 'Use `Thing`.',
    });
  });
});

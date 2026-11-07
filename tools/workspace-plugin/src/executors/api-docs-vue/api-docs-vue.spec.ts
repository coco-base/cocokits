import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REPO, scratchArea, withJunction } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import executor from './executor';
import { extractVueApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-vue');

const TSCONFIG = {
  compilerOptions: { strict: true, types: [], noEmit: true, paths: {} },
  include: ['**/*.ts', '**/*.vue'],
};

const LABEL_DOC = '  /** The accessible label. */\n';

interface Sources {
  vue?: string;
  types?: string;
  /** More files of the package, by path from the package root. */
  more?: Record<string, string>;
}

function createPackage(name: string, sources: Sources = {}): { project: string; tsConfig: string } {
  return area.create(
    name,
    {
      'src/thing/Thing.vue': sources.vue ?? fixture('Thing.vue'),
      'src/thing/thing.types.ts': sources.types ?? fixture('thing.types.ts'),
      'src/thing/index.ts': fixture('index.ts'),
      ...sources.more,
    },
    TSCONFIG,
  );
}

function extract(name: string, sources?: Sources): ApiDocJson[] {
  const { project, tsConfig } = createPackage(name, sources);
  return extractVueApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractVueApiDocs', () => {
  it('writes one part per .vue file, with the anatomy part from its Props type', () => {
    const [doc, ...more] = extract('part');
    expect(more).toEqual([]);
    expect(doc).toMatchObject({ component: 'thing', framework: 'vue' });
    expect(doc?.parts).toHaveLength(1);
    expect(doc?.parts[0]).toMatchObject({ name: 'Thing', semanticId: 'thing.root', anatomyPart: 'root' });
    expect(doc?.parts[0]?.selector).toBeUndefined();
  });

  it('lists the declared props only, never a global prop such as key or ref', () => {
    const names = extract('props')[0]?.parts[0]?.props.map((prop) => prop.name);
    expect(names?.sort()).toEqual(['as', 'disabled', 'label', 'modelValue']);
  });

  it('lets @defaultValue win over withDefaults, and reads the type without undefined', () => {
    const props = extract('defaults')[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'disabled')).toEqual({
      name: 'disabled',
      semanticId: 'thing.disabled',
      type: 'boolean',
      default: 'false',
      required: false,
      description: 'Whether the thing is disabled.',
    });
    expect(props.find((prop) => prop.name === 'as')).toMatchObject({
      semanticId: 'none',
      default: "'button'",
      remarks: 'The element override.',
    });
    expect(props.find((prop) => prop.name === 'label')).toMatchObject({ required: true, type: 'string' });
  });

  it('uses the default of withDefaults when the TSDoc has no @defaultValue, and ignores an undefined one', () => {
    const types = fixture('thing.types.ts').replace('   * @defaultValue false\n', '');
    const vue = fixture('Thing.vue').replace('disabled: undefined, as', 'as');
    const [doc] = extract('source-default', { types, vue });
    const props = doc?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'as')).toMatchObject({ default: "'button'" });
    expect(props.find((prop) => prop.name === 'disabled')?.default).toBeUndefined();
  });

  it('writes the slot, the emit and the v-model binding', () => {
    const part = extract('slots')[0]?.parts[0];
    expect(part?.slots).toEqual([
      expect.objectContaining({ name: 'default', description: 'The content of the thing.', required: false }),
    ]);
    expect(part?.events.map((event) => event.name)).toEqual(['update:modelValue']);
    expect(part?.bindings).toEqual([{ semanticId: 'thing.modelValue', value: 'modelValue', syntax: 'v-model' }]);
  });

  it('writes the part description, and honours @cckSemantic none on a slot', () => {
    const parts = extract('description')[0]?.parts ?? [];
    for (const part of parts) expect(part.description).not.toBe('');
    expect(parts[0]?.description).toBe('Props of the Thing.');
    const vue = fixture('Thing.vue').replace(
      '  /** The content of the thing. */\n',
      '  /**\n   * The host element.\n   * @cckSemantic none\n   * @remarks The host.\n   * @cckParity Only here.\n   */\n',
    );
    expect(extract('slot-none', { vue })[0]?.parts[0]?.slots).toEqual([
      expect.objectContaining({ name: 'default', semanticId: 'none', remarks: 'The host.' }),
    ]);
  });

  it('fails on a prop without TSDoc and on a slot without TSDoc', () => {
    const types = fixture('thing.types.ts').replace(LABEL_DOC, '');
    expect(() => extract('missing-prop', { types })).toThrow(/Thing\.label: no TSDoc description/);
    const vue = fixture('Thing.vue').replace('  /** The content of the thing. */\n', '');
    expect(() => extract('missing-slot', { vue })).toThrow(/Thing\.default: no TSDoc description/);
  });

  it('fails without @cckPart, without a description and without the Props type, listing every problem', () => {
    const types = fixture('thing.types.ts').replace('/**\n * Props of the Thing.\n * @cckPart root\n */', '/** */');
    try {
      extract('no-part', { types: types.replace(LABEL_DOC, '') });
      expect.unreachable();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      expect(message).toContain('3 problem(s)');
      expect(message).toContain('ThingProps: the TSDoc needs "@cckPart <part>"');
      expect(message).toContain('ThingProps: no TSDoc description');
      expect(message).toContain('Thing.label: no TSDoc description');
    }
    expect(() => extract('no-type', { types: 'export {};\n' })).toThrow(
      /Thing: the folder needs an exported ThingProps in a \*\.types\.ts file/,
    );
  });

  it('fails on a package without an entry point and on an entry without a .vue file', () => {
    const empty = area.create('empty', { 'src/internal/index.ts': 'export {};\n' }, TSCONFIG);
    expect(() => extractVueApiDocs(REPO, empty.project, empty.tsConfig)).toThrow(/no Vue entry point/);
    const none = area.create('no-vue', { 'src/thing/index.ts': 'export {};\n' }, TSCONFIG);
    expect(() => extractVueApiDocs(REPO, none.project, none.tsConfig)).toThrow(
      /thing: the entry point has no \.vue component/,
    );
  });
});

describe('extractVueApiDocs: hostile input', () => {
  it('lists only kebab-case folders as entry points, so a folder name never reaches a file path', () => {
    const { project, tsConfig } = createPackage('names');
    for (const name of ['Weird Name', 'a.b', '-x', 'x_y', 'UPPER', 'internal', 'generated']) {
      mkdirSync(join(project, 'src', name), { recursive: true });
      writeFileSync(join(project, 'src', name, 'index.ts'), 'export {};\n');
    }
    expect(extractVueApiDocs(REPO, project, tsConfig).map((doc) => doc.component)).toEqual(['thing']);
  });

  it('keeps quotes, backslashes, markup and path text in TSDoc as JSON data', () => {
    const hostile = 'He said "hi" \\" </script><img src=x onerror=1> ../../etc/passwd';
    const types = fixture('thing.types.ts')
      .replace(LABEL_DOC, `  /** ${hostile} */\n`)
      .replace('@cckPart root', '@cckPart ../../escape');
    const doc = extract('hostile', { types })[0];
    const label = doc?.parts[0]?.props.find((prop) => prop.name === 'label');
    expect(label?.description).toContain('</script><img src=x onerror=1> ../../etc/passwd');
    expect(label?.description).toContain('He said "hi" \\"');
    expect(doc?.parts[0]?.anatomyPart).toBe('../../escape');
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });
});

/** The thing fixture with the text the text rules ask for: a root example and the "When not set" sentences. */
const FOLLOWS_TEXT_RULES: Sources = {
  types: fixture('thing.types.ts')
    .replace(' * @cckPart root\n */', ' * @cckPart root\n * @example\n * <Thing label="Save">Save</Thing>\n */')
    .replace(
      '/** The value, for `v-model`. */',
      '/** The value, for `v-model`. When not set, the thing has no value. */',
    ),
  vue: fixture('Thing.vue').replace(
    '/** The content of the thing. */',
    '/**\n   * The content. When not set, the thing is empty.\n   * @example\n   * <Thing label="Save">Save</Thing>\n   */',
  ),
};

describe('api-docs-vue executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes one ApiDoc file per entry point into the project, deterministically', async () => {
    createPackage('run', FOLLOWS_TEXT_RULES);
    const out = join(area.dir, 'run', 'out');
    const outputDir = `tools/workspace-plugin/tmp/api-docs-vue/run/out`;
    expect((await executor({ outputDir }, area.context('run'))).success).toBe(true);
    expect(readdirSync(out)).toEqual(['thing.json']);
    const first = readFileSync(join(out, 'thing.json'), 'utf8');
    expect(JSON.parse(first)).toMatchObject({ component: 'thing', framework: 'vue' });
    expect(first.endsWith('}\n')).toBe(true);
    await executor({ outputDir }, area.context('run'));
    expect(readFileSync(join(out, 'thing.json'), 'utf8')).toBe(first);
  });

  it('fails on TSDoc that breaks a text rule, names the item and writes nothing', async () => {
    createPackage('rules');
    const outputDir = 'tools/workspace-plugin/tmp/api-docs-vue/rules/out';
    expect((await executor({ outputDir }, area.context('rules'))).success).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/vue\/thing Thing \(root part\): needs an @example/);
    expect(existsSync(join(area.dir, 'rules', 'out'))).toBe(false);
  });

  it('fails on a prop without TSDoc and writes nothing', async () => {
    createPackage('fail', { types: fixture('thing.types.ts').replace(LABEL_DOC, '') });
    expect(
      (await executor({ outputDir: 'tools/workspace-plugin/tmp/api-docs-vue/fail/out' }, area.context('fail'))).success,
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
      const options = { outputDir: 'tools/workspace-plugin/tmp/api-docs-vue/junction/pkg/link/out' };
      expect((await executor(options, area.context('junction'))).success).toBe(false);
      expect(readdirSync(outside)).toEqual([]);
    });
  });
});

describe('extractVueApiDocs: scoped slots', () => {
  const vue = (field: string): string =>
    fixture('Thing.vue').replace(
      '  default?(): unknown;\n}>();',
      `  default?(): unknown;\n  /** What the thing shows. */\n  preview?(props: {\n${field}\n  }): unknown;\n}>();`,
    );

  it('writes the props of a slot as its scope, with their TSDoc', () => {
    const doc = extract('scoped', {
      vue: vue('    /** The chosen ones. */\n    selected: readonly string[];'),
    });
    const preview = doc[0]?.parts[0]?.slots.find((slot) => slot.name === 'preview');
    expect(preview?.scope).toEqual([{ name: 'selected', type: 'readonly string[]', description: 'The chosen ones.' }]);
    expect(doc[0]?.parts[0]?.slots.find((slot) => slot.name === 'default')?.scope).toBeUndefined();
  });

  it('writes a type parameter of the scope with the default of the component', () => {
    const types = fixture('thing.types.ts').replace(
      'export interface ThingProps {',
      'export interface ThingProps<T = string> {',
    );
    const generic = vue(['    /** The chosen ones. */', '    selected: readonly T[];'].join('\n'))
      .replace('<script setup lang="ts">', '<script setup lang="ts" generic="T">')
      .replace('defineProps<ThingProps>()', 'defineProps<ThingProps<T>>()');
    const doc = extract('scoped-generic', { types, vue: generic });
    expect(doc[0]?.parts[0]?.slots.find((slot) => slot.name === 'preview')?.scope?.[0]?.type).toBe('readonly string[]');
  });

  it('checks @cckParity on a prop and keeps it out of the JSON', () => {
    const types = (tags: string): string =>
      fixture('thing.types.ts').replace(
        '   * @cckSemantic none\n   * @remarks The element override.\n   * @cckParity Another framework has no override.\n',
        tags,
      );
    const props = extract('parity', { types: types('   * @cckSemantic none\n   * @cckParity Other has it.\n') })[0]
      ?.parts[0]?.props;
    const as = props?.find((prop) => prop.name === 'as');
    expect(as).toMatchObject({ semanticId: 'none' });
    expect(JSON.stringify(as)).not.toMatch(/parity|Other has it/i);
    expect(() => extract('parity-none', { types: types('   * @cckSemantic none\n') })).toThrow(
      /is "@cckSemantic none" and needs a "@cckParity" reason/,
    );
    expect(() => extract('parity-empty', { types: types('   * @cckParity\n') })).toThrow(/"@cckParity" needs a reason/);
  });

  it('marks a slot prop tagged @cckSemantic none and needs its @cckParity', () => {
    const tagged = (remarks: string, tag = 'cckParity'): string =>
      vue(
        [
          '    /**',
          '     * The chosen ones.',
          '     *',
          '     * @cckSemantic none',
          ...(remarks === '' ? [] : [`     * @${tag} ${remarks}`]),
          '     */',
          '    selected: readonly string[];',
        ].join('\n'),
      );
    const doc = extract('scoped-none', { vue: tagged('Vue only.') });
    const preview = doc[0]?.parts[0]?.slots.find((slot) => slot.name === 'preview');
    expect(preview?.scope).toEqual([
      { name: 'selected', type: 'readonly string[]', description: 'The chosen ones.', semanticId: 'none' },
    ]);
    expect(() => extract('scoped-none-bare', { vue: tagged('') })).toThrow(/needs a "@cckParity" reason/);
  });

  it('fails on a slot prop without TSDoc', () => {
    expect(() => extract('scoped-bare', { vue: vue('    selected: readonly string[];') })).toThrow(
      /scope field "selected" has no TSDoc/,
    );
  });
});

describe('extractVueApiDocs: generic components', () => {
  it('reads a prop typed by a type parameter with the default of the parameter', () => {
    const types = fixture('thing.types.ts')
      .replace('export interface ThingProps {', 'export interface ThingProps<T = string> {')
      .replace('readonly modelValue?: string;', 'readonly modelValue?: T[];');
    const props = extract('generic', { types })[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'modelValue')?.type).toBe('string[]');
  });

  it('writes a member of a component declared with generic="T" with the default of the type parameter', () => {
    const types = fixture('thing.types.ts')
      .replace('export interface ThingProps {', 'export interface ThingProps<T = string> {')
      .replace('readonly modelValue?: string;', 'readonly modelValue?: T | readonly T[] | null;');
    const vue = fixture('Thing.vue')
      .replace('<script setup lang="ts">', '<script setup lang="ts" generic="T">')
      .replace('defineProps<ThingProps>()', 'defineProps<ThingProps<T>>()');
    const [doc] = extract('generic-sfc', { types, vue });
    const modelValue = doc?.parts[0]?.props.find((prop) => prop.name === 'modelValue');
    expect(modelValue?.type).toBe('string | readonly string[] | null');
    expect(doc?.parts[0]?.props.map((prop) => prop.name).sort()).toEqual(['as', 'disabled', 'label', 'modelValue']);
  });

  it('reads the Props type from any types file of the folder, not only the first by name', () => {
    const types = fixture('thing.types.ts')
      .replace('export interface ThingProps {', 'export interface ThingProps<T = string> {')
      .replace('readonly modelValue?: string;', 'readonly modelValue?: T[];');
    // `thing-list.types.ts` sorts before `thing.types.ts`, as `select-list.types.ts` before `select.types.ts`.
    const list = `export interface ThingListProps {\n${LABEL_DOC}  readonly label: string;\n}\n`;
    const more = { 'src/thing/thing-list.types.ts': list };
    const vue = fixture('Thing.vue')
      .replace('<script setup lang="ts">', '<script setup lang="ts" generic="T">')
      .replace('defineProps<ThingProps>()', 'defineProps<ThingProps<T>>()');
    const props = extract('split-types', { types, vue, more })[0]?.parts[0]?.props ?? [];
    expect(props.find((prop) => prop.name === 'modelValue')?.type).toBe('string[]');
  });
});

describe('extractVueApiDocs: parts and defaults that differ by design', () => {
  const differs = (reason: string): string =>
    fixture('thing.types.ts').replace(
      LABEL_DOC,
      `  /**\n   * The accessible label.\n   * @cckDefaultDiffers${reason}\n   */\n`,
    );

  it('writes the reason of @cckDefaultDiffers on the member, and fails on the tag without a reason', () => {
    const label = extract('differs', { types: differs(' Read from a token.') })[0]?.parts[0]?.props.find(
      (prop) => prop.name === 'label',
    );
    expect(label?.defaultDiffers).toBe('Read from a token.');
    expect(() => extract('differs-empty', { types: differs('') })).toThrow(
      /Thing\.label: "@cckDefaultDiffers" needs a reason/,
    );
  });

  it('marks a part tagged @cckSemantic none as framework-only, and needs its @cckParity', () => {
    const tagged = (remarks: string): string =>
      fixture('thing.types.ts').replace(
        ' * @cckPart root\n */',
        ` * @cckPart root\n * @cckSemantic none\n${remarks} */`,
      );
    expect(extract('only', { types: tagged(' * @cckParity Only here.\n') })[0]?.parts[0]?.frameworkOnly).toBe(true);
    expect(() => extract('only-empty', { types: tagged('') })).toThrow(
      /ThingProps: the part is "@cckSemantic none" and needs a "@cckParity"/,
    );
  });
});

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import executor from './executor';

let dir = '';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'docs-data-'));
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function write(path: string, content: string): void {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

function context(project: string, root: string): never {
  return { root: dir, projectName: project, projectsConfigurations: { projects: { [project]: { root } } } } as never;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(dir, path), 'utf8'));
}

function errors(): string {
  return vi
    .mocked(console.error)
    .mock.calls.map((call) => String(call[0]))
    .join('\n');
}

const ANATOMY = `export const alphaAnatomy = { block: 'alpha', parts: { root: { name: 'Root', description: 'The root.' } }, classes: { root: 'cck-alpha' } };`;
const META = `export const alphaMeta = { apg: 'https://example.test/alpha', dataAttrs: { root: ['data-disabled'] }, dataAttrDetails: { 'data-disabled': { setWhen: 'The alpha is disabled.' } }, roles: { root: null }, keyboard: [{ key: 'Enter', context: 'root', action: 'Activates.' }], form: 'Native.' };`;

/** A fake machines package with built `dist` files: `./alpha` complete and, optionally, `./beta`. */
function machines(beta: string | undefined): void {
  const exportsField: Record<string, unknown> = {
    './alpha': { types: './dist/alpha/index.d.ts', default: './dist/alpha/index.js' },
  };
  write('packages/m/dist/alpha/index.js', `${ANATOMY}\n${META}\n`);
  if (beta !== undefined) {
    exportsField['./beta'] = { default: './dist/beta/index.js' };
    write('packages/m/dist/beta/index.js', beta);
  }
  write('packages/m/package.json', JSON.stringify({ name: '@x/m', type: 'module', exports: exportsField }));
}

describe('docs-data: machines', () => {
  it('writes ComponentDocData for every component subpath, from the built package', async () => {
    machines(undefined);
    const result = await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(result.success).toBe(true);
    expect(readJson('dist/docs-data/m/alpha.json')).toEqual({
      kind: 'component',
      componentName: 'alpha',
      anatomy: {
        block: 'alpha',
        parts: { root: { name: 'Root', description: 'The root.' } },
        classes: { root: 'cck-alpha' },
      },
      meta: {
        apg: 'https://example.test/alpha',
        dataAttrs: { root: ['data-disabled'] },
        dataAttrDetails: { 'data-disabled': { setWhen: 'The alpha is disabled.' } },
        roles: { root: null },
        keyboard: [{ key: 'Enter', context: 'root', action: 'Activates.' }],
        form: 'Native.',
      },
    });
  });

  it('accepts a meta with no apg, because some components follow no pattern', async () => {
    write(
      'packages/m/package.json',
      JSON.stringify({ type: 'module', exports: { './alpha': { default: './dist/a.js' } } }),
    );
    write(
      'packages/m/dist/a.js',
      `${ANATOMY}
${META.replace("apg: 'https://example.test/alpha', ", '')}
`,
    );
    const result = await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(result.success).toBe(true);
    expect(readJson('dist/docs-data/m/alpha.json')).not.toHaveProperty('meta.apg');
  });

  it('reads the camelCase export names of a kebab-case subpath', async () => {
    write(
      'packages/m/package.json',
      JSON.stringify({ type: 'module', exports: { './date-picker': { default: './dist/dp.js' } } }),
    );
    write(
      'packages/m/dist/dp.js',
      `${ANATOMY.replace('alpha', 'datePicker').replace('alpha', 'date-picker')}\n${META.replace('alphaMeta', 'datePickerMeta')}\n`,
    );
    const result = await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(result.success).toBe(true);
    expect(readJson('dist/docs-data/m/date-picker.json')).toMatchObject({
      componentName: 'date-picker',
    });
  });

  it('fails on a subpath without the two exports and names the subpath', async () => {
    machines(`${ANATOMY.replace('alpha', 'beta').replace("'alpha'", "'beta'")}\n`);
    const result = await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(result.success).toBe(false);
    expect(errors()).toMatch(/\.\/beta: .* does not export betaMeta/);
    expect(existsSync(join(dir, 'dist/docs-data'))).toBe(false);
  });

  it('fails on an export that is not an anatomy or a meta', async () => {
    machines('export const betaAnatomy = { block: 1 };\nexport const betaMeta = {};\n');
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(false);
    expect(errors()).toMatch(/\.\/beta: the anatomy export is not made by defineAnatomy/);
  });

  it.each([
    ['an empty frameworks list', '[]', /the keyboard row "Enter" has an empty or invalid "frameworks" list/],
    ['an unknown framework name', "['react', 'svelte']", /names an unknown framework "svelte"/],
  ])('fails on a keyboard row with %s', async (_label, list, message) => {
    machines(
      `${ANATOMY.replace('alpha', 'beta').replace("'alpha'", "'beta'")}
${META.replace('alphaMeta', 'betaMeta').replace("action: 'Activates.'", `action: 'Activates.', frameworks: ${list}`)}
`,
    );
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(false);
    expect(errors()).toMatch(message);
  });

  const betaWith = (details: string): string =>
    `${ANATOMY.replace('alpha', 'beta').replace("'alpha'", "'beta'")}
${META.replace('alphaMeta', 'betaMeta').replace("dataAttrs: { root: ['data-disabled'] }, dataAttrDetails: { 'data-disabled': { setWhen: 'The alpha is disabled.' } }", details)}
`;
  const ATTRS = "dataAttrs: { root: ['data-disabled', 'data-state'] }";

  it('keeps dataAttrDetails, values and set when, in the docs data', async () => {
    machines(
      betaWith(
        `${ATTRS}, dataAttrDetails: { 'data-disabled': { setWhen: 'Off.' }, 'data-state': { values: ['open', 'closed'], setWhen: 'Always.' } }`,
      ),
    );
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(true);
    expect(readJson('dist/docs-data/m/beta.json')).toHaveProperty('meta.dataAttrDetails', {
      'data-disabled': { setWhen: 'Off.' },
      'data-state': { values: ['open', 'closed'], setWhen: 'Always.' },
    });
  });

  it.each([
    [
      'an attribute with no entry',
      `${ATTRS}, dataAttrDetails: { 'data-disabled': { setWhen: 'Off.' } }`,
      /\.\/beta: data-state is named in dataAttrs but has no entry in dataAttrDetails/,
    ],
    [
      'no dataAttrDetails at all',
      ATTRS,
      /\.\/beta: data-disabled is named in dataAttrs but has no entry in dataAttrDetails/,
    ],
    [
      'an entry for an attribute no part lists',
      `dataAttrs: { root: ['data-disabled'] }, dataAttrDetails: { 'data-disabled': { setWhen: 'Off.' }, 'data-ghost': { setWhen: 'Never.' } }`,
      /\.\/beta: dataAttrDetails has an entry for data-ghost, which no part lists in dataAttrs/,
    ],
    [
      'an empty setWhen',
      `dataAttrs: { root: ['data-disabled'] }, dataAttrDetails: { 'data-disabled': { setWhen: ' ' } }`,
      /\.\/beta: dataAttrDetails data-disabled has an empty setWhen/,
    ],
    [
      'empty values',
      `dataAttrs: { root: ['data-disabled'] }, dataAttrDetails: { 'data-disabled': { values: [], setWhen: 'Off.' } }`,
      /\.\/beta: dataAttrDetails data-disabled has an empty values list/,
    ],
  ])('fails on %s and names the component and the attribute', async (_label, details, message) => {
    machines(betaWith(details));
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(false);
    expect(errors()).toMatch(message);
  });

  it('accepts a meta with no attribute and no dataAttrDetails', async () => {
    machines(betaWith('dataAttrs: { root: [] }'));
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(true);
  });

  it('keeps a keyboard row frameworks list in the docs data', async () => {
    write(
      'packages/m/package.json',
      JSON.stringify({ type: 'module', exports: { './alpha': { default: './dist/a.js' } } }),
    );
    write(
      'packages/m/dist/a.js',
      `${ANATOMY}
${META.replace("action: 'Activates.'", "action: 'Activates.', frameworks: ['react', 'vue']")}
`,
    );
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(true);
    expect(readJson('dist/docs-data/m/alpha.json')).toHaveProperty('meta.keyboard.0.frameworks', ['react', 'vue']);
  });

  it('fails with a hint when the package is not built', async () => {
    machines(undefined);
    rmSync(join(dir, 'packages/m/dist'), { recursive: true });
    expect((await executor({ source: 'machines' }, context('m', 'packages/m'))).success).toBe(false);
    expect(errors()).toMatch(/does not exist; run the build first/);
  });

  it('replaces the JSON files, so a removed component leaves no stale file', async () => {
    machines(undefined);
    write('dist/docs-data/m/old.json', '{}');
    write('dist/docs-data/m/keep.txt', 'x');
    await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(readdirSync(join(dir, 'dist/docs-data/m')).sort()).toEqual(['alpha.json', 'keep.txt']);
  });

  it('does not rewrite a file whose bytes would not change, so a watching dev server sees nothing', async () => {
    machines(undefined);
    await executor({ source: 'machines' }, context('m', 'packages/m'));
    const file = join(dir, 'dist/docs-data/m/alpha.json');
    const before = statSync(file).mtimeMs;
    await new Promise((resolve) => setTimeout(resolve, 30));
    await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(statSync(file).mtimeMs).toBe(before);
  });

  it('is deterministic: the same data gives the same bytes', async () => {
    machines(undefined);
    await executor({ source: 'machines' }, context('m', 'packages/m'));
    const first = readFileSync(join(dir, 'dist/docs-data/m/alpha.json'), 'utf8');
    await executor({ source: 'machines' }, context('m', 'packages/m'));
    expect(readFileSync(join(dir, 'dist/docs-data/m/alpha.json'), 'utf8')).toBe(first);
    expect(first.endsWith('}\n')).toBe(true);
  });
});

const OPTION = `{ attrName: 'size', values: ['sm', 'md'], default: 'md', partNames: ['root'], description: 'Size.' }`;

/** A fake theme core whose built entry exports a `ThemeConfig` (one `button.size` option) and `modeCollections` (none for `null`). */
function theme(option = OPTION, extraExport = '', collections: unknown = COLLECTIONS): void {
  write(
    'packages/t/package.json',
    JSON.stringify({ type: 'module', exports: { '.': { default: './dist/index.js' } } }),
  );
  const index = collections === null ? '' : `export const modeCollections = ${JSON.stringify(collections)};\n`;
  write(
    'packages/t/dist/index.js',
    `export const moodThemeConfig = { name: 'mood', components: { button: { size: ${option} } } };\n${index}${extraExport}`,
  );
}

const MOOD = {
  name: 'Mood',
  attrName: 'acme-mood',
  modes: [
    { name: 'Day', value: 'day' },
    { name: 'Night', value: 'night' },
  ],
  defaultMode: 'Day',
};
const COLLECTIONS = [MOOD, { ...MOOD, name: 'Card / Size', attrName: 'size', componentName: 'card' }];

const THEME_OPTIONS = { source: 'theme' } as const;

describe('docs-data: theme', () => {
  it('writes the options of the built ThemeConfig and its modeCollections as the theme exports them', async () => {
    theme();
    const result = await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'));
    expect(result.success).toBe(true);
    expect(readJson('dist/docs-data/theme-mood/theme.json')).toEqual({
      kind: 'theme',
      name: 'mood',
      components: {
        button: {
          size: { attrName: 'size', values: ['sm', 'md'], default: 'md', partNames: ['root'], description: 'Size.' },
        },
      },
      modeCollections: COLLECTIONS,
    });
  });

  it('accepts the options of a theme with no partNames or description, and a null default', async () => {
    theme(`{ attrName: 'cck-color', values: ['a', true], default: null }`);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(true);
  });

  it.each([
    [
      'an unknown option field',
      `{ attrName: 'size', values: ['sm'], default: 'sm', extra: 1 }`,
      /unknown theme option field "extra"/,
    ],
    [
      'a default that is not a value',
      `{ attrName: 'size', values: ['sm'], default: 'lg' }`,
      /default "lg" is not one of the values/,
    ],
    ['no values', `{ attrName: 'size', values: [], default: null }`, /values must be a non-empty list/],
    ['a value that is a number', `{ attrName: 'size', values: [1], default: null }`, /values must be a non-empty list/],
    [
      'an attribute name with data-',
      `{ attrName: 'data_size', values: ['a'], default: 'a' }`,
      /attrName must be an attribute name/,
    ],
    ['partNames that are not names', `{ attrName: 'size', values: ['a'], default: 'a', partNames: [1] }`, /partNames/],
  ])('fails on %s', async (_label, option, message) => {
    theme(option);
    const result = await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'));
    expect(result.success).toBe(false);
    expect(errors()).toMatch(message);
    expect(existsSync(join(dir, 'dist/docs-data/theme-mood'))).toBe(false);
  });

  it('fails when the entry exports no ThemeConfig', async () => {
    theme();
    write('packages/t/dist/index.js', `export const modeCollections = [];\n`);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(/exports no ThemeConfig/);
  });

  it('fails when the entry exports more than one ThemeConfig', async () => {
    theme(OPTION, `export const secondThemeConfig = { name: 'two', components: {} };\n`);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(/more than one ThemeConfig: moodThemeConfig, secondThemeConfig/);
  });

  // `require` caches a loaded module by path, so each case builds its own fake theme.
  it.each([
    ['no modeCollections', null, /\.\/dist\/index\.js exports no modeCollections/],
    ['modeCollections that are not a list', { not: 'a list' }, /modeCollections must be a list/],
  ])('fails, naming the export, when the entry exports %s', async (_label, collections, message) => {
    theme(OPTION, '', collections);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(message);
    expect(existsSync(join(dir, 'dist/docs-data/theme-mood'))).toBe(false);
  });

  it('has no option besides source and outputDir', () => {
    const schema = JSON.parse(readFileSync(join(import.meta.dirname, 'schema.json'), 'utf8')) as {
      properties: Record<string, unknown>;
      additionalProperties: boolean;
    };
    expect(Object.keys(schema.properties)).toEqual(['source', 'outputDir']);
    expect(schema.additionalProperties).toBe(false);
  });

  it.each([
    ['an unknown field', { page: true }, /modeCollections\[0\]: unknown field "page"/],
    ['an empty name', { name: '' }, /name must be text/],
    ['an attrName with a capital', { attrName: 'Mood' }, /\(Mood\): attrName must match/],
    ['an attrName with a space', { attrName: 'acme mood' }, /attrName must match/],
    ['a componentName that is empty', { componentName: '' }, /componentName must be text/],
    ['no modes', { modes: [] }, /modes must be a non-empty list/],
    ['a mode without a value', { modes: [{ name: 'Day' }] }, /every mode needs a name and a value/],
    ['a defaultMode that is no mode name', { defaultMode: 'day' }, /defaultMode is not the name of a mode/],
  ])('fails on a collection with %s', async (_label, change, message) => {
    theme(OPTION, '', [{ ...MOOD, ...change }]);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(message);
  });

  it('fails on two page collections with the same attribute', async () => {
    theme(OPTION, '', [MOOD, { ...MOOD, name: 'Other' }]);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(/\(Other\): attrName "acme-mood" is listed twice/);
  });

  const size = (componentName: string) => ({
    ...MOOD,
    name: `${componentName} / Size`,
    attrName: 'size',
    componentName,
  });

  it('lets two components share an attribute name', async () => {
    theme(OPTION, '', [size('button'), size('input'), MOOD]);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(true);
  });

  it('fails on two collections of one component with the same attribute', async () => {
    theme(OPTION, '', [size('button'), size('button')]);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(false);
    expect(errors()).toMatch(/\(button \/ Size\): attrName "size" is listed twice/);
  });

  it('assumes nothing about the attribute scheme: another prefix and names pass', async () => {
    theme(OPTION, '', [{ ...MOOD, name: 'Density', attrName: 'x9-density' }]);
    expect((await executor(THEME_OPTIONS, context('theme-mood', 'packages/t'))).success).toBe(true);
    expect(readJson('dist/docs-data/theme-mood/theme.json')).toMatchObject({
      modeCollections: [{ attrName: 'x9-density' }],
    });
  });
});

describe('docs-data: paths', () => {
  it('fails for an outputDir outside the workspace, and writes nothing', async () => {
    theme();
    const outside = join(dir, '..', 'docs-data-outside');
    for (const options of [
      { ...THEME_OPTIONS, outputDir: '../docs-data-outside' },
      { ...THEME_OPTIONS, outputDir: outside },
    ]) {
      expect((await executor(options, context('theme-mood', 'packages/t'))).success).toBe(false);
    }
    expect(errors()).toMatch(/outputDir: .* is outside the workspace/);
    expect(existsSync(outside)).toBe(false);
  });

  it('fails for an outputDir through a junction to a folder outside the workspace', async () => {
    theme();
    const outside = mkdtempSync(join(tmpdir(), 'docs-data-outside-'));
    try {
      try {
        symlinkSync(outside, join(dir, 'link'), 'junction');
      } catch {
        return; // the OS refuses to create the link
      }
      const result = await executor({ ...THEME_OPTIONS, outputDir: 'link/data' }, context('theme-mood', 'packages/t'));
      expect(result.success).toBe(false);
      expect(readdirSync(outside)).toEqual([]);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import { textRuleProblems } from '../api-docs-common/text-rules';
import type { ApiDocJson } from '../api-docs-common/types';
import executor from './executor';
import { extractTsApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-ts');

const TSCONFIG = {
  compilerOptions: { strict: true, types: [], noEmit: true, paths: {}, exactOptionalPropertyTypes: true },
  include: ['**/*.ts'],
};

/** A package with the folder entry point `src/tools/` and the given text for `tools.ts`. */
function createFolderPackage(name: string, tools = fixture('tools.ts')): { project: string; tsConfig: string } {
  return area.create(name, { 'src/tools/tools.ts': tools, 'src/tools/index.ts': fixture('tools-index.ts') }, TSCONFIG);
}

/** A package whose `src/index.ts` re-exports from two files. */
function createFilePackage(name: string): { project: string; tsConfig: string } {
  return area.create(
    name,
    {
      'src/alpha.ts': fixture('alpha.ts'),
      'src/beta.ts': fixture('beta.ts'),
      'src/index.ts': fixture('files-index.ts'),
    },
    TSCONFIG,
  );
}

function extractFolder(name: string, tools?: string): ApiDocJson[] {
  const { project, tsConfig } = createFolderPackage(name, tools);
  return extractTsApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractTsApiDocs', () => {
  it('writes one file per folder entry point, with framework ts and no parts', () => {
    const [doc, ...more] = extractFolder('folder');
    expect(more).toEqual([]);
    expect(doc).toMatchObject({ component: 'tools', framework: 'ts', parts: [] });
  });

  it('writes every exported function as a function symbol with examples and a text per parameter', () => {
    const symbols = extractFolder('functions')[0]?.symbols?.filter((symbol) => symbol.kind === 'function') ?? [];
    expect(symbols.map((symbol) => symbol.name)).toEqual(['openTool', 'clearTool', 'countWords']);
    for (const symbol of symbols) {
      expect(symbol.examples?.length).toBeGreaterThan(0);
      for (const param of symbol.params ?? []) expect(param.description).not.toBe('');
    }
  });

  it('reads the parameters, the result and the thrown text of a function declaration', () => {
    const open = extractFolder('open')[0]?.symbols?.find((symbol) => symbol.name === 'openTool');
    expect(open).toMatchObject({
      kind: 'function',
      description: 'Opens the tool and returns a function that closes it.',
      remarks: 'The tool needs the element to be in the document.',
      params: [
        { name: 'element', type: 'Element', optional: false, description: 'The element that owns the tool.' },
        { name: 'options', type: 'ToolOptions', optional: false, description: 'How the tool opens.' },
      ],
      returns: { type: '() => void', description: 'A function that closes the tool.' },
      throws: ['When the element is not in the document.'],
      props: [],
      methods: [],
    });
  });

  it('reads a const arrow function, a default value making its parameter optional', () => {
    const count = extractFolder('arrow')[0]?.symbols?.find((symbol) => symbol.name === 'countWords');
    expect(count).toMatchObject({
      kind: 'function',
      params: [
        { name: 'text', type: 'string', optional: false },
        { name: 'extra', type: 'number', optional: true },
      ],
      returns: { type: 'number', description: 'The number of words.' },
    });
  });

  it('gives a void function an empty returns text and no throws', () => {
    const clear = extractFolder('void')[0]?.symbols?.find((symbol) => symbol.name === 'clearTool');
    expect(clear).toMatchObject({ params: [], returns: { type: 'void', description: '' } });
    expect(clear?.throws).toBeUndefined();
  });

  it('writes a constant as a constant symbol with its type', () => {
    const name = extractFolder('constant')[0]?.symbols?.find((symbol) => symbol.name === 'TOOL_NAME');
    expect(name).toMatchObject({ kind: 'constant', type: 'string', examples: ['console.log(TOOL_NAME);'] });
  });

  it('leaves an @internal export out', () => {
    const names = extractFolder('internal')[0]?.symbols?.map((symbol) => symbol.name);
    expect(names).not.toContain('hiddenTool');
  });

  it('writes the exported types, and the type that a parameter names without exporting it', () => {
    const types = extractFolder('types')[0]?.types;
    expect(types?.map((type) => type.name)).toEqual(['ToolBox', 'ToolOptions', 'ToolSide']);
    const options = types?.find((type) => type.name === 'ToolOptions');
    expect(options?.fields.find((field) => field.name === 'gap')).toMatchObject({ default: '5', required: false });
  });

  it('writes one file per file that src/index.ts re-exports, with only the names that line exports', () => {
    const { project, tsConfig } = createFilePackage('files');
    const docs = extractTsApiDocs(REPO, project, tsConfig);
    expect(docs.map((doc) => doc.component)).toEqual(['alpha', 'beta']);
    expect(docs.map((doc) => doc.framework)).toEqual(['ts', 'ts']);
    expect(docs[1]?.symbols?.map((symbol) => symbol.name)).toEqual(['beta']);
    expect(docs[1]?.types?.map((type) => type.name)).toEqual(['BetaOptions']);
  });

  it('passes the text rules of its own fixtures', () => {
    for (const doc of extractFolder('rules')) expect(textRuleProblems(doc)).toEqual([]);
    const { project, tsConfig } = createFilePackage('rules-files');
    for (const doc of extractTsApiDocs(REPO, project, tsConfig)) expect(textRuleProblems(doc)).toEqual([]);
  });

  it.each([
    ['an export with no TSDoc', 'export function bare(): void {}\n', /tools: bare has no TSDoc description/],
    [
      'a @param that names no parameter',
      ' * @param ghost - Nothing.\n */\nexport function ghost(): void {}\n',
      /"@param ghost" names no parameter/,
    ],
  ])('fails on %s', (_name, extra, message) => {
    const text = extra.startsWith(' *') ? `/**\n * Ghost.\n${extra}` : extra;
    expect(() => extractFolder('fails', `${fixture('tools.ts')}\n${text}`)).toThrow(message);
  });

  it('fails when the package has no module entry point', () => {
    const { project, tsConfig } = area.create('none', { 'src/readme.ts': 'export {};\n' }, TSCONFIG);
    expect(() => extractTsApiDocs(REPO, project, tsConfig)).toThrow(/no module entry point/);
  });
});

describe('the text rules over an extracted module', () => {
  const problemsOf = (tools: string): string[] => extractFolder('text', tools).flatMap(textRuleProblems);
  const base = fixture('tools.ts');

  it('fails a function without @example', () => {
    const text = base.replace(' * @example\n * clearTool();\n', '');
    expect(problemsOf(text)).toEqual(['ts/tools function clearTool: needs an @example']);
  });

  it('fails a parameter without @param', () => {
    const text = base.replace(' * @param extra - More words to add.\n', '');
    expect(problemsOf(text)).toEqual(['ts/tools function countWords(extra): needs a @param text']);
  });

  it('fails a function that returns a value without @returns', () => {
    const text = base.replace(' * @returns The number of words.\n', '');
    expect(problemsOf(text)).toEqual(['ts/tools function countWords: needs a @returns text']);
  });

  it('fails a default that is written as prose', () => {
    const text = base
      .replace('   * @defaultValue 5\n', '')
      .replace('The gap in pixels.', 'The gap in pixels. Default `5`.');
    expect(problemsOf(text)).toEqual([
      'ts/tools type ToolOptions.gap: a default is written as prose; use "@defaultValue" and leave it out of the text',
    ]);
  });
});

describe('the api-docs-ts executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes one JSON file per module into the output folder', async () => {
    createFolderPackage('run');
    const outputDir = 'tools/workspace-plugin/tmp/api-docs-ts/run/out';
    expect((await executor({ outputDir }, area.context('run'))).success).toBe(true);
    const out = join(area.dir, 'run', 'out');
    expect(readdirSync(out)).toEqual(['tools.json']);
    expect(JSON.parse(readFileSync(join(out, 'tools.json'), 'utf8'))).toMatchObject({ framework: 'ts' });
  });

  it('fails on a missing @example, names the function and writes nothing', async () => {
    createFolderPackage('run-fails', fixture('tools.ts').replace(' * @example\n * clearTool();\n', ''));
    const outputDir = 'tools/workspace-plugin/tmp/api-docs-ts/run-fails/out';
    expect((await executor({ outputDir }, area.context('run-fails'))).success).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/function clearTool: needs an @example/);
    expect(existsSync(join(area.dir, 'run-fails', 'out'))).toBe(false);
  });
});

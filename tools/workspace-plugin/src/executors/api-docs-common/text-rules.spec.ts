import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runApiDocs } from './run';
import { scratchArea } from './testing/scratch';
import { hasObjectPayload, sentencesOf, textRuleProblems, unionLiteralsOf } from './text-rules';
import type { ApiDocJson, ApiMemberJson, ApiPartJson, ApiSlotJson, ApiSymbolJson, ApiTypeJson } from './types';

const member = (fields: Partial<ApiMemberJson> = {}): ApiMemberJson => ({
  name: 'size',
  semanticId: 'thing.size',
  type: 'string',
  required: true,
  description: 'The size of the thing.',
  ...fields,
});

const slot = (fields: Partial<ApiSlotJson> = {}): ApiSlotJson => ({
  ...member({ name: 'default', semanticId: 'thing.default', type: 'ReactNode' }),
  description: 'The content of the thing. When not set, the thing is empty.',
  examples: ['<Thing>Hello</Thing>'],
  ...fields,
});

const part = (fields: Partial<ApiPartJson> = {}): ApiPartJson => ({
  name: 'Thing',
  semanticId: 'thing.root',
  description: 'A thing you can show.',
  examples: ['<Thing />'],
  props: [],
  events: [],
  slots: [],
  methods: [],
  ...fields,
});

const doc = (fields: Partial<ApiDocJson> = {}, framework: ApiDocJson['framework'] = 'react'): ApiDocJson => ({
  component: 'thing',
  framework,
  parts: [part()],
  ...fields,
});

const problemsOf = (fields: Partial<ApiPartJson>, framework?: ApiDocJson['framework']): string[] =>
  textRuleProblems(doc({ parts: [part(fields)] }, framework));

describe('textRuleProblems', () => {
  it('passes a text that follows every rule', () => {
    expect(
      problemsOf({
        props: [
          member(),
          member({ name: 'tone', required: false, description: 'The tone. When not set, it is calm.' }),
        ],
        slots: [slot()],
      }),
    ).toEqual([]);
  });

  it('fails a sentence over 25 words and counts a code span as one word', () => {
    const long = `${'word '.repeat(25)}more.`;
    expect(problemsOf({ description: long })).toEqual(['react/thing Thing: a sentence has 26 words (25 at most)']);
    expect(problemsOf({ description: `${'word '.repeat(24)}\`a long code span\`.` })).toEqual([]);
  });

  it('fails a first paragraph of more than 3 sentences, but not long remarks', () => {
    expect(problemsOf({ description: 'One. Two. Three. Four.' })).toEqual([
      'react/thing Thing: the first paragraph has 4 sentences; move the rest to @remarks',
    ]);
    expect(problemsOf({ remarks: 'One. Two. Three. Four.' })).toEqual([]);
  });

  it('fails a word or a contraction that is not allowed, outside code only', () => {
    expect(problemsOf({ description: 'You can just show it.' })).toEqual([
      'react/thing Thing: "just" is not allowed (text rules)',
    ]);
    expect(problemsOf({ remarks: "It doesn't close." })).toEqual([
      'react/thing Thing (remarks): "doesn\'t" is not allowed (text rules)',
    ]);
    expect(problemsOf({ description: "Read it, e.g. twice. It's here." })[0]).toMatch(/"e\.g\." is not allowed/);
    expect(problemsOf({ description: 'Pass `just` or `via` to it.' })).toEqual([]);
    expect(problemsOf({ description: 'The thing adjusts itself.' })).toEqual([]);
  });

  it('checks the meanings of the values and the fields of a slot scope', () => {
    const values = [{ value: 'a', description: 'Simply the first.' }];
    expect(problemsOf({ props: [member({ type: "'a' | 'b'", values })] })).toEqual([
      'react/thing Thing.size @cckValue a: "Simply" is not allowed (text rules)',
      "react/thing Thing.size: no @cckValue for 'b'",
    ]);
    const scope = [{ name: 'open', type: 'boolean', description: 'Whether it is open, i.e. shown.' }];
    expect(problemsOf({ slots: [slot({ scope })] })).toEqual([
      'react/thing Thing slot default scope open: "i.e." is not allowed (text rules)',
    ]);
  });

  it('asks a @cckValue for each literal of a union member or alias', () => {
    expect(problemsOf({ props: [member({ type: "'sm' | 'md' | undefined" })] })).toEqual([
      "react/thing Thing.size: no @cckValue for 'sm', 'md'",
    ]);
    const types = [{ kind: 'alias' as const, name: 'Level', description: 'A level.', text: '1 | 2', fields: [] }];
    expect(textRuleProblems(doc({ types }))).toEqual(["react/thing type Level: no @cckValue for '1', '2'"]);
  });

  it('asks a "When not set" sentence of an optional prop with no default', () => {
    expect(problemsOf({ props: [member({ required: false })] })).toEqual([
      'react/thing Thing.size: optional with no default; say what happens in a "When not set, …" sentence',
    ]);
    expect(problemsOf({ props: [member({ required: false, default: "'md'" })] })).toEqual([]);
  });

  it('asks a slot for its "When not set" sentence and no @defaultValue', () => {
    expect(problemsOf({ slots: [slot({ description: 'The content.', default: 'Nothing' })] })).toEqual([
      'react/thing Thing slot default: a slot has no @defaultValue; say what shows without it in a "When not set, …" sentence',
      'react/thing Thing slot default: a slot needs a "When not set, …" sentence',
    ]);
  });

  it('asks an example of every root part, slot, object event and method', () => {
    expect(
      problemsOf({
        examples: [],
        slots: [slot({ examples: [] })],
        events: [member({ name: 'onOpenChange', type: '((open: boolean, details: Details) => void)' })],
        methods: [member({ name: 'focus', type: '() => void' })],
      }),
    ).toEqual([
      'react/thing Thing (root part): needs an @example',
      'react/thing Thing.onOpenChange (object payload): needs an @example',
      'react/thing Thing slot default: needs an @example',
      'react/thing Thing.focus(): needs an @example',
    ]);
    expect(problemsOf({ examples: [], semanticId: 'thing.item' })).toEqual([]);
  });

  it('asks an example of an Angular template slot only, and of a Vue slot', () => {
    const content = slot({ name: 'hint', selector: 'cck-hint', examples: [] });
    const template = slot({ name: 'label', selector: 'ng-template[cckLabel]', examples: [] });
    expect(problemsOf({ slots: [content, template] }, 'angular')).toEqual([
      'angular/thing Thing slot label: needs an @example',
    ]);
    expect(problemsOf({ slots: [slot({ examples: [] })] }, 'vue')).toEqual([
      'vue/thing Thing slot default: needs an @example',
    ]);
  });

  it('fails an example in a code fence, which the page would show and copy', () => {
    expect(problemsOf({ examples: ['```ts\nopen();\n```'] })).toEqual([
      'react/thing Thing: an @example is code without a ``` fence',
    ]);
  });

  it('asks an example of every constant and of every service or class method', () => {
    const method = member({ name: 'open', type: '() => void' });
    const symbols = [
      { kind: 'constant' as const, name: 'THING', description: 'The thing.', props: [], methods: [] },
      { kind: 'service' as const, name: 'Things', description: 'Opens things.', props: [], methods: [method] },
      { kind: 'class' as const, name: 'ThingRef', description: 'One thing.', props: [], methods: [] },
    ];
    expect(textRuleProblems(doc({ symbols }, 'angular'))).toEqual([
      'angular/thing constant THING: needs an @example',
      'angular/thing service Things.open(): needs an @example',
    ]);
  });
});

describe('textRuleProblems for the functions of a ts module', () => {
  const fn = (fields: Partial<ApiSymbolJson> = {}): ApiSymbolJson => ({
    kind: 'function',
    name: 'openThing',
    description: 'Opens the thing.',
    examples: ['openThing(element);'],
    params: [{ name: 'element', type: 'Element', optional: false, description: 'The element to open.' }],
    returns: { type: 'boolean', description: 'Whether it opened.' },
    props: [],
    methods: [],
    ...fields,
  });
  const tsProblems = (symbol: ApiSymbolJson, types: ApiTypeJson[] = []): string[] =>
    textRuleProblems({ component: 'thing', framework: 'ts', parts: [], symbols: [symbol], types });

  it('passes a function with an example, a text per parameter and a result text', () => {
    expect(tsProblems(fn())).toEqual([]);
    expect(tsProblems(fn({ params: [], returns: { type: 'void', description: '' } }))).toEqual([]);
  });

  it.each([
    ['has no @example', fn({ examples: [] }), ['ts/thing function openThing: needs an @example']],
    [
      'has a parameter with no @param',
      fn({ params: [{ name: 'element', type: 'Element', optional: false, description: '' }] }),
      ['ts/thing function openThing(element): needs a @param text'],
    ],
    [
      'returns a value with no @returns',
      fn({ returns: { type: 'boolean', description: '' } }),
      ['ts/thing function openThing: needs a @returns text'],
    ],
    [
      'has a parameter text over 25 words',
      fn({
        params: [{ name: 'element', type: 'Element', optional: false, description: `The ${'long '.repeat(25)}text.` }],
      }),
      ['ts/thing function openThing(element): a sentence has 27 words (25 at most)'],
    ],
  ])('fails a function that %s', (_name, symbol, problems) => {
    expect(tsProblems(symbol)).toEqual(problems);
  });

  it.each([['Default `5`.'], ['Defaults to 5.'], ['Default: 5.'], ['The default is 5.'], ['It defaults to 5.']])(
    'fails an option field with the prose default "%s"',
    (text) => {
      const type: ApiTypeJson = {
        kind: 'interface',
        name: 'ThingOptions',
        description: 'Options.',
        fields: [member({ name: 'gap', required: false, description: `The gap. ${text}` })],
      };
      expect(tsProblems(fn(), [type])).toEqual([
        'ts/thing type ThingOptions.gap: a default is written as prose; use "@defaultValue" and leave it out of the text',
      ]);
    },
  );

  it('passes a field with @defaultValue and a text that only uses the word default', () => {
    const type: ApiTypeJson = {
      kind: 'interface',
      name: 'ThingOptions',
      description: 'Options.',
      fields: [member({ name: 'gap', required: false, default: '5', description: 'Replaces the default gap.' })],
    };
    expect(tsProblems(fn(), [type])).toEqual([]);
  });

  it('keeps the prose default allowed for a component framework', () => {
    expect(problemsOf({ props: [member({ required: false, description: 'The size. Defaults to 5.' })] })).toEqual([
      'react/thing Thing.size: optional with no default; say what happens in a "When not set, …" sentence',
    ]);
  });
});

describe('sentencesOf', () => {
  it('splits paragraphs, list items and sentences, and keeps code as one word', () => {
    expect(sentencesOf('One `a. B` two. Three?\n\n- Four\n- Five')).toEqual([
      'One CODE two.',
      'Three?',
      '- Four',
      '- Five',
    ]);
  });
});

describe('unionLiteralsOf', () => {
  it('reads the top-level literals of a union with two members or more', () => {
    expect(unionLiteralsOf("'a' | 'b' | undefined")).toEqual(['a', 'b']);
    expect(unionLiteralsOf("'auto' | number")).toEqual(['auto']);
    expect(unionLiteralsOf("'a' | undefined")).toEqual([]);
    expect(unionLiteralsOf("Details<'a' | 'b'> | ((x: 'c') => void)")).toEqual([]);
  });
});

describe('hasObjectPayload', () => {
  it('is true for a named type or an object, false for primitives and literals', () => {
    expect(hasObjectPayload('ValueChangeDetails<boolean, Reason>')).toBe(true);
    expect(hasObjectPayload('[event: CustomEvent<{ value: T; }>]')).toBe(true);
    expect(hasObjectPayload('((value: string, details: Details) => void)')).toBe(true);
    expect(hasObjectPayload('void')).toBe(false);
    expect(hasObjectPayload('[value: string | null]')).toBe(false);
    expect(hasObjectPayload("((open: boolean, reason: 'Esc') => void)")).toBe(false);
  });
});

describe('runApiDocs with the text rules', () => {
  const area = scratchArea('api-docs-text-rules');
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    area.clean();
  });

  it('fails on a broken rule, names the item and writes nothing', async () => {
    const outputDir = 'tools/workspace-plugin/tmp/api-docs-text-rules/out';
    // The part example of `doc()` must be a whole example of the source of the project.
    area.create('run', { 'src/thing.ts': '/**\n * @example\n * <Thing />\n */\nexport const thing = 1;\n' }, {});
    const broken = doc({ parts: [part({ description: 'You can simply show it.' })] });
    const result = await runApiDocs({ outputDir }, area.context('run'), () => [broken]);
    expect(result.success).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/react\/thing Thing: "simply" is not allowed/);
    expect(existsSync(join(area.dir, 'out'))).toBe(false);
    rmSync(join(area.dir, 'out'), { recursive: true, force: true });
    expect((await runApiDocs({ outputDir }, area.context('run'), () => [doc()])).success).toBe(true);
    expect(existsSync(join(area.dir, 'out', 'thing.json'))).toBe(true);
  });
});

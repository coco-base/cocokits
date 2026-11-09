import { beforeAll, describe, expect, it } from 'vitest';
import ts from 'typescript';
import { docOfNode, docOfSymbol, docTextOf, isRealTag, readTsDoc, tagLikeLineProblems, tagsOfNode } from './jsdoc';
import type { TsDocText } from './jsdoc';
import { SOURCE_ROWS } from './testing/at-sign-cases';
import type { SourceRow } from './testing/at-sign-cases';

/** A comment with the usual ` * ` margin. */
const comment = (...lines: string[]): string =>
  ['/**', ...lines.map((line) => ` * ${line}`.trimEnd()), ' */'].join('\n');

const EXAMPLE_ROWS: readonly SourceRow[] = [
  ...(
    [
      ['an event', '<Thing @click="save">Save</Thing>'],
      ['an event with a modifier', '<Thing @click.prevent="save">Save</Thing>'],
      ['an event with a colon', '<Thing @update:model-value="(value) => (tab = value)" />'],
      ['an event after a tab', '<Thing\t@click="save" />'],
      ['a Component decorator as the first token', '@Component({ selector: "x" })\nexport class X {}'],
      ['an address', '<Input defaultValue="ana@example.com" />'],
      ['an @ in a tag', '<Leading aria-hidden="true">@</Leading>'],
      ['a tag name in the middle of an example line', '<Thing @see @param />'],
    ] as const
  ).map(([name, example]) => ({
    name,
    comment: comment('@example', ...example.split('\n'), '', '@cckPart root'),
    example,
    others: ['cckPart'],
  })),
  {
    name: 'an event first on a line',
    comment: comment('@example', '<Thing', '@click="save"', '>Save</Thing>', '@cckPart root'),
    example: '<Thing\n@click="save"\n>Save</Thing>',
    others: ['cckPart'],
  },
  ...['@for (item of items; track item) {', '@if (open) {', '@switch (kind) {', '@default {'].map((line) => ({
    name: `an Angular block ${line.split(' ')[0] ?? ''} at the start of a line`,
    comment: comment('@example', '<cck-thing />', line, '  <cck-thing />', '}'),
    example: `<cck-thing />\n${line}\n  <cck-thing />\n}`,
    others: [],
  })),
  ...['@cckPart root', '@cckSemantic none', "@defaultValue 'x'", '@param a - b', '@remarks The rest.'].map((tag) => ({
    name: `an example followed by ${tag.split(' ')[0] ?? ''}`,
    comment: comment('@example', '<Thing @click="save" />', '', tag),
    example: '<Thing @click="save" />',
    others: [tag.slice(1).split(' ')[0] ?? ''],
  })),
];

describe('readTsDoc', () => {
  it.each([...SOURCE_ROWS, ...EXAMPLE_ROWS])('reads every TSDoc text to its end: $name', (row) => {
    const { tags } = readTsDoc(row.comment);
    expect(tags.filter((tag) => tag.name === 'example').map((tag) => tag.comment)).toEqual([row.example]);
    expect(tags.filter((tag) => tag.name !== 'example').map((tag) => tag.name)).toEqual(row.others);
  });

  it('reads the text of two @example tags of one declaration, each to its end', () => {
    const { tags } = readTsDoc(
      comment('@example', '<Thing @click="a" />', '@example', '<Thing @click="b" />', '@cckPart root'),
    );
    expect(tags).toEqual([
      { name: 'example', comment: '<Thing @click="a" />' },
      { name: 'example', comment: '<Thing @click="b" />' },
      { name: 'cckPart', comment: 'root' },
    ]);
  });

  it('reads an @ in a description and in a @remarks text', () => {
    const read = readTsDoc(
      comment('Use @click to listen.', '', '@remarks Add @click.prevent to keep the page.', '@cckPart root'),
    );
    expect(read.description).toBe('Use @click to listen.');
    expect(read.tags).toEqual([
      { name: 'remarks', comment: 'Add @click.prevent to keep the page.' },
      { name: 'cckPart', comment: 'root' },
    ]);
  });

  it('ends a description at a real tag in the middle of a line', () => {
    expect(readTsDoc('/** Whether it is open. @defaultValue false */')).toEqual({
      description: 'Whether it is open.',
      tags: [{ name: 'defaultValue', comment: 'false' }],
    });
  });

  it('keeps the indentation of a text and the text of a tag that starts on its own line', () => {
    expect(readTsDoc(comment('@example', '<Thing>', '  <Part />', '</Thing>')).tags).toEqual([
      { name: 'example', comment: '<Thing>\n  <Part />\n</Thing>' },
    ]);
    expect(readTsDoc(comment('@returns The first line', '  and the second.')).tags).toEqual([
      { name: 'returns', comment: 'The first line\nand the second.' },
    ]);
  });
});

describe('isRealTag', () => {
  it.each(['example', 'param', 'defaultValue', 'cckPart', 'cckSemantic', 'internal'])('accepts %s', (name) => {
    expect(isRealTag(name)).toBe(true);
  });
  it.each(['click', 'escape-key-down', 'Component', 'for', 'if', 'default', 'update:model-value'])(
    'rejects %s',
    (name) => {
      expect(isRealTag(name)).toBe(false);
    },
  );
});

/** The first statement of a source text. */
const declarationOf = (...lines: string[]): ts.Statement => {
  const [statement] = ts.createSourceFile(
    'doc.ts',
    [...lines, 'export const a = 1;'].join(String.fromCharCode(10)),
    ts.ScriptTarget.Latest,
    true,
  ).statements;
  if (statement === undefined) throw new Error('no statement');
  return statement;
};

describe('the TSDoc of a declaration', () => {
  it.each(['see', 'param', 'returns', 'remarks', 'defaultValue', 'internal', 'deprecated', 'cckPart', 'cckExample'])(
    'reads an example whole when a line of it holds the tag name @%s',
    (name) => {
      const node = declarationOf(comment('A thing.', '', '@example', `<Thing @${name} x />`));
      expect(tagsOfNode(node)).toEqual([{ name: 'example', comment: `<Thing @${name} x />` }]);
      expect(docTextOf(node)).toBe('A thing.');
    },
  );

  it('keeps a tab of an example as written', () => {
    const node = declarationOf(comment('@example', '<Thing>', '\t<Part @click="x" />', '</Thing>'));
    expect(tagsOfNode(node)).toEqual([{ name: 'example', comment: '<Thing>\n\t<Part @click="x" />\n</Thing>' }]);
  });

  it('finds the comment when its text holds a comment opener, or a line comment comes before the declaration', () => {
    expect(docTextOf(declarationOf('/** Use @click and the string "/**". */'))).toBe(
      'Use @click and the string "/**".',
    );
    expect(docTextOf(declarationOf('/** Use @click. */', '// a note'))).toBe('Use @click.');
  });

  it('keeps a tag in a code span of a description as text', () => {
    expect(docTextOf(declarationOf('/** Use `foo @see bar` here. */'))).toBe('Use `foo @see bar` here.');
  });
});

describe('docOfNode', () => {
  it('keeps only the last of stacked comments', () => {
    const node = declarationOf('/** First comment. @example one */', '/** Second comment. @example two */');
    expect(docOfNode(node)).toEqual({ description: 'Second comment.', tags: [{ name: 'example', comment: 'two' }] });
  });

  it('joins the comment of an initializer, first, and the comment of its statement', () => {
    const statement = declarationOf('/** Statement doc. */', 'const stmt = /** inner doc */ (a: number) => a;');
    if (!ts.isVariableStatement(statement)) throw new Error('not a statement');
    const [declaration] = statement.declarationList.declarations;
    expect(declaration && docOfNode(declaration).description).toBe('inner doc\nStatement doc.');
  });
});

/** The source of the `docOfSymbol` rows: each shape has its own names, in one program. */
const SYMBOL_SOURCE = [
  '// A: the base text is cut by an @click, the override has only a whole example',
  'interface BaseA {',
  '  /** The extra text. Use @click to listen. */',
  '  extra?: string;',
  '}',
  'interface OverA extends BaseA {',
  '  /**',
  '   * @example',
  '   * <Thing />',
  '   */',
  '  extra?: string;',
  '}',
  '// B: the base text is plain, the override example holds an @click',
  'interface BaseB {',
  '  /** The extra text. */',
  '  extra?: string;',
  '}',
  'interface OverB extends BaseB {',
  '  /**',
  '   * @example',
  '   * <Thing @click="save" />',
  '   */',
  '  extra?: string;',
  '}',
  '// C: the override text holds an @click and no tag, the base has an example',
  'interface BaseC {',
  '  /**',
  '   * Base.',
  '   * @example',
  '   * <Thing />',
  '   */',
  '  extra?: string;',
  '}',
  'interface OverC extends BaseC {',
  '  /** Use @click to listen. */',
  '  extra?: string;',
  '}',
  '// D: an intersection, both parts document the member, one holds an @click',
  'interface DA {',
  '  /** First. Use @click here. */',
  '  extra?: string;',
  '}',
  'interface DB {',
  '  /** Second. */',
  '  extra?: string;',
  '}',
  'type TypeD = DA & DB;',
  '// E: no comment on the override',
  'interface OverE extends BaseC {',
  '  extra?: string;',
  '}',
  '// F: a base declared twice gives no tags',
  'interface BaseF {',
  '  /**',
  '   * One.',
  '   * @example',
  '   * <One />',
  '   */',
  '  extra?: string;',
  '}',
  'interface BaseF {',
  '  /** Two. */',
  '  extra?: string;',
  '}',
  'interface OverF extends BaseF {',
  '  /** Own text. */',
  '  extra?: string;',
  '}',
  '// G: a grandparent documents, two levels redeclare without a comment',
  'interface Grand {',
  '  /** Grand text. */',
  '  extra?: string;',
  '}',
  'interface Parent extends Grand {',
  '  extra?: string;',
  '}',
  'interface Child extends Parent {',
  '  extra?: string;',
  '}',
  '// H: a class implements a documented interface',
  'interface Hints {',
  '  /**',
  '   * Hint text.',
  '   * @example',
  '   * <Hint />',
  '   */',
  '  extra?: string;',
  '}',
  'class Impl implements Hints {',
  '  extra?: string;',
  '}',
  '// I: an own description wins over the base',
  'interface BaseI {',
  '  /** Base I. */',
  '  extra?: string;',
  '}',
  'interface OverI extends BaseI {',
  '  /** Own I. */',
  '  extra?: string;',
  '}',
  '// J: a merged interface with two bases',
  'interface FromA {',
  '  /** From A. */',
  '  extra?: string;',
  '}',
  'interface FromB {',
  '  /** From B. */',
  '  extra?: string;',
  '}',
  'interface Merged extends FromA {',
  '  extra?: string;',
  '}',
  'interface Merged extends FromB {',
  '  extra?: string;',
  '}',
  '// K: Pick of a base and the base itself list the declaration once',
  'interface BaseK {',
  '  /**',
  '   * K text.',
  '   * @example',
  '   * <K />',
  '   */',
  '  extra?: string;',
  '}',
  "type TypeK = Pick<BaseK, 'extra'> & BaseK;",
].join('\n');

describe('docOfSymbol', () => {
  let checker: ts.TypeChecker;
  let file: ts.SourceFile;

  beforeAll(() => {
    const host = ts.createCompilerHost({});
    const original = host.getSourceFile.bind(host);
    host.getSourceFile = (name, languageVersion) =>
      name === 'symbols.ts'
        ? ts.createSourceFile(name, SYMBOL_SOURCE, languageVersion, true)
        : original(name, languageVersion);
    host.fileExists = (name) => name === 'symbols.ts' || ts.sys.fileExists(name);
    const program = ts.createProgram(['symbols.ts'], { strict: true, noEmit: true, types: [] }, host);
    checker = program.getTypeChecker();
    const source = program.getSourceFile('symbols.ts');
    if (source === undefined) throw new Error('no source');
    file = source;
  });

  /** The text of the member `extra` of the interface, class or alias `name`. */
  const textOf = (name: string): TsDocText => {
    const named = file.statements.find(
      (statement): statement is ts.InterfaceDeclaration | ts.ClassDeclaration | ts.TypeAliasDeclaration =>
        (ts.isInterfaceDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement)) &&
        statement.name?.text === name,
    );
    if (named?.name === undefined) throw new Error(`no declaration ${name}`);
    return docOfSymbol(checker, checker.getTypeAtLocation(named.name).getProperty('extra'));
  };
  const example = (comment: string): TsDocText['tags'] => [{ name: 'example', comment }];

  it.each([
    [
      'A: the base text read to its end, the tags of the override',
      'OverA',
      'The extra text. Use @click to listen.',
      example('<Thing />'),
    ],
    [
      'B: the base text, the whole example of the override',
      'OverB',
      'The extra text.',
      example('<Thing @click="save" />'),
    ],
    ['C: the own text with an @click, the tags of the base', 'OverC', 'Use @click to listen.', example('<Thing />')],
    ['D: both texts of an intersection, each to its end', 'TypeD', 'First. Use @click here.\nSecond.', []],
    ['E: no comment, the text and tags of the base', 'OverE', 'Base.', example('<Thing />')],
    ['F: a base with two declarations gives no tags', 'OverF', 'Own text.', []],
    ['G: the text of a grandparent', 'Child', 'Grand text.', []],
    ['H: the text and tags of an implemented interface', 'Impl', 'Hint text.', example('<Hint />')],
    ['I: an own text wins over the base', 'OverI', 'Own I.', []],
    ['J: the texts of two bases, the later first', 'Merged', 'From B.\nFrom A.', []],
    ['K: a Pick and its base list the example once', 'TypeK', 'K text.', example('<K />')],
  ])('merges the texts of a symbol as TypeScript does: %s', (_row, name, description, tags) => {
    expect(textOf(name)).toEqual({ description, tags });
  });

  it('gives no text for a member that has no symbol', () => {
    expect(docOfSymbol(checker, undefined)).toEqual({ description: '', tags: [] });
  });
});

describe('tagLikeLineProblems', () => {
  const doc = (description: string, ...tags: [string, string][]): TsDocText => ({
    description,
    tags: tags.map(([name, comment]) => ({ name, comment })),
  });

  it('reports a line of a description or a tag text that starts with a word that is no tag', () => {
    expect(tagLikeLineProblems('Thing', doc('Opens it.\n@exmaple <Thing />'))).toEqual([
      'Thing: a line starts with "@exmaple", which is no TSDoc tag; write it in backticks or fix the tag name',
    ]);
    expect(tagLikeLineProblems('Thing', doc('Text.', ['remarks', 'More.\n@click fires.']))).toHaveLength(1);
  });

  it('does not report a real tag, an @ in the middle of a line, a word that is no tag name, or an example line', () => {
    expect(tagLikeLineProblems('Thing', doc('Listen with @click.\nUse `@click`.\n@click="x" is code.'))).toEqual([]);
    expect(tagLikeLineProblems('Thing', doc('Text.', ['example', '@for (item of items) {\n  <x />\n}']))).toEqual([]);
    expect(tagLikeLineProblems('Thing', doc('Text.\n@remarks later'))).toEqual([]);
  });
});

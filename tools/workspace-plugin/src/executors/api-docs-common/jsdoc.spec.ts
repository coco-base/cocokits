import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { docTextOf, isRealTag, readTsDoc, tagsOfNode, wholeDocOf } from './jsdoc';
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

  it('reads the comment of a declaration in a .vue text, by its position', () => {
    const vue = [
      '<template><b /></template>',
      '<script setup lang="ts">',
      '/** Use @click. */',
      'const a = 1;',
      '</script>',
    ].join('\n');
    const place = { text: vue, position: vue.indexOf('const a') };
    const parsed = { description: 'Use', tags: [{ name: 'click', comment: '' }] };
    expect(wholeDocOf(parsed, [place])).toEqual({ description: 'Use @click.', tags: [] });
    expect(wholeDocOf(parsed, [{ text: vue, position: 0 }])).toBe(parsed);
  });
});

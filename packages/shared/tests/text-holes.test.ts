import { describe, expect, it } from 'vitest';
import {
  escapeSnippetValue,
  layoutMarkup,
  printTextHole,
  renderSnippet,
  type SnippetArgAttr,
  type SnippetNode,
  type SnippetTemplate,
} from '../src/index';

/** The values a reader can type into a text control: each one is a way to break the page or the layout. */
const CORPUS: readonly string[] = [
  '{',
  '}',
  '{{',
  '}}',
  '&',
  '"',
  '<',
  'a\\b',
  'a\nb',
  '{{ x }}',
  '>',
  '<b>',
  '@',
  '@if (x) {',
  '`',
  '${y}',
  '</template>',
  'a\u2028b',
  '\u00a0',
  '   ',
  '',
  'Say "hi" & bye',
  'plain',
  'x'.repeat(130),
];

const text = (escape: 'text' | 'angular'): SnippetArgAttr => ({ arg: 'note', escape });

/** The shapes a text hole sits in: alone, beside text, beside an element, in an inline element, in a block. */
const SHAPES: readonly (readonly [string, (hole: SnippetNode) => SnippetNode[]])[] = [
  ['alone in an element', (hole) => [{ tag: 'p', attrs: [], children: [hole] }]],
  ['between texts', (hole) => [{ tag: 'p', attrs: [], children: ['Max ', hole, ' characters'] }]],
  [
    'beside an element',
    (hole) => [{ tag: 'p', attrs: [], children: [hole, { tag: 'b', attrs: [], children: ['now'] }] }],
  ],
  ['in an inline element', (hole) => [{ tag: 'span', attrs: ['class="x"'], children: ['Note: ', hole] }]],
  ['at the top level', (hole) => ['Note: ', hole]],
  [
    'in a block',
    (hole) => [
      {
        tag: '',
        attrs: [],
        children: [hole],
        conditionalLines: { open: '@if (open()) {', middle: '} @else {', close: '}' },
        otherwise: ['none'],
      },
    ],
  ],
  ['two holes in a row', (hole) => [{ tag: 'p', attrs: [], children: [hole, hole] }]],
  ['a hole and an expression', (hole) => [{ tag: 'p', attrs: [], children: [hole, '{{ count() }}'] }]],
  [
    'next to another element',
    (hole) => [
      { tag: 'p', attrs: [], children: [hole] },
      { tag: 'p', attrs: [], children: ['second'] },
    ],
  ],
];

/** The nodes as the compiler writes them when the text is known: adjacent texts are one text. */
function written(nodes: readonly SnippetNode[]): SnippetNode[] {
  const joined: SnippetNode[] = [];
  for (const node of nodes) {
    const last = joined.at(-1);
    if (typeof node === 'string' && typeof last === 'string') joined[joined.length - 1] = last + node;
    else if (typeof node === 'string' || 'arg' in node) joined.push(node);
    else {
      const otherwise = node.otherwise === undefined ? {} : { otherwise: written(node.otherwise) };
      joined.push({ ...node, children: written(node.children), ...otherwise });
    }
  }
  return joined;
}

function template(markup: SnippetNode[]): SnippetTemplate {
  return { before: '', markup, indent: 2, after: '' };
}

describe('escapeSnippetValue: text', () => {
  it('turns & < > { and } into entities', () => {
    expect(escapeSnippetValue('a & b < c > d {e} {{f}}', 'text')).toBe(
      'a &amp; b &lt; c &gt; d &#123;e&#125; &#123;&#123;f&#125;&#125;',
    );
  });

  it('leaves a quote, @, a backtick and ${ to the surrounding text', () => {
    expect(escapeSnippetValue('"@`', 'text')).toBe('"@`');
    expect(escapeSnippetValue('plain', 'text')).toBe('plain');
    expect(escapeSnippetValue('', 'text')).toBe('');
  });
});

describe('printTextHole', () => {
  it('prints nothing for a missing or empty value, or one of only spaces, tabs or line breaks, and for a number hole with no finite number', () => {
    for (const value of [null, undefined, '', '  \n\t']) expect(printTextHole(value, 'text')).toBe('');
    expect(printTextHole(Number.NaN, 'text', 'number')).toBe('');
    expect(printTextHole('7', 'text', 'number')).toBe('');
    expect(printTextHole(7, 'text', 'number')).toBe('7');
    expect(printTextHole('\u00a0', 'text')).toBe('\u00a0');
  });

  it('writes a brace at the start or end of an Angular value as an interpolation of the brace', () => {
    expect(printTextHole('{', 'angular')).toBe("{{ '{' }}");
    expect(printTextHole('{a}', 'angular')).toBe("{{ '{' }}a{{ '}' }}");
    expect(printTextHole('a{b', 'angular')).toBe('a&#123;b');
    expect(printTextHole('{{', 'angular')).toBe("{{ '{{' }}");
  });

  it('keeps two neighbouring Angular holes from joining their braces into an interpolation', () => {
    const joined = `${printTextHole('{', 'angular')}${printTextHole('{ x }}', 'angular')}`;
    expect(joined).not.toContain('&#123;&#123;');
    expect(joined.replace(/\{\{ '[{}]+' \}\}/g, '')).not.toContain('{{');
  });
});

describe('renderSnippet: text holes', () => {
  it('fills a hole with the escaped value and lays it out like the text around it', () => {
    const t = template([{ tag: 'p', attrs: [], children: [{ arg: 'maxLength', escape: 'text' }, ' characters'] }]);
    expect(renderSnippet(t, { maxLength: 200 }).code).toBe('  <p>200 characters</p>');
    expect(renderSnippet(t, { maxLength: '<b>' }).code).toBe('  <p>&lt;b&gt; characters</p>');
  });

  it('marks the line of a hole on every render, whatever the value', () => {
    const t = template([
      { tag: 'p', attrs: [], children: ['Max ', { arg: 'maxLength', escape: 'text' }] },
      { tag: 'p', attrs: [], children: ['static'] },
    ]);
    expect(renderSnippet(t, { maxLength: 80 }).changedLines).toEqual([0]);
    expect(renderSnippet(t, { maxLength: 5 }).changedLines).toEqual([0]);
  });

  it('prints nothing, and marks nothing, for a null, a missing or an empty value', () => {
    const t = template([{ tag: 'p', attrs: [], children: ['Max ', { arg: 'maxLength', escape: 'text' }] }]);
    expect(renderSnippet(t, { maxLength: null })).toEqual({ code: '  <p>Max </p>', changedLines: [] });
    expect(renderSnippet(t, {}).code).toBe('  <p>Max </p>');
    expect(renderSnippet(t, { maxLength: '' }).changedLines).toEqual([]);
  });

  it('prints a number hole only for a finite number', () => {
    const t = template([{ tag: 'p', attrs: [], children: [{ arg: 'n', kind: 'number', escape: 'text' }] }]);
    expect(renderSnippet(t, { n: 3 }).code).toBe('  <p>3</p>');
    expect(renderSnippet(t, { n: Number.POSITIVE_INFINITY }).code).toBe('  <p></p>');
  });

  it('keeps the line of a block that holds a hole in text', () => {
    const shape = SHAPES.find(([name]) => name === 'in a block')?.[1];
    const rendered = renderSnippet(template(shape?.({ arg: 'note', escape: 'angular' }) ?? []), { note: 'hi' });
    expect(rendered).toEqual({ code: '  @if (open()) {hi} @else {none}', changedLines: [0] });
  });

  it('throws when layoutMarkup meets a hole, because only renderSnippet knows the args', () => {
    expect(() => layoutMarkup([{ tag: 'p', attrs: [], children: [text('text')] }], 0)).toThrow(/note/);
  });
});

describe.each(['text', 'angular'] as const)('renderSnippet: a hole equals the written text, escape %s', (escape) => {
  describe.each(SHAPES)('%s', (_name, shape) => {
    it.each(CORPUS.map((value) => ({ value })))('value %j', ({ value }) => {
      const filled = renderSnippet(template(shape(text(escape))), { note: value }).code;
      const literal = layoutMarkup(written(shape(printTextHole(value, escape))), 2);
      expect(filled).toBe(literal);
    });
  });
});

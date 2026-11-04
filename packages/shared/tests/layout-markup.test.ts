import { describe, expect, it } from 'vitest';
import { layoutMarkup, type SnippetBlock, type SnippetElement, type SnippetNode } from '../src/index';

function el(
  tag: string,
  attrs: SnippetElement['attrs'] = [],
  children: SnippetNode[] = [],
  selfClosing = false,
): SnippetElement {
  return { tag, attrs, children, ...(selfClosing ? { selfClosing } : {}) };
}

const longAttrs = ['cckButton', 'variant="outline"', 'color="danger"', 'size="lg"', `aria-label="${'x'.repeat(70)}"`];

describe('layoutMarkup: indent', () => {
  it('indents each nesting level by 2 spaces, from the given indent', () => {
    const tree = el('form', [], [el('div', [], [el('button', ['cckButton'], ['Save'])])]);
    expect(layoutMarkup([tree], 4)).toBe(
      ['    <form>', '      <div>', '        <button cckButton>Save</button>', '      </div>', '    </form>'].join(
        '\n',
      ),
    );
  });

  it('prints top-level nodes as siblings at the same indent', () => {
    expect(layoutMarkup([el('a', ['href="/"'], ['Home']), el('b', [], ['x'])], 2)).toBe(
      ['  <a href="/">Home</a>', '  <b>x</b>'].join('\n'),
    );
  });

  it('prints nothing for no nodes or empty text', () => {
    expect(layoutMarkup([], 2)).toBe('');
    expect(layoutMarkup([''], 2)).toBe('');
  });
});

describe('layoutMarkup: opening tag width', () => {
  /** `<x a="…">` is `n + 8` columns wide; the child keeps the opening tag from sharing its line. */
  const opening = (n: number): SnippetElement => el('x', [`a="${'b'.repeat(n)}"`], [el('y')]);

  it('keeps the attributes on one line when the opening tag is exactly 120 columns', () => {
    const lines = layoutMarkup([opening(112)], 0).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveLength(120);
  });

  it('wraps one attribute per line one column later', () => {
    const lines = layoutMarkup([opening(113)], 0).split('\n');
    expect(lines[0]).toBe('<x');
    expect(lines[1]).toBe(`  a="${'b'.repeat(113)}"`);
    expect(lines[2]).toBe('>');
  });

  it('counts the indent in the 120 columns', () => {
    expect(layoutMarkup([opening(110)], 2).split('\n')[0]).toHaveLength(120);
    expect(layoutMarkup([opening(111)], 2).split('\n')[0]).toBe('  <x');
  });

  it('prints one attribute per line, with the closing bracket on its own line, when it does not fit', () => {
    expect(layoutMarkup([el('button', longAttrs, ['Delete'])], 2)).toBe(
      [
        '  <button',
        '    cckButton',
        '    variant="outline"',
        '    color="danger"',
        '    size="lg"',
        `    aria-label="${'x'.repeat(70)}"`,
        '  >',
        '    Delete',
        '  </button>',
      ].join('\n'),
    );
  });

  it('ends a wrapped self-closing tag with /> and a wrapped empty tag with > and its closing tag on the next line', () => {
    const wrapped = layoutMarkup([el('path', longAttrs, [], true)], 0).split('\n');
    expect(wrapped.at(-1)).toBe('/>');
    expect(wrapped).toHaveLength(longAttrs.length + 2);
    const empty = layoutMarkup([el('div', longAttrs)], 0).split('\n');
    expect(empty.slice(-2)).toEqual(['>', '</div>']);
    expect(empty).toHaveLength(longAttrs.length + 3);
  });

  it('measures the opening tag of an empty element alone: exactly 120 columns keeps its attributes on one line', () => {
    const attr = (width: number): string => `a="${'b'.repeat(width - '<div a="">'.length)}"`;
    expect(
      layoutMarkup([el('div', [attr(120)])], 0)
        .split('\n')
        .map((line) => line.length),
    ).toEqual([120, 6]);
    expect(layoutMarkup([el('div', [attr(121)])], 0).split('\n')[0]).toBe('<div');
    expect(layoutMarkup([el('div', [attr(113)])], 0).split('\n')).toHaveLength(1);
  });
});

describe('layoutMarkup: content', () => {
  it('keeps text-only content on the element line when the whole element fits', () => {
    expect(layoutMarkup([el('button', ['cckButton', 'size="lg"'], ['Save changes'])], 0)).toBe(
      '<button cckButton size="lg">Save changes</button>',
    );
  });

  it('moves text to its own line when only the opening tag fits', () => {
    const text = 't'.repeat(100);
    expect(layoutMarkup([el('p', ['class-less="a-fairly-long-attribute-value-here"'], [text])], 0)).toBe(
      ['<p class-less="a-fairly-long-attribute-value-here">', `  ${text}`, '</p>'].join('\n'),
    );
  });

  it('fits an element exactly at 120 columns and wraps one column more', () => {
    const open = '<p>';
    const close = '</p>';
    const fit = 'a'.repeat(120 - open.length - close.length);
    expect(layoutMarkup([el('p', [], [fit])], 0).split('\n')).toHaveLength(1);
    expect(layoutMarkup([el('p', [], [`${fit}a`])], 0).split('\n')).toHaveLength(3);
  });

  it('puts element children on their own lines, even one short child', () => {
    expect(layoutMarkup([el('p', [], [el('b', [], ['x'])])], 0)).toBe(['<p>', '  <b>x</b>', '</p>'].join('\n'));
  });

  it('trims the text it moves to a line of its own', () => {
    const text = ` ${'t'.repeat(100)} `;
    const lines = layoutMarkup([el('p', ['class-less="a-fairly-long-attribute-value-here"'], [text])], 0).split('\n');
    expect(lines).toEqual(['<p class-less="a-fairly-long-attribute-value-here">', `  ${text.trim()}`, '</p>']);
  });

  it('does not make a run of the text of a block element', () => {
    const text = 't'.repeat(118);
    expect(layoutMarkup([el('p', [], [text])], 0).split('\n')).toEqual(['<p>', `  ${text}`, '</p>']);
  });
});

describe('layoutMarkup: inline runs', () => {
  it('prints text beside elements on one line, exactly as written', () => {
    const run = el('p', [], ['Press ', el('kbd', [], ['Enter']), ' to ', el('b', [], ['send']), '.']);
    expect(layoutMarkup([run], 2)).toBe('  <p>Press <kbd>Enter</kbd> to <b>send</b>.</p>');
  });

  it('adds no space where the author wrote none and keeps the one the author wrote between two elements', () => {
    expect(layoutMarkup([el('p', [], ['Read', el('b', [], ['this']), 'now'])], 0)).toBe('<p>Read<b>this</b>now</p>');
    expect(layoutMarkup([el('p', [], [el('b', [], ['a']), ' ', el('i', [], ['b'])])], 0)).toBe(
      '<p><b>a</b> <i>b</i></p>',
    );
  });

  it('prints nested elements of a run flat: attributes, self-closing and empty elements', () => {
    const icon = el('svg', ['aria-hidden="true"'], [el('path', ['d="M0"'], [], true)]);
    expect(layoutMarkup([el('button', ['cckButton'], [icon, ' Save'])], 0)).toBe(
      '<button cckButton><svg aria-hidden="true"><path d="M0" /></svg> Save</button>',
    );
    expect(layoutMarkup([el('p', [], ['a', el('span')])], 0)).toBe('<p>a<span></span></p>');
  });

  it('never reflows a run: a long run stays on one line', () => {
    const lines = layoutMarkup([el('p', [], ['word '.repeat(40), el('b', [], ['x'])])], 0).split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]?.length).toBeGreaterThan(120);
  });

  it('wraps only the attributes of the opening tag of a run and puts the run after the closing bracket', () => {
    const run = el('p', longAttrs, ['See ', el('a', ['href="/x"'], ['docs'])]);
    const lines = layoutMarkup([run], 0).split('\n');
    expect(lines.slice(0, 2)).toEqual(['<p', '  cckButton']);
    expect(lines.at(-1)).toBe('>See <a href="/x">docs</a></p>');
    expect(lines.every((line) => line === line.trimEnd())).toBe(true);
  });

  it('keeps the text of an inline element on its line, however long', () => {
    const long = 'x'.repeat(130);
    for (const tag of ['a', 'span', 'code']) {
      expect(layoutMarkup([el(tag, ['id="a"'], [long])], 0).split('\n'), tag).toEqual([
        `<${tag} id="a">${long}</${tag}>`,
      ]);
    }
  });

  it('prints top-level text beside elements as one run, and a lone text as a line', () => {
    expect(layoutMarkup(['Hello ', el('b', [], ['world'])], 4)).toBe('    Hello <b>world</b>');
    expect(layoutMarkup(['Hello'], 4)).toBe('    Hello');
  });
});

describe('layoutMarkup: empty and self-closing elements', () => {
  it('prints a selfClosing element as <x … /> and an empty one with a closing tag', () => {
    expect(layoutMarkup([el('path', ['d="M0 0"'], [], true)], 0)).toBe('<path d="M0 0" />');
    expect(layoutMarkup([el('path', [], [], true)], 0)).toBe('<path />');
    expect(layoutMarkup([el('div', ['id="a"'])], 0)).toBe('<div id="a"></div>');
  });

  it('ignores selfClosing on an element with children', () => {
    expect(layoutMarkup([el('p', [], ['x'], true)], 0)).toBe('<p>x</p>');
  });
});

describe('layoutMarkup: args', () => {
  it('rejects an arg attribute: only renderSnippet knows the args', () => {
    const node = el('button', [{ arg: 'size', values: { sm: 'size="sm"' } }]);
    expect(() => layoutMarkup([node], 0)).toThrow(/arg "size"/);
  });
});

describe('layoutMarkup: markup attributes', () => {
  const label = (text: string): SnippetElement => el('Label', ['htmlFor="email"'], [text]);
  const field = (attrs: SnippetElement['attrs']): SnippetElement => el('FormField', attrs, [el('input', [], [], true)]);

  it('keeps a one-line markup attribute inline when the opening tag fits', () => {
    const node = field([{ name: 'label', markup: [label('Email')] }]);
    expect(layoutMarkup([node], 0)).toBe(
      ['<FormField label={<Label htmlFor="email">Email</Label>}>', '  <input />', '</FormField>'].join('\n'),
    );
  });

  it('wraps the opening tag when it is too wide, with the markup one level deeper in braces', () => {
    const node = field(['id="a"', { name: 'label', markup: [label('x'.repeat(80))] }]);
    expect(layoutMarkup([node], 0)).toBe(
      [
        '<FormField',
        '  id="a"',
        '  label={',
        `    <Label htmlFor="email">${'x'.repeat(80)}</Label>`,
        '  }',
        '>',
        '  <input />',
        '</FormField>',
      ].join('\n'),
    );
  });

  it('wraps when the markup is more than one line, and lays a nested fragment out by the same rules', () => {
    const markup = [el('Label', [], ['Email']), el('Hint', [], [el('b', [], ['x'])]), el('Hint', [], ['Help'])];
    const node = field([{ name: 'label', markup }]);
    expect(layoutMarkup([node], 2)).toBe(
      [
        '  <FormField',
        '    label={',
        '      <Label>Email</Label>',
        '      <Hint>',
        '        <b>x</b>',
        '      </Hint>',
        '      <Hint>Help</Hint>',
        '    }',
        '  >',
        '    <input />',
        '  </FormField>',
      ].join('\n'),
    );
  });

  it('prints a markup attribute inside a markup attribute', () => {
    const inner = el('Label', [{ name: 'hint', markup: [el('Hint', [], ['Help'])] }], ['Email']);
    const node = el('FormField', [{ name: 'label', markup: [inner] }]);
    expect(layoutMarkup([node], 0)).toBe(
      '<FormField label={<Label hint={<Hint>Help</Hint>}>Email</Label>}></FormField>',
    );
  });

  it('prints nothing for a markup attribute without markup', () => {
    expect(layoutMarkup([el('FormField', [{ name: 'label', markup: [''] }])], 0)).toBe('<FormField></FormField>');
  });

  it('keeps a markup attribute on one line in an inline run', () => {
    const node = el('p', [], ['See ', el('Tip', [{ name: 'label', markup: [label('Email')] }], [])]);
    expect(layoutMarkup([node], 0)).toBe('<p>See <Tip label={<Label htmlFor="email">Email</Label>}></Tip></p>');
  });
});

describe('layoutMarkup: no trailing whitespace', () => {
  it('trims the ends of a top-level run, which have no meaning at the edge of the markup', () => {
    expect(layoutMarkup([' Hello ', el('b', [], ['world']), ' '], 2)).toBe('  Hello <b>world</b>');
  });

  it('trims layout white space only: a no-break space at the ends of a run or of a text stays', () => {
    const nbsp = '\u00a0';
    expect(layoutMarkup([`${nbsp}Hello `, el('b', [], ['x']), nbsp], 2)).toBe(`  ${nbsp}Hello <b>x</b>${nbsp}`);
    expect(layoutMarkup([nbsp], 2)).toBe(`  ${nbsp}`);
    expect(layoutMarkup([` \t\n${nbsp}Hi${nbsp}\r\f `], 2)).toBe(`  ${nbsp}Hi${nbsp}`);
  });

  it('prints no line with trailing whitespace', () => {
    const nodes = [el('p', [], [' a ', el('b', [], ['x'])]), el('div', ['id="a"'], [el('i', [], ['y'])]), ' tail '];
    for (const line of layoutMarkup(nodes, 2).split('\n')) expect(line, JSON.stringify(line)).toBe(line.trimEnd());
  });
});

describe('layoutMarkup: conditional blocks', () => {
  const angular = { open: '@if (open()) {', middle: '} @else {', close: '}' };
  const react = (otherwise: boolean) => ({
    open: '{open ? (',
    middle: ') : (',
    close: otherwise ? ')}' : ') : null}',
  });
  const p = (text: string): SnippetElement => el('p', [], [text]);
  const block = (shape: SnippetBlock, children: SnippetNode[], otherwise?: SnippetNode[]): SnippetElement => ({
    tag: '',
    attrs: [],
    children,
    conditionalLines: shape,
    ...(otherwise ? { otherwise } : {}),
  });

  it('prints the opening line, the content one level deeper and the closing line', () => {
    expect(layoutMarkup([block(angular, [p('Details')])], 4)).toBe(
      ['    @if (open()) {', '      <p>Details</p>', '    }'].join('\n'),
    );
  });

  it('prints the middle line and the otherwise content', () => {
    expect(layoutMarkup([block(angular, [p('Open')], [p('Closed')])], 0)).toBe(
      ['@if (open()) {', '  <p>Open</p>', '} @else {', '  <p>Closed</p>', '}'].join('\n'),
    );
  });

  it('prints the lines of another framework as given', () => {
    expect(layoutMarkup([block(react(false), [p('Details')])], 2)).toBe(
      ['  {open ? (', '    <p>Details</p>', '  ) : null}'].join('\n'),
    );
    expect(layoutMarkup([block(react(true), [p('Open')], [p('Closed')])], 0)).toBe(
      ['{open ? (', '  <p>Open</p>', ') : (', '  <p>Closed</p>', ')}'].join('\n'),
    );
  });

  it('sits among siblings like any element', () => {
    expect(layoutMarkup([el('button', [], ['Go']), block(angular, [p('Details')])], 0)).toBe(
      ['<button>Go</button>', '@if (open()) {', '  <p>Details</p>', '}'].join('\n'),
    );
  });

  it('keeps a block with text of its own on one line, because lines of its own would add spaces to the text', () => {
    expect(layoutMarkup([block(angular, ['hello'])], 2)).toBe('  @if (open()) {hello}');
    expect(layoutMarkup([block(angular, [p('Open')], ['closed'])], 0)).toBe(
      '@if (open()) {<p>Open</p>} @else {closed}',
    );
    expect(layoutMarkup([block(angular, ['one ', el('b', [], ['two'])])], 0)).toBe('@if (open()) {one <b>two</b>}');
  });

  it('prints an empty branch as its opening and closing line', () => {
    expect(layoutMarkup([block(angular, [], [p('Closed')])], 0)).toBe(
      ['@if (open()) {', '} @else {', '  <p>Closed</p>', '}'].join('\n'),
    );
  });

  it('prints on one line in an inline run, content joined without added spaces', () => {
    const node = el('p', [], ['Now ', block(angular, [el('b', [], ['open'])], [el('i', [], ['closed'])])]);
    expect(layoutMarkup([node], 0)).toBe('<p>Now @if (open()) {<b>open</b>} @else {<i>closed</i>}</p>');
  });
});

describe('layoutMarkup: breaks inside an inline run that does not fit', () => {
  const path = (): SnippetElement => el('path', [`d="${'M0 0'.repeat(14)}"`], [], true);
  const icon = (): SnippetElement => el('svg', ['aria-hidden="true"'], [path(), path()]);

  it('prints the children of an element of elements one per line, and no break next to the text', () => {
    const lines = layoutMarkup([el('button', ['cckButton'], [icon(), 'Inbox ', el('span', ['cckBadge'])])], 0).split(
      '\n',
    );
    expect(lines[0]).toBe('<button cckButton>');
    expect(lines[1]).toBe('  <svg aria-hidden="true">');
    expect(lines[2]).toMatch(/^ {4}<path d="(M0 0)+" \/>$/);
    expect(lines.at(-2)).toBe('  </svg>Inbox <span cckBadge></span>');
    expect(lines.at(-1)).toBe('</button>');
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(120);
  });

  it('breaks between two sibling elements and never between an element and text', () => {
    const wide = (name: string): SnippetElement => el(name, [`data-x="${'y'.repeat(40)}"`], ['text']);
    const lines = layoutMarkup([el('p', [], ['Lead ', wide('a'), wide('b'), wide('c'), ' end'])], 0).split('\n');
    expect(lines[0]).toMatch(/^<p>Lead <a data-x="y+">text<\/a>$/);
    expect(lines[1]).toMatch(/^ {2}<b data-x="y+">text<\/b>$/);
    expect(lines[2]).toMatch(/^ {2}<c data-x="y+">text<\/c> end<\/p>$/);
  });

  it('keeps a run on one line when it fits, and a run of text and one element when it does not', () => {
    expect(layoutMarkup([el('p', [], [el('svg', [], [el('path', [], [], true)]), ' Save'])], 0)).toBe(
      '<p><svg><path /></svg> Save</p>',
    );
    const long = 'word '.repeat(30);
    expect(layoutMarkup([el('p', [], [long, el('b', [], ['x'])])], 0).split('\n')).toHaveLength(1);
  });

  it('breaks the top-level run the same way and trims its ends', () => {
    const lines = layoutMarkup([icon(), ' tail '], 2).split('\n');
    expect(lines[0]).toBe('  <svg aria-hidden="true">');
    expect(lines.at(-1)).toBe('  </svg> tail');
  });

  it('prints a scoped-slot arrow that names a one-line form on one line when it fits', () => {
    const flat = { open: '({ selected }) => ', close: '' };
    const block: SnippetBlock = { open: '({ selected }) => (', middle: '', close: ')', flat };
    const arrow = (children: SnippetNode[]): SnippetElement => ({
      tag: '',
      attrs: [],
      children,
      conditionalLines: block,
    });
    const markup = (children: SnippetNode[]): string =>
      layoutMarkup([el('Select.Root', [{ name: 'preview', markup: [arrow(children)] }])], 0);
    expect(markup([el('', [], ['3 selected'])])).toBe(
      '<Select.Root preview={({ selected }) => <>3 selected</>}></Select.Root>',
    );
    const list = el('ul', [], [el('li', [], ['a']), el('li', [], ['b'])]);
    expect(markup([list])).toContain('({ selected }) => (\n');
    const wide = el('', [], ['x'.repeat(130)]);
    expect(markup([wide])).toContain('({ selected }) => (\n');
  });
});

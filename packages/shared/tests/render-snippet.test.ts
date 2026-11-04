import { describe, expect, it } from 'vitest';
import { escapeSnippetValue, renderSnippet, type SnippetElement, type SnippetTemplate } from '../src/index';

const button = (attrs: SnippetElement['attrs'], text = 'Save changes'): SnippetElement => ({
  tag: 'button',
  attrs,
  children: [text],
});

const variant = { arg: 'variant', values: { primary: '', outline: 'variant="outline"', basic: 'variant="basic"' } };
const disabled = { arg: 'disabled', values: { true: 'disabled', false: '' } };
const placeholder = { arg: 'placeholder', before: 'placeholder="', after: '"' };
const maxlength = { arg: 'maxlength', before: 'maxlength="', after: '"', default: 3 };
const title = { arg: 'title', before: 'title="', after: '"', default: 'Untitled' };

function template(attrs: SnippetElement['attrs'], before = 'template: `\n', after = '\n`'): SnippetTemplate {
  return { before, markup: [button(['cckButton', ...attrs])], indent: 2, after };
}

describe('renderSnippet: arg forms', () => {
  it('prints the text of a select value and nothing for its default', () => {
    const t = template([variant]);
    expect(renderSnippet(t, { variant: 'outline' }).code).toBe(
      'template: `\n  <button cckButton variant="outline">Save changes</button>\n`',
    );
    expect(renderSnippet(t, { variant: 'primary' }).code).toBe(
      'template: `\n  <button cckButton>Save changes</button>\n`',
    );
  });

  it('prints a switch by its boolean value', () => {
    const t = template([disabled]);
    expect(renderSnippet(t, { disabled: true }).code).toContain('<button cckButton disabled>');
    expect(renderSnippet(t, { disabled: false }).code).toContain('<button cckButton>');
  });

  it('prints a text value between before and after, escaped', () => {
    const t = template([placeholder]);
    expect(renderSnippet(t, { placeholder: 'Search & find' }).code).toContain('placeholder="Search &amp; find"');
    expect(renderSnippet(t, { placeholder: 'say "hi" {{ x }}' }).code).toContain(
      'placeholder="say &quot;hi&quot; &#123;&#123; x &#125;&#125;"',
    );
  });

  it('prints a number value between before and after', () => {
    expect(renderSnippet(template([maxlength]), { maxlength: 5 }).code).toContain('maxlength="5"');
  });

  it('prints nothing for the default of a text or number arg', () => {
    expect(renderSnippet(template([maxlength]), { maxlength: 3 }).code).not.toContain('maxlength');
    expect(renderSnippet(template([title]), { title: 'Untitled' }).code).not.toContain('title');
    expect(renderSnippet(template([title]), { title: 'Report' }).code).toContain('title="Report"');
  });

  it('prints nothing for a null or missing arg, and for a select value that is not listed', () => {
    const t = template([variant, placeholder, disabled]);
    expect(renderSnippet(t, { variant: null, placeholder: null }).code).toContain('<button cckButton>');
    expect(renderSnippet(t, {}).code).toContain('<button cckButton>');
    expect(renderSnippet(t, { variant: 'solid' }).code).toContain('<button cckButton>');
  });

  it('keeps the order of the attributes of the template', () => {
    const t = template([variant, disabled, maxlength]);
    expect(renderSnippet(t, { variant: 'basic', disabled: true, maxlength: 9 }).code).toContain(
      '<button cckButton variant="basic" disabled maxlength="9">',
    );
  });

  it('prints args on nested elements and in an empty element', () => {
    const t: SnippetTemplate = {
      before: '',
      markup: [
        { tag: 'div', attrs: [], children: [{ tag: 'input', attrs: [placeholder], children: [], selfClosing: true }] },
      ],
      indent: 0,
      after: '',
    };
    expect(renderSnippet(t, { placeholder: 'Name' }).code).toBe('<div>\n  <input placeholder="Name" />\n</div>');
  });
});

describe('renderSnippet: changedLines', () => {
  it('lists exactly the lines with a non-default value, counted from the first line of the code', () => {
    const t: SnippetTemplate = {
      before: 'line 0\nline 1\n',
      markup: [
        button(['cckButton', variant]),
        button(['cckButton', disabled]),
        button(['cckButton', { arg: 'size', values: { md: '', lg: 'size="lg"' } }]),
      ],
      indent: 0,
      after: '\nline 5',
    };
    const result = renderSnippet(t, { variant: 'outline', disabled: false, size: 'lg' });
    expect(result.code.split('\n')).toEqual([
      'line 0',
      'line 1',
      '<button cckButton variant="outline">Save changes</button>',
      '<button cckButton>Save changes</button>',
      '<button cckButton size="lg">Save changes</button>',
      'line 5',
    ]);
    expect(result.changedLines).toEqual([2, 4]);
  });

  it('is empty when every arg has its default', () => {
    expect(
      renderSnippet(template([variant, disabled, maxlength]), { variant: 'primary', disabled: false, maxlength: 3 })
        .changedLines,
    ).toEqual([]);
  });

  it('marks the line of each non-default attribute when the tag wraps', () => {
    const long = { arg: 'label', before: 'aria-label="', after: '"' };
    const t: SnippetTemplate = {
      before: '<!-- 0 -->\n',
      markup: [button(['cckButton', variant, disabled, long])],
      indent: 0,
      after: '',
    };
    const result = renderSnippet(t, { variant: 'basic', disabled: false, label: 'x'.repeat(110) });
    expect(result.code.split('\n').slice(0, 5)).toEqual([
      '<!-- 0 -->',
      '<button',
      '  cckButton',
      '  variant="basic"',
      `  aria-label="${'x'.repeat(110)}"`,
    ]);
    expect(result.changedLines).toEqual([3, 4]);
  });

  it('marks the one line of a single-line tag once, however many args changed', () => {
    const result = renderSnippet(template([variant, disabled]), { variant: 'outline', disabled: true });
    expect(result.changedLines).toEqual([1]);
  });

  it('counts a before that does not end in a line break', () => {
    const t: SnippetTemplate = { before: 'a\nb', markup: [button([variant])], indent: 0, after: '' };
    expect(renderSnippet(t, { variant: 'outline' }).changedLines).toEqual([1]);
  });
});

describe('renderSnippet: markup attributes', () => {
  const size = { arg: 'size', values: { md: '', lg: 'size="lg"' } };
  const field = (label: SnippetElement): SnippetTemplate => ({
    before: 'export const a = (\n',
    markup: [
      {
        tag: 'FormField',
        attrs: [{ name: 'label', markup: [label] }],
        children: [{ tag: 'input', attrs: [], children: [], selfClosing: true }],
      },
    ],
    indent: 2,
    after: '\n);',
  });
  const inlineLabel: SnippetElement = { tag: 'Label', attrs: [size], children: ['Email'] };

  it('prints an arg nested in a markup attribute at its default, with no changed line', () => {
    const result = renderSnippet(field(inlineLabel), { size: 'md' });
    expect(result.code).toBe(
      [
        'export const a = (',
        '  <FormField label={<Label>Email</Label>}>',
        '    <input />',
        '  </FormField>',
        ');',
      ].join('\n'),
    );
    expect(result.changedLines).toEqual([]);
  });

  it('marks the line of a changed nested arg when the attribute stays inline', () => {
    const result = renderSnippet(field(inlineLabel), { size: 'lg' });
    expect(result.code.split('\n')[1]).toBe('  <FormField label={<Label size="lg">Email</Label>}>');
    expect(result.changedLines).toEqual([1]);
  });

  it('marks only the slot line of a changed nested arg when the markup spans lines', () => {
    const label: SnippetElement = {
      tag: 'Label',
      attrs: [size],
      children: [
        { tag: 'b', attrs: [], children: ['Email'] },
        { tag: 'Hint', attrs: [], children: ['Help'] },
      ],
    };
    const result = renderSnippet(field(label), { size: 'lg' });
    expect(result.code.split('\n')).toEqual([
      'export const a = (',
      '  <FormField',
      '    label={',
      '      <Label size="lg">',
      '        <b>Email</b>',
      '        <Hint>Help</Hint>',
      '      </Label>',
      '    }',
      '  >',
      '    <input />',
      '  </FormField>',
      ');',
    ]);
    expect(result.changedLines).toEqual([3]);
    expect(renderSnippet(field(label), { size: 'md' }).changedLines).toEqual([]);
  });
});

describe('renderSnippet: purity', () => {
  it('gives the same result for the same input and does not change the template', () => {
    const t = template([variant]);
    const copy = JSON.stringify(t);
    expect(renderSnippet(t, { variant: 'outline' })).toEqual(renderSnippet(t, { variant: 'outline' }));
    expect(JSON.stringify(t)).toBe(copy);
  });
});

describe('renderSnippet: checked and escaped values', () => {
  const count = { arg: 'count', kind: 'number' as const, before: '[count]="', after: '"', default: 3 };

  it('a number control prints finite numbers only', () => {
    const t = template([count]);
    expect(renderSnippet(t, { count: 5 }).code).toContain('[count]="5"');
    expect(renderSnippet(t, { count: 0 }).code).toContain('[count]="0"');
    for (const value of ['alert(1)', '5', Number.NaN, Number.POSITIVE_INFINITY, true]) {
      expect(renderSnippet(t, { count: value }).code, String(value)).not.toContain('count');
    }
    expect(renderSnippet(t, { count: 3 }).code).not.toContain('count');
  });

  it('looks select and switch values up by own keys only', () => {
    const t = template([variant, disabled]);
    for (const value of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      const result = renderSnippet(t, { variant: value, disabled: value });
      expect(result.code, value).toContain('<button cckButton>');
      expect(result.changedLines).toEqual([]);
    }
  });

  it('ignores an inherited key of the args', () => {
    const t = template([{ arg: 'toString', before: 'title="', after: '"' }]);
    expect(renderSnippet(t, {}).code).not.toContain('title');
  });

  it('prints a value that is not a string in a values map as nothing', () => {
    const odd = { arg: 'odd', values: { x: 3 as unknown as string } };
    expect(renderSnippet(template([odd]), { odd: 'x' }).code).toContain('<button cckButton>');
  });

  it('escapes a text value for an Angular template with escape: angular, the way the compiler prints a literal', () => {
    const t = template([{ arg: 'title', before: 'title="', after: '"', escape: 'angular' as const }]);
    const print = (value: string): string => renderSnippet(t, { title: value }).code;
    expect(print('a`b')).toContain('title="a\\`b"');
    expect(print('a\\b')).toContain('title="a\\\\b"');
    expect(print('x {{ y }}')).toContain('title="x {{ \'{{\' }} y &#125;&#125;"');
    expect(print('${z}')).toContain('title="$&#123;z&#125;"');
    expect(print('50% @ "x"')).toContain('title="50% &#64; &quot;x&quot;"');
  });

  it('escapes a text value as an attribute by default', () => {
    const t = template([placeholder]);
    expect(renderSnippet(t, { placeholder: 'a`b\\c' }).code).toContain('placeholder="a`b\\c"');
  });
});

describe('renderSnippet: conditional blocks', () => {
  it('fills an arg inside a block and marks the changed line', () => {
    const inBlock: SnippetElement = {
      tag: '',
      attrs: [],
      children: [button(['cckButton', disabled])],
      conditionalLines: { open: '@if (open()) {', middle: '} @else {', close: '}' },
    };
    const t: SnippetTemplate = { before: '', markup: [inBlock], indent: 0, after: '' };
    const rendered = renderSnippet(t, { disabled: true });
    expect(rendered.code).toBe('@if (open()) {\n  <button cckButton disabled>Save changes</button>\n}');
    expect(rendered.changedLines).toEqual([1]);
  });
});

describe('renderSnippet: script holes', () => {
  const limit = { arg: 'limit', kind: 'number', escape: 'script' } as const;
  const label = { arg: 'label', kind: 'text', escape: 'script' } as const;
  const note = { arg: 'note', before: 'note="', after: '"', default: 'none' };
  const withScript: SnippetTemplate = {
    before: "const left = 80 - message.length;\nconst name = 'Ada';\n\n",
    markup: [button(['cckButton', note])],
    indent: 0,
    after: '\nexport {};\n',
    script: {
      before: ['const left = ', limit, ' - message.length;\nconst name = ', label, ';\n\n'],
      after: ['\nconst again = ', limit, ';\n'],
    },
  };

  it('fills the holes of the script and ignores before and after', () => {
    expect(renderSnippet(withScript, { limit: 40, label: 'Grace', note: 'none' }).code).toBe(
      "const left = 40 - message.length;\nconst name = 'Grace';\n\n<button cckButton>Save changes</button>\nconst again = 40;\n",
    );
  });

  it('prints a hole at any value, even the one that the default of an attribute would leave out', () => {
    expect(renderSnippet(withScript, { limit: 80, label: 'Ada' }).code).toContain('const left = 80 - message.length;');
  });

  it('marks the line of each hole that printed text, before the markup, on it and after it', () => {
    const rendered = renderSnippet(withScript, { limit: 40, label: 'Grace', note: 'x' });
    expect(rendered.changedLines).toEqual([0, 1, 3, 4]);
    expect(rendered.code.split('\n')[3]).toContain('note="x"');
    expect(rendered.code.split('\n')[4]).toBe('const again = 40;');
  });

  it('prints a string as a TypeScript literal, a boolean and an infinite number as they are', () => {
    const t: SnippetTemplate = {
      ...withScript,
      script: { before: [label, ' ', limit, ' ', { arg: 'flag', escape: 'script' }], after: [] },
    };
    expect(renderSnippet(t, { label: "It's\n<!--", limit: Number.POSITIVE_INFINITY, flag: false }).code).toContain(
      "'It\\'s\\n\\u003C!--' Infinity false",
    );
  });

  it('marks a line once, however many holes on it printed', () => {
    const t: SnippetTemplate = { ...withScript, script: { before: [limit, ' ', limit, '\n'], after: [limit, label] } };
    expect(renderSnippet(t, { limit: 1, label: 'a' }).changedLines).toEqual([0, 1]);
  });

  it('prints a hole of a null or missing arg as nothing', () => {
    expect(renderSnippet(withScript, { limit: null }).code).toContain('const left =  - message.length;');
  });

  it('renders a template without a script from before and after, as before', () => {
    const plain: SnippetTemplate = {
      before: withScript.before,
      markup: withScript.markup,
      indent: 0,
      after: withScript.after,
    };
    expect(renderSnippet(plain, { note: 'x' }).code).toBe(
      'const left = 80 - message.length;\nconst name = \'Ada\';\n\n<button cckButton note="x">Save changes</button>\nexport {};\n',
    );
    expect(renderSnippet(plain, { note: 'x' }).changedLines).toEqual([3]);
  });
});

describe('escapeSnippetValue', () => {
  it('the script mode is a single-quoted TypeScript string literal', () => {
    expect(escapeSnippetValue("a'b\\c\n</x", 'script')).toBe("'a\\'b\\\\c\\n\\u003C/x'");
    expect(escapeSnippetValue(String.fromCharCode(0xe000), 'script')).toBe(`'${String.fromCharCode(92)}ue000'`);
    expect(escapeSnippetValue(String.fromCharCode(0x2028, 0x2029), 'script')).toBe("'\\u2028\\u2029'");
  });

  it('escapes the characters that end an attribute or start an interpolation', () => {
    expect(escapeSnippetValue('a & b < c "d" {e}')).toBe('a &amp; b &lt; c &quot;d&quot; &#123;e&#125;');
    expect(escapeSnippetValue('plain')).toBe('plain');
  });

  it('the angular mode also escapes {{, @, backslashes, backticks and ${', () => {
    expect(escapeSnippetValue('{{ x }}', 'angular')).toBe("{{ '{{' }} x &#125;&#125;");
    expect(escapeSnippetValue('{{{', 'angular')).toBe("{{ '{{' }}&#123;");
    expect(escapeSnippetValue('a@b', 'angular')).toBe('a&#64;b');
    expect(escapeSnippetValue('\\`${', 'angular')).toBe('\\\\\\`$&#123;');
  });
});

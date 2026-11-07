import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { aliasResolverAt, aliasValuesOf, expandAliases } from './expand-alias';

const FILES: Record<string, string> = {
  '/pos.ts': [
    '/**',
    ' * A corner.',
    ' * @cckValue top-left - The top left corner.',
    ' * @cckValue top-right - The top right corner.',
    ' */',
    "export type Position = 'top-left' | 'top-right';",
    "export type Single = 'only';",
    "export type Mixed = 'a' | 1;",
    'export const kinds = { text: 1, email: 2 };',
    '/**',
    ' * A kind of text.',
    ' * @cckValue text - Plain text.',
    ' * @cckValue email - An email address.',
    ' */',
    'export type Kind = keyof typeof kinds;',
    'export type Box<T> = T;',
    'export type Corner = Position;',
    '/** @cckValue only - The one value. */',
    'export type Sole = Single;',
    '',
  ].join('\n'),
  '/use.ts':
    "import type { Position, Single, Mixed, Box, Corner, Sole, Kind } from './pos';\ntype Local = 'x';\nexport const keep = 1;\n",
  '/far.ts': [
    '/**',
    ' * A way that no import of use.ts names.',
    ' * @cckValue up - Upward.',
    ' * @cckValue down - Downward.',
    ' */',
    "export type Far = 'up' | 'down';",
    "export type Twice = 'a';",
    '',
  ].join('\n'),
  '/again.ts': "export type Twice = 'b';\n",
};

function resolver(): ReturnType<typeof aliasResolverAt> {
  const options: ts.CompilerOptions = { noEmit: true, types: [], strict: true };
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host);
  host.readFile = (name) => FILES[name] ?? read(name);
  host.fileExists = (name) => name in FILES;
  host.getSourceFile = (name, version) => {
    const text = FILES[name];
    return text === undefined ? undefined : ts.createSourceFile(name, text, version, true);
  };
  const program = ts.createProgram({ rootNames: ['/use.ts', '/far.ts', '/again.ts'], options, host });
  const source = program.getSourceFile('/use.ts');
  if (source === undefined) throw new Error('no source');
  return aliasResolverAt(program, source);
}

describe('expandAliases', () => {
  const resolve = resolver();

  it('expands an imported and a local alias of string literals, in declaration order', () => {
    expect(expandAliases('Position', resolve)).toBe("'top-left' | 'top-right'");
    expect(expandAliases('Position | undefined', resolve)).toBe("'top-left' | 'top-right' | undefined");
    expect(expandAliases('Local', resolve)).toBe("'x'");
    expect(expandAliases('Single', resolve)).toBe("'only'");
  });

  it('keeps the meaning of a type that only contains the alias name', () => {
    for (const text of [
      'Position[]',
      'readonly Position[]',
      'keyof Position',
      '{ Position: 1 }',
      '(Position)',
      'Array<Position>',
    ]) {
      expect(expandAliases(text, resolve)).toBe(text);
    }
    expect(expandAliases('Position[] | Single', resolve)).toBe("Position[] | 'only'");
    expect(expandAliases("(() => Position) | 'a|b' | Position", resolve)).toBe(
      "(() => Position) | 'a|b' | 'top-left' | 'top-right'",
    );
  });

  it('expands an alias whose union the checker computes, as from the keys of a const object', () => {
    expect(expandAliases('Kind | undefined', resolve)).toBe("'text' | 'email' | undefined");
    expect(aliasValuesOf('Kind', resolve)).toEqual([
      { value: 'text', description: 'Plain text.' },
      { value: 'email', description: 'An email address.' },
    ]);
  });

  it('expands an alias of the program that is not in scope, when only one declaration has the name', () => {
    expect(expandAliases('Far | undefined', resolve)).toBe("'up' | 'down' | undefined");
    expect(aliasValuesOf('Far', resolve)).toHaveLength(2);
    expect(expandAliases('Twice', resolve)).toBe('Twice');
  });

  it('leaves other types, generics, member accesses, quoted text and unknown names as written', () => {
    for (const text of ['Box<Position>', 'Mixed', 'ns.Position', "'Position'", 'string | number', 'Unknown']) {
      expect(expandAliases(text, resolve)).toBe(text);
    }
  });
});

describe('aliasValuesOf', () => {
  const resolve = resolver();
  const corners = [
    { value: 'top-left', description: 'The top left corner.' },
    { value: 'top-right', description: 'The top right corner.' },
  ];

  it('gives the @cckValue meanings of the aliases a type text names, and none for an alias without them', () => {
    expect(aliasValuesOf('Position | undefined', resolve)).toEqual(corners);
    expect(aliasValuesOf('Single', resolve)).toEqual([]);
    expect(aliasValuesOf('Position[]', resolve)).toEqual([]);
  });

  it('expands an alias of an alias, which takes the inner meanings unless it has its own', () => {
    expect(expandAliases('Corner', resolve)).toBe("'top-left' | 'top-right'");
    expect(aliasValuesOf('Corner', resolve)).toEqual(corners);
    expect(aliasValuesOf('Sole', resolve)).toEqual([{ value: 'only', description: 'The one value.' }]);
  });
});

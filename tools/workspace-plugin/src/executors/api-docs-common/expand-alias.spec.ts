import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { aliasResolverAt, expandAliases } from './expand-alias';

const FILES: Record<string, string> = {
  '/pos.ts':
    "export type Position = 'top-left' | 'top-right';\nexport type Single = 'only';\nexport type Mixed = 'a' | 1;\nexport type Box<T> = T;\n",
  '/use.ts': "import type { Position, Single, Mixed, Box } from './pos';\ntype Local = 'x';\nexport const keep = 1;\n",
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
  const program = ts.createProgram({ rootNames: ['/use.ts'], options, host });
  const source = program.getSourceFile('/use.ts');
  if (source === undefined) throw new Error('no source');
  return aliasResolverAt(program.getTypeChecker(), source);
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

  it('leaves other types, generics, member accesses, quoted text and unknown names as written', () => {
    for (const text of ['Box<Position>', 'Mixed', 'ns.Position', "'Position'", 'string | number', 'Unknown']) {
      expect(expandAliases(text, resolve)).toBe(text);
    }
  });
});

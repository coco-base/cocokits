import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

/** `tools/scripts/check-utf8.mjs`. The broken samples are built from escapes so this file stays clean itself. */
const SCRIPT = resolve(import.meta.dirname, '..', '..', '..', 'scripts', 'check-utf8.mjs');

interface CheckModule {
  findProblems: (file: string, bytes: Uint8Array) => string[];
}

let findProblems: CheckModule['findProblems'];

beforeAll(async () => {
  ({ findProblems } = (await import(pathToFileURL(SCRIPT).href)) as CheckModule);
});

const bytes = (text: string) => Buffer.from(text, 'utf8');

describe('check-utf8', () => {
  it('accepts valid UTF-8 with non-ASCII text', () => {
    expect(
      findProblems('a.ts', bytes('// architecture \u00a74, na\u00efve, \u2014 \u201cquoted\u201d, \u00c0 la carte')),
    ).toEqual([]);
  });

  it('skips a binary file (a NUL byte)', () => {
    expect(findProblems('a.png', Buffer.from([0x89, 0x50, 0x00, 0xff, 0xfe]))).toEqual([]);
  });

  it('reports bytes that are not valid UTF-8', () => {
    expect(findProblems('a.ts', Buffer.from([0x61, 0xa7, 0x34]))).toEqual(['a.ts: invalid UTF-8']);
  });

  it('reports the replacement character with its line', () => {
    expect(findProblems('a.ts', bytes('ok\narchitecture \ufffd4\n'))).toEqual(['a.ts:2: replacement character']);
  });

  it.each([
    ['Latin-1 two-byte', '\u00c3\u00a9'],
    ['Latin-1 section sign', '\u00c2\u00a7'],
    ['Windows-1252 em dash', '\u00e2\u20ac\u201d'],
    ['Windows-1252 right quote', '\u00e2\u20ac\u2122'],
    ['Windows-1252 left quote', '\u00e2\u20ac\u0153'],
  ])('reports mojibake: %s', (_name, broken) => {
    expect(findProblems('a.md', bytes(`one\ntext ${broken} text`))).toEqual(['a.md:2: mojibake']);
  });

  it('does not report legitimate accented text', () => {
    expect(findProblems('a.md', bytes('\u00e2me, p\u00e2t\u00e9, \u00c3 la mode, \u00a9 2026'))).toEqual([]);
  });
});

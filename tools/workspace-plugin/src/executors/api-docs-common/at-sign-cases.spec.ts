import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SOURCE_ROWS } from './testing/at-sign-cases';
import { REPO } from './testing/scratch';

const NEW_LINE = /\r?\n/;
/** The text with each line trimmed, so the indentation of the source does not count. */
const trimmed = (text: string): string =>
  text
    .split(NEW_LINE)
    .map((line) => line.trim())
    .join(String.fromCharCode(10));

describe('the rows of at-sign-cases.ts', () => {
  it.each(SOURCE_ROWS.map((row) => [row.name, row] as const))('%s matches its source file', (_name, row) => {
    const text = readFileSync(join(REPO, row.file), 'utf8');
    expect(text.split(NEW_LINE)[row.line - 1]).toContain('@example');
    expect(trimmed(text)).toContain(trimmed(row.comment));
  });
});

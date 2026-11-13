import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(import.meta.dirname, '..', 'svg-icon.ts'), 'utf8');

describe('SvgIcon source (Angular)', () => {
  it('says that its markup is trusted content only', () => {
    expect(source).toContain('Trusted content only');
  });

  it('inserts markup only through the one bypass, with its written reason', () => {
    expect(source.match(/bypassSecurityTrust/g)).toHaveLength(1);
    expect(source).toContain("Angular's sanitiser would strip it");
  });

  it('does not use another way to put markup into the page', () => {
    for (const sink of ['outerHTML', 'insertAdjacentHTML', 'createContextualFragment', 'document.write']) {
      expect(source).not.toContain(sink);
    }
  });
});

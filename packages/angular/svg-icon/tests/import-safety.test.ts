import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** The ways to put markup into the page. No SvgIcon source may use one: an icon is bound as attributes only. */
const sinks = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'dangerouslySetInnerHTML',
  'v-html',
  'DOMParser',
  'createContextualFragment',
  'bypassSecurityTrust',
  'DomSanitizer',
];

const folder = join(import.meta.dirname, '..');
const sources = readdirSync(folder).filter((name) => name.endsWith('.ts'));

describe('SvgIcon sources (Angular)', () => {
  it('finds the component source', () => {
    expect(sources).toContain('svg-icon.ts');
  });

  it.each(sources.flatMap((file) => sinks.map((sink) => [file, sink] as const)))('%s does not use %s', (file, sink) => {
    expect(readFileSync(join(folder, file), 'utf8')).not.toContain(sink);
  });
});

// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

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
  'innerHtml',
];

const folder = join(import.meta.dirname, '..');
const sources = readdirSync(folder)
  .filter((name) => /\.(vue|ts)$/.test(name))
  .sort();

describe('svg-icon sources', () => {
  it('finds the sources of the entry', () => {
    expect(sources).toEqual(['SvgIcon.vue', 'index.ts', 'svg-icon.types.ts'].sort());
  });

  it.each(sinks.flatMap((sink) => sources.map((file) => [sink, file] as const)))('has no %s in %s', (sink, file) => {
    expect(readFileSync(join(folder, file), 'utf8')).not.toContain(sink);
  });
});

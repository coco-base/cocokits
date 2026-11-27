import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiPartJson } from '../api-docs-common/types';
import { extractAngularApiDocs } from './extract';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');
const area = scratchArea('api-docs-angular-overlays');

/** The `ApiDoc` of the fixture `overlays` (a root with a short form and a rich trigger) with a change of its text. */
function extract(name: string, change: (text: string) => string = (text) => text): ApiDocJson[] {
  const { project, tsConfig } = area.create(
    name,
    {
      'thing/index.ts': change(readFileSync(join(FIXTURES, 'overlays.ts.txt'), 'utf8')),
      'thing/ng-package.json': JSON.stringify({ lib: { entryFile: 'index.ts' } }),
    },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  return extractAngularApiDocs(REPO, project, tsConfig);
}

const partNamed = (docs: ApiDocJson[], name: string): ApiPartJson | undefined =>
  docs[0]?.parts.find((part) => part.name === name);

afterEach(() => {
  area.clean();
});

describe('extractAngularApiDocs: a short form, a part around another, a root with its own selector', () => {
  it('writes shortForm on the member of the short form, and the trigger need not expose it', () => {
    const root = partNamed(extract('short-form'), 'Tip');
    expect(root?.props.map((prop) => [prop.name, prop.shortForm])).toEqual([
      ['tip', true],
      ['open', undefined],
      ['showDelay', undefined],
    ]);
  });

  it('still fails when the trigger does not expose a member of the rich form', () => {
    expect(() => extract('hidden-delay', (text) => text.replace("'open', 'showDelay'", "'open'"))).toThrow(
      'TipTrigger: the host directive Tip must expose "showDelay" under its own name in its inputs',
    );
  });

  it('fails on a short-form member of a part that no host directive applies', () => {
    const change = (text: string): string =>
      text.replace(
        '/** The template of the content. */',
        '/**\n   * The template of the content.\n   * @cckShortForm\n   */',
      );
    expect(() => extract('short-form-trigger', change)).toThrow(
      'TipTrigger.tipTriggerFor: "@cckShortForm" needs a part with a selector of its own that another part also applies as a host directive',
    );
  });

  it('writes the selector and appliedBy of a root that sits on its own element and is applied by its trigger', () => {
    expect(partNamed(extract('own-selector'), 'Tip')).toMatchObject({
      semanticId: 'thing.root',
      selector: '[tip]',
      appliedBy: 'trigger',
    });
  });

  it('writes the part a part must hold', () => {
    const docs = extract('around');
    expect(partNamed(docs, 'TipAnchor')?.around).toBe('trigger');
    expect(partNamed(docs, 'TipContent')?.around).toBeUndefined();
  });

  it.each([
    ['shape', '@cckAround', '"@cckAround" needs the shape "@cckAround <part>"'],
    ['two words', '@cckAround trigger content', '"@cckAround" needs the shape "@cckAround <part>"'],
    ['part', '@cckAround list', 'TipAnchor: "@cckAround list" names no part "list" of the entry point'],
  ])('fails on a tag that names no part (%s)', (id, tag, problem) => {
    expect(() => extract(`bad-around-${id}`, (text) => text.replace('@cckAround trigger', tag))).toThrow(problem);
  });
});

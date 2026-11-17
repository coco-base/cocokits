import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractReactApiDocs } from './extract';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, `${name}.txt`), 'utf8');
const area = scratchArea('api-docs-react-methods');

const TSCONFIG = {
  compilerOptions: {
    jsx: 'react-jsx',
    strict: true,
    types: [],
    noEmit: true,
    paths: {},
    exactOptionalPropertyTypes: true,
  },
  include: ['**/*.ts', '**/*.tsx'],
};

function extract(name: string, thing = fixture('thing.ts')): ApiDocJson[] {
  const { project, tsConfig } = area.create(
    name,
    { 'src/thing/thing.ts': thing, 'src/thing/index.ts': fixture('index.ts') },
    TSCONFIG,
  );
  return extractReactApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractReactApiDocs methods', () => {
  it('reads the methods the element type of the ref prop declares, and lists no ref prop', () => {
    const thing = fixture('thing.ts')
      .replace('import type { ButtonHTMLAttributes,', 'import type { Ref, ButtonHTMLAttributes,')
      .replace(
        '/** Props of the {@link Thing}.',
        `/** The element with its methods. */
export interface ThingElement extends HTMLButtonElement {
  /**
   * Moves the focus to the thing.
   *
   * @cckSemantic thing.focus
   */
  focus(options?: FocusOptions): void;
  /**
   * Clears the facts of the thing.
   *
   * @cckSemantic thing.reset
   */
  reset(): void;
}

/** Props of the {@link Thing}.`,
      )
      .replace(
        '  /** The content of the thing. */',
        `  /**
   * The ref of the thing.
   *
   * @cckSemantic none
   */
  readonly ref?: Ref<ThingElement> | undefined;
  /** The content of the thing. */`,
      );
    const part = extract('methods', thing)[0]?.parts[0];
    expect(part?.methods.map((method) => [method.name, method.semanticId, method.description])).toEqual([
      ['focus', 'thing.focus', 'Moves the focus to the thing.'],
      ['reset', 'thing.reset', 'Clears the facts of the thing.'],
    ]);
    expect(part?.methods.every((method) => !method.required)).toBe(true);
    expect(part?.props.map((prop) => prop.name)).not.toContain('ref');
  });

  it('lists no method for a ref of a plain DOM element', () => {
    expect(extract('no-methods')[0]?.parts[0]?.methods).toEqual([]);
  });
});

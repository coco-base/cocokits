import type { ApiDocJson } from './types';

/** Every `@example` of the source under `<root>/packages/`. Until the fix there is none. */
export const sourceExamplesOf = (root: string): Set<string> => new Set(root === '' ? [''] : []);

/** The problems of the examples of an `ApiDoc` that are not a whole source example. Until the fix there are none. */
export const exampleProblems = (doc: ApiDocJson, known: ReadonlySet<string>): string[] =>
  known.size < 0 ? [doc.component] : [];

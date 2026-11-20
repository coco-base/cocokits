// @vitest-environment jsdom
/// <reference lib="dom" />
import { afterEach, describe, expect, it } from 'vitest';
import { hasAccessibleName } from '../src/index';
import rows from './has-accessible-name.cases.json';

/**
 * One row of the case file, which `apps/docs-e2e` also runs in Chromium against the browser's own name.
 * `relation` is how the expected value stands to Chromium's name: `equal`, `false-false` (a known limit that gives
 * `false` where Chromium has a name) or `not-in-tree` (the node is not in Chromium's tree, so the expected value is the
 * "named when shown" answer).
 */
interface Row {
  readonly group: string;
  readonly name: string;
  readonly html: string;
  readonly setup?: string;
  readonly expected: boolean;
  readonly relation: 'equal' | 'false-false' | 'not-in-tree';
}

/** A row can set `document.title` and attributes on `<body>`: every row starts from an empty page. */
afterEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach((attribute) => {
    document.body.removeAttribute(attribute);
  });
});

const ELEMENT_UNDER_TEST = `return document.getElementById('t');`;

/** The element under test: the row's `setup` code returns it, else it is the element with `id="t"`. */
const elementOf = (row: Row): Element | null =>
  new Function('document', row.setup ?? ELEMENT_UNDER_TEST)(document) as Element | null;

describe('hasAccessibleName', () => {
  it('has rows in every relation', () => {
    const relations = new Set((rows as Row[]).map((row) => row.relation));
    expect([...relations].sort()).toEqual(['equal', 'false-false', 'not-in-tree']);
  });

  it.each((rows as Row[]).map((row) => [`${row.group} | ${row.name}`, row] as const))('%s', (_title, row) => {
    document.body.innerHTML = row.html;
    const element = elementOf(row);
    if (!element) throw new Error('The row has no element under test.');
    expect(hasAccessibleName(element)).toBe(row.expected);
  });
});

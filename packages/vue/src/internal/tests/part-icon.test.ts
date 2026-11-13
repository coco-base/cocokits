// @vitest-environment node
import { createCommentVNode, createTextVNode, Fragment, h, type VNode } from 'vue';
import { describe, expect, it } from 'vitest';
import { isEmptyContent } from '../part-icon';

const fragment = (...children: VNode[]): VNode => h(Fragment, null, children);

describe('isEmptyContent (what counts as no content)', () => {
  const rows: readonly [string, readonly unknown[] | undefined, boolean][] = [
    ['no slot', undefined, true],
    ['an empty slot', [], true],
    ['a comment', [createCommentVNode('v-if')], true],
    ['an empty text', [createTextVNode('')], true],
    ['white space text', [createTextVNode(' \n\t ')], true],
    ['a fragment of comments and white space', [fragment(createCommentVNode('a'), createTextVNode('  '))], true],
    ['an empty fragment', [fragment()], true],
    ['text with a character', [createTextVNode(' x ')], false],
    ['an element', [h('b')], false],
    ['an element after a comment', [createCommentVNode('a'), h('i')], false],
    ['an element inside a fragment', [fragment(h('b'))], false],
    ['a component', [h({ render: () => null })], false],
  ];
  it.each(rows)('%s', (_name, nodes, empty) => {
    expect(isEmptyContent(nodes)).toBe(empty);
  });
});

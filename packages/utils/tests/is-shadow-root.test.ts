// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { isShadowRoot } from '../src/index';

describe('isShadowRoot', () => {
  it.each([
    { name: 'a shadow root', make: () => document.createElement('div').attachShadow({ mode: 'open' }), expected: true },
    { name: 'a document fragment', make: () => document.createDocumentFragment(), expected: false },
    { name: 'an element', make: () => document.createElement('div'), expected: false },
    { name: 'the document', make: () => document, expected: false },
    { name: 'null', make: () => null, expected: false },
  ])('is $expected for $name', ({ make, expected }) => {
    expect(isShadowRoot(make())).toBe(expected);
  });
});

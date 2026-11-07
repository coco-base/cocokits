// @vitest-environment jsdom
/// <reference lib="dom" />
import { afterEach, describe, expect, it } from 'vitest';
import { hasAccessibleName, hasChoiceControlName } from '../src/index';

afterEach(() => {
  document.body.replaceChildren();
});

const mount = (html: string): HTMLInputElement => {
  document.body.innerHTML = html;
  const input = document.querySelector('input');
  if (!input) throw new Error('No input.');
  return input;
};

describe('hasAccessibleName', () => {
  it.each([
    ['nothing', '<input>', false],
    ['a label for', '<label for="a">Name</label><input id="a">', true],
    ['a wrapping label', '<label>Name <input></label>', true],
    ['aria-label', '<input aria-label="Name">', true],
    ['aria-labelledby', '<input aria-labelledby="x">', true],
    ['title', '<input title="Name">', true],
    ['a label for another control', '<label for="b">Name</label><input id="a">', false],
  ])('%s', (_name, html, expected) => {
    expect(hasAccessibleName(mount(html))).toBe(expected);
  });
});

describe('hasChoiceControlName', () => {
  const check = (html: string, ignoreFirstChild = false): boolean => {
    document.body.innerHTML = html;
    const input = document.querySelector('input');
    const label = document.querySelector('label.own');
    if (!input || !label) throw new Error('No control.');
    return hasChoiceControlName(input, label, ignoreFirstChild ? [label.firstChild] : []);
  };

  it.each([
    ['an empty own label', '<input id="a"><label class="own" for="a"></label>', false],
    ['content in the own label', '<input id="a"><label class="own" for="a">Name</label>', true],
    ['another label', '<label for="a">Outside</label><input id="a"><label class="own" for="a"></label>', true],
    ['aria-label', '<input id="a" aria-label="Name"><label class="own" for="a"></label>', true],
    ['aria-labelledby', '<input id="a" aria-labelledby="x"><label class="own" for="a"></label>', true],
    ['title', '<input id="a" title="Name"><label class="own" for="a"></label>', true],
  ])('%s', (_name, html, expected) => {
    expect(check(html)).toBe(expected);
  });

  it('ignores the nodes that are not the author content', () => {
    expect(check('<input id="a"><label class="own" for="a"><span></span></label>', true)).toBe(false);
    expect(check('<input id="a"><label class="own" for="a"><span></span>Name</label>', true)).toBe(true);
  });
});

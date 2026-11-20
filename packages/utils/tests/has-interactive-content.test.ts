// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { hasInteractiveContent } from '../src/index';

function element(markup: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = markup;
  return host;
}

describe('hasInteractiveContent', () => {
  it.each([
    ['a link', '<a href="#x">x</a>'],
    ['a button', '<span><button>x</button></span>'],
    ['an input', '<input type="checkbox" />'],
    ['a select', '<select></select>'],
    ['a textarea', '<textarea></textarea>'],
    ['a tabindex', '<span tabindex="0">x</span>'],
    ['an editable element', '<span contenteditable="true">x</span>'],
    ['a summary', '<details><summary>x</summary></details>'],
  ])('finds %s', (_name, markup) => {
    expect(hasInteractiveContent(element(markup))).toBe(true);
  });

  it.each([
    ['text', 'Cake'],
    ['an icon and a title', '<svg aria-hidden="true"></svg><b>Cake</b><span>Sweet</span>'],
    ['a link with no href', '<a>x</a>'],
    ['a hidden input', '<input type="hidden" />'],
    ['a non-editable element', '<span contenteditable="false">x</span>'],
  ])('does not find %s', (_name, markup) => {
    expect(hasInteractiveContent(element(markup))).toBe(false);
  });

  it('does not look at the element itself', () => {
    const button = document.createElement('button');
    expect(hasInteractiveContent(button)).toBe(false);
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { sortByDomOrderOf } from '../src/index';
import { must } from './queries';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('sortByDomOrderOf', () => {
  it('orders items by the document position of their elements', () => {
    document.body.innerHTML = '<p id="a"></p><div><p id="b"></p></div><p id="c"></p>';
    const item = (id: string): { id: string; element: Element } => ({ id, element: must(document.getElementById(id)) });
    const items = [item('c'), item('a'), item('b')];
    expect(sortByDomOrderOf(items, (entry) => entry.element).map((entry) => entry.id)).toEqual(['a', 'b', 'c']);
    expect(items.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);
  });

  it('keeps items whose element is not in the page after the others, in the given order', () => {
    document.body.innerHTML = '<p id="a"></p>';
    const items = [
      { element: document.createElement('i') },
      { element: must(document.getElementById('a')) },
      { element: document.createElement('b') },
    ];
    expect(sortByDomOrderOf(items, (entry) => entry.element)).toEqual([items[1], items[0], items[2]]);
  });
});

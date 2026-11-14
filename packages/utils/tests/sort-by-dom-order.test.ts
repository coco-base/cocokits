// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { sortByDomOrder } from '../src/index';

afterEach(() => {
  document.body.innerHTML = '';
});

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element;
}

function build(): { a: HTMLElement; b: HTMLElement; c: HTMLElement; d: HTMLElement; e: HTMLElement } {
  document.body.innerHTML = '<div id="a"><span id="b"></span><span id="c"><i id="d"></i></span></div><p id="e"></p>';
  return { a: byId('a'), b: byId('b'), c: byId('c'), d: byId('d'), e: byId('e') };
}

describe('sortByDomOrder', () => {
  it('sorts elements into document order', () => {
    const { a, b, c, d, e } = build();
    expect(sortByDomOrder([e, d, b, a, c])).toEqual([a, b, c, d, e]);
  });

  it('returns a new array and leaves the input untouched', () => {
    const { a, b } = build();
    const input = [b, a];
    const result = sortByDomOrder(input);
    expect(result).not.toBe(input);
    expect(input).toEqual([b, a]);
  });

  it.each([
    { name: 'empty', count: 0 },
    { name: 'one element', count: 1 },
  ])('handles $name', ({ count }) => {
    const { a } = build();
    expect(sortByDomOrder(count ? [a] : [])).toEqual(count ? [a] : []);
  });

  it('keeps the order of a duplicated element', () => {
    const { a, b } = build();
    expect(sortByDomOrder([b, a, b])).toEqual([a, b, b]);
  });

  it('puts an element of another tree after the rendered ones', () => {
    const { a } = build();
    const loose = document.createElement('div');
    expect(sortByDomOrder([loose, a])).toEqual([a, loose]);
  });

  describe('rendered order', () => {
    function host(markup: string, id: string, shadow: string): HTMLElement {
      document.body.insertAdjacentHTML('beforeend', markup);
      const element = byId(id);
      element.attachShadow({ mode: 'open' }).innerHTML = shadow;
      return element;
    }
    function inShadow(root: HTMLElement, id: string): HTMLElement {
      const found = root.shadowRoot?.getElementById(id);
      if (!found) throw new Error(`Missing #${id} in the shadow root`);
      return found;
    }
    function permutations<T>(items: readonly T[]): T[][] {
      if (items.length <= 1) return [[...items]];
      return items.flatMap((item, index) =>
        permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
      );
    }

    it('places the content of an open shadow tree at its host', () => {
      const h = host(
        '<div id="before"></div><div id="h"></div><div id="after"></div>',
        'h',
        '<b id="s1"></b><b id="s2"></b>',
      );
      const [s1, s2] = [inShadow(h, 's1'), inShadow(h, 's2')];
      expect(sortByDomOrder([byId('after'), s2, s1, byId('before'), h])).toEqual([
        byId('before'),
        h,
        s1,
        s2,
        byId('after'),
      ]);
    });

    it('places slotted elements at their slot and unassigned light children last', () => {
      const h = host(
        '<div id="h"><i id="l1" slot="x"></i><i id="stray" slot="none"></i><i id="l2" slot="y"></i></div><p id="p"></p>',
        'h',
        '<u id="top"></u><slot name="y"></slot><slot name="x"></slot>',
      );
      const top = inShadow(h, 'top');
      expect(sortByDomOrder([byId('p'), byId('l1'), byId('stray'), byId('l2'), top, h])).toEqual([
        h,
        top,
        byId('l2'),
        byId('l1'),
        byId('p'),
        byId('stray'),
      ]);
    });

    it('puts detached and other-document elements last in the given order', () => {
      const { a, b } = build();
      const loose = document.createElement('div');
      const foreign = document.implementation.createHTMLDocument('x').body;
      expect(sortByDomOrder([a, foreign, b, loose])).toEqual([a, b, foreign, loose]);
    });

    it('takes the primary document from the first connected element', () => {
      const { a, b } = build();
      const foreign = document.implementation.createHTMLDocument('x');
      const other = foreign.body.appendChild(foreign.createElement('div'));
      expect(sortByDomOrder([b, other, a])).toEqual([a, b, other]);
    });

    it('returns the same order for every input permutation of rendered elements', () => {
      const h = host(
        '<div id="h"><i id="l1" slot="x"></i></div><p id="p"></p>',
        'h',
        '<u id="u"></u><slot name="x"></slot>',
      );
      const expected = [h, inShadow(h, 'u'), byId('l1'), byId('p')];
      for (const order of permutations(expected)) expect(sortByDomOrder(order)).toEqual(expected);
    });

    it('keeps the input order of unrendered elements, on their own', () => {
      build();
      const [x, y, z] = [document.createElement('i'), document.createElement('i'), document.createElement('i')];
      for (const order of permutations([x, y, z])) expect(sortByDomOrder(order)).toEqual(order);
    });
  });
});

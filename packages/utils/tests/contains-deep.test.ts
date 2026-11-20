// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { containsDeep } from '../src/index';

afterEach(() => {
  document.body.innerHTML = '';
});

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element;
}

describe('containsDeep', () => {
  it('finds itself, a child and a deep descendant', () => {
    document.body.innerHTML = '<div id="a"><p><span id="b"></span></p></div>';
    const a = byId('a');
    const b = byId('b');
    expect(containsDeep(a, a)).toBe(true);
    expect(containsDeep(a, b)).toBe(true);
    expect(containsDeep(b, a)).toBe(false);
  });

  it('crosses a shadow root', () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = byId('host');
    const inner = document.createElement('button');
    host.attachShadow({ mode: 'open' }).append(inner);
    expect(containsDeep(host, inner)).toBe(true);
    expect(containsDeep(document.body, inner)).toBe(true);
  });

  it.each([{ name: 'null' }, { name: 'a detached node' }])('is false for $name', ({ name }) => {
    document.body.innerHTML = '<div id="a"></div>';
    const a = byId('a');
    expect(containsDeep(a, name === 'null' ? null : document.createElement('i'))).toBe(false);
  });
});

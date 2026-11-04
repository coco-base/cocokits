// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { focusFirst, getTabbables } from '../index';
import { mount } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

const ids = (elements: HTMLElement[]): string[] => elements.map((element) => element.id);

describe('getTabbables', () => {
  it('returns the reachable elements in DOM order', () => {
    const { host } = mount(
      '<a id="a" href="#">a</a><button id="b">b</button><input id="c"><div id="d" tabindex="0"></div><p>text</p>',
    );
    expect(ids(getTabbables(host))).toEqual(['a', 'b', 'c', 'd']);
  });

  it.each([
    { name: 'disabled', markup: '<button id="x" disabled>x</button>' },
    { name: 'disabled fieldset', markup: '<fieldset disabled><input id="x"></fieldset>' },
    { name: 'tabindex -1', markup: '<div id="x" tabindex="-1"></div>' },
    { name: 'hidden attribute', markup: '<div hidden><button id="x">x</button></div>' },
    { name: 'display none', markup: '<div style="display:none"><button id="x">x</button></div>' },
    { name: 'visibility hidden', markup: '<button id="x" style="visibility:hidden">x</button>' },
    { name: 'inert', markup: '<div inert><button id="x">x</button></div>' },
    { name: 'hidden input', markup: '<input id="x" type="hidden">' },
    { name: 'link without href', markup: '<a id="x">x</a>' },
  ])('skips $name', ({ markup }) => {
    const { host } = mount(`${markup}<button id="ok">ok</button>`);
    expect(ids(getTabbables(host))).toEqual(['ok']);
  });

  it('enters an open shadow root', () => {
    const { host, byId } = mount('<div id="h"></div><button id="after">after</button>');
    const root = byId('h').attachShadow({ mode: 'open' });
    root.innerHTML = '<button id="inside">inside</button>';
    expect(ids(getTabbables(host))).toEqual(['inside', 'after']);
  });

  it('does not include the container itself', () => {
    const { byId } = mount('<button id="self"><span></span></button>');
    expect(getTabbables(byId('self'))).toEqual([]);
  });
});

describe('focusFirst', () => {
  it('focuses the first tabbable', () => {
    const { byId } = mount('<div id="c" tabindex="-1"><button id="a">a</button><button id="b">b</button></div>');
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('a'));
  });

  it('focuses the container when nothing inside is tabbable', () => {
    const { byId } = mount('<div id="c" tabindex="-1"><p>text</p></div>');
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('c'));
  });
});

describe('focusFirst with autofocus', () => {
  it('prefers the autofocus element over an earlier tabbable', () => {
    const { byId } = mount(
      '<div id="c" tabindex="-1"><button id="a">a</button><button id="b" autofocus>b</button></div>',
    );
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('b'));
  });

  it('takes an autofocus element that is focusable but not tabbable', () => {
    const { byId } = mount(
      '<div id="c" tabindex="-1"><button id="a">a</button><div id="b" tabindex="-1" autofocus></div></div>',
    );
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('b'));
  });

  it('skips a disabled, inert or hidden autofocus element', () => {
    const { byId } = mount(
      '<div id="c" tabindex="-1"><button id="a">a</button><button autofocus disabled>x</button>' +
        '<div inert><button autofocus>y</button></div><div style="display: none"><button autofocus>z</button></div></div>',
    );
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('a'));
  });
});

describe('focusFirst with autofocus in a shadow root', () => {
  it('finds a later [autofocus] element inside an open shadow root', () => {
    const { host, byId } = mount('<div id="c" tabindex="-1"><button id="a">a</button><div id="h"></div></div>');
    const shadow = byId('h').attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button id="s1">s1</button><button id="s2" autofocus>s2</button>';
    focusFirst(byId('c'));
    expect(shadow.activeElement?.id).toBe('s2');
    expect(host.isConnected).toBe(true);
  });

  it('skips an autofocus element in an inert or display: none part of a shadow root', () => {
    const { byId } = mount('<div id="c" tabindex="-1"><button id="a">a</button><div id="h"></div></div>');
    const shadow = byId('h').attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<div inert><button autofocus>x</button></div><div style="display: none"><button autofocus>y</button></div>';
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('a'));
  });
});

describe('getTabbables in rendered order', () => {
  it('lists a slotted element at its slot, once', () => {
    const { byId } = mount(
      '<div id="c"><div id="h"><button id="l2" slot="y">l2</button><button id="l1" slot="x">l1</button></div></div>',
    );
    byId('h').attachShadow({ mode: 'open' }).innerHTML =
      '<button id="s1">s1</button><slot name="x"></slot><button id="s2">s2</button><slot name="y"></slot>';
    expect(ids(getTabbables(byId('c')))).toEqual(['s1', 'l1', 's2', 'l2']);
  });

  it('skips a light child that no slot takes', () => {
    const { byId } = mount('<div id="c"><div id="h"><button id="stray">x</button></div></div>');
    byId('h').attachShadow({ mode: 'open' }).innerHTML = '<button id="s1">s1</button>';
    expect(ids(getTabbables(byId('c')))).toEqual(['s1']);
  });

  it('treats a slot filled with text only as filled: its fallback is not drawn', () => {
    const { byId } = mount('<div id="c"><div id="h">just text</div></div>');
    byId('h').attachShadow({ mode: 'open' }).innerHTML = '<slot><button id="fallback">f</button></slot>';
    expect(ids(getTabbables(byId('c')))).toEqual([]);
  });

  it('lists the fallback of a slot with nothing assigned', () => {
    const { byId } = mount('<div id="c"><div id="h"></div></div>');
    byId('h').attachShadow({ mode: 'open' }).innerHTML = '<slot><button id="fallback">f</button></slot>';
    expect(ids(getTabbables(byId('c')))).toEqual(['fallback']);
  });

  it('skips an inert slotted element', () => {
    const { byId } = mount('<div id="c"><div id="h"><button id="l" inert>l</button></div></div>');
    byId('h').attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>';
    expect(ids(getTabbables(byId('c')))).toEqual([]);
  });
});

describe('getTabbables radio groups', () => {
  it('makes the checked radio the only stop of its group', () => {
    const { host } = mount(
      '<input id="r1" type="radio" name="g"><input id="r2" type="radio" name="g" checked><input id="r3" type="radio" name="g">',
    );
    expect(ids(getTabbables(host))).toEqual(['r2']);
  });

  it('keeps the enabled peers of a checked radio that is disabled', () => {
    const { host } = mount(
      '<input id="r1" type="radio" name="g" tabindex="0"><input id="r2" type="radio" name="g" checked disabled>' +
        '<input id="r3" type="radio" name="g" tabindex="-1">',
    );
    expect(ids(getTabbables(host))).toEqual(['r1']);
  });

  it('moves initial focus to the enabled radio when the checked one is disabled', () => {
    const { byId } = mount(
      '<div id="c" tabindex="-1"><input id="r1" type="radio" name="g"><input id="r2" type="radio" name="g" checked disabled></div>',
    );
    focusFirst(byId('c'));
    expect(document.activeElement).toBe(byId('r1'));
  });

  it('keeps every radio of a group with none checked', () => {
    const { host } = mount('<input id="r1" type="radio" name="g"><input id="r2" type="radio" name="g">');
    expect(ids(getTabbables(host))).toEqual(['r1', 'r2']);
  });

  it('treats a radio without a name as its own group', () => {
    const { host } = mount('<input id="r1" type="radio"><input id="r2" type="radio" checked>');
    expect(ids(getTabbables(host))).toEqual(['r1', 'r2']);
  });

  it('splits groups by form owner', () => {
    const { host } = mount(
      '<form><input id="a1" type="radio" name="g" checked><input id="a2" type="radio" name="g"></form>' +
        '<form><input id="b1" type="radio" name="g"><input id="b2" type="radio" name="g"></form>' +
        '<input id="c1" type="radio" name="g"><input id="c2" type="radio" name="g">',
    );
    expect(ids(getTabbables(host))).toEqual(['a1', 'b1', 'b2', 'c1', 'c2']);
  });

  it('splits groups by tree', () => {
    const { host, byId } = mount('<input id="o" type="radio" name="g" checked><div id="h"></div>');
    byId('h').attachShadow({ mode: 'open' }).innerHTML =
      '<input id="s1" type="radio" name="g"><input id="s2" type="radio" name="g">';
    expect(ids(getTabbables(host))).toEqual(['o', 's1', 's2']);
  });
});

describe('getTabbables and <details>', () => {
  it('yields only the first summary of a closed details', () => {
    const { host } = mount(
      '<details><summary id="s1">one</summary><summary id="s2">two</summary><button id="b">b</button></details>',
    );
    expect(ids(getTabbables(host))).toEqual(['s1']);
  });

  it('yields the content of an open details, but never a second summary', () => {
    const { host } = mount(
      '<details open><summary id="s1">one</summary><summary id="s2">two</summary><button id="b">b</button></details>',
    );
    expect(ids(getTabbables(host))).toEqual(['s1', 'b']);
  });
});

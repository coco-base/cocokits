// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { makeOutsideInert } from '../index';
import { mount } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

const MARKUP =
  '<main id="page"><button id="page-button">page</button></main>' +
  '<div id="host"><div id="content"><button id="in">in</button></div><div id="other">other</div></div>' +
  '<aside id="aside">aside</aside>';

const inertIds = (): string[] =>
  Array.from(document.querySelectorAll('[inert]'))
    .map((element) => element.id)
    .sort();

describe('makeOutsideInert', () => {
  it('makes the siblings of every ancestor inert and leaves the path alone', () => {
    const { byId } = mount(MARKUP);
    makeOutsideInert(() => [byId('content')]);
    expect(inertIds()).toEqual(['aside', 'other', 'page']);
    expect(document.body.hasAttribute('inert')).toBe(false);
    expect(document.head.hasAttribute('inert')).toBe(false);
  });

  it('keeps several inside elements usable, such as a trigger and a content', () => {
    const { byId } = mount(MARKUP);
    makeOutsideInert(() => [byId('content'), byId('page-button'), null]);
    expect(byId('page-button').hasAttribute('inert')).toBe(false);
    expect(byId('page').hasAttribute('inert')).toBe(false);
    expect(byId('other').hasAttribute('inert')).toBe(true);
  });

  it('leaves an element added afterwards usable', () => {
    const { byId } = mount(MARKUP);
    makeOutsideInert(() => [byId('content')]);
    const later = document.createElement('div');
    document.body.append(later);
    const sibling = document.createElement('div');
    byId('host').append(sibling);
    expect(later.hasAttribute('inert')).toBe(false);
    expect(sibling.hasAttribute('inert')).toBe(false);
  });

  it('restores exactly what it changed, keeping an inert the page already had', () => {
    const { byId } = mount(MARKUP);
    byId('aside').setAttribute('inert', '');
    const release = makeOutsideInert(() => [byId('content')]);
    release();
    expect(inertIds()).toEqual(['aside']);
    release();
    expect(inertIds()).toEqual(['aside']);
  });

  it('keeps an element inert until every call that set it is released', () => {
    const { byId } = mount(MARKUP);
    const first = makeOutsideInert(() => [byId('content')]);
    const second = makeOutsideInert(() => [byId('content')]);
    first();
    expect(byId('other').hasAttribute('inert')).toBe(true);
    second();
    expect(byId('other').hasAttribute('inert')).toBe(false);
  });

  it('works for content inside an open modal dialog', () => {
    const { byId } = mount(
      '<div id="page">page</div><dialog id="dlg"><div id="c"><button>x</button></div><p id="p">p</p></dialog>',
    );
    byId('dlg').setAttribute('open', '');
    makeOutsideInert(() => [byId('c')]);
    expect(inertIds()).toEqual(['p', 'page']);
  });

  it('crosses a shadow root to the siblings around its host', () => {
    const { byId } = mount('<div id="before">b</div><div id="shadow-host"></div><div id="after">a</div>');
    const root = byId('shadow-host').attachShadow({ mode: 'open' });
    root.innerHTML = '<div id="sc"><button>in</button></div><p id="sp">p</p>';
    makeOutsideInert(() => [root.getElementById('sc')]);
    expect(root.getElementById('sp')?.hasAttribute('inert')).toBe(true);
    expect(inertIds()).toEqual(['after', 'before']);
  });

  it('does nothing without inside elements', () => {
    mount(MARKUP);
    makeOutsideInert(() => [null])();
    expect(inertIds()).toEqual([]);
  });
});

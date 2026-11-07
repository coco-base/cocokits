// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { connectFocusGuards } from '../index';
import { mount } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

const MARKUP =
  '<button id="before">before</button><button id="t">t</button><button id="after">after</button>' +
  '<div id="c" role="dialog" tabindex="-1"><span id="g1" tabindex="0"></span>' +
  '<button id="in1">one</button><button id="in2">two</button><span id="g2" tabindex="0"></span></div>';

function setup(loop: boolean) {
  const view = mount(MARKUP);
  const guards = connectFocusGuards({
    getContent: () => view.byId('c'),
    getTrigger: () => view.byId('t'),
    getGuards: () => [view.byId('g1'), view.byId('g2')],
    loop,
  });
  return { ...view, guards };
}

describe('connectFocusGuards with loop', () => {
  it('wraps Tab from the end guard to the first tabbable of the content', () => {
    const { byId } = setup(true);
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('in1'));
  });

  it('wraps Shift+Tab from the start guard to the last tabbable of the content', () => {
    const { byId } = setup(true);
    byId('g1').focus();
    expect(document.activeElement).toBe(byId('in2'));
  });

  it('focuses the content itself when it holds no tabbable element', () => {
    const view = mount(
      '<div id="c" tabindex="-1"><span id="g1" tabindex="0"></span><span id="g2" tabindex="0"></span></div>',
    );
    connectFocusGuards({
      getContent: () => view.byId('c'),
      getTrigger: () => null,
      getGuards: () => [view.byId('g1'), view.byId('g2')],
      loop: true,
    });
    view.byId('g2').focus();
    expect(document.activeElement).toBe(view.byId('c'));
  });

  it('never sends focus to the trigger or past the content', () => {
    const { byId } = setup(true);
    byId('g2').focus();
    byId('g1').focus();
    expect(document.activeElement).not.toBe(byId('t'));
    expect(document.activeElement).not.toBe(byId('after'));
  });

  it('keeps the forwarding without loop', () => {
    const { byId } = setup(false);
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('after'));
  });

  it('stops after destroy', () => {
    const { byId, guards } = setup(true);
    guards.destroy();
    byId('g2').focus();
    expect(document.activeElement).toBe(byId('g2'));
  });
});

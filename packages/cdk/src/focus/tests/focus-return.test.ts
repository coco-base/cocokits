// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { captureFocusReturn } from '../index';
import { mount } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('captureFocusReturn', () => {
  it('focuses the trigger when focus is inside the content', () => {
    const { byId } = mount('<button id="t">t</button><div id="c"><button id="in">in</button></div>');
    const back = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('c') });
    byId('in').focus();
    back.restore();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('focuses the trigger when focus was lost to the body', () => {
    const { byId } = mount('<button id="t">t</button>');
    const back = captureFocusReturn({ getTrigger: () => byId('t') });
    back.restore();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('leaves focus on another focusable outside the overlay', () => {
    const { byId } = mount('<button id="t">t</button><button id="other">other</button><div id="c"></div>');
    const back = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('c') });
    byId('other').focus();
    back.restore();
    expect(document.activeElement).toBe(byId('other'));
  });

  it('falls back to the body of the document when the trigger is gone', () => {
    const { byId } = mount('<button id="t">t</button><button id="stray">stray</button>');
    const trigger = byId('t');
    let current: HTMLElement | null = trigger;
    const back = captureFocusReturn({ getTrigger: () => current });
    trigger.remove();
    current = null;
    expect(() => {
      back.restore();
    }).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('does nothing after destroy', () => {
    const { byId } = mount('<button id="t">t</button><div id="c"><button id="in">in</button></div>');
    const back = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('c') });
    byId('in').focus();
    back.destroy();
    back.restore();
    expect(document.activeElement).toBe(byId('in'));
  });
});

describe("captureFocusReturn with restoreTo: 'opener'", () => {
  it('captures in the document it is given before anything is attached, here an iframe document', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const inner = frame.contentDocument;
    if (!inner) throw new Error('Expected the frame document.');
    inner.body.innerHTML = '<button id="opener">o</button>';
    const opener = inner.getElementById('opener');
    opener?.focus();
    document.body.focus();
    const back = captureFocusReturn({ getTrigger: () => null, restoreTo: 'opener', document: inner });
    inner.body.focus();
    (inner.activeElement as HTMLElement | null)?.blur();
    back.restore();
    expect(inner.activeElement).toBe(opener);
  });

  it('captures nothing without a document, a trigger or a content', () => {
    const { byId } = mount('<button id="x">x</button>');
    byId('x').focus();
    const back = captureFocusReturn({ getTrigger: () => null, restoreTo: 'opener' });
    expect(() => {
      back.restore();
    }).not.toThrow();
    expect(document.activeElement).toBe(byId('x'));
  });

  it('returns focus to the element that had it when called, not to the trigger', () => {
    const { byId } = mount(
      '<button id="opener">o</button><button id="t">t</button><div id="c"><button id="in">in</button></div>',
    );
    byId('opener').focus();
    const back = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('c'), restoreTo: 'opener' });
    byId('in').focus();
    back.restore();
    expect(document.activeElement).toBe(byId('opener'));
  });

  it('works with no trigger at all', () => {
    const { byId } = mount('<button id="opener">o</button><div id="c"><button id="in">in</button></div>');
    byId('opener').focus();
    const back = captureFocusReturn({ getTrigger: () => null, getContent: () => byId('c'), restoreTo: 'opener' });
    byId('in').focus();
    back.restore();
    expect(document.activeElement).toBe(byId('opener'));
  });

  it('goes to the body of the document when the opener is gone', () => {
    const { byId } = mount(
      '<button id="opener">o</button><button id="stray">s</button><div id="c"><button id="in">in</button></div>',
    );
    byId('opener').focus();
    const back = captureFocusReturn({ getTrigger: () => null, getContent: () => byId('c'), restoreTo: 'opener' });
    byId('opener').remove();
    byId('in').focus();
    back.restore();
    expect(document.activeElement).toBe(document.body);
  });

  it('uses the trigger when nothing had focus (a button click does not focus in Safari)', () => {
    const { byId } = mount('<button id="t">t</button>');
    const back = captureFocusReturn({ getTrigger: () => byId('t'), restoreTo: 'opener' });
    back.restore();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('is the body when nothing had focus and there is no trigger', () => {
    const { byId } = mount('<div id="c"><button id="in">in</button></div>');
    const back = captureFocusReturn({ getTrigger: () => null, getContent: () => byId('c'), restoreTo: 'opener' });
    byId('in').focus();
    back.restore();
    expect(document.activeElement).toBe(document.body);
  });

  it('still leaves focus alone when the user moved it to another focusable outside', () => {
    const { byId } = mount('<button id="opener">o</button><button id="other">x</button><div id="c"></div>');
    byId('opener').focus();
    const back = captureFocusReturn({ getTrigger: () => null, getContent: () => byId('c'), restoreTo: 'opener' });
    byId('other').focus();
    back.restore();
    expect(document.activeElement).toBe(byId('other'));
  });
});

describe('captureFocusReturn when an overlay opened another one', () => {
  /** A menu whose item opens a dialog with no trigger, then closes and takes the item away. */
  function menuOpensDialog(): { menuTrigger: HTMLElement; dialogBack: ReturnType<typeof captureFocusReturn> } {
    const { byId } = mount(
      '<button id="t">t</button><div id="menu"><button id="item">item</button></div><div id="dialog"><button id="close">close</button></div>',
    );
    const menuTrigger = byId('t');
    const menu = byId('menu');
    const dialog = byId('dialog');
    const menuBack = captureFocusReturn({ getTrigger: () => menuTrigger, getContent: () => menu });
    byId('item').focus();
    const dialogBack = captureFocusReturn({ getTrigger: () => null, getContent: () => dialog, restoreTo: 'opener' });
    byId('close').focus();
    menu.remove();
    // The focus is in the dialog, so the menu leaves it there.
    menuBack.restore();
    expect(document.activeElement).toBe(byId('close'));
    return { menuTrigger, dialogBack };
  }

  it('returns to the trigger of the menu whose item opened the dialog, when the item is gone', () => {
    const { menuTrigger, dialogBack } = menuOpensDialog();
    dialogBack.restore();
    expect(document.activeElement).toBe(menuTrigger);
  });

  it('falls back to the body when the trigger of the menu is gone too', () => {
    const { menuTrigger, dialogBack } = menuOpensDialog();
    menuTrigger.remove();
    dialogBack.restore();
    expect(document.activeElement).toBe(document.body);
  });

  it('returns to the menu trigger also when the focus was already on the body when the dialog opened', () => {
    const { byId } = mount(
      '<button id="t">t</button><div id="menu"></div><div id="dialog"><button id="close">x</button></div>',
    );
    const menuBack = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('menu') });
    const dialogBack = captureFocusReturn({
      getTrigger: () => null,
      getContent: () => byId('dialog'),
      restoreTo: 'opener',
    });
    byId('close').focus();
    menuBack.restore();
    dialogBack.restore();
    expect(document.activeElement).toBe(byId('t'));
  });

  it('gives no trigger to an overlay that was open before it', () => {
    const { byId } = mount(
      '<button id="opener">o</button><div id="dialog"><button id="in">in</button></div><button id="t">t</button><div id="pop"></div>',
    );
    byId('opener').focus();
    const dialogBack = captureFocusReturn({
      getTrigger: () => null,
      getContent: () => byId('dialog'),
      restoreTo: 'opener',
    });
    const popoverBack = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('pop') });
    byId('in').focus();
    popoverBack.restore();
    byId('opener').remove();
    dialogBack.restore();
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps a destroyed return out: it gets no stand-in and its content is not read again', () => {
    const { byId } = mount(
      '<button id="t">t</button><div id="menu"></div><div id="dialog"><button id="close">x</button></div>',
    );
    const menuBack = captureFocusReturn({ getTrigger: () => byId('t'), getContent: () => byId('menu') });
    let reads = 0;
    const dialogBack = captureFocusReturn({
      getTrigger: () => null,
      getContent: () => {
        reads += 1;
        return byId('dialog');
      },
      restoreTo: 'opener',
    });
    byId('close').focus();
    dialogBack.destroy();
    reads = 0;
    menuBack.restore();
    expect(reads).toBe(0);
    expect(document.activeElement).toBe(byId('close'));
  });
});

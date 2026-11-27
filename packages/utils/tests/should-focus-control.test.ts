// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { shouldFocusControl } from '../src/index';

afterEach(() => {
  document.body.replaceChildren();
  document.getSelection()?.removeAllRanges();
});

const FIELD = `
  <div id="wrapper">
    <span id="prefix">$ <svg id="icon"></svg></span>
    <textarea id="control"></textarea>
    <span id="suffix">kg</span>
    <button id="button"><span id="inner">x</span></button>
    <a id="link" href="#"><i id="linkInner"></i></a>
    <a id="anchor">no href</a>
    <label id="label">L</label>
    <details><summary id="summary">S</summary></details>
    <span id="tab" tabindex="0">t</span>
    <span id="editable" contenteditable="true">e</span>
    <span id="notEditable" contenteditable="false">n</span>
    <input id="other"><select id="select"></select><textarea id="area"></textarea>
  </div>`;

const WRAPPED = (inner: string, outerOpen = '', outerClose = ''): string =>
  `${outerOpen}<div id="wrapper"><span id="prefix">$</span>${inner}</div>${outerClose}`;

const byId = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No #${id}.`);
  return element;
};

const mount = (html = FIELD): HTMLElement => {
  document.body.innerHTML = html;
  return byId('control');
};

/** Dispatches a click on `target` and returns the decision made while it bubbles through the wrapper. */
const decide = (
  control: HTMLElement | null,
  target: Node,
  { prevent = false }: { prevent?: boolean } = {},
): boolean => {
  let result: boolean | undefined;
  byId('wrapper').addEventListener(
    'click',
    (event) => {
      if (prevent) event.preventDefault();
      result = shouldFocusControl(event, control);
    },
    { once: true },
  );
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  if (result === undefined) throw new Error('The event did not reach the wrapper.');
  return result;
};

const select = (node: Node): void => {
  const range = document.createRange();
  range.selectNodeContents(node);
  document.getSelection()?.addRange(range);
};

describe('shouldFocusControl', () => {
  describe('returns true', () => {
    it.each([
      ['the wrapper', () => byId('wrapper')],
      ['a prefix element', () => byId('prefix')],
      ['a prefix text node', () => byId('prefix').firstChild as Node],
      ['a suffix text node', () => byId('suffix').firstChild as Node],
      ['an icon in the prefix', () => byId('icon')],
      ['an a without href', () => byId('anchor')],
      ['an element with contenteditable="false"', () => byId('notEditable')],
    ])('for a press on %s', (_name, target) => {
      const control = mount();
      expect(decide(control, target())).toBe(true);
    });

    it('for a read-only control', () => {
      const control = mount() as HTMLTextAreaElement;
      control.readOnly = true;
      expect(decide(control, byId('prefix'))).toBe(true);
    });

    it('for a collapsed selection', () => {
      const control = mount();
      const range = document.createRange();
      range.setStart(byId('prefix').firstChild as Node, 1);
      range.collapse(true);
      document.getSelection()?.addRange(range);
      expect(decide(control, byId('prefix'))).toBe(true);
    });

    it('for a selection inside the control', () => {
      const control = mount();
      control.textContent = 'hello';
      select(control);
      expect(decide(control, byId('prefix'))).toBe(true);
    });
  });

  describe('returns false', () => {
    it('for a press on the control', () => {
      const control = mount();
      expect(decide(control, control)).toBe(false);
    });

    it('for a press inside the control', () => {
      const control = mount('<div id="wrapper"><div id="control"><b id="in">x</b></div></div>');
      expect(decide(control, byId('in'))).toBe(false);
    });

    it.each([
      ['a button', 'button'],
      ['inside a button', 'inner'],
      ['an a[href]', 'link'],
      ['inside an a[href]', 'linkInner'],
      ['a label', 'label'],
      ['a summary', 'summary'],
      ['a [tabindex]', 'tab'],
      ['a [contenteditable]', 'editable'],
      ['an input', 'other'],
      ['a select', 'select'],
      ['another textarea', 'area'],
    ])('for a press on %s', (_name, id) => {
      const control = mount();
      expect(decide(control, byId(id))).toBe(false);
    });

    it('for the text node of a button', () => {
      const control = mount();
      expect(decide(control, byId('inner').firstChild as Node)).toBe(false);
    });

    it('for a defaultPrevented event', () => {
      const control = mount();
      expect(decide(control, byId('prefix'), { prevent: true })).toBe(false);
    });

    it('when there is no control', () => {
      mount();
      expect(decide(null, byId('prefix'))).toBe(false);
    });

    it('for a disabled control', () => {
      const control = mount() as HTMLTextAreaElement;
      control.disabled = true;
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for a control in a disabled fieldset', () => {
      const control = mount(WRAPPED('<textarea id="control"></textarea>', '<fieldset disabled>', '</fieldset>'));
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for a hidden control', () => {
      const control = mount();
      control.hidden = true;
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for a control inside a hidden ancestor', () => {
      const control = mount(WRAPPED('<textarea id="control"></textarea>', '<div hidden>', '</div>'));
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for an inert control', () => {
      const control = mount();
      control.setAttribute('inert', '');
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for a control inside an inert ancestor', () => {
      const control = mount(WRAPPED('<textarea id="control"></textarea>', '<div inert>', '</div>'));
      expect(decide(control, byId('prefix'))).toBe(false);
    });

    it('for a non-collapsed selection outside the control', () => {
      const control = mount();
      select(byId('prefix'));
      expect(decide(control, byId('suffix'))).toBe(false);
    });
  });
});

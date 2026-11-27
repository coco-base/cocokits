// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFormParticipation } from '../index';
import { isDisabledByFieldset, watchFieldsetDisabled } from '../fieldset-disabled';
import { must, nextMicrotask } from './helpers';

let host: HTMLElement;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  host.remove();
});

const query = (selector: string): Element => must(host.querySelector(selector));
const queryInput = (selector: string): HTMLInputElement => must(host.querySelector<HTMLInputElement>(selector));

describe('isDisabledByFieldset', () => {
  it.each([
    { name: 'no fieldset', markup: '<input />', expected: false },
    { name: 'an enabled fieldset', markup: '<fieldset><input /></fieldset>', expected: false },
    { name: 'a disabled fieldset', markup: '<fieldset disabled><input /></fieldset>', expected: true },
    {
      name: 'a nested group in a disabled fieldset',
      markup: '<fieldset disabled><div><input /></div></fieldset>',
      expected: true,
    },
    {
      name: 'the first legend of a disabled fieldset',
      markup: '<fieldset disabled><legend><input /></legend></fieldset>',
      expected: false,
    },
    {
      name: 'the second legend of a disabled fieldset',
      markup: '<fieldset disabled><legend>a</legend><legend><input /></legend></fieldset>',
      expected: true,
    },
    {
      name: 'the first legend of an inner fieldset inside a disabled outer one',
      markup: '<fieldset disabled><fieldset disabled><legend><input /></legend></fieldset></fieldset>',
      expected: true,
    },
    { name: 'its own disabled attribute only', markup: '<input disabled />', expected: false },
  ])('is $expected for $name', ({ markup, expected }) => {
    host.innerHTML = markup;
    expect(isDisabledByFieldset(query('input'))).toBe(expected);
  });

  it('is false for an element without a parent', () => {
    expect(isDisabledByFieldset(document.createElement('input'))).toBe(false);
  });
});

describe('watchFieldsetDisabled', () => {
  it('reports once after creation and then on change only', async () => {
    host.innerHTML = '<fieldset><input /></fieldset>';
    const onChange = vi.fn();
    const stop = watchFieldsetDisabled(query('input'), onChange);
    expect(onChange.mock.calls).toEqual([[false]]);
    query('fieldset').setAttribute('disabled', '');
    await nextMicrotask();
    expect(onChange.mock.calls).toEqual([[false], [true]]);
    query('fieldset').setAttribute('disabled', 'disabled');
    await nextMicrotask();
    expect(onChange).toHaveBeenCalledTimes(2);
    query('fieldset').removeAttribute('disabled');
    await nextMicrotask();
    expect(onChange.mock.calls).toEqual([[false], [true], [false]]);
    stop();
  });

  it('reports true at once under a disabled fieldset and false in its first legend', () => {
    host.innerHTML = '<fieldset disabled><legend><input id="in" /></legend><input id="out" /></fieldset>';
    const inLegend = vi.fn();
    const outside = vi.fn();
    watchFieldsetDisabled(query('#in'), inLegend)();
    watchFieldsetDisabled(query('#out'), outside)();
    expect(inLegend.mock.calls).toEqual([[false]]);
    expect(outside.mock.calls).toEqual([[true]]);
  });

  it('ignores a disabled change of an element that is not a fieldset', async () => {
    host.innerHTML = '<fieldset><input /><button></button></fieldset>';
    const onChange = vi.fn();
    const stop = watchFieldsetDisabled(query('input'), onChange);
    query('button').setAttribute('disabled', '');
    await nextMicrotask();
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
  });

  it('shares one observer per document and disconnects with the last subscriber', () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const observe = vi.spyOn(MutationObserver.prototype, 'observe');
    host.innerHTML = '<input id="a" /><input id="b" />';
    const stopA = watchFieldsetDisabled(query('#a'), () => undefined);
    const stopB = watchFieldsetDisabled(query('#b'), () => undefined);
    expect(observe).toHaveBeenCalledTimes(1);
    stopA();
    stopA();
    expect(disconnect).not.toHaveBeenCalled();
    stopB();
    expect(disconnect).toHaveBeenCalledTimes(1);
    const stopC = watchFieldsetDisabled(query('#a'), () => undefined);
    expect(observe).toHaveBeenCalledTimes(2);
    stopC();
    disconnect.mockRestore();
    observe.mockRestore();
  });

  it('stops reporting after cleanup', async () => {
    host.innerHTML = '<fieldset><input /></fieldset>';
    const onChange = vi.fn();
    watchFieldsetDisabled(query('input'), onChange)();
    query('fieldset').setAttribute('disabled', '');
    await nextMicrotask();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('createFormParticipation: fieldset', () => {
  it('forwards the fieldset answer and follows later changes', async () => {
    host.innerHTML = '<form><fieldset disabled><legend><input id="l" /></legend><input id="o" /></fieldset></form>';
    const legend = vi.fn();
    const outside = vi.fn();
    const a = createFormParticipation({
      element: queryInput('#l'),
      getValue: () => '',
      onFieldsetDisabledChange: legend,
    });
    const b = createFormParticipation({
      element: queryInput('#o'),
      getValue: () => '',
      onFieldsetDisabledChange: outside,
    });
    expect(legend.mock.calls).toEqual([[false]]);
    expect(outside.mock.calls).toEqual([[true]]);
    query('fieldset').removeAttribute('disabled');
    await nextMicrotask();
    expect(outside.mock.calls).toEqual([[true], [false]]);
    expect(legend).toHaveBeenCalledTimes(1);
    a.destroy();
    b.destroy();
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chipListMeta } from '@cocokits/machines/chip-list';
import { mountView } from '../../internal/tests/mount-helpers';
import { ChipList } from '../index';
import { bound, box, chipTexts, list, listRoot, removeButtons } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Fires Enter and tells whether the browser would still run its default. */
const enter = (init: KeyboardEventInit = {}, legacyKeyCode?: number): boolean => {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init });
  if (legacyKeyCode !== undefined) Object.defineProperty(event, 'keyCode', { value: legacyKeyCode });
  return box().dispatchEvent(event);
};

describe('ChipList anatomy', () => {
  it('renders the root, one removable chip per value and the text box after them', () => {
    mountView(() => list({ defaultValue: ['Pizza', 'Cake'], placeholder: 'Add' }));
    expect(listRoot().tagName).toBe('DIV');
    expect(chipTexts()).toEqual(['Pizza', 'Cake']);
    expect(removeButtons()).toHaveLength(2);
    expect(listRoot().lastElementChild).toBe(box());
    expect(box().className).toBe('cck-chip-list__input');
    expect(box().type).toBe('text');
    expect(box().getAttribute('autocomplete')).toBe('off');
    expect(box().placeholder).toBe('Add');
    expect(box().hasAttribute('name')).toBe(false);
  });

  it('sends the naming attributes to the text box and every other attribute to the root', () => {
    mountView(() =>
      h(ChipList, {
        'aria-label': 'Toppings',
        'aria-describedby': 'x',
        id: 'mine',
        class: 'extra',
        'data-testid': 'root',
        title: 'T',
      }),
    );
    expect(box().getAttribute('aria-label')).toBe('Toppings');
    expect(box().getAttribute('aria-describedby')).toBe('x');
    expect(box().id).toBe('mine');
    expect(listRoot().getAttribute('data-testid')).toBe('root');
    expect(listRoot().getAttribute('title')).toBe('T');
    expect(listRoot().classList.contains('extra')).toBe(true);
    expect(listRoot().hasAttribute('aria-label')).toBe(false);
    expect(listRoot().hasAttribute('id')).toBe(false);
  });

  it('renders the element of as, merges onto the child with asChild, and exposes the elements', () => {
    const handle = ref<{ element: Element | null; inputElement: HTMLInputElement | null } | null>(null);
    mountView(() => h(ChipList, { ref: handle, 'aria-label': 'T', as: 'section' }));
    expect(listRoot().tagName).toBe('SECTION');
    expect(handle.value?.element).toBe(listRoot());
    expect(handle.value?.inputElement).toBe(box());
    cleanup();
    mountView(() => h(ChipList, { 'aria-label': 'T', asChild: true, defaultValue: ['A'] }, () => h('ul')));
    expect(listRoot().tagName).toBe('UL');
    expect(chipTexts()).toEqual(['A']);
  });

  it('emits only data attributes that the meta lists', () => {
    mountView(() =>
      list({ defaultValue: ['A'], required: true, invalid: true, touched: true, dirty: true, hidden: true }),
    );
    const names = [...listRoot().attributes].map((attribute) => attribute.name).filter((n) => n.startsWith('data-'));
    for (const name of names) expect(chipListMeta.dataAttrs.root, name).toContain(name);
    expect(names).toEqual(expect.arrayContaining(['data-required', 'data-invalid', 'data-filled']));
    expect(listRoot().hasAttribute('hidden')).toBe(true);
  });

  it('logs one development error when nothing names the text box', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mountView(() => h(ChipList));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toMatch(/^CocoKits: a Chip list has no accessible name/);
  });
});

describe('ChipList adding', () => {
  it('adds the trimmed text on Enter, clears the box and prevents the default', async () => {
    const onUpdate = vi.fn();
    const parent = bound(['Pizza'], onUpdate);
    mountView(() => list(parent.props()));
    await userEvent.type(box(), '  Salad ');
    expect(enter()).toBe(false);
    await nextTick();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['Pizza', 'Salad']);
    expect(chipTexts()).toEqual(['Pizza', 'Salad']);
    expect(box().value).toBe('');
  });

  it('clears the box for a duplicate and reports nothing', async () => {
    const onUpdate = vi.fn();
    mountView(() => list(bound(['Pizza'], onUpdate).props()));
    await userEvent.type(box(), 'Pizza');
    expect(enter()).toBe(false);
    await nextTick();
    expect(box().value).toBe('');
    expect(onUpdate).not.toHaveBeenCalled();
    expect(chipTexts()).toEqual(['Pizza']);
  });

  it('keeps the default of Enter when the box is empty or only white space', async () => {
    const onUpdate = vi.fn();
    mountView(() => list({ 'onUpdate:modelValue': onUpdate }));
    expect(enter()).toBe(true);
    await userEvent.type(box(), '   ');
    expect(enter()).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it.each<[string, KeyboardEventInit, number?]>([
    ['composing', { isComposing: true }],
    ['key code 229', {}, 229],
    ['Shift', { shiftKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
  ])('adds nothing on Enter while %s', async (_name, init, keyCode) => {
    const onUpdate = vi.fn();
    mountView(() => list({ 'onUpdate:modelValue': onUpdate }));
    await userEvent.type(box(), 'Salad');
    expect(enter(init, keyCode)).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(box().value).toBe('Salad');
  });

  it('adds on blur only with addOnBlur', async () => {
    const onUpdate = vi.fn();
    mountView(() => h('div', [list({ 'onUpdate:modelValue': onUpdate }), h('button', 'next')]));
    await userEvent.type(box(), 'Salad');
    await userEvent.tab();
    expect(onUpdate).not.toHaveBeenCalled();
    cleanup();
    mountView(() => h('div', [list({ addOnBlur: true, 'onUpdate:modelValue': onUpdate }), h('button', 'next')]));
    await userEvent.type(box(), ' Salad ');
    await userEvent.tab();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['Salad']);
    expect(box().value).toBe('');
  });

  it('adds and removes nothing while read-only or disabled', async () => {
    const onUpdate = vi.fn();
    mountView(() => list({ defaultValue: ['A'], readonly: true, 'onUpdate:modelValue': onUpdate }));
    expect(box().readOnly).toBe(true);
    await userEvent.type(box(), 'Salad');
    enter();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(removeButtons()[0]?.disabled).toBe(true);
    cleanup();
    mountView(() => list({ defaultValue: ['A'], disabled: true, 'onUpdate:modelValue': onUpdate }));
    expect(box().disabled).toBe(true);
    expect(removeButtons()[0]?.disabled).toBe(true);
    await userEvent.click(removeButtons()[0]);
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

describe('ChipList value', () => {
  it('works uncontrolled, starting from defaultValue', async () => {
    mountView(() => list({ defaultValue: ['A'] }));
    await userEvent.type(box(), 'B{Enter}');
    expect(chipTexts()).toEqual(['A', 'B']);
  });

  it('works controlled: a parent that ignores the change keeps its value', async () => {
    const onUpdate = vi.fn();
    mountView(() => list({ modelValue: ['A'], 'onUpdate:modelValue': onUpdate }));
    await userEvent.type(box(), 'B{Enter}');
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['A', 'B']);
    expect(chipTexts()).toEqual(['A']);
  });

  it('never emits when the parent sets the value, and shows it as given without a warning', async () => {
    const onUpdate = vi.fn();
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const values = ref(['A']);
    mountView(() => list({ modelValue: values.value, 'onUpdate:modelValue': onUpdate }));
    values.value = ['Pizza', 'Pizza', ''];
    await nextTick();
    expect(chipTexts()).toEqual(['Pizza', 'Pizza', '']);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('removes the value at the position of the button, also with equal values', async () => {
    const onUpdate = vi.fn();
    const parent = bound(['Pizza', 'Pizza', 'Cake'], onUpdate);
    mountView(() => list(parent.props()));
    await userEvent.click(removeButtons()[1]);
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(['Pizza', 'Cake']);
    expect(chipTexts()).toEqual(['Pizza', 'Cake']);
    expect(document.activeElement).toBe(box());
  });
});

/** The focus table of the spec: one row per start state and change. */
describe('ChipList focus when a remove button goes away', () => {
  const start = ['A', 'B', 'C'];

  it.each<[string, number, string]>([
    ['the first chip, Enter', 0, '{Enter}'],
    ['a middle chip, Enter', 1, '{Enter}'],
    ['the last chip, Enter', 2, '{Enter}'],
    ['a middle chip, Space', 1, ' '],
  ])('moves to the text box when the button of %s is activated', async (_name, index, key) => {
    mountView(() => list(bound([...start]).props()));
    removeButtons()[index]?.focus();
    await userEvent.keyboard(key);
    expect(document.activeElement).toBe(box());
  });

  it('moves to the text box when the button is clicked', async () => {
    mountView(() => list(bound([...start]).props()));
    await userEvent.click(removeButtons()[0]);
    expect(document.activeElement).toBe(box());
  });

  it.each<[string, number, string[], 'input' | 'stays']>([
    ['the chip at its position is gone (last)', 2, ['A', 'B'], 'input'],
    ['the chip at its position is gone (middle)', 1, ['A'], 'input'],
    ['the chip at its position is gone (first)', 0, [], 'input'],
    ['its position stays', 0, ['X', 'Y', 'Z'], 'stays'],
    ['its position stays in a shorter list', 1, ['X', 'Y'], 'stays'],
  ])('with the parent setting the value, when %s', async (_name, index, next, expected) => {
    const values = ref([...start]);
    mountView(() => list({ modelValue: values.value }));
    removeButtons()[index]?.focus();
    values.value = next;
    await nextTick();
    expect(document.activeElement).toBe(expected === 'input' ? box() : removeButtons()[index]);
  });

  it('moves to the text box when the list turns read-only', async () => {
    const readonly = ref(false);
    mountView(() => list({ defaultValue: start, readonly: readonly.value }));
    removeButtons()[1]?.focus();
    readonly.value = true;
    await nextTick();
    expect(document.activeElement).toBe(box());
  });

  it('keeps the focus in the text box through an add', async () => {
    mountView(() => list({ defaultValue: ['A'] }));
    box().focus();
    await userEvent.keyboard('B{Enter}');
    expect(document.activeElement).toBe(box());
  });

  it('does not move the focus when the whole list turns disabled', async () => {
    const disabled = ref(false);
    mountView(() => list({ defaultValue: start, disabled: disabled.value }));
    removeButtons()[1]?.focus();
    disabled.value = true;
    await nextTick();
    expect(document.activeElement).not.toBe(box());
  });
});

describe('ChipList facts and Tab order', () => {
  it('shows filled, focused, touched and dirty on the root, not on the text box', async () => {
    mountView(() => h('div', [list(), h('button', 'next')]));
    expect(listRoot().hasAttribute('data-filled')).toBe(false);
    await userEvent.type(box(), 'a');
    expect(listRoot().hasAttribute('data-filled')).toBe(true);
    expect(listRoot().hasAttribute('data-focused')).toBe(true);
    expect(box().hasAttribute('data-focused')).toBe(false);
    await userEvent.keyboard('{Enter}');
    expect(listRoot().hasAttribute('data-dirty')).toBe(true);
    await userEvent.tab();
    expect(listRoot().hasAttribute('data-touched')).toBe(true);
    expect(listRoot().hasAttribute('data-focused')).toBe(false);
  });

  it('reaches each remove button, then the text box, and stays focused and untouched meanwhile', async () => {
    mountView(() => list({ defaultValue: ['A', 'B'] }));
    await userEvent.tab();
    expect(document.activeElement).toBe(removeButtons()[0]);
    await userEvent.tab();
    expect(document.activeElement).toBe(removeButtons()[1]);
    await userEvent.tab();
    expect(document.activeElement).toBe(box());
    expect(listRoot().hasAttribute('data-touched')).toBe(false);
    expect(listRoot().hasAttribute('data-focused')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { formFieldIds } from '../../form-field';
import {
  addChipListValue,
  chipListAnatomy,
  chipListMeta,
  getChipListProps,
  isChipListAddKey,
  removeChipListValue,
} from '../index';

const dataKeys = (props: object): string[] =>
  Object.entries(props)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);

describe('chipListAnatomy', () => {
  it('names the classes of the Anatomy table', () => {
    expect(chipListAnatomy.classes).toEqual({ root: 'cck-chip-list', input: 'cck-chip-list__input' });
  });
});

describe('addChipListValue', () => {
  it('appends the trimmed text at the end', () => {
    expect(addChipListValue(['a'], '  b  ')).toEqual(['a', 'b']);
  });

  it.each([
    ['empty text', ['a'], ''],
    ['blank text', ['a'], '   '],
    ['a duplicate', ['a', 'b'], 'a'],
    ['a duplicate after trimming', ['a'], ' a '],
  ])('changes nothing for %s', (_name, value, text) => {
    expect(addChipListValue(value, text)).toBe(value);
  });

  it('never mutates the list', () => {
    const value = Object.freeze(['a']);
    expect(addChipListValue(value, 'b')).not.toBe(value);
    expect(value).toEqual(['a']);
  });

  it('adds to a list the parent gave with duplicates and keeps them', () => {
    expect(addChipListValue(['x', 'x'], 'y')).toEqual(['x', 'x', 'y']);
  });
});

describe('removeChipListValue', () => {
  it('removes only the value at that index', () => {
    expect(removeChipListValue(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });

  it('removes the second of two equal values and keeps the first', () => {
    const result = removeChipListValue(['Pizza', 'Pizza'], 1);
    expect(result).toEqual(['Pizza']);
    expect(removeChipListValue(['Pizza', 'Pizza'], 0)).toEqual(['Pizza']);
  });

  it.each([-1, 2, 1.5, Number.NaN])('changes nothing for index %s', (index) => {
    const value = ['a', 'b'];
    expect(removeChipListValue(value, index)).toBe(value);
  });

  it('never mutates the list', () => {
    const value = Object.freeze(['a', 'b']);
    removeChipListValue(value, 0);
    expect(value).toEqual(['a', 'b']);
  });
});

describe('isChipListAddKey', () => {
  const press = (over: object = {}) => ({
    key: 'Enter',
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    isComposing: false,
    ...over,
  });

  it('is true for a plain Enter', () => {
    expect(isChipListAddKey(press())).toBe(true);
  });

  it.each([
    ['another key', { key: 'a' }],
    ['Space', { key: ' ' }],
    ['Shift', { shiftKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
    ['composition', { isComposing: true }],
    ['the composition key code 229', { keyCode: 229 }],
  ])('is false with %s', (_name, over) => {
    expect(isChipListAddKey(press(over))).toBe(false);
  });
});

describe('getChipListProps', () => {
  it('renders the classes and the input defaults of an empty list', () => {
    const { root, input, formInput, chipDisabled } = getChipListProps({ value: [] });
    expect(root.class).toBe('cck-chip-list');
    expect(dataKeys(root)).toEqual([]);
    expect(input).toMatchObject({ class: 'cck-chip-list__input', type: 'text', autocomplete: 'off' });
    expect(input.placeholder).toBeUndefined();
    expect(formInput.values).toEqual([]);
    expect(chipDisabled).toBe(false);
  });

  it('renders the placeholder on the input, none for an empty string', () => {
    expect(getChipListProps({ value: [], placeholder: 'Add' }).input.placeholder).toBe('Add');
    expect(getChipListProps({ value: [], placeholder: '' }).input.placeholder).toBeUndefined();
  });

  it('renders exactly the ten facts of the meta on the root, and not on the input', () => {
    const { root, input } = getChipListProps({
      value: ['a'],
      disabled: true,
      readOnly: true,
      required: true,
      invalid: true,
      pending: true,
      touched: true,
      dirty: true,
      submitted: true,
      focused: true,
      hidden: true,
    });
    expect([...dataKeys(root)].sort()).toEqual([...chipListMeta.dataAttrs.root].sort());
    expect(root.hidden).toBe(true);
    expect(dataKeys(input)).toEqual([]);
  });

  it('puts the control id, aria-describedby and the gated aria-invalid on the input', () => {
    const ids = formFieldIds('f', { hints: [undefined], errors: [undefined] });
    const field = { ids };
    const quiet = getChipListProps({ value: [], invalid: true, ariaDescribedBy: 'own' }, field).input;
    expect(quiet.id).toBe(ids.control);
    expect(quiet['aria-describedby']).toBe(['own', ...(ids.hints ?? []), ...(ids.errors ?? [])].join(' '));
    expect(quiet['aria-invalid']).toBeUndefined();
    const shown = getChipListProps({ value: [], invalid: true, touched: true }, field).input;
    expect(shown['aria-invalid']).toBe('true');
  });

  it('lets an author id win over the control id', () => {
    const field = { ids: formFieldIds('f') };
    expect(getChipListProps({ value: [], id: 'mine' }, field).input.id).toBe('mine');
  });

  it('renders native disabled and readonly, and aria-required instead of native required', () => {
    const input = getChipListProps({ value: [], disabled: true, readOnly: true, required: true }).input;
    expect(input).toMatchObject({ disabled: true, readonly: true, 'aria-required': 'true' });
    expect(input).not.toHaveProperty('required');
    expect(getChipListProps({ value: [] }).input['aria-required']).toBeUndefined();
  });

  it('renders no name on the input', () => {
    const { input, formInput } = getChipListProps({ value: ['a'], name: 'tags' });
    expect(input).not.toHaveProperty('name');
    expect(formInput.name).toBe('tags');
  });

  it('defaults the hidden input name from the control path', () => {
    expect(getChipListProps({ value: [], controlPath: ['form', 'tags'] }).formInput.name).toBe('form.tags');
  });

  it('gives the hidden inputs the name, disabled, required and one string per value', () => {
    const { formInput } = getChipListProps({ value: ['a', 'b'], name: 'tags', disabled: true, required: true });
    expect(formInput).toEqual({ name: 'tags', disabled: true, required: true, values: ['a', 'b'] });
  });

  it('makes the field facts reach the list by OR', () => {
    const field = { state: { disabled: true, readOnly: true, required: true, invalid: true } };
    const { root, control, input } = getChipListProps({ value: [] }, field);
    expect(root).toMatchObject({
      'data-disabled': '',
      'data-readonly': '',
      'data-required': '',
      'data-invalid': '',
    });
    expect(control).toMatchObject({ disabled: true, readOnly: true, required: true, invalid: true });
    expect(input).toMatchObject({ disabled: true, readonly: true });
  });

  it.each([
    ['a value', ['a'], '', true],
    ['draft text', [], 'x', true],
    ['both', ['a'], 'x', true],
    ['neither', [], '', false],
  ])('sets filled for %s', (_name, value, draft, filled) => {
    const { root, control } = getChipListProps({ value, draft });
    expect(root['data-filled']).toBe(filled ? '' : undefined);
    expect(control.filled).toBe(filled);
  });

  it.each([
    ['own disabled', { disabled: true }, true],
    ['own read-only', { readOnly: true }, true],
    ['neither', {}, false],
  ])('disables the chips for %s', (_name, facts, expected) => {
    expect(getChipListProps({ value: ['a'], ...facts }).chipDisabled).toBe(expected);
  });

  it('disables the chips when the field is read-only', () => {
    expect(getChipListProps({ value: ['a'] }, { state: { readOnly: true } }).chipDisabled).toBe(true);
  });
});

describe('chipListMeta', () => {
  it('declares no roles and the default elements', () => {
    expect(chipListMeta.roles).toEqual({ root: null, input: null });
    expect(chipListMeta.defaultElements).toEqual({ root: 'div', input: 'input' });
    expect(chipListMeta.dataAttrs.input).toEqual([]);
    expect(chipListMeta.dataAttrs.root).toHaveLength(10);
  });

  it('has the keyboard rows of the spec', () => {
    expect(chipListMeta.keyboard.map((row) => `${row.key} | ${row.context}`)).toEqual([
      'Enter | text box with text',
      'Enter | text box without text',
      'Enter, Space | remove button',
      'Tab, Shift+Tab | chip list',
    ]);
  });

  it('states the form contract', () => {
    expect(chipListMeta.form).toMatch(/hidden input/);
  });
});

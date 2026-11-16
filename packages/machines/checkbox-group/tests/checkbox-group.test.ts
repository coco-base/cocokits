import { describe, expect, it } from 'vitest';
import { formFieldIds, getFormFieldLabelFor, type FormFieldControlContext } from '../../form-field';
import {
  CHECKBOX_GROUP_NAME_WARNING,
  checkboxGroupAnatomy,
  checkboxGroupMeta,
  getCheckboxGroupProps,
  toggleCheckboxGroupValue,
} from '../index';

const defined = (part: object): object =>
  Object.fromEntries(Object.entries(part).filter(([, value]) => value !== undefined));

const inField = (over: Partial<FormFieldControlContext> = {}): FormFieldControlContext => ({
  ids: formFieldIds('f', { hints: [undefined], errors: [undefined] }),
  hasLabel: true,
  ...over,
});

describe('checkboxGroupAnatomy', () => {
  it('names the class of the Anatomy table', () => {
    expect(checkboxGroupAnatomy.classes).toEqual({ root: 'cck-checkbox-group' });
  });
});

describe('getCheckboxGroupProps root', () => {
  it('is a div group with the vertical orientation by default and nothing else', () => {
    const { root } = getCheckboxGroupProps({});
    expect(defined(root)).toEqual({
      class: 'cck-checkbox-group',
      role: 'group',
      'data-orientation': 'vertical',
    });
  });

  it('renders the horizontal orientation and data-disabled, never "false"', () => {
    const { root } = getCheckboxGroupProps({ orientation: 'horizontal', disabled: true });
    expect(root['data-orientation']).toBe('horizontal');
    expect(root['data-disabled']).toBe('');
    expect(JSON.stringify(getCheckboxGroupProps({}))).not.toContain('"false"');
  });

  it('renders exactly the data attributes of the meta', () => {
    const { root } = getCheckboxGroupProps({ disabled: true });
    const keys = Object.keys(root).filter((key) => key.startsWith('data-'));
    expect(keys.sort()).toEqual([...checkboxGroupMeta.dataAttrs.root].sort());
  });

  it('declares the group role and the div element in the meta', () => {
    expect(checkboxGroupMeta.roles.root).toBe('group');
    expect(checkboxGroupMeta.defaultElements.root).toBe('div');
  });
});

describe('what the group gives each checkbox', () => {
  it.each([
    ['nothing', {}, {}],
    ['a name', { name: 'toppings' }, { name: 'toppings' }],
    ['disabled', { disabled: true }, { disabled: true }],
  ])('passes %s', (_name, state, expected) => {
    expect(defined(getCheckboxGroupProps(state).checkbox)).toEqual(expected);
  });

  it('passes the disabled state of the field too', () => {
    const parts = getCheckboxGroupProps({}, inField({ state: { disabled: true } }));
    expect(parts.checkbox.disabled).toBe(true);
    expect(parts.root['data-disabled']).toBe('');
  });
});

describe('naming (checkbox group inside and outside a FormField)', () => {
  const authorLabel = { ...formFieldIds('f'), label: 'mine' };
  it.each([
    ['alone, unnamed', {}, undefined, undefined, undefined, false],
    ['alone, aria-label', { ariaLabel: 'Toppings' }, undefined, 'Toppings', undefined, true],
    ['alone, aria-labelledby', { ariaLabelledBy: 'cap' }, undefined, undefined, 'cap', true],
    ['a field without a Label', {}, inField({ hasLabel: false }), undefined, undefined, false],
    ['a field with a Label', {}, inField(), undefined, 'f-label', true],
    ['a field with a Label and aria-label', { ariaLabel: 'Own' }, inField(), 'Own', undefined, true],
    ['a field with a Label and aria-labelledby', { ariaLabelledBy: 'cap' }, inField(), undefined, 'cap', true],
    ['a field whose Label has an author id', {}, inField({ ids: authorLabel }), undefined, 'mine', true],
  ])('%s', (_name, state, field, label, labelledBy, named) => {
    const parts = getCheckboxGroupProps(state, field);
    expect(parts.root['aria-label']).toBe(label);
    expect(parts.root['aria-labelledby']).toBe(labelledBy);
    expect(parts.named).toBe(named);
  });

  it('has a warning text for a group nothing names', () => {
    expect(CHECKBOX_GROUP_NAME_WARNING).toMatch(/no name/);
  });
});

describe('the group as the labelled element of a FormField', () => {
  it('takes the control id and the description ids of the field', () => {
    const { root } = getCheckboxGroupProps({}, inField());
    expect(root.id).toBe('f-control');
    expect(root['aria-describedby']).toBe('f-hint-1 f-error-1');
  });

  it('reports itself as a group, so the Label renders no `for`', () => {
    const { control } = getCheckboxGroupProps({ value: ['a'] }, inField());
    expect(control).toMatchObject({ id: 'f-control', group: true, filled: true });
    expect(getFormFieldLabelFor(control)).toBeUndefined();
  });

  it('reports the facts of the group: filled follows the value, required and invalid pass through', () => {
    expect(getCheckboxGroupProps({}).control.filled).toBe(false);
    expect(getCheckboxGroupProps({ value: [] }).control.filled).toBe(false);
    expect(getCheckboxGroupProps({ required: true, invalid: true, touched: true }).control).toMatchObject({
      required: true,
      invalid: true,
      touched: true,
    });
  });

  it('keeps the author id over the control id', () => {
    expect(getCheckboxGroupProps({ id: 'mine' }, inField()).root.id).toBe('mine');
  });
});

describe('toggleCheckboxGroupValue', () => {
  it.each([
    ['checks a new value at the end', ['a'], 'b', true, ['a', 'b']],
    ['unchecks a value', ['a', 'b', 'c'], 'b', false, ['a', 'c']],
  ])('%s', (_name, value, item, checked, expected) => {
    expect(toggleCheckboxGroupValue(value, item, checked)).toEqual(expected);
  });

  it.each([
    ['a checked value that is checked again', ['a'], 'a', true],
    ['an unchecked value that is unchecked again', ['a'], 'b', false],
  ])('returns the same list for %s', (_name, value, item, checked) => {
    expect(toggleCheckboxGroupValue(value, item, checked)).toBe(value);
  });

  it('never mutates the list', () => {
    const value = Object.freeze(['a']);
    toggleCheckboxGroupValue(value, 'b', true);
    expect(value).toEqual(['a']);
  });
});

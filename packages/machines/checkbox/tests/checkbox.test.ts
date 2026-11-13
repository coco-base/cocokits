import { describe, expect, it } from 'vitest';
import { formFieldIds } from '../../form-field';
import { checkboxAnatomy, checkboxMeta, getCheckboxProps } from '../index';

const ids = formFieldIds('terms', { hints: [undefined], errors: [undefined] });

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);
}

function defined(part: object): object {
  return Object.fromEntries(Object.entries(part).filter(([, value]) => value !== undefined));
}

describe('getCheckboxProps', () => {
  it('renders the part classes and an unchecked native checkbox for an empty state', () => {
    const parts = getCheckboxProps({});
    expect(checkboxAnatomy.classes).toMatchObject({
      root: 'cck-checkbox',
      wrapper: 'cck-checkbox__wrapper',
      inputWrapper: 'cck-checkbox__input-wrapper',
      input: 'cck-checkbox__input',
      backdrop: 'cck-checkbox__backdrop',
      background: 'cck-checkbox__background',
      label: 'cck-checkbox__label',
    });
    expect(defined(parts.root)).toEqual({ class: 'cck-checkbox' });
    expect(defined(parts.input)).toEqual({ class: 'cck-checkbox__input', type: 'checkbox', checked: false });
    expect(parts.wrapper).toEqual({ class: 'cck-checkbox__wrapper' });
    expect(parts.inputWrapper).toEqual({ class: 'cck-checkbox__input-wrapper' });
  });

  it('renders exactly the data attributes of the meta when every fact is true', () => {
    const { root } = getCheckboxProps({
      checked: true,
      indeterminate: true,
      disabled: true,
      readOnly: true,
      required: true,
      invalid: true,
      pending: true,
      touched: true,
      dirty: true,
      submitted: true,
      focused: true,
    });
    expect(dataKeys(root).sort()).toEqual([...checkboxMeta.dataAttrs.root].sort());
    expect(dataKeys(root)).not.toContain('data-filled');
  });

  it('renders no data attribute for a false fact, never the string "false"', () => {
    const parts = getCheckboxProps({});
    expect(dataKeys(parts.root)).toEqual([]);
    expect(JSON.stringify(parts)).not.toContain('"false"');
  });

  it('reads a nullish model as unchecked', () => {
    expect(getCheckboxProps({ checked: null }).input.checked).toBe(false);
    expect(getCheckboxProps({ checked: undefined }).root['data-checked']).toBeUndefined();
  });

  it('renders data-checked and the checked property from checked', () => {
    const { root, input } = getCheckboxProps({ checked: true });
    expect(root['data-checked']).toBe('');
    expect(input.checked).toBe(true);
  });

  it('renders data-indeterminate from the prop alone, independent of checked', () => {
    expect(getCheckboxProps({ indeterminate: true }).root['data-indeterminate']).toBe('');
    expect(getCheckboxProps({ indeterminate: true, checked: true }).root['data-indeterminate']).toBe('');
    expect(getCheckboxProps({ checked: true }).root['data-indeterminate']).toBeUndefined();
  });

  it('puts the control attributes on the input and none of them on the root', () => {
    const { root, input } = getCheckboxProps({
      id: 'x',
      name: 'accept',
      disabled: true,
      required: true,
      ariaDescribedBy: 'help',
    });
    expect(input).toMatchObject({
      id: 'x',
      name: 'accept',
      disabled: true,
      required: true,
      'aria-describedby': 'help',
    });
    for (const key of ['id', 'name', 'disabled', 'required', 'readonly', 'aria-invalid', 'aria-describedby']) {
      expect(root).not.toHaveProperty(key);
    }
  });

  it('renders aria-readonly instead of readonly, only while read-only', () => {
    expect(getCheckboxProps({ readOnly: true }).input).toMatchObject({ 'aria-readonly': 'true' });
    expect(getCheckboxProps({ readOnly: true }).input).not.toHaveProperty('readonly');
    expect(getCheckboxProps({ readOnly: true }).root['data-readonly']).toBe('');
    expect(getCheckboxProps({}).input['aria-readonly']).toBeUndefined();
    expect(getCheckboxProps({ readOnly: false }).input['aria-readonly']).toBeUndefined();
  });

  it('renders no aria-checked anywhere', () => {
    const parts = getCheckboxProps({ checked: true, indeterminate: true });
    expect(JSON.stringify(parts)).not.toContain('aria-checked');
  });

  it('gates aria-invalid on touched or submitted, while data-invalid stays raw', () => {
    expect(getCheckboxProps({ invalid: true }).input['aria-invalid']).toBeUndefined();
    expect(getCheckboxProps({ invalid: true }).root['data-invalid']).toBe('');
    expect(getCheckboxProps({ invalid: true, touched: true }).input['aria-invalid']).toBe('true');
    expect(getCheckboxProps({ invalid: true, submitted: true }).input['aria-invalid']).toBe('true');
    expect(getCheckboxProps({ touched: true }).input['aria-invalid']).toBeUndefined();
  });

  it('marks backdrop and background aria-hidden, and the containers and label not', () => {
    const parts = getCheckboxProps({});
    expect(parts.backdrop['aria-hidden']).toBe('true');
    expect(parts.background['aria-hidden']).toBe('true');
    for (const part of [parts.wrapper, parts.inputWrapper, parts.label]) {
      expect(part).not.toHaveProperty('aria-hidden');
    }
  });

  it('points the label at the input id', () => {
    const parts = getCheckboxProps({ id: 'own' });
    expect(parts.input.id).toBe('own');
    expect(parts.label.for).toBe('own');
    const inField = getCheckboxProps({}, { ids });
    expect(inField.input.id).toBe(ids.control);
    expect(inField.label.for).toBe(ids.control);
  });

  it('lets an author id win over the field control id', () => {
    expect(getCheckboxProps({ id: 'own' }, { ids }).label.for).toBe('own');
  });

  it('merges aria-describedby: the author ids first, then the hint and error ids', () => {
    expect(getCheckboxProps({ ariaDescribedBy: 'a' }, { ids }).input['aria-describedby']).toBe(
      'a terms-hint-1 terms-error-1',
    );
    expect(getCheckboxProps({}, { ids }).input['aria-describedby']).toBe('terms-hint-1 terms-error-1');
  });

  it('ORs the field facts into the input and the root', () => {
    const { root, input } = getCheckboxProps(
      {},
      { ids, state: { disabled: true, readOnly: true, required: true, invalid: true } },
    );
    expect(input).toMatchObject({ disabled: true, required: true, 'aria-readonly': 'true' });
    expect(root).toMatchObject({ 'data-disabled': '', 'data-readonly': '', 'data-required': '', 'data-invalid': '' });
  });

  it('defaults name from the bound control path', () => {
    expect(getCheckboxProps({ controlPath: ['prefs', 'email'] }).input.name).toBe('prefs.email');
    expect(getCheckboxProps({ name: 'own', controlPath: ['terms'] }).input.name).toBe('own');
  });

  it('reports the field control state with filled = checked and the effective id', () => {
    expect(getCheckboxProps({ checked: true }, { ids }).control).toMatchObject({ id: ids.control, filled: true });
    expect(getCheckboxProps({ checked: false }, { ids }).control.filled).toBe(false);
    expect(getCheckboxProps({ id: 'own', required: true }).control).toMatchObject({ id: 'own', required: true });
  });

  it('renders native hidden on the root', () => {
    expect(getCheckboxProps({ hidden: true }).root.hidden).toBe(true);
  });

  it('declares the meta: roles, default elements, apg and keyboard', () => {
    expect(checkboxMeta.roles.input).toBeNull();
    expect(checkboxMeta.defaultElements).toEqual({
      root: 'div',
      wrapper: 'span',
      inputWrapper: 'span',
      input: 'input',
      backdrop: 'span',
      background: 'span',
      label: 'label',
    });
    expect(checkboxMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/');
    expect(checkboxMeta.keyboard.map((row) => row.key)).toEqual(['Tab / Shift+Tab', 'Space']);
  });
});

describe('icon-holding part description', () => {
  it('says the background holds the theme tick icon while checked', () => {
    expect(checkboxAnatomy.parts.background.description).toMatch(/theme's tick icon while checked/);
  });
});

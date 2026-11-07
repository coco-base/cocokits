import { describe, expect, it } from 'vitest';
import { formFieldIds } from '../../form-field';
import { getTextareaProps, textareaAnatomy, textareaMeta } from '../index';

const ids = formFieldIds('msg');

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);
}

function defined(root: object): string[] {
  return Object.entries(root)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);
}

describe('getTextareaProps', () => {
  it('renders only the class for an empty textarea, and no type', () => {
    const { root } = getTextareaProps({});
    expect(textareaAnatomy.classes.root).toBe('cck-textarea');
    expect(defined(root)).toEqual(['class']);
    expect(root).not.toHaveProperty('type');
  });

  it('renders exactly the data attributes of the meta when every fact is true', () => {
    const { root } = getTextareaProps({
      value: 'a',
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
    expect(dataKeys(root).sort()).toEqual([...textareaMeta.dataAttrs.root].sort());
    expect(root).toMatchObject({ disabled: true, readonly: true, required: true });
  });

  it('renders no data attribute for a false fact', () => {
    expect(dataKeys(getTextareaProps({}).root)).toEqual([]);
  });

  it('is filled for any non-empty value and empty for null, undefined and an empty string', () => {
    expect(getTextareaProps({ value: 'a\nb' }).root['data-filled']).toBe('');
    for (const value of [null, undefined, ''] as const) {
      expect(getTextareaProps({ value }).root['data-filled']).toBeUndefined();
    }
  });

  it('takes the control id and the feedback id from the field, and lets an author id win', () => {
    expect(getTextareaProps({}, { ids }).root).toMatchObject({
      id: 'msg-control',
      'aria-describedby': 'msg-feedback',
    });
    const author = getTextareaProps({ id: 'mine', ariaDescribedBy: 'help' }, { ids });
    expect(author.root).toMatchObject({ id: 'mine', 'aria-describedby': 'help msg-feedback' });
    expect(author.control.id).toBe('mine');
  });

  it('has no generated id outside a field', () => {
    expect(getTextareaProps({}).root.id).toBeUndefined();
  });

  it('defaults the name from the control path', () => {
    expect(getTextareaProps({ controlPath: ['notes', 0, 'text'] }).root.name).toBe('notes.0.text');
    expect(getTextareaProps({ controlPath: ['notes'], name: 'own' }).root.name).toBe('own');
  });

  it('sets aria-invalid only while invalid and touched or submitted, never "false"', () => {
    expect(getTextareaProps({ invalid: true }).root['aria-invalid']).toBeUndefined();
    expect(getTextareaProps({ invalid: true, touched: true }).root['aria-invalid']).toBe('true');
    expect(getTextareaProps({ invalid: true, submitted: true }).root['aria-invalid']).toBe('true');
    expect(getTextareaProps({ touched: true }).root['aria-invalid']).toBeUndefined();
  });

  it('ORs the field facts with its own', () => {
    const { root, control } = getTextareaProps({ readOnly: true }, { state: { disabled: true, invalid: true } });
    expect(root).toMatchObject({ disabled: true, readonly: true });
    expect(control).toMatchObject({ disabled: true, readOnly: true, invalid: true });
  });

  it('declares a native textarea without a role', () => {
    expect(textareaMeta.roles.root).toBeNull();
    expect(textareaMeta.defaultElements).toEqual({ root: 'textarea' });
    expect(textareaMeta.keyboard.map((row) => row.key)).toEqual(['Tab / Shift+Tab', 'Text keys, IME', 'Enter']);
  });
});

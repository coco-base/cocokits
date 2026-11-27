import { describe, expect, it, vi } from 'vitest';
import { formFieldIds, getFormFieldLabelFor, type FormFieldControlContext } from '../../form-field';
import { getRadioGroupProps, type RadioGroupState } from '../index';

const base = (over: Partial<RadioGroupState> = {}): RadioGroupState => ({
  name: 'plan',
  items: [{ value: 'a' }, { value: 'b' }],
  mounted: true,
  ...over,
});

const inField = (over: Partial<FormFieldControlContext> = {}): FormFieldControlContext => ({
  ids: formFieldIds('f', { hints: [undefined], errors: [undefined] }),
  hasLabel: true,
  ...over,
});

describe('radio group outside a FormField', () => {
  it('renders the author id, name and description as given', () => {
    const { root } = getRadioGroupProps(
      base({ id: 'mine', ariaLabel: 'Plan', ariaLabelledBy: undefined, ariaDescribedBy: 'note' }),
      vi.fn(),
    );
    expect(root.id).toBe('mine');
    expect(root['aria-label']).toBe('Plan');
    expect(root['aria-labelledby']).toBeUndefined();
    expect(root['aria-describedby']).toBe('note');
  });

  it('renders no id, name or description when the author gave none', () => {
    const { root } = getRadioGroupProps(base(), vi.fn());
    expect(root.id).toBeUndefined();
    expect(root['aria-label']).toBeUndefined();
    expect(root['aria-labelledby']).toBeUndefined();
    expect(root['aria-describedby']).toBeUndefined();
  });
});

describe('naming (radio group inside a FormField)', () => {
  const authorLabel = { ...formFieldIds('f'), label: 'mine' };
  it.each([
    ['a field without a Label', {}, inField({ hasLabel: false }), undefined, undefined],
    ['a field with a Label', {}, inField(), undefined, 'f-label'],
    ['a field with a Label and aria-label', { ariaLabel: 'Own' }, inField(), 'Own', undefined],
    ['a field with a Label and aria-labelledby', { ariaLabelledBy: 'cap' }, inField(), undefined, 'cap'],
    ['a field whose Label has an author id', {}, inField({ ids: authorLabel }), undefined, 'mine'],
  ])('%s', (_name, state, field, label, labelledBy) => {
    const { root } = getRadioGroupProps(base(state), vi.fn(), field);
    expect(root['aria-label']).toBe(label);
    expect(root['aria-labelledby']).toBe(labelledBy);
  });
});

describe('the group as the labelled element of a FormField', () => {
  it('takes the control id and the description ids of the field', () => {
    const { root } = getRadioGroupProps(base({ ariaDescribedBy: 'note' }), vi.fn(), inField());
    expect(root.id).toBe('f-control');
    expect(root['aria-describedby']).toBe('note f-hint-1 f-error-1');
  });

  it('keeps the author id over the control id', () => {
    expect(getRadioGroupProps(base({ id: 'mine' }), vi.fn(), inField()).root.id).toBe('mine');
  });

  it('gets no id and no description as a second control of the field', () => {
    const { root } = getRadioGroupProps(base(), vi.fn(), inField({ ids: undefined }));
    expect(root.id).toBeUndefined();
    expect(root['aria-describedby']).toBeUndefined();
    expect(root['aria-labelledby']).toBeUndefined();
  });

  it('reports itself as a group, so the Label renders no `for`', () => {
    const { control } = getRadioGroupProps(base({ value: 'a' }), vi.fn(), inField());
    expect(control).toMatchObject({ id: 'f-control', group: true, filled: true });
    expect(getFormFieldLabelFor(control)).toBeUndefined();
  });

  it('reports filled from the value', () => {
    expect(getRadioGroupProps(base(), vi.fn()).control.filled).toBe(false);
    expect(getRadioGroupProps(base({ value: null }), vi.fn()).control.filled).toBe(false);
    expect(getRadioGroupProps(base({ value: 'a' }), vi.fn()).control.filled).toBe(true);
  });

  it('reports a required group with no value as invalid, with the touched and submitted facts', () => {
    expect(getRadioGroupProps(base({ required: true, touched: true }), vi.fn()).control).toMatchObject({
      required: true,
      invalid: true,
      touched: true,
      submitted: false,
    });
    expect(getRadioGroupProps(base({ required: true, value: 'a' }), vi.fn()).control.invalid).toBe(false);
    expect(getRadioGroupProps(base({ invalid: true, submitted: true }), vi.fn()).control).toMatchObject({
      invalid: true,
      submitted: true,
    });
  });
});

describe('the facts of the field reach the group', () => {
  it('a disabled field disables every radio and removes the tab stop', () => {
    const parts = getRadioGroupProps(base(), vi.fn(), inField({ state: { disabled: true } }));
    expect(parts.root['aria-disabled']).toBe('true');
    expect(parts.root['data-disabled']).toBe('');
    expect(parts.radio({ value: 'a' })).toMatchObject({ disabled: true, tabIndex: -1 });
    expect(parts.control.disabled).toBe(true);
  });

  it('a required field makes the group and every radio required', () => {
    const parts = getRadioGroupProps(base({ touched: true }), vi.fn(), inField({ state: { required: true } }));
    expect(parts.root['aria-required']).toBe('true');
    expect(parts.root['data-required']).toBe('');
    expect(parts.radio({ value: 'a' }).required).toBe(true);
    expect(parts.root['aria-invalid']).toBe('true');
  });

  it('an invalid field shows the invalid state once the group is touched', () => {
    const field = inField({ state: { invalid: true } });
    expect(getRadioGroupProps(base({ value: 'a' }), vi.fn(), field).root['aria-invalid']).toBeUndefined();
    const touched = getRadioGroupProps(base({ value: 'a', touched: true }), vi.fn(), field);
    expect(touched.root['aria-invalid']).toBe('true');
    expect(touched.root['data-invalid']).toBe('');
  });

  it('the key handler of a disabled field does nothing', () => {
    const send = vi.fn();
    const { root } = getRadioGroupProps(base({ value: 'a' }), send, inField({ state: { disabled: true } }));
    const event = Object.assign(new Event('keydown', { cancelable: true }), {
      key: 'ArrowDown',
      isComposing: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false,
    }) as unknown as KeyboardEvent;
    root.onKeyDown(event, 'a');
    expect(send).not.toHaveBeenCalled();
  });
});

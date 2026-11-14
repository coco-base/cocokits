import { describe, expect, it } from 'vitest';
import { formFieldIds, getFormFieldControlProps, invalidShown, isFilledText } from '../index';

const ids = formFieldIds('f');

describe('invalidShown', () => {
  it('is true only for invalid and (touched or submitted)', () => {
    const base = { invalid: false, touched: false, submitted: false };
    expect(invalidShown(base)).toBe(false);
    expect(invalidShown({ ...base, invalid: true })).toBe(false);
    expect(invalidShown({ ...base, touched: true, submitted: true })).toBe(false);
    expect(invalidShown({ ...base, invalid: true, touched: true })).toBe(true);
    expect(invalidShown({ ...base, invalid: true, submitted: true })).toBe(true);
  });
});

describe('isFilledText', () => {
  it('is false for null, undefined and an empty string, true for any text', () => {
    expect([null, undefined, ''].map(isFilledText)).toEqual([false, false, false]);
    expect(['a', ' ', '0'].map(isFilledText)).toEqual([true, true, true]);
  });
});

describe('getFormFieldControlProps', () => {
  it('renders no class, since each control adds its own', () => {
    expect(getFormFieldControlProps({}).root).not.toHaveProperty('class');
  });

  it('uses the generated control id only as a fallback, and only inside a field', () => {
    expect(getFormFieldControlProps({}).root.id).toBeUndefined();
    expect(getFormFieldControlProps({}, { ids }).root.id).toBe('f-control');
    expect(getFormFieldControlProps({ id: '' }, { ids }).root.id).toBe('f-control');
    expect(getFormFieldControlProps({ id: 'mine' }, { ids }).root.id).toBe('mine');
  });

  it('gives a second control no id and no feedback id when the field leaves the ids out', () => {
    const { root } = getFormFieldControlProps({ ariaDescribedBy: 'a' }, { state: {} });
    expect(root.id).toBeUndefined();
    expect(root['aria-describedby']).toBe('a');
  });

  it('lists the author ids, then every hint id, then every error id, and not the feedback wrapper', () => {
    const described = formFieldIds('f', { hints: [undefined, 'mine'], errors: [undefined] });
    const { root } = getFormFieldControlProps({ ariaDescribedBy: 'a' }, { ids: described });
    expect(root['aria-describedby']).toBe('a f-hint-1 mine f-error-1');
  });

  it('has no description from the field when it holds no hint and no error', () => {
    expect(getFormFieldControlProps({}, { ids }).root['aria-describedby']).toBeUndefined();
  });

  it('reports the effective id and facts, with filled', () => {
    const { control } = getFormFieldControlProps({ filled: true, touched: true }, { ids });
    expect(control).toMatchObject({ id: 'f-control', filled: true, touched: true });
  });

  it('gates aria-invalid with invalidShown on the OR of the field and the control', () => {
    const { root } = getFormFieldControlProps({ touched: true }, { state: { invalid: true } });
    expect(root['aria-invalid']).toBe('true');
    expect(root['data-invalid']).toBe('');
  });
});

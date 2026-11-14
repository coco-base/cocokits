import { describe, expect, it } from 'vitest';
import {
  formFieldAnatomy,
  formFieldIds,
  formFieldMeta,
  getFormFieldProps,
  mergeDescribedBy,
  resolveFormFieldState,
  isSameFormFieldControlState,
} from '../index';

const none = resolveFormFieldState({});

describe('getFormFieldProps', () => {
  it('names the classes of the four parts', () => {
    expect(formFieldAnatomy.classes).toEqual({
      root: 'cck-form-field',
      wrapper: 'cck-form-field__wrapper',
      inputWrapper: 'cck-form-field__input-wrapper',
      feedbackWrapper: 'cck-form-field__feedback-wrapper',
    });
  });

  it('returns only the class of each part without input', () => {
    expect(getFormFieldProps()).toEqual({
      root: { class: 'cck-form-field' },
      wrapper: { class: 'cck-form-field__wrapper' },
      inputWrapper: { class: 'cck-form-field__input-wrapper' },
      feedbackWrapper: { class: 'cck-form-field__feedback-wrapper' },
    });
  });

  it('describes every part', () => {
    for (const part of Object.values(formFieldAnatomy.parts)) {
      expect(part.description.length).toBeGreaterThan(0);
    }
  });

  it('declares the ten facts on the root, a div for every part and no role or keyboard', () => {
    expect(formFieldMeta.dataAttrs.root).toHaveLength(10);
    expect(formFieldMeta.dataAttrs.wrapper).toEqual([]);
    expect(formFieldMeta.dataAttrs.inputWrapper).toEqual([]);
    expect(formFieldMeta.dataAttrs.feedbackWrapper).toEqual([]);
    expect(formFieldMeta.roles).toEqual({ root: null, wrapper: null, inputWrapper: null, feedbackWrapper: null });
    expect(formFieldMeta.keyboard).toEqual([]);
    expect(formFieldMeta.defaultElements).toEqual({
      root: 'div',
      wrapper: 'div',
      inputWrapper: 'div',
      feedbackWrapper: 'div',
    });
  });

  it('has a meta entry for every anatomy part', () => {
    expect(Object.keys(formFieldMeta.dataAttrs)).toEqual(Object.keys(formFieldAnatomy.parts));
  });

  it('renders exactly the meta data attributes on the root when every fact is true', () => {
    const state = resolveFormFieldState(
      {},
      {
        disabled: true,
        readOnly: true,
        required: true,
        invalid: true,
        pending: true,
        touched: true,
        dirty: true,
        submitted: true,
        focused: true,
        filled: true,
      },
    );
    const keys = Object.entries(getFormFieldProps({ state }).root)
      .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
      .map(([key]) => key);
    expect(keys.sort()).toEqual([...formFieldMeta.dataAttrs.root].sort());
  });

  it('renders no fact and no hidden for false facts', () => {
    const { root } = getFormFieldProps({ state: none });
    expect(Object.values(root).filter((value) => value === '')).toEqual([]);
    expect(root.hidden).toBeUndefined();
  });

  it('renders native hidden while the control is hidden', () => {
    expect(getFormFieldProps({ state: resolveFormFieldState({}, { hidden: true }) }).root.hidden).toBe(true);
  });

  it('gives the feedback wrapper the feedback id only when the field id is known', () => {
    expect(getFormFieldProps({ fieldId: 'email' }).feedbackWrapper).toEqual({
      class: 'cck-form-field__feedback-wrapper',
      id: 'email-feedback',
    });
    expect(getFormFieldProps({ state: none }).feedbackWrapper).not.toHaveProperty('id');
  });
});

describe('formFieldIds', () => {
  it('derives the control and the feedback id from the field id', () => {
    expect(formFieldIds('r1')).toMatchObject({ control: 'r1-control', feedback: 'r1-feedback', label: 'r1-label' });
  });
});

describe('formFieldIds with hints and errors', () => {
  it('lists no hint and no error id by default', () => {
    expect(formFieldIds('r1')).toMatchObject({ hints: [], errors: [] });
  });

  it('numbers a part without its own id from 1, and lets an author id win', () => {
    const ids = formFieldIds('r1', { hints: [undefined, 'mine', undefined], errors: [undefined] });
    expect(ids.hints).toEqual(['r1-hint-1', 'mine', 'r1-hint-3']);
    expect(ids.errors).toEqual(['r1-error-1']);
  });

  it('treats an empty author id as none', () => {
    expect(formFieldIds('r1', { hints: [''] }).hints).toEqual(['r1-hint-1']);
  });
});

describe('mergeDescribedBy', () => {
  it('puts the author ids first and the feedback id last', () => {
    expect(mergeDescribedBy('a b', 'f')).toBe('a b f');
  });

  it('never duplicates, wherever the duplicate is', () => {
    expect(mergeDescribedBy('f a', 'f')).toBe('f a');
    expect(mergeDescribedBy('a a', 'f')).toBe('a f');
  });

  it('collapses extra whitespace', () => {
    expect(mergeDescribedBy('  a   b ', 'f')).toBe('a b f');
  });

  it('gives the feedback id alone for no author ids', () => {
    expect(mergeDescribedBy(undefined, 'f')).toBe('f');
    expect(mergeDescribedBy('', 'f')).toBe('f');
    expect(mergeDescribedBy(null, 'f')).toBe('f');
  });

  it('keeps only the author ids without a feedback id', () => {
    expect(mergeDescribedBy('a', undefined)).toBe('a');
  });

  it('takes any number of ids after the author ids, in order', () => {
    expect(mergeDescribedBy('a', 'h1', 'h2', undefined, 'e1')).toBe('a h1 h2 e1');
  });

  it('returns undefined when there is no id', () => {
    expect(mergeDescribedBy(undefined)).toBeUndefined();
    expect(mergeDescribedBy('  ', null)).toBeUndefined();
  });
});

describe('resolveFormFieldState', () => {
  it('is all false without a field prop and a control', () => {
    expect(resolveFormFieldState(undefined)).toEqual({
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
      pending: false,
      touched: false,
      dirty: false,
      submitted: false,
      focused: false,
      filled: false,
      hidden: false,
    });
  });

  it.each(['disabled', 'readOnly', 'required', 'invalid'] as const)('%s is true when either side sets it', (fact) => {
    expect(resolveFormFieldState({ [fact]: true })[fact]).toBe(true);
    expect(resolveFormFieldState({}, { [fact]: true })[fact]).toBe(true);
    expect(resolveFormFieldState({ [fact]: true }, { [fact]: false })[fact]).toBe(true);
    expect(resolveFormFieldState({ [fact]: false }, { [fact]: true })[fact]).toBe(true);
    expect(resolveFormFieldState({ [fact]: false }, { [fact]: false })[fact]).toBe(false);
  });

  it.each(['pending', 'touched', 'dirty', 'submitted', 'focused', 'filled', 'hidden'] as const)(
    '%s comes from the control only',
    (fact) => {
      expect(resolveFormFieldState({}, { [fact]: true })[fact]).toBe(true);
      expect(resolveFormFieldState({ disabled: true })[fact]).toBe(false);
    },
  );

  it('does not turn hideRequiredMarker into a fact', () => {
    expect(resolveFormFieldState({ hideRequiredMarker: true }).required).toBe(false);
  });
});

describe('isSameFormFieldControlState', () => {
  const state = { id: 'a-control', required: true, filled: false };

  it('is true for the same object and for equal facts', () => {
    expect(isSameFormFieldControlState(state, state)).toBe(true);
    expect(isSameFormFieldControlState(state, { ...state })).toBe(true);
    expect(isSameFormFieldControlState(undefined, undefined)).toBe(true);
  });

  it('is false when one fact changed', () => {
    expect(isSameFormFieldControlState(state, { ...state, filled: true })).toBe(false);
    expect(isSameFormFieldControlState(state, { ...state, id: 'b-control' })).toBe(false);
  });

  it('is false for a key on one side only, even when its value is undefined', () => {
    expect(isSameFormFieldControlState(state, { ...state, touched: true })).toBe(false);
    expect(isSameFormFieldControlState({ ...state, touched: true }, state)).toBe(false);
    expect(isSameFormFieldControlState(state, { ...state, touched: undefined })).toBe(true);
  });

  it('is false when only one side is undefined', () => {
    expect(isSameFormFieldControlState(undefined, state)).toBe(false);
    expect(isSameFormFieldControlState(state, undefined)).toBe(false);
  });
});

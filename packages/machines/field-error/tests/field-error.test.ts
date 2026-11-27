import { describe, expect, it } from 'vitest';
import { resolveFormFieldState } from '../../form-field';
import { fieldErrorAnatomy, fieldErrorMeta, getFieldErrorProps } from '../index';

const state = (facts: Parameters<typeof resolveFormFieldState>[1]) => resolveFormFieldState(undefined, facts);

describe('getFieldErrorProps', () => {
  it('always renders the class and the polite live region', () => {
    expect(fieldErrorAnatomy.classes.root).toBe('cck-field-error');
    const inputs = [{}, { force: true }, { state: state({}) }, { state: state({ invalid: true, touched: true }) }];
    for (const input of inputs) {
      expect(getFieldErrorProps(input).root).toEqual({ class: 'cck-field-error', 'aria-live': 'polite' });
    }
  });

  it('shows with force, whatever the state', () => {
    expect(getFieldErrorProps({ force: true, state: state({}) }).shown).toBe(true);
  });

  it('shows outside a field, where there is no state', () => {
    expect(getFieldErrorProps({}).shown).toBe(true);
  });

  it('shows in a field only while invalid and touched or submitted', () => {
    expect(getFieldErrorProps({ state: state({ invalid: true }) }).shown).toBe(false);
    expect(getFieldErrorProps({ state: state({ invalid: true, touched: true }) }).shown).toBe(true);
    expect(getFieldErrorProps({ state: state({ invalid: true, submitted: true }) }).shown).toBe(true);
    expect(getFieldErrorProps({ state: state({ touched: true, submitted: true }) }).shown).toBe(false);
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(fieldErrorMeta.dataAttrs).toEqual({ root: [] });
    expect(fieldErrorMeta.roles.root).toBeNull();
    expect(fieldErrorMeta.keyboard).toEqual([]);
    expect(fieldErrorMeta.defaultElements).toEqual({ root: 'div' });
  });
});

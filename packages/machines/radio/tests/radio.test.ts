import { describe, expect, it } from 'vitest';
import { getRadioProps, radioAnatomy, radioMeta } from '../index';

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);
}

describe('getRadioProps', () => {
  it('renders the part classes and an unchecked native radio for an empty state', () => {
    const parts = getRadioProps({});
    expect(radioAnatomy.classes).toMatchObject({
      root: 'cck-radio',
      wrapper: 'cck-radio__wrapper',
      inputWrapper: 'cck-radio__input-wrapper',
      input: 'cck-radio__input',
      backdrop: 'cck-radio__backdrop',
      background: 'cck-radio__background',
      label: 'cck-radio__label',
    });
    expect(dataKeys(parts.root)).toEqual([]);
    expect(parts.input).toMatchObject({ class: 'cck-radio__input', type: 'radio', checked: false });
  });

  it('renders exactly the three data attributes of the meta', () => {
    const { root } = getRadioProps({ checked: true, disabled: true, required: true });
    expect(dataKeys(root).sort()).toEqual([...radioMeta.dataAttrs.root].sort());
    expect(radioMeta.dataAttrs.root).toEqual(['data-checked', 'data-disabled', 'data-required']);
  });

  it('renders no read-only, invalid or form-state output, whatever the caller passes', () => {
    const state = { readOnly: true, invalid: true, touched: true } as Parameters<typeof getRadioProps>[0];
    const parts = getRadioProps(state);
    expect(JSON.stringify(parts)).not.toMatch(/readonly|aria-readonly|aria-invalid|data-invalid|data-touched/);
    expect(parts).not.toHaveProperty('control');
  });

  it('renders the tab stop a group gives and no tabindex otherwise', () => {
    expect(getRadioProps({}).input.tabIndex).toBeUndefined();
    expect(getRadioProps({ tabIndex: 0 }).input.tabIndex).toBe(0);
    expect(getRadioProps({ tabIndex: -1 }).input.tabIndex).toBe(-1);
  });

  it('reads a nullish model as unchecked', () => {
    expect(getRadioProps({ checked: null }).input.checked).toBe(false);
  });

  it('puts the native attributes on the input', () => {
    const { input } = getRadioProps({ id: 'a', name: 'size', checked: true, disabled: true, required: true });
    expect(input).toMatchObject({ id: 'a', name: 'size', checked: true, disabled: true, required: true });
  });

  it('treats an empty id or name as none', () => {
    const { input, label } = getRadioProps({ id: '', name: '' });
    expect(input.id).toBeUndefined();
    expect(input.name).toBeUndefined();
    expect(label.for).toBeUndefined();
  });

  it('points the label at the input id', () => {
    expect(getRadioProps({ id: 'r1' }).label.for).toBe('r1');
  });

  it('marks backdrop and background aria-hidden, and the containers and label not', () => {
    const parts = getRadioProps({});
    expect(parts.backdrop['aria-hidden']).toBe('true');
    expect(parts.background['aria-hidden']).toBe('true');
    for (const part of [parts.wrapper, parts.inputWrapper, parts.label]) {
      expect(part).not.toHaveProperty('aria-hidden');
    }
  });

  it('renders no aria-checked and no role', () => {
    expect(JSON.stringify(getRadioProps({ checked: true }))).not.toMatch(/aria-checked|"role"/);
    expect(radioMeta.roles.input).toBeNull();
  });

  it('declares the apg link and default elements', () => {
    expect(radioMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/radio/');
    expect(radioMeta.defaultElements?.root).toBe('div');
    expect(radioMeta.defaultElements?.label).toBe('label');
  });
});

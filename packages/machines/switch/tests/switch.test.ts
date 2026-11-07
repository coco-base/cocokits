import { describe, expect, it } from 'vitest';
import { formFieldIds } from '../../form-field';
import { getSwitchProps, switchAnatomy, switchMeta } from '../index';

const ids = formFieldIds('notify', { hints: [undefined] });

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);
}

describe('getSwitchProps', () => {
  it('renders the part classes', () => {
    const parts = getSwitchProps({});
    expect(switchAnatomy.classes).toMatchObject({
      root: 'cck-switch',
      label: 'cck-switch__label',
      track: 'cck-switch__track',
      input: 'cck-switch__input',
      thumb: 'cck-switch__thumb',
      backdrop: 'cck-switch__backdrop',
    });
    expect(parts.root.class).toBe('cck-switch');
    expect(parts.label.class).toBe('cck-switch__label');
    expect(parts.track).toEqual({ class: 'cck-switch__track' });
    expect(parts.input.class).toBe('cck-switch__input');
    expect(parts.thumb.class).toBe('cck-switch__thumb');
    expect(parts.backdrop.class).toBe('cck-switch__backdrop');
  });

  it('renders a native checkbox input with role switch and no aria-checked', () => {
    const parts = getSwitchProps({ checked: true });
    expect(parts.input).toMatchObject({ type: 'checkbox', role: 'switch', checked: true });
    expect(JSON.stringify(parts)).not.toContain('aria-checked');
    expect(switchMeta.roles.input).toBe('switch');
  });

  it('renders exactly the data attributes of the meta when every fact is true, with no indeterminate', () => {
    const { root } = getSwitchProps({
      checked: true,
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
    expect(dataKeys(root).sort()).toEqual([...switchMeta.dataAttrs.root].sort());
    expect(dataKeys(root)).not.toContain('data-indeterminate');
    expect(dataKeys(root)).not.toContain('data-filled');
  });

  it('ignores an indeterminate value from untyped code', () => {
    const state = { indeterminate: true } as Parameters<typeof getSwitchProps>[0];
    expect(getSwitchProps(state).root).not.toHaveProperty('data-indeterminate', '');
  });

  it('renders aria-readonly only while read-only, and gates aria-invalid', () => {
    expect(getSwitchProps({ readOnly: true }).input['aria-readonly']).toBe('true');
    expect(getSwitchProps({}).input['aria-readonly']).toBeUndefined();
    expect(getSwitchProps({ invalid: true }).input['aria-invalid']).toBeUndefined();
    expect(getSwitchProps({ invalid: true, touched: true }).input['aria-invalid']).toBe('true');
  });

  it('marks thumb and backdrop aria-hidden, and the track and label not', () => {
    const parts = getSwitchProps({});
    expect(parts.thumb['aria-hidden']).toBe('true');
    expect(parts.backdrop['aria-hidden']).toBe('true');
    expect(parts.track).not.toHaveProperty('aria-hidden');
    expect(parts.label).not.toHaveProperty('aria-hidden');
  });

  it('points the label at the input id, in and out of a field', () => {
    expect(getSwitchProps({ id: 'own' }).label.for).toBe('own');
    const inField = getSwitchProps({}, { ids });
    expect(inField.input.id).toBe(ids.control);
    expect(inField.label.for).toBe(ids.control);
    expect(inField.input['aria-describedby']).toBe('notify-hint-1');
  });

  it('reports the field control state with filled = checked', () => {
    expect(getSwitchProps({ checked: true }, { ids }).control).toMatchObject({ id: ids.control, filled: true });
  });

  it('declares the default elements and the apg link', () => {
    expect(switchMeta.defaultElements).toEqual({
      root: 'div',
      label: 'label',
      track: 'span',
      input: 'input',
      thumb: 'span',
      backdrop: 'span',
    });
    expect(switchMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/switch/');
  });
});

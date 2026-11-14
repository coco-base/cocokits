import { describe, expect, it } from 'vitest';
import { formFieldIds } from '../../form-field';
import { getInputProps, inputAnatomy, inputMeta } from '../index';

const ids = formFieldIds('email', { hints: [undefined], errors: [undefined] });

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([key, value]) => key.startsWith('data-') && value !== undefined)
    .map(([key]) => key);
}

function defined(root: object): object {
  return Object.fromEntries(Object.entries(root).filter(([, value]) => value !== undefined));
}

describe('getInputProps', () => {
  it('renders the class and an explicit text type, nothing else, for an empty input', () => {
    const { root } = getInputProps({});
    expect(inputAnatomy.classes.root).toBe('cck-input');
    expect(root).toMatchObject({ class: 'cck-input', type: 'text' });
    expect(Object.keys(root).filter((key) => root[key as keyof typeof root] !== undefined)).toEqual(['class', 'type']);
  });

  it('falls back to text for a type outside the six text types', () => {
    expect(getInputProps({ type: 'checkbox' as 'text' }).root.type).toBe('text');
    expect(getInputProps({ type: 'file' as 'text' }).root.type).toBe('text');
  });

  it('lets an author type replace the default', () => {
    expect(getInputProps({ type: 'email' }).root.type).toBe('email');
  });

  it('renders exactly the data attributes of the meta when every fact is true', () => {
    const { root } = getInputProps({
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
    expect(dataKeys(root).sort()).toEqual([...inputMeta.dataAttrs.root].sort());
    expect(root).toMatchObject({ disabled: true, readonly: true, required: true });
  });

  it('renders no data attribute for a false fact, never the string "false"', () => {
    const { root } = getInputProps({});
    expect(dataKeys(root)).toEqual([]);
    expect(Object.values(root)).not.toContain('false');
  });

  it('declares a native input without a role', () => {
    expect(inputMeta.roles.root).toBeNull();
    expect(inputMeta.defaultElements).toEqual({ root: 'input' });
    expect(defined(inputMeta)).not.toHaveProperty('apg');
  });

  describe('filled', () => {
    it.each([
      ['', false],
      [null, false],
      [undefined, false],
      ['a', true],
      [' ', true],
    ] as const)('value %j gives filled %j', (value, filled) => {
      const { root, control } = getInputProps({ value });
      expect(root['data-filled']).toBe(filled ? '' : undefined);
      expect(control.filled).toBe(filled);
    });
  });

  describe('aria-invalid', () => {
    it('is absent while invalid but neither touched nor submitted', () => {
      const { root } = getInputProps({ invalid: true });
      expect(defined(root)).not.toHaveProperty('aria-invalid');
      expect(root['data-invalid']).toBe('');
    });

    it.each([{ touched: true }, { submitted: true }])('is "true" while invalid and %j', (gate) => {
      expect(getInputProps({ invalid: true, ...gate }).root['aria-invalid']).toBe('true');
    });

    it('is never rendered for a valid control, however touched', () => {
      const { root } = getInputProps({ touched: true, submitted: true });
      expect(defined(root)).not.toHaveProperty('aria-invalid');
    });

    it('follows an invalid set on the field', () => {
      const { root } = getInputProps({ touched: true }, { state: { invalid: true } });
      expect(root['aria-invalid']).toBe('true');
    });
  });

  describe('inside a field', () => {
    it('defaults the id to the control id and describes by the hint and error ids', () => {
      const { root, control } = getInputProps({}, { ids });
      expect(root.id).toBe('email-control');
      expect(root['aria-describedby']).toBe('email-hint-1 email-error-1');
      expect(control.id).toBe('email-control');
    });

    it('lets an author id win', () => {
      const { root, control } = getInputProps({ id: 'mine' }, { ids });
      expect(root.id).toBe('mine');
      expect(control.id).toBe('mine');
    });

    it('puts the author ids before the hint and error ids, without duplicates', () => {
      expect(getInputProps({ ariaDescribedBy: 'a b' }, { ids }).root['aria-describedby']).toBe(
        'a b email-hint-1 email-error-1',
      );
      expect(getInputProps({ ariaDescribedBy: 'email-hint-1 a' }, { ids }).root['aria-describedby']).toBe(
        'email-hint-1 a email-error-1',
      );
    });

    it('gives a control without field ids no generated id and only the author ids', () => {
      const { root } = getInputProps({ ariaDescribedBy: 'a' }, { state: { required: true } });
      expect(defined(root)).not.toHaveProperty('id');
      expect(root['aria-describedby']).toBe('a');
    });

    it('ORs the field facts into the control', () => {
      const { root, control } = getInputProps(
        { required: true },
        { ids, state: { disabled: true, readOnly: true, required: false, invalid: true } },
      );
      expect(root).toMatchObject({ disabled: true, readonly: true, required: true });
      expect(root['data-invalid']).toBe('');
      expect(control).toMatchObject({ disabled: true, readOnly: true, required: true, invalid: true });
    });
  });

  describe('outside a field', () => {
    it('renders no id and no aria-describedby, and keeps the author describedby', () => {
      const bare = getInputProps({}).root;
      expect(defined(bare)).not.toHaveProperty('id');
      expect(defined(bare)).not.toHaveProperty('aria-describedby');
      expect(getInputProps({ id: 'x', ariaDescribedBy: 'h' }).root).toMatchObject({ id: 'x', 'aria-describedby': 'h' });
    });
  });

  describe('hidden', () => {
    it('renders native hidden and reports it', () => {
      const { root, control } = getInputProps({ hidden: true });
      expect(root.hidden).toBe(true);
      expect(control.hidden).toBe(true);
      expect(defined(getInputProps({}).root)).not.toHaveProperty('hidden');
    });
  });

  describe('name', () => {
    it('keeps an author name over the path', () => {
      expect(getInputProps({ name: 'mine', controlPath: ['email'] }).root.name).toBe('mine');
    });

    it.each([
      [['email'], 'email'],
      [['address', 'street'], 'address.street'],
      [['items', '0', 'name'], 'items.0.name'],
      [['items', 0, 'name'], 'items.0.name'],
    ])('joins the path %j into %j', (controlPath, name) => {
      expect(getInputProps({ controlPath }).root.name).toBe(name);
    });

    it.each([
      ['no path', undefined],
      ['a null path', null],
      ['an empty path', []],
      ['a lone numeric segment', ['0']],
      ['a lone numeric number segment', [3]],
      ['an empty segment', ['address', '']],
      ['a lone empty segment', ['']],
    ])('renders no name for %s', (_label, controlPath) => {
      expect(defined(getInputProps({ controlPath }).root)).not.toHaveProperty('name');
    });

    it('treats an empty author name as none', () => {
      expect(getInputProps({ name: '', controlPath: ['a'] }).root.name).toBe('a');
      expect(defined(getInputProps({ name: '' }).root)).not.toHaveProperty('name');
    });
  });
});

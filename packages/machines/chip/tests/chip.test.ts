import { describe, expect, it } from 'vitest';
import { chipAnatomy, chipMeta, getChipProps } from '../index';

const keysOf = (props: object | null, prefix: string): string[] =>
  Object.entries(props ?? {})
    .filter(([key, value]) => key.startsWith(prefix) && value !== undefined)
    .map(([key]) => key);

describe('chipAnatomy', () => {
  it('names the classes of the Anatomy table', () => {
    expect(chipAnatomy.classes).toEqual({
      root: 'cck-chip',
      contentWrapper: 'cck-chip__content-wrapper',
      remove: 'cck-chip__remove',
    });
  });
});

describe('getChipProps', () => {
  it('renders the classes and the content id derived from the chip id', () => {
    const { root, contentWrapper, remove } = getChipProps({ id: 'c1' });
    expect(root).toMatchObject({ class: 'cck-chip', id: 'c1' });
    expect(contentWrapper).toEqual({ class: 'cck-chip__content-wrapper', id: 'c1-content' });
    expect(remove).toBeNull();
  });

  it('renders the remove button only while removable, named by the content wrapper', () => {
    const { remove, contentWrapper } = getChipProps({ id: 'c1', removable: true });
    expect(remove).toMatchObject({ class: 'cck-chip__remove', type: 'button', 'aria-labelledby': contentWrapper.id });
    expect(remove?.disabled).toBeUndefined();
    expect(remove?.['data-disabled']).toBeUndefined();
  });

  it('marks a disabled chip on the root and the remove button', () => {
    const { root, remove } = getChipProps({ id: 'c1', removable: true, disabled: true });
    expect(root['data-disabled']).toBe('');
    expect(remove).toMatchObject({ disabled: true, 'data-disabled': '', type: 'button' });
  });

  it('renders no data attribute on an enabled chip', () => {
    const { root, remove } = getChipProps({ id: 'c1', removable: true });
    expect(keysOf(root, 'data-')).toEqual([]);
    expect(keysOf(remove, 'data-')).toEqual([]);
  });

  it('renders only data attributes the meta declares', () => {
    const { root, remove } = getChipProps({ id: 'c1', removable: true, disabled: true });
    expect(keysOf(root, 'data-')).toEqual(chipMeta.dataAttrs.root);
    expect(keysOf(remove, 'data-')).toEqual(chipMeta.dataAttrs.remove);
    expect(chipMeta.dataAttrs.contentWrapper).toEqual([]);
  });
});

describe('chipMeta', () => {
  it('declares no roles, the default elements and no form behaviour', () => {
    expect(chipMeta.roles).toEqual({ root: null, contentWrapper: null, remove: null });
    expect(chipMeta.defaultElements).toEqual({ root: 'div', contentWrapper: 'span', remove: 'button' });
    expect(chipMeta.form).toMatch(/^None/);
  });

  it('has the remove keyboard row', () => {
    expect(chipMeta.keyboard.map((row) => row.key)).toEqual(['Enter, Space']);
  });
});

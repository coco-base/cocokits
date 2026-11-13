import { describe, expect, it } from 'vitest';
import { dividerAnatomy, dividerMeta, getDividerProps } from '../index';
import type { DividerOrientation } from '../index';

describe('getDividerProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(dividerAnatomy.classes).toEqual({ root: 'cck-divider' });
    expect(dividerAnatomy.parts.root.description).toBe('The line that separates content.');
  });

  it('is a horizontal, non-decorative separator without input', () => {
    expect(getDividerProps()).toEqual({ root: { class: 'cck-divider', 'data-orientation': 'horizontal' } });
    expect(getDividerProps({}).root).toEqual(getDividerProps().root);
  });

  it.each<[DividerOrientation, boolean, Record<string, string>]>([
    ['horizontal', false, { class: 'cck-divider', 'data-orientation': 'horizontal' }],
    ['vertical', false, { class: 'cck-divider', 'data-orientation': 'vertical', 'aria-orientation': 'vertical' }],
    ['horizontal', true, { class: 'cck-divider', 'data-orientation': 'horizontal', role: 'none' }],
    ['vertical', true, { class: 'cck-divider', 'data-orientation': 'vertical', role: 'none' }],
  ])('orientation %s, decorative %s', (orientation, decorative, root) => {
    expect(getDividerProps({ orientation, decorative }).root).toEqual(root);
  });

  it('never sets aria-orientation on a decorative divider, nor a role on a separator', () => {
    expect(getDividerProps({ orientation: 'vertical', decorative: true }).root).not.toHaveProperty('aria-orientation');
    expect(getDividerProps({ orientation: 'vertical' }).root).not.toHaveProperty('role');
  });

  it('emits only data attributes that the meta lists', () => {
    const emitted = Object.keys(getDividerProps({ orientation: 'vertical' }).root).filter((k) => k.startsWith('data-'));
    expect(emitted).toEqual(dividerMeta.dataAttrs.root);
  });

  it('is pure: equal input gives equal output', () => {
    expect(getDividerProps({ orientation: 'vertical' })).toEqual(getDividerProps({ orientation: 'vertical' }));
  });
});

describe('dividerMeta', () => {
  it('declares the native hr, its role, no keys and no APG pattern', () => {
    expect(dividerMeta.dataAttrs).toEqual({ root: ['data-orientation'] });
    expect(dividerMeta.dataAttrDetails?.['data-orientation']?.values).toEqual(['horizontal', 'vertical']);
    expect(dividerMeta.roles).toEqual({ root: null });
    expect(dividerMeta.keyboard).toEqual([]);
    expect(dividerMeta.defaultElements).toEqual({ root: 'hr' });
    expect(dividerMeta.apg).toBeUndefined();
  });

  it('has a meta entry for every anatomy part', () => {
    expect(Object.keys(dividerMeta.dataAttrs)).toEqual(Object.keys(dividerAnatomy.parts));
  });
});

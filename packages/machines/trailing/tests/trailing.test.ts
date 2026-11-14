import { describe, expect, it } from 'vitest';
import { getTrailingProps, trailingAnatomy, trailingMeta } from '../index';

describe('getTrailingProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(trailingAnatomy.classes.root).toBe('cck-trailing');
  });

  it('returns only the class of the root', () => {
    expect(getTrailingProps()).toEqual({ root: { class: 'cck-trailing' } });
  });

  it('describes the root', () => {
    expect(trailingAnatomy.parts.root.description).toBe('Content outside the box, after it.');
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(trailingMeta.dataAttrs).toEqual({ root: [] });
    expect(trailingMeta.roles.root).toBeNull();
    expect(trailingMeta.keyboard).toEqual([]);
    expect(trailingMeta.defaultElements).toEqual({ root: 'div' });
  });
});

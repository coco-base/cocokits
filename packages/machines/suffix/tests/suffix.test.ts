import { describe, expect, it } from 'vitest';
import { getSuffixProps, suffixAnatomy, suffixMeta } from '../index';

describe('getSuffixProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(suffixAnatomy.classes.root).toBe('cck-suffix');
  });

  it('returns only the class of the root', () => {
    expect(getSuffixProps()).toEqual({ root: { class: 'cck-suffix' } });
  });

  it('describes the root', () => {
    expect(suffixAnatomy.parts.root.description).toBe('Content inside the box, after the control.');
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(suffixMeta.dataAttrs).toEqual({ root: [] });
    expect(suffixMeta.roles.root).toBeNull();
    expect(suffixMeta.keyboard).toEqual([]);
    expect(suffixMeta.defaultElements).toEqual({ root: 'div' });
  });
});

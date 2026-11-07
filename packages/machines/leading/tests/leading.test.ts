import { describe, expect, it } from 'vitest';
import { getLeadingProps, leadingAnatomy, leadingMeta } from '../index';

describe('getLeadingProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(leadingAnatomy.classes.root).toBe('cck-leading');
  });

  it('returns only the class of the root', () => {
    expect(getLeadingProps()).toEqual({ root: { class: 'cck-leading' } });
  });

  it('describes the root', () => {
    expect(leadingAnatomy.parts.root.description).toBe('Content outside the box, before it.');
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(leadingMeta.dataAttrs).toEqual({ root: [] });
    expect(leadingMeta.roles.root).toBeNull();
    expect(leadingMeta.keyboard).toEqual([]);
    expect(leadingMeta.defaultElements).toEqual({ root: 'div' });
  });
});

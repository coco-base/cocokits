import { describe, expect, it } from 'vitest';
import { getPrefixProps, prefixAnatomy, prefixMeta } from '../index';

describe('getPrefixProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(prefixAnatomy.classes.root).toBe('cck-prefix');
  });

  it('returns only the class of the root', () => {
    expect(getPrefixProps()).toEqual({ root: { class: 'cck-prefix' } });
  });

  it('describes the root', () => {
    expect(prefixAnatomy.parts.root.description).toBe('Content inside the box, before the control.');
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(prefixMeta.dataAttrs).toEqual({ root: [] });
    expect(prefixMeta.roles.root).toBeNull();
    expect(prefixMeta.keyboard).toEqual([]);
    expect(prefixMeta.defaultElements).toEqual({ root: 'div' });
  });
});

import { describe, expect, it } from 'vitest';
import { getTagProps, tagAnatomy, tagMeta } from '../index';

describe('getTagProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(tagAnatomy.classes).toEqual({ root: 'cck-tag' });
  });

  it('returns only the class of the root', () => {
    expect(getTagProps()).toEqual({ root: { class: 'cck-tag' } });
  });

  it('describes the root without naming an element or a look', () => {
    expect(tagAnatomy.parts.root.description).toBe(
      'A short status or category label. It holds the text and an optional icon.',
    );
  });

  it('declares no data attribute, role or keyboard, and a span by default', () => {
    expect(tagMeta.dataAttrs).toEqual({ root: [] });
    expect(tagMeta.roles.root).toBeNull();
    expect(tagMeta.keyboard).toEqual([]);
    expect(tagMeta.defaultElements).toEqual({ root: 'span' });
  });

  it('is pure', () => {
    expect(getTagProps()).toEqual(getTagProps());
  });
});

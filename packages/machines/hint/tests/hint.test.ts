import { describe, expect, it } from 'vitest';
import { getHintProps, hintAnatomy, hintMeta } from '../index';

describe('getHintProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(hintAnatomy.classes.root).toBe('cck-hint');
  });

  it('returns only the class of the root', () => {
    expect(getHintProps()).toEqual({ root: { class: 'cck-hint' } });
  });

  it('describes the root without naming an element', () => {
    expect(hintAnatomy.parts.root.description).toBe(
      'A short help text for a control. It holds the text and an optional icon.',
    );
  });

  it('declares no data attribute, role or keyboard, and a div by default', () => {
    expect(hintMeta.dataAttrs).toEqual({ root: [] });
    expect(hintMeta.roles.root).toBeNull();
    expect(hintMeta.keyboard).toEqual([]);
    expect(hintMeta.defaultElements).toEqual({ root: 'div' });
  });
});

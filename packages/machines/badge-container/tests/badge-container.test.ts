import { describe, expect, it } from 'vitest';
import { badgeContainerAnatomy, badgeContainerMeta, getBadgeContainerProps, BADGE_CONTAINER_DEFAULTS } from '../index';

describe('getBadgeContainerProps', () => {
  it('has the block class on the anatomy root', () => {
    expect(badgeContainerAnatomy.classes.root).toBe('cck-badge-container');
  });

  it('describes the root without naming an element', () => {
    expect(badgeContainerAnatomy.parts.root.description).toBe(
      "Wraps the element a badge is pinned to, and that element's badges.",
    );
  });

  it('defaults to top-right and writes no style', () => {
    expect(getBadgeContainerProps()).toEqual({
      root: { class: 'cck-badge-container', 'data-position': 'top-right' },
    });
  });

  it('exports the defaults', () => {
    expect(BADGE_CONTAINER_DEFAULTS).toEqual({ position: 'top-right' });
  });

  it('puts the position on the root', () => {
    expect(getBadgeContainerProps({ position: 'bottom-left' }).root['data-position']).toBe('bottom-left');
  });

  it('declares data-position, no keyboard or role, and a div by default', () => {
    expect(badgeContainerMeta.dataAttrs.root).toEqual(['data-position']);
    expect(badgeContainerMeta.keyboard).toEqual([]);
    expect(badgeContainerMeta.roles.root).toBeNull();
    expect(badgeContainerMeta.defaultElements).toEqual({ root: 'div' });
    expect(Object.keys(getBadgeContainerProps().root)).toEqual(['class', 'data-position']);
  });
});

describe('meta defaults', () => {
  it('names the position the root renders with no input', () => {
    expect(getBadgeContainerProps().root['data-position']).toBe(
      badgeContainerMeta.dataAttrDetails?.['data-position']?.default,
    );
  });
});

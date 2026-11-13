import { describe, expect, it } from 'vitest';
import { avatarGroupAnatomy, avatarGroupMeta, getAvatarGroupProps } from '../index';

describe('getAvatarGroupProps', () => {
  it('returns the root class only', () => {
    expect(avatarGroupAnatomy.classes).toEqual({ root: 'cck-avatar-group' });
    expect(getAvatarGroupProps()).toEqual({ root: { class: 'cck-avatar-group' } });
  });

  it('is pure: equal calls give equal output', () => {
    expect(getAvatarGroupProps()).toEqual(getAvatarGroupProps());
  });
});

describe('avatarGroupMeta', () => {
  it('lists no data attribute, no role and no key', () => {
    expect(avatarGroupMeta.dataAttrs).toEqual({ root: [] });
    expect(avatarGroupMeta.roles).toEqual({ root: null });
    expect(avatarGroupMeta.keyboard).toEqual([]);
    expect(avatarGroupMeta.defaultElements).toEqual({ root: 'div' });
  });
});

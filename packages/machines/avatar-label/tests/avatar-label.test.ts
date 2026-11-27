import { describe, expect, it } from 'vitest';
import { avatarLabelAnatomy, avatarLabelMeta, getAvatarLabelProps } from '../index';

describe('getAvatarLabelProps', () => {
  it('has the block, text, name and description classes', () => {
    expect(avatarLabelAnatomy.classes).toEqual({
      root: 'cck-avatar-label',
      text: 'cck-avatar-label__text',
      name: 'cck-avatar-label__name',
      description: 'cck-avatar-label__description',
    });
  });

  it('renders every part when name and description are set', () => {
    expect(getAvatarLabelProps({ name: 'Ada', description: 'Engineer' })).toEqual({
      root: { class: 'cck-avatar-label' },
      text: { class: 'cck-avatar-label__text' },
      name: { class: 'cck-avatar-label__name' },
      description: { class: 'cck-avatar-label__description' },
    });
  });

  it('leaves out the description when only the name is set', () => {
    const parts = getAvatarLabelProps({ name: 'Ada' });
    expect(parts.text).not.toBeNull();
    expect(parts.name).not.toBeNull();
    expect(parts.description).toBeNull();
  });

  it('leaves out the name when only the description is set', () => {
    const parts = getAvatarLabelProps({ description: 'Engineer' });
    expect(parts.text).not.toBeNull();
    expect(parts.name).toBeNull();
    expect(parts.description).not.toBeNull();
  });

  it.each([[{}], [undefined], [{ name: '', description: '' }], [{ name: null, description: null }]])(
    'leaves out text, name and description for %j',
    (input) => {
      expect(getAvatarLabelProps(input)).toEqual({
        root: { class: 'cck-avatar-label' },
        text: null,
        name: null,
        description: null,
      });
    },
  );

  it('counts an empty string as unset', () => {
    const parts = getAvatarLabelProps({ name: '', description: 'Engineer' });
    expect(parts.name).toBeNull();
    expect(parts.description).not.toBeNull();
  });
});

describe('avatarLabelMeta', () => {
  it('lists no data attribute, no role and no key, and the element of each part', () => {
    expect(avatarLabelMeta.dataAttrs).toEqual({ root: [], text: [], name: [], description: [] });
    expect(avatarLabelMeta.roles).toEqual({ root: null, text: null, name: null, description: null });
    expect(avatarLabelMeta.keyboard).toEqual([]);
    expect(avatarLabelMeta.defaultElements).toEqual({ root: 'div', text: 'span', name: 'span', description: 'span' });
  });
});

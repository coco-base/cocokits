// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { avatarLabelMeta } from '@cocokits/machines/avatar-label';
import { AvatarRoot } from '../../avatar';
import { AvatarLabel } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

describe('AvatarLabel', () => {
  it('renders the avatar first, then the text with the name and the description', () => {
    const { container } = mountView(() =>
      h(AvatarLabel, { name: 'Ada Lovelace', description: 'Mathematician' }, () => h(AvatarRoot)),
    );
    const label = pick(container, '.cck-avatar-label');
    expect(label.tagName).toBe('DIV');
    expect([...label.children].map((child) => child.className)).toEqual(['cck-avatar', 'cck-avatar-label__text']);
    const text = pick(container, '.cck-avatar-label__text');
    expect(text.tagName).toBe('SPAN');
    expect([...text.children].map((child) => child.className)).toEqual([
      'cck-avatar-label__name',
      'cck-avatar-label__description',
    ]);
    expect(pick(container, '.cck-avatar-label__name').textContent).toBe('Ada Lovelace');
    expect(pick(container, '.cck-avatar-label__description').textContent).toBe('Mathematician');
  });

  it.each([
    ['only a name', { name: 'Ada' }, true, false],
    ['only a description', { description: 'Maths' }, false, true],
    ['empty strings', { name: '', description: '' }, false, false],
    ['nothing', {}, false, false],
  ])('leaves out the parts that are not set: %s', (_label, props, hasName, hasDescription) => {
    const { container } = mountView(() => h(AvatarLabel, props));
    expect(container.querySelector('.cck-avatar-label__name') !== null).toBe(hasName);
    expect(container.querySelector('.cck-avatar-label__description') !== null).toBe(hasDescription);
    expect(container.querySelector('.cck-avatar-label__text') !== null).toBe(hasName || hasDescription);
  });

  it('lets native attributes and a merged class through, and exposes the element', () => {
    const label = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => h(AvatarLabel, { ref: label, id: 'who', class: 'mine', 'data-x': '1' }));
    const root = pick(container, '.cck-avatar-label');
    expect([...root.classList].sort()).toEqual(['cck-avatar-label', 'mine']);
    expect(root.id).toBe('who');
    expect(root.getAttribute('data-x')).toBe('1');
    expect(label.value?.element).toBe(root);
  });

  it('merges onto its child with asChild and puts the avatar and the text inside', () => {
    const { container } = mountView(() =>
      h(AvatarLabel, { asChild: true, name: 'Ada' }, () => h('section', null, [h(AvatarRoot)])),
    );
    const root = pick(container, 'section.cck-avatar-label');
    expect([...root.children].map((child) => child.className)).toEqual(['cck-avatar', 'cck-avatar-label__text']);
  });

  it('declares no data-* in the meta', () => {
    expect(Object.values(avatarLabelMeta.dataAttrs).flat()).toEqual([]);
  });
});

// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { AvatarGroup } from '../../avatar-group';
import { AvatarLabel } from '../../avatar-label';
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index';
import { mountView, stubImage } from './fixtures';

beforeEach(stubImage);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Avatar accessibility', () => {
  it.each<[string, () => VNode]>([
    [
      'an image with alt',
      () =>
        h(AvatarRoot, null, () => [
          h(AvatarImage, { src: '/a.webp', alt: 'Ada Lovelace' }),
          h(AvatarFallback, null, () => 'AL'),
        ]),
    ],
    [
      'initials with role img and aria-label on the root',
      () => h(AvatarRoot, { role: 'img', 'aria-label': 'Ada Lovelace' }, () => h(AvatarFallback, null, () => 'AL')),
    ],
    [
      'a label with an aria-hidden avatar',
      () =>
        h(AvatarLabel, { name: 'Ada Lovelace', description: 'Mathematician' }, () =>
          h(AvatarRoot, { 'aria-hidden': 'true' }, () => h(AvatarFallback, null, () => 'AL')),
        ),
    ],
    [
      'a named group',
      () =>
        h(AvatarGroup, { role: 'group', 'aria-label': 'Team' }, () => [
          h(AvatarRoot, { role: 'img', 'aria-label': 'Ada' }, () => h(AvatarFallback, null, () => 'A')),
          h(AvatarRoot, { role: 'img', 'aria-label': 'Grace' }, () => h(AvatarFallback, null, () => 'G')),
        ]),
    ],
  ])('has no axe violations: %s', async (_name, make) => {
    const { container } = mountView(make);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('adds no role, aria-* or tabindex of its own', () => {
    const { container } = mountView(() =>
      h(AvatarLabel, { name: 'Ada' }, () =>
        h(AvatarRoot, null, () => [h(AvatarImage, { src: '/a.webp' }), h(AvatarFallback)]),
      ),
    );
    for (const element of container.querySelectorAll('div, span, img')) {
      expect(
        element
          .getAttributeNames()
          .filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-')),
      ).toEqual([]);
    }
  });
});

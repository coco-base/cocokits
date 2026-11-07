// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { badgeContainerMeta } from '@cocokits/machines/badge-container';
import { badgeMeta } from '@cocokits/machines/badge';
import { Button } from '../../button';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';
import { mountView } from './fixtures';

afterEach(cleanup);

describe('Badge accessibility', () => {
  it('adds its text to the name of the Button it sits in', () => {
    mountView(() => h(Button, null, () => ['Inbox ', h(Badge, { content: 5 })]));
    expect(screen.getByRole('button', { name: 'Inbox 5' })).toBeDefined();
  });

  it('adds a truncated count to the name as "99+"', () => {
    mountView(() => h(Button, null, () => ['Inbox ', h(Badge, { content: 120, max: 99 })]));
    expect(screen.getByRole('button', { name: 'Inbox 99+' })).toBeDefined();
  });

  it.each<[string, () => VNode]>([
    ['badge', () => h(Badge, { content: 5 })],
    ['truncated', () => h(Badge, { content: 120, max: 99 })],
    ['hidden', () => h(Badge, { content: 5, hide: true })],
    ['truncated in a button', () => h(Button, null, () => ['Inbox ', h(Badge, { content: 120, max: 99 })])],
    ['empty', () => h(Badge)],
    ['badge in a button', () => h(Button, null, () => ['Inbox ', h(Badge, { content: 5 })])],
    [
      'container',
      () =>
        h(BadgeContainer, null, () => [
          h(Button, { 'aria-label': 'Notifications, 2 new' }, () => h('svg', { 'aria-hidden': 'true' })),
          h(Badge),
        ]),
    ],
  ])('has no axe violations: %s', async (_name, make) => {
    const { container } = mountView(make);
    expect((await axe(container)).violations).toEqual([]);
  });

  const markup = (): VNode =>
    h(BadgeContainer, { position: 'top-left' }, () => [
      h('button', { type: 'button' }, 'Inbox'),
      h(Badge, { content: 120, max: 99 }),
      h(Badge),
    ]);

  it('adds no role, aria-* or tabindex to the roots or the parts', () => {
    const { container } = mountView(markup);
    for (const element of container.querySelectorAll('div, span')) {
      const names = element.getAttributeNames();
      expect(names.filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'))).toEqual([]);
    }
  });

  it('is not tabbable and leaves the Tab order of the host unchanged', async () => {
    mountView(() => [
      h('button', { type: 'button' }, 'First'),
      h('button', { type: 'button' }, ['Second ', h(Badge, { content: 3 })]),
    ]);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('First');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Second 3');
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('emits per part only the data-* the meta declares', () => {
    const { container } = mountView(markup);
    const dataOf = (element: Element): string[] =>
      element.getAttributeNames().filter((name) => name.startsWith('data-'));
    const badges = container.querySelectorAll('.cck-badge');
    expect(badges).toHaveLength(2);
    for (const badge of badges) {
      expect(dataOf(badge).every((name) => badgeMeta.dataAttrs.root.includes(name))).toBe(true);
    }
    for (const part of container.querySelectorAll('.cck-badge__content, .cck-badge__max-indicator')) {
      expect(dataOf(part)).toEqual([]);
    }
    for (const root of container.querySelectorAll('.cck-badge-container'))
      expect(dataOf(root)).toEqual(['data-position']);
    expect(badgeContainerMeta.dataAttrs.root).toEqual(['data-position']);
    expect(badgeMeta.dataAttrs.content).toEqual([]);
    expect(badgeMeta.dataAttrs.maxIndicator).toEqual([]);
  });
});

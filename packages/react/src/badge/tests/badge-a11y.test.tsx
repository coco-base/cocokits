// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { badgeContainerMeta } from '@cocokits/machines/badge-container';
import { badgeMeta } from '@cocokits/machines/badge';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';

afterEach(cleanup);

describe('Badge accessibility', () => {
  it('becomes part of the name of the button it sits in', () => {
    render(
      <button type="button">
        Inbox <Badge content={5} />
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Inbox 5' })).toBeDefined();
  });

  it('reads a truncated badge as "99+" inside the name', () => {
    render(
      <button type="button">
        Inbox <Badge content={120} max={99} />
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Inbox 99+' })).toBeDefined();
  });

  it.each([
    ['badge', <Badge key="a" content={5} />],
    ['empty', <Badge key="b" />],
    ['hidden', <Badge key="c" content={5} hide />],
    ['truncated', <Badge key="t" content={120} max={99} />],
    [
      'truncated in a button',
      <button key="u" type="button">
        Inbox <Badge content={120} max={99} />
      </button>,
    ],
    [
      'badge in a button',
      <button key="d" type="button">
        Inbox <Badge content={5} />
      </button>,
    ],
    [
      'container with an icon-only button',
      <BadgeContainer key="e" position="top-right">
        <button type="button" aria-label="Notifications, 2 new">
          <svg aria-hidden="true" width="8" height="8" />
        </button>
        <Badge />
      </BadgeContainer>,
    ],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  const markup = (
    <BadgeContainer position="top-left">
      <button type="button">Inbox</button>
      <Badge content={120} max={99} />
      <Badge />
    </BadgeContainer>
  );

  it('adds no role, aria-* or tabindex to the roots or the parts', () => {
    const { container } = render(markup);
    for (const element of container.querySelectorAll('div, span')) {
      const names = element.getAttributeNames();
      expect(names.filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'))).toEqual([]);
    }
  });

  it('is not tabbable and leaves the Tab order of the host unchanged', async () => {
    render(
      <>
        <button type="button">First</button>
        <button type="button">
          Second <Badge content={3} />
        </button>
      </>,
    );
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('First');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Second 3');
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('emits per part only the data-* the meta declares', () => {
    const { container } = render(markup);
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
    for (const root of container.querySelectorAll('.cck-badge-container')) {
      expect(dataOf(root).every((name) => badgeContainerMeta.dataAttrs.root.includes(name))).toBe(true);
    }
    expect(badgeContainerMeta.dataAttrs.root).toEqual(['data-position']);
    expect(badgeMeta.dataAttrs.content).toEqual([]);
    expect(badgeMeta.dataAttrs.maxIndicator).toEqual([]);
  });
});

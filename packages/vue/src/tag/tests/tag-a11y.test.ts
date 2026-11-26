// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Tag } from '../index';
import { mountView, pick } from './fixtures';

afterEach(cleanup);

describe('Tag accessibility', () => {
  it.each<[string, () => VNode]>([
    ['text', () => h(Tag, null, () => 'Paid')],
    ['empty', () => h(Tag)],
    ['leading icon', () => h(Tag, null, () => [h('svg', { 'aria-hidden': 'true', width: 8, height: 8 }), 'Passed'])],
    ['in a line of text', () => h('p', null, ['Invoice 42 ', h(Tag, null, () => 'Paid')])],
    ['with role status', () => h(Tag, { role: 'status' }, () => 'Saved')],
  ])('has no axe violations: %s', async (_name, make) => {
    const { container } = mountView(make);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('adds no role, aria-* or tabindex', () => {
    const { container } = mountView(() => h(Tag, null, () => 'Paid'));
    const names = pick(container, '.cck-tag').getAttributeNames();
    expect(names.filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'))).toEqual([]);
  });

  it('becomes part of the name of the button it sits in', () => {
    mountView(() => h('button', { type: 'button' }, ['Plan ', h(Tag, null, () => 'Beta')]));
    expect(screen.getByRole('button', { name: 'Plan Beta' })).toBeDefined();
  });

  it('is not tabbable and leaves the Tab order unchanged', async () => {
    mountView(() => [
      h('button', { type: 'button' }, 'First'),
      h(Tag, null, () => 'Paid'),
      h('button', { type: 'button' }, 'Second'),
    ]);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('First');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Second');
  });
});

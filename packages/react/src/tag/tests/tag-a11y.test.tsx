// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Tag } from '../index';

afterEach(cleanup);

describe('Tag accessibility', () => {
  it.each([
    ['text', <Tag key="a">Paid</Tag>],
    ['empty', <Tag key="b" />],
    [
      'leading icon',
      <Tag key="c">
        <svg aria-hidden="true" width="8" height="8" />
        Passed
      </Tag>,
    ],
    [
      'in a line of text',
      <p key="d">
        Invoice 42 <Tag>Paid</Tag>
      </p>,
    ],
    [
      'with role status',
      <Tag key="e" role="status">
        Saved
      </Tag>,
    ],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('adds no role, aria-* or tabindex', () => {
    render(<Tag data-testid="tag">Paid</Tag>);
    const names = screen.getByTestId('tag').getAttributeNames();
    expect(names.filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'))).toEqual([]);
  });

  it('becomes part of the name of the button it sits in', () => {
    render(
      <button type="button">
        Plan <Tag>Beta</Tag>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Plan Beta' })).toBeDefined();
  });

  it('is not tabbable and leaves the Tab order unchanged', async () => {
    render(
      <>
        <button type="button">First</button>
        <Tag>Paid</Tag>
        <button type="button">Second</button>
      </>,
    );
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('First');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Second');
  });
});

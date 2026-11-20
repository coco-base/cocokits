// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Divider } from '../index';

afterEach(cleanup);

describe('Divider accessibility', () => {
  it('is a separator with its orientation', () => {
    render(
      <>
        <Divider aria-label="Sections" />
        <Divider orientation="vertical" aria-label="Toolbar" />
      </>,
    );
    expect(screen.getByRole('separator', { name: 'Sections' }).getAttribute('aria-orientation')).toBeNull();
    expect(screen.getByRole('separator', { name: 'Toolbar' }).getAttribute('aria-orientation')).toBe('vertical');
  });

  it('leaves the accessibility tree when decorative', () => {
    render(<Divider decorative />);
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it.each([
    ['horizontal', <Divider key="h" />],
    ['vertical', <Divider key="v" orientation="vertical" />],
    ['named', <Divider key="n" aria-label="Sections" />],
    ['decorative', <Divider key="d" decorative />],
    ['decorative vertical', <Divider key="dv" decorative orientation="vertical" />],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is not focusable: Tab goes from the button before it to the button after it', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Divider />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Before');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('After');
  });
});

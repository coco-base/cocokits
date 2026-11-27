// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { tabsMeta } from '@cocokits/machines/tabs';
import { Example } from './fixtures';

afterEach(cleanup);

describe('Tabs accessibility (axe)', () => {
  it('has no violations, also after a selection and with a disabled tab', async () => {
    const { container } = render(<Example defaultValue="account" lockPassword />);
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations when vertical', async () => {
    const { container } = render(<Example defaultValue="account" orientation="vertical" />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG tabs pattern: tablist, tab and tabpanel named by their tab', () => {
    render(<Example defaultValue="account" />);
    expect(screen.getByRole('tablist', { name: 'Account settings' })).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel', { name: 'Account' }).textContent).toBe('Account panel');
    expect(tabsMeta.roles).toMatchObject({ list: 'tablist', trigger: 'tab', panel: 'tabpanel' });
    expect(tabsMeta.apg).toContain('/patterns/tabs/');
  });
});

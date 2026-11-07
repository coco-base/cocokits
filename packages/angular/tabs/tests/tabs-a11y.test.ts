import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { tabsMeta } from '@cocokits/machines/tabs';
import { CckTabsImports } from '../index';

const imports = [...CckTabsImports];

const TEMPLATE = `
  <div cckTabs aria-label="Account settings">
    <div cckTab label="Account">Account body</div>
    <div cckTab label="Password">Password body</div>
    <div cckTab label="Locked" disabled>Locked body</div>
  </div>`;

describe('Tabs accessibility', () => {
  it('has no axe violations, also after a selection', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, { imports });
    expect((await axe(container)).violations).toEqual([]);
    await user.click(screen.getByRole('tab', { name: 'Password' }));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations when vertical', async () => {
    const { container } = await render(TEMPLATE.replace('cckTabs', 'cckTabs orientation="vertical"'), { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG tabs pattern: tablist, tab and tabpanel named by their tab', async () => {
    await render(TEMPLATE, { imports });
    expect(screen.getByRole('tablist', { name: 'Account settings' })).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    const panel = screen.getByRole('tabpanel', { name: 'Account' });
    expect(panel.textContent).toContain('Account body');
    expect(tabsMeta.roles).toMatchObject({ list: 'tablist', trigger: 'tab', panel: 'tabpanel' });
    expect(tabsMeta.apg).toContain('/patterns/tabs/');
  });
});

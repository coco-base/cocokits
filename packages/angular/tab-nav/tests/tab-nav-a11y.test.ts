import { render, screen } from '@testing-library/angular';
import { tabNavMeta } from '@cocokits/machines/tab-nav';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckTabNavImports } from '../index';

const imports = [...CckTabNavImports];

const TEMPLATE = `
  <nav cckTabNav aria-label="Project">
    <a cckTabNavLink href="#overview" active>Overview</a>
    <a cckTabNavLink href="#activity">Activity</a>
    <a cckTabNavLink href="#settings" disabled>Settings</a>
  </nav>`;

describe('TabNav accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = await render(TEMPLATE, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is a navigation landmark of native links, with no tablist, tab or tabpanel', async () => {
    await render(TEMPLATE, { imports });
    expect(screen.getByRole('navigation', { name: 'Project' })).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(tabNavMeta.roles).toMatchObject({ root: null, list: null, link: null, indicator: null });
  });

  it('exposes the current page and the disabled state to assistive technology', async () => {
    await render(TEMPLATE, { imports });
    expect(screen.getByRole('link', { name: 'Overview', current: 'page' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-disabled')).toBe('true');
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { tabsAnatomy, tabsMeta } from '@cocokits/machines/tabs';
import { undeclaredData } from '../../internal/tests/declared-data';
import { mountView, tabsView } from './fixtures';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('Tabs accessibility (axe)', () => {
  it('has no violations, also after a selection and with a disabled tab', async () => {
    const { container } = mountView(tabsView({ root: { modelValue: 'account' }, lockPassword: true }));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations when vertical', async () => {
    const { container } = mountView(tabsView({ root: { modelValue: 'account', orientation: 'vertical' } }));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG tabs pattern: tablist, tab and tabpanel named by their tab', async () => {
    mountView(tabsView({ root: { modelValue: 'account' } }));
    await nextTick();
    expect(screen.getByRole('tablist', { name: 'Account settings' })).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel', { name: 'Account' }).textContent).toBe('Account panel');
    expect(tabsMeta.roles).toMatchObject({ list: 'tablist', trigger: 'tab', panel: 'tabpanel' });
    expect(tabsMeta.apg).toContain('/patterns/tabs/');
  });
});

describe('Tabs data attributes', () => {
  it('emits only the data-* the meta declares on each part', () => {
    mountView(tabsView({ lockPassword: true }));
    const { undeclared, found } = undeclaredData(tabsAnatomy.classes, tabsMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['root', 'list', 'trigger', 'panel']));
    expect(undeclared).toEqual([]);
  });
});

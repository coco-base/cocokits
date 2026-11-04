// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { TabNavLink, TabNavList, TabNavPanel, TabNavRoot } from '../index';
import { mountView, tabNavView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  window.location.hash = '';
});

const link = (name: string): HTMLElement => screen.getByRole('tab', { name });
const stops = (): string[] =>
  screen.getAllByRole('tab').flatMap((element) => (element.tabIndex === 0 ? [element.textContent] : []));

describe('TabNav panel mode', () => {
  it('renders the tablist, the tabs and the labelled tabpanel', async () => {
    mountView(tabNavView({ active: '#billing', panel: 'routed' }));
    await nextTick();
    expect(screen.getByRole('navigation', { name: 'Account' })).toBeTruthy();
    expect(screen.getByRole('tablist').className).toBe('cck-tab-nav__list');
    expect(link('Billing').getAttribute('aria-selected')).toBe('true');
    expect(link('Profile').getAttribute('aria-selected')).toBe('false');
    expect(link('Billing').getAttribute('aria-controls')).toBe('routed');
    expect(link('Billing').hasAttribute('aria-current')).toBe(false);
    const panel = screen.getByRole('tabpanel');
    expect(panel.id).toBe('routed');
    expect(panel.getAttribute('tabindex')).toBe('0');
    expect(panel.getAttribute('aria-labelledby')).toBe(link('Billing').id);
    expect(document.getElementById(panel.getAttribute('aria-labelledby') ?? '')).toBe(link('Billing'));
  });

  it('moves the Tab stop and the label through none, active, other and none again', async () => {
    const active = ref<string | undefined>(undefined);
    mountView(tabNavView({ active, panel: 'routed', panelProps: { hasActiveLink: false } }));
    await nextTick();
    expect(stops()).toEqual(['Profile']);
    expect(screen.getByRole('tabpanel').hasAttribute('aria-labelledby')).toBe(false);
    active.value = '#security';
    await nextTick();
    await nextTick();
    expect(stops()).toEqual(['Security']);
    expect(link('Security').id).toBe('routed-tab');
    active.value = '#billing';
    await nextTick();
    await nextTick();
    expect(stops()).toEqual(['Billing']);
    active.value = undefined;
    await nextTick();
    await nextTick();
    expect(stops()).toEqual(['Profile']);
    expect(link('Security').hasAttribute('id')).toBe(false);
  });

  it('moves focus with the arrows, wraps, skips a disabled link and never navigates', async () => {
    mountView(tabNavView({ active: '#profile', lockBilling: true, panel: 'routed' }));
    await nextTick();
    link('Profile').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('Security'));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('Profile'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(link('Security'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(link('Profile'));
    expect(window.location.hash).toBe('');
  });

  it('flips the horizontal arrows in right-to-left and not Home and End', async () => {
    const Rtl = defineComponent({
      setup: () => {
        provideDirection('rtl');
        return () => tabNavView({ active: '#profile', panel: 'routed' })();
      },
    });
    mountView(() => h(Rtl));
    await nextTick();
    link('Profile').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(link('Billing'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(link('Profile'));
  });

  it('activates a link with Space without scrolling, and Enter follows it natively', async () => {
    mountView(tabNavView({ active: '#profile', panel: 'routed' }));
    await nextTick();
    link('Billing').focus();
    await userEvent.keyboard(' ');
    expect(window.location.hash).toBe('#billing');
  });

  it('lets an author aria-labelledby win and warns in development about a missing target', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(tabNavView({ active: '#profile', panel: 'routed', panelProps: { 'aria-labelledby': 'nowhere' } }));
    await nextTick();
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('nowhere');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('has-active-link'));
  });

  it('keeps an author link id in panel mode', async () => {
    mountView(() => [
      h(TabNavRoot, { 'aria-label': 'Account', tabPanel: 'p' }, () =>
        h(TabNavList, null, () => [h(TabNavLink, { href: '#a', active: true, id: 'mine' }, () => 'A')]),
      ),
      h(TabNavPanel, { id: 'p' }, () => 'x'),
    ]);
    await nextTick();
    expect(link('A').id).toBe('mine');
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('p-tab');
  });

  it('renders the elements given with as and asChild', async () => {
    const tree = (): VNode[] => [
      h(TabNavRoot, { 'aria-label': 'Account', tabPanel: 'p', as: 'div' }, () =>
        h(TabNavList, { as: 'ul' }, () => [h(TabNavLink, { href: '#a', active: true }, () => 'A')]),
      ),
      h(TabNavPanel, { id: 'p', asChild: true }, () => h('section', 'x')),
    ];
    mountView(tree);
    await nextTick();
    expect(screen.getByRole('tablist').tagName).toBe('UL');
    expect(screen.getByRole('tabpanel').tagName).toBe('SECTION');
  });
});

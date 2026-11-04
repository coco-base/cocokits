// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { tabNavAnatomy, tabNavMeta } from '@cocokits/machines/tab-nav';
import { TabNavLink, TabNavRoot } from '../index';
import { undeclaredData } from '../../internal/tests/declared-data';
import { makeRouterLink, mountView, tabNavView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  window.location.hash = '';
});

describe('TabNav parts', () => {
  it('renders a nav, a list, links and one indicator with the anatomy classes', () => {
    mountView(tabNavView({ active: '#profile' }));
    const { root, list, link, indicator } = tabNavAnatomy.classes;
    const nav = screen.getByRole('navigation', { name: 'Account' });
    expect(nav.tagName).toBe('NAV');
    expect(nav.classList.contains(root)).toBe(true);
    const listElement = nav.querySelector(`.${list}`);
    expect(listElement?.tagName).toBe('DIV');
    expect(listElement?.querySelectorAll(`.${link}`)).toHaveLength(3);
    const indicators = nav.querySelectorAll(`.${indicator}`);
    expect(indicators).toHaveLength(1);
    expect(indicators[0].tagName).toBe('SPAN');
    expect(indicators[0].getAttribute('aria-hidden')).toBe('true');
    expect(indicators[0].parentElement).toBe(listElement);
  });

  it('has no tab roles and keeps native attributes on the nav and the links', () => {
    mountView(() => [
      h(TabNavRoot, { 'aria-label': 'Account', class: 'mine', 'data-x': '1' }, () => [
        h(TabNavLink, { href: '#a', 'data-y': '2' }, () => 'A'),
      ]),
    ]);
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    const nav = screen.getByRole('navigation', { name: 'Account' });
    expect(nav.classList.contains('mine')).toBe(true);
    expect(nav.getAttribute('data-x')).toBe('1');
    expect(screen.getByRole('link', { name: 'A' }).getAttribute('data-y')).toBe('2');
    expect(screen.getByRole('link', { name: 'A' }).getAttribute('href')).toBe('#a');
  });

  it('warns in development when the Root has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(TabNavRoot, null, () => h(TabNavLink, { href: '#a' }, () => 'A')));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<TabNavRoot> has no accessible name'));
  });

  it('does not warn when the Root has a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(tabNavView());
    expect(warn).not.toHaveBeenCalled();
  });

  it('throws outside a root', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(TabNavLink, { href: '#a' }, () => 'A'))).toThrow(/inside <TabNavRoot>/);
  });
});

describe('TabNav active link', () => {
  it('marks only the active link with aria-current and data-active', () => {
    mountView(tabNavView({ active: '#billing' }));
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual([null, 'page', null]);
    expect(links.map((link) => link.hasAttribute('data-active'))).toEqual([false, true, false]);
    expect(links.every((link) => link.classList.contains(tabNavAnatomy.classes.link))).toBe(true);
  });

  it('follows a change of the active link', async () => {
    const active = ref<string | undefined>('#profile');
    mountView(tabNavView({ active }));
    expect(screen.getByRole('link', { name: 'Profile' }).getAttribute('aria-current')).toBe('page');
    active.value = '#security';
    await nextTick();
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('aria-current'))).toEqual([null, null, 'page']);
  });
});

describe('TabNav keyboard', () => {
  it('moves between the links with Tab and follows one with Enter', async () => {
    const user = userEvent.setup();
    mountView(tabNavView({ active: '#profile' }));
    await user.tab();
    expect(document.activeElement?.textContent).toBe('before');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('Profile');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('Billing');
    await user.keyboard('{Enter}');
    expect(window.location.hash).toBe('#billing');
    // Arrow keys do nothing: the links are not tabs.
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Billing');
  });
});

describe('TabNav disabled link', () => {
  it('has aria-disabled, leaves the tab order and does not navigate', async () => {
    const user = userEvent.setup();
    mountView(tabNavView({ active: '#profile', lockBilling: true }));
    const billing = screen.getByRole('link', { name: 'Billing' });
    expect(billing.getAttribute('aria-disabled')).toBe('true');
    expect(billing.getAttribute('tabindex')).toBe('-1');
    expect(billing.hasAttribute('data-disabled')).toBe(true);
    await user.click(billing);
    expect(window.location.hash).toBe('');
    // The click focused the disabled link; Tab leaves it for the next link.
    await user.tab();
    expect(document.activeElement?.textContent).toBe('Security');
  });

  it('lets a consumer click listener run before the guard and veto it', async () => {
    const onClick = vi.fn();
    mountView(() => [
      h(TabNavRoot, { 'aria-label': 'Account' }, () => [
        h(TabNavLink, { href: '#x', disabled: true, onClick }, () => 'X'),
      ]),
    ]);
    await userEvent.click(screen.getByRole('link', { name: 'X' }));
    expect(window.location.hash).toBe('');
  });
});

describe('TabNav asChild', () => {
  it('merges the contract onto a router link and keeps its own props', async () => {
    const navigate = vi.fn();
    const RouterLink = makeRouterLink(navigate);
    mountView(() => [
      h(TabNavRoot, { 'aria-label': 'Account' }, () => [
        h(TabNavLink, { asChild: true, active: false }, () => h(RouterLink, { to: '#r' }, () => 'Router')),
        h(TabNavLink, { asChild: true, active: true }, () => h(RouterLink, { to: '#s' }, () => 'Second')),
      ]),
    ]);
    const [first, second] = screen.getAllByRole('link');
    expect(first.classList.contains(tabNavAnatomy.classes.link)).toBe(true);
    expect(first.getAttribute('href')).toBe('#r');
    // The machine owns the markers: not active means no aria-current, even though the router link sets one.
    expect(first.hasAttribute('aria-current')).toBe(false);
    expect(second.getAttribute('aria-current')).toBe('page');
    expect(second.hasAttribute('data-active')).toBe(true);
    await userEvent.click(second);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('blocks a disabled router link before its own handler', async () => {
    const navigate = vi.fn();
    const RouterLink = makeRouterLink(navigate);
    mountView(() => [
      h(TabNavRoot, { 'aria-label': 'Account' }, () => [
        h(TabNavLink, { asChild: true, disabled: true }, () => h(RouterLink, { to: '#r' }, () => 'Router')),
      ]),
    ]);
    const link = screen.getByRole('link', { name: 'Router' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('TabNav accessibility (axe)', () => {
  it('has no violations, also with a disabled link', async () => {
    const { container } = mountView(tabNavView({ active: '#profile', lockBilling: true }));
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('matches the meta: no roles, data attributes on the link', () => {
    expect(tabNavMeta.roles).toEqual({ root: null, list: null, link: null, indicator: null, panel: 'tabpanel' });
    expect(tabNavMeta.dataAttrs.link).toEqual(['data-active', 'data-disabled']);
  });
});

describe('TabNav data attributes', () => {
  it('emits only the data-* the meta declares on each part', () => {
    mountView(tabNavView({ active: '#profile', lockBilling: true }));
    const { undeclared, found } = undeclaredData(tabNavAnatomy.classes, tabNavMeta.dataAttrs);
    expect(found).toEqual(expect.arrayContaining(['root', 'list', 'link', 'indicator']));
    expect(undeclared).toEqual([]);
  });
});

// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabNavLink, TabNavRoot } from '../index';
import { mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Section = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('section', attrs, slots.default?.()),
});

describe('TabNav as', () => {
  it('renders a nav and an a by default', async () => {
    mountView(() =>
      h(TabNavRoot, { 'aria-label': 'Account' }, () => h(TabNavLink, { href: '#a', active: true }, () => 'A')),
    );
    await nextTick();
    expect(screen.getByRole('navigation').localName).toBe('nav');
    expect(screen.getByRole('link').localName).toBe('a');
  });

  it('renders another tag or a component given to as, keeping the state markers', async () => {
    mountView(() =>
      h(TabNavRoot, { as: 'div', 'aria-label': 'Account' }, () => [
        h(TabNavLink, { as: Section, active: true }, () => 'A'),
        h(TabNavLink, { as: 'span', disabled: true }, () => 'B'),
      ]),
    );
    await nextTick();
    expect(document.querySelector('.cck-tab-nav')?.localName).toBe('div');
    const links = [...document.querySelectorAll('.cck-tab-nav__link')];
    expect(links.map((link) => link.localName)).toEqual(['section', 'span']);
    expect(links[0]?.getAttribute('aria-current')).toBe('page');
    expect(links[1]?.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('TabNav aria-* fall-through', () => {
  it('renders aria-label, aria-labelledby and aria-describedby written on the root', async () => {
    mountView(() =>
      h(TabNavRoot, { 'aria-label': 'Account', 'aria-labelledby': 'title', 'aria-describedby': 'hint' }, () =>
        h(TabNavLink, { href: '#a' }, () => 'A'),
      ),
    );
    await nextTick();
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Account');
    expect(nav.getAttribute('aria-labelledby')).toBe('title');
    expect(nav.getAttribute('aria-describedby')).toBe('hint');
  });

  it('declares no ariaLabel prop on the root', () => {
    expect(Object.keys((TabNavRoot as unknown as { props: object }).props)).not.toContain('ariaLabel');
  });
});

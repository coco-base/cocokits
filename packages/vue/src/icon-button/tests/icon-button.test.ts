// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iconButtonAnatomy } from '@cocokits/machines/icon-button';
import { ThemeProvider } from '@cocokits/vue-core';
import { linkForms, makeLink, mountView, iconThemeConfig } from './fixtures';
import { nextFrame } from '../../internal/tests/choice-helpers';
import { SvgIcon } from '../../svg-icon';
import * as entry from '../index';
import { IconButton } from '../index';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = '';
});

const navigate = vi.fn();
const forms = linkForms(makeLink(navigate), IconButton);

const plus = (): VNode => h(SvgIcon, { iconName: 'plus' });
const errors = (): string[] => vi.mocked(console.error).mock.calls.map(([text]) => String(text));
const unnamed = (): string[] => errors().filter((text) => text.includes('no accessible name'));

describe('@cocokits/vue/icon-button', () => {
  it('exports the component and its props type from the entry point', () => {
    expect(Object.keys(entry)).toEqual(['IconButton']);
  });

  it('renders a native button with the class and type="button", and no role', () => {
    mountView(() => h(IconButton, { 'aria-label': 'Add item' }, plus));
    const button = screen.getByRole('button', { name: 'Add item' });
    expect(button.tagName).toBe('BUTTON');
    expect([...button.classList]).toEqual([iconButtonAnatomy.classes.root]);
    expect(button.getAttribute('type')).toBe('button');
    for (const name of ['role', 'disabled', 'tabindex', 'data-disabled']) expect(button.hasAttribute(name)).toBe(false);
    expect(button.querySelector('.cck-svg-icon')).not.toBeNull();
  });

  it('disables the native button and lets a consumer type win', async () => {
    const onClick = vi.fn();
    mountView(() => [
      h(IconButton, { 'aria-label': 'Off', disabled: true, onClick }, plus),
      h(IconButton, { 'aria-label': 'Send', type: 'submit' }, plus),
    ]);
    const off = screen.getByRole('button', { name: 'Off' });
    expect(off.hasAttribute('disabled')).toBe(true);
    expect(off.getAttribute('data-disabled')).toBe('');
    await userEvent.click(off);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send' }).getAttribute('type')).toBe('submit');
  });

  it('renders the theme data-* of its own anatomy and falls class and attrs through', () => {
    mountView(() =>
      h(ThemeProvider, { themeConfig: iconThemeConfig }, () =>
        h(IconButton, { 'aria-label': 'Add', class: 'mine', id: 'x' }, plus),
      ),
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.getAttribute('data-size')).toBe('md');
    expect([...button.classList].sort()).toEqual(['cck-icon-button', 'mine']);
    expect(button.id).toBe('x');
  });

  it('exposes the element', () => {
    let exposed: { element: Element | null } | undefined;
    mountView(() =>
      h(IconButton, {
        'aria-label': 'Add',
        ref: (instance) => {
          exposed = instance as unknown as { element: Element | null };
        },
      }),
    );
    expect(exposed?.element).toBe(screen.getByRole('button'));
  });
});

describe.each(forms)('IconButton as a link (%s)', (_form, link) => {
  it('renders an <a> with the class, no type and no role', () => {
    mountView(() => link({ button: { 'aria-label': 'Open' } }));
    const anchor = screen.getByRole('link', { name: 'Open' });
    expect(anchor.tagName).toBe('A');
    expect(anchor.classList.contains('cck-icon-button')).toBe(true);
    for (const name of ['type', 'role', 'tabindex', 'disabled']) expect(anchor.hasAttribute(name)).toBe(false);
  });

  it('renders the disabled markers, and blocks click and Enter for every handler', async () => {
    const user = userEvent.setup();
    const button = vi.fn();
    const element = vi.fn();
    navigate.mockClear();
    mountView(() => link({ button: { disabled: true, onClick: button }, element: { onClick: element } }));
    const anchor = screen.getByRole('link', { name: 'Go' });
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.getAttribute('data-disabled')).toBe('');
    await user.click(anchor);
    anchor.focus();
    await user.keyboard('{Enter}');
    expect(window.location.hash).toBe('');
    expect([navigate, button, element].map((mock) => mock.mock.calls.length)).toEqual([0, 0, 0]);
  });

  it('lets a consumer capture handler veto the guard', async () => {
    const calls: string[] = [];
    mountView(() =>
      link({
        button: {
          disabled: true,
          onClickCapture: (event: Event) => {
            calls.push('capture');
            event.preventDefault();
          },
          onClick: () => calls.push('button'),
        },
      }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'Go' }));
    expect(calls).toEqual(['capture', 'button']);
  });
});

describe('IconButton name check (development)', () => {
  const cases: readonly [string, () => VNode, boolean][] = [
    ['no name', () => h(IconButton, null, plus), true],
    ['an aria-label', () => h(IconButton, { 'aria-label': 'Add' }, plus), false],
    [
      'an aria-labelledby',
      () => h('div', [h('span', { id: 'cap' }, 'Add'), h(IconButton, { 'aria-labelledby': 'cap' }, plus)]),
      false,
    ],
    [
      'a labelled SvgIcon inside',
      () => h(IconButton, null, () => h(SvgIcon, { iconName: 'plus', label: 'Add' })),
      false,
    ],
  ];
  it.each(cases)('with %s', async (_name, render, logs) => {
    mountView(() => h(ThemeProvider, { themeConfig: iconThemeConfig }, render));
    await nextFrame();
    await nextTick();
    expect(unnamed()).toHaveLength(logs ? 1 : 0);
    if (logs) expect(unnamed()[0]).toMatch(/^CocoKits: a IconButton has no accessible name\. Add an aria-label/);
  });

  it('logs no error in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mountView(() => h(IconButton, null, plus));
    await nextFrame();
    expect(unnamed()).toHaveLength(0);
    vi.unstubAllEnvs();
  });
});

describe('IconButton rendered kind (development)', () => {
  it('logs with its own name when a link is rendered on a button element', async () => {
    const NotLink: Component = { render: () => h('button', 'x') };
    mountView(() => h(IconButton, { as: NotLink, 'aria-label': 'x' }));
    await nextTick();
    expect(errors().some((text) => text.startsWith('CocoKits: <IconButton> renders a link'))).toBe(true);
  });
});

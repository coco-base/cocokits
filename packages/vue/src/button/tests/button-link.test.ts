// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { Button } from '../index';
import { linkForms, makeLink, mountView, type Extras } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  window.location.hash = '';
});

const navigate = vi.fn();
const LinkStub = makeLink(navigate);
const forms = linkForms(LinkStub);

describe.each(forms)('Button as a link (%s)', (_form, link) => {
  it('renders an <a> with the class, no type and no role', () => {
    mountView(() => link());
    const anchor = screen.getByRole('link', { name: 'Go' });
    expect(anchor.tagName).toBe('A');
    expect(anchor.classList.contains('cck-button')).toBe(true);
    expect(anchor.hasAttribute('type')).toBe(false);
    expect(anchor.hasAttribute('role')).toBe(false);
    expect(anchor.hasAttribute('tabindex')).toBe(false);
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(anchor.getAttribute('href')).toBe('#go');
  });

  it('follows on Enter and does nothing on Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    mountView(() => link({ button: { onClick } }));
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('#go');
  });

  it('keeps all props: class, aria-label and a data attribute', () => {
    mountView(() => link({ button: { class: 'mine', 'aria-label': 'Open', 'data-x': '1' } }));
    const anchor = screen.getByRole('link', { name: 'Open' });
    expect(anchor.classList.contains('cck-button')).toBe(true);
    expect(anchor.classList.contains('mine')).toBe(true);
    expect(anchor.getAttribute('data-x')).toBe('1');
  });

  describe('disabled', () => {
    it('renders the markers and keeps href', () => {
      mountView(() => link({ button: { disabled: true } }));
      const anchor = screen.getByRole('link', { name: 'Go' });
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
      expect(anchor.getAttribute('tabindex')).toBe('-1');
      expect(anchor.getAttribute('data-disabled')).toBe('');
      expect(anchor.getAttribute('href')).toBe('#go');
    });

    it('blocks click and Enter, and runs no handler of the Button, the element or an ancestor', async () => {
      const user = userEvent.setup();
      const button = vi.fn();
      const element = vi.fn();
      const ancestor = vi.fn();
      navigate.mockClear();
      mountView(() =>
        h('div', { onClick: ancestor }, [
          link({ button: { disabled: true, onClick: button }, element: { onClick: element } }),
        ]),
      );
      const anchor = screen.getByRole('link', { name: 'Go' });
      await user.click(anchor);
      anchor.focus();
      await user.keyboard('{Enter}');
      expect(window.location.hash).toBe('');
      expect(navigate).not.toHaveBeenCalled();
      expect([button, element, ancestor].map((mock) => mock.mock.calls.length)).toEqual([0, 0, 0]);
    });

    it('is skipped by Tab', async () => {
      const user = userEvent.setup();
      mountView(() => h('div', [link({ button: { disabled: true } }), h('button', 'after')]));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    });

    it('runs the consumer capture handler first and lets its preventDefault veto the guard', async () => {
      const calls: string[] = [];
      const extras = (veto: boolean): Extras => ({
        button: {
          disabled: true,
          onClickCapture: (event: Event) => {
            calls.push('capture');
            if (veto) event.preventDefault();
          },
          onClick: () => calls.push('button'),
        },
        element: { onClick: () => calls.push('element') },
      });
      mountView(() => link(extras(false)));
      await userEvent.click(screen.getByRole('link', { name: 'Go' }));
      expect(calls).toEqual(['capture']);

      cleanup();
      calls.length = 0;
      mountView(() => link(extras(true)));
      await userEvent.click(screen.getByRole('link', { name: 'Go' }));
      expect(calls[0]).toBe('capture');
      expect(calls).toContain('button');
      expect(window.location.hash).toBe('');
    });
  });
});

describe('Button asChild merging', () => {
  it('renders the first element child, with the child props winning and the class joined', () => {
    mountView(() =>
      h(Button, { asChild: true, class: 'ours', 'data-x': '1' }, () => [
        h('a', { href: '#child', class: 'child', 'data-x': '2' }, 'Go'),
      ]),
    );
    const anchor = screen.getByRole('link');
    expect(anchor.getAttribute('data-x')).toBe('2');
    expect([...anchor.classList].sort()).toEqual(['cck-button', 'child', 'ours']);
  });

  it('warns in development for two element children', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(Button, { asChild: true }, () => [h('a', { href: '#a' }, 'a'), h('a', { href: '#b' }, 'b')]));
    expect(warn.mock.calls.filter((call) => String(call[0]).startsWith('CocoKits:'))).toHaveLength(1);
  });
});

describe('Button kind check (development)', () => {
  const kindErrors = (spy: MockInstance<typeof console.error>): unknown[][] =>
    spy.mock.calls.filter((call) => typeof call[0] === 'string' && call[0].startsWith('CocoKits:'));
  const spyError = (): MockInstance<typeof console.error> =>
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

  it('logs a CocoKits error for as="div"', () => {
    const error = spyError();
    mountView(() => h(Button, { as: 'div' }, () => 'x'));
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it('logs a CocoKits error for a button child with asChild', () => {
    const error = spyError();
    mountView(() => h(Button, { asChild: true }, () => h('button', 'x')));
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it('logs a CocoKits error for a component that renders a <div>', () => {
    const error = spyError();
    const Box: Component = { render: () => h('div') };
    mountView(() => h(Button, { as: Box }, () => 'x'));
    expect(kindErrors(error).length).toBeGreaterThan(0);
  });

  it.each([
    ['the default button', (): VNode => h(Button, null, () => 'x')],
    ['as="button"', (): VNode => h(Button, { as: 'button' }, () => 'x')],
    ['as="a"', (): VNode => h(Button, { as: 'a', href: '#go' }, () => 'x')],
    ['an <a> child', (): VNode => h(Button, { asChild: true }, () => h('a', { href: '#go' }, 'x'))],
    ['a link component', (): VNode => h(Button, { as: LinkStub, to: '#go' }, () => 'x')],
  ])('logs nothing for %s', (_name, make) => {
    const error = spyError();
    mountView(make);
    expect(kindErrors(error)).toEqual([]);
  });

  it('logs nothing in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = spyError();
    mountView(() => h(Button, { as: 'div' }, () => 'x'));
    expect(kindErrors(error)).toEqual([]);
  });
});

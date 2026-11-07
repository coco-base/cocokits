// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { Comment, h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../index';
import { ThemeProvider } from '@cocokits/vue-core';
import { linkForms, makeLink, mountView, testThemeConfig } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = '';
});

const forms = linkForms(makeLink(vi.fn()));
const active = (): string | null | undefined => document.activeElement?.textContent;

describe.each(forms)('Tab order around a link (%s)', (_form, link) => {
  it('stops on an enabled link in both directions', async () => {
    const user = userEvent.setup();
    mountView(() => [h('button', 'before'), link(), h('button', 'after')]);
    await user.tab();
    await user.tab();
    expect(active()).toBe('Go');
    await user.tab();
    expect(active()).toBe('after');
    await user.tab({ shift: true });
    expect(active()).toBe('Go');
    await user.tab({ shift: true });
    expect(active()).toBe('before');
  });

  it('skips a disabled link in both directions', async () => {
    const user = userEvent.setup();
    mountView(() => [h('button', 'before'), link({ button: { disabled: true } }), h('button', 'after')]);
    await user.tab();
    await user.tab();
    expect(active()).toBe('after');
    await user.tab({ shift: true });
    expect(active()).toBe('before');
  });

  it('keeps the same keys and order in a right-to-left tree', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    mountView(() =>
      h('div', { dir: 'rtl' }, [
        h('button', 'before'),
        link({ button: { onClick } }),
        link({ button: { disabled: true, onClick } }),
        h('button', 'after'),
      ]),
    );
    await user.tab();
    await user.tab();
    expect(active()).toBe('Go');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(active()).toBe('after');
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(active()).toBe('before');
    await user.click(screen.getAllByRole('link')[1]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('re-enables a mounted link: markers go, activation returns, updates fire no click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const disabled = ref(true);
    const label = ref(0);
    mountView(() => h('div', { 'data-l': label.value }, [link({ button: { disabled: disabled.value, onClick } })]));
    const root = screen.getByRole('link');
    await user.click(root);
    expect(onClick).not.toHaveBeenCalled();
    disabled.value = false;
    await nextTick();
    expect(screen.getByRole('link')).toBe(root);
    for (const name of ['aria-disabled', 'tabindex', 'data-disabled']) expect(root.hasAttribute(name)).toBe(false);
    label.value = 1;
    await nextTick();
    expect(onClick).not.toHaveBeenCalled();
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    disabled.value = true;
    await nextTick();
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('tabindex')).toBe('-1');
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Tab order around a button', () => {
  it('skips a disabled button in both directions', async () => {
    const user = userEvent.setup();
    mountView(() => [h('button', 'before'), h(Button, { disabled: true }, () => 'Off'), h('button', 'after')]);
    await user.tab();
    await user.tab();
    expect(active()).toBe('after');
    await user.tab({ shift: true });
    expect(active()).toBe('before');
  });

  it('keeps the same keys in a right-to-left tree', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    mountView(() =>
      h('div', { dir: 'rtl' }, [
        h('button', 'before'),
        h(Button, { onClick }, () => 'Go'),
        h(Button, { disabled: true, onClick }, () => 'Off'),
        h('button', 'after'),
      ]),
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(active()).toBe('after');
    await user.tab({ shift: true });
    expect(active()).toBe('Go');
    await user.click(screen.getByRole('button', { name: 'Off' }));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('re-enables a mounted button: native disabled and markers go, clicks run, updates fire none', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const disabled = ref(true);
    const label = ref('Go');
    mountView(() => h(Button, { disabled: disabled.value, onClick }, () => label.value));
    const root = screen.getByRole<HTMLButtonElement>('button');
    expect(root.disabled).toBe(true);
    await user.click(root);
    expect(onClick).not.toHaveBeenCalled();
    disabled.value = false;
    await nextTick();
    expect(screen.getByRole('button')).toBe(root);
    expect(root.disabled).toBe(false);
    expect(root.hasAttribute('disabled')).toBe(false);
    expect(root.hasAttribute('data-disabled')).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    label.value = 'Go again';
    await nextTick();
    expect(onClick).not.toHaveBeenCalled();
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    disabled.value = true;
    await nextTick();
    expect(root.disabled).toBe(true);
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Button with asChild', () => {
  it('keeps the disabled markers when the child sets its own tabindex and aria-disabled', () => {
    mountView(() =>
      h(Button, { asChild: true, disabled: true }, () =>
        h('a', { href: '#go', tabindex: '0', 'aria-disabled': 'false' }, 'Go'),
      ),
    );
    const anchor = screen.getByRole('link');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.hasAttribute('data-disabled')).toBe(true);
  });

  it('lets the child keep its own tabindex while enabled, and clears a stale data-disabled', () => {
    mountView(() =>
      h(Button, { asChild: true }, () => h('a', { href: '#go', tabindex: '3', 'data-disabled': '' }, 'Go')),
    );
    const anchor = screen.getByRole('link');
    expect(anchor.getAttribute('tabindex')).toBe('3');
    expect(anchor.hasAttribute('data-disabled')).toBe(false);
  });

  it('leaves the theme attrs of an asChild child alone', () => {
    mountView(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () =>
        h(Button, { asChild: true }, () =>
          h('a', { href: '#go', 'data-variant': 'mine', 'data-size': 'xl', 'data-cck-color': 'custom' }, 'Go'),
        ),
      ),
    );
    const anchor = screen.getByRole('link');
    expect(['data-variant', 'data-size', 'data-cck-color'].map((name) => anchor.getAttribute(name))).toEqual([
      'mine',
      'xl',
      'custom',
    ]);
  });

  it('never takes data-disabled from a consumer attr', () => {
    mountView(() => [
      h(Button, { 'data-disabled': '' }, () => 'a'),
      h(Button, { as: 'a', href: '#x', 'data-disabled': '' }, () => 'b'),
    ]);
    expect(screen.getByRole('button').hasAttribute('data-disabled')).toBe(false);
    expect(screen.getByRole('link').hasAttribute('data-disabled')).toBe(false);
  });

  it('picks the first element child, not the text before it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(Button, { asChild: true }, () => ['intro ', h('a', { href: '#go' }, 'Go')]));
    const anchor = screen.getByRole('link');
    expect(anchor.classList.contains('cck-button')).toBe(true);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns for an empty and a text-only slot', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const warned = (): number => warn.mock.calls.filter((call) => String(call[0]).startsWith('CocoKits:')).length;
    mountView(() => h(Button, { asChild: true }, () => []));
    expect(warned()).toBe(1);
    cleanup();
    mountView(() => h(Button, { asChild: true }, () => 'text'));
    expect(warned()).toBe(2);
  });
});

describe('Button DOM exposure', () => {
  it('exposes the native button', () => {
    const button = ref<{ element: Element | null } | null>(null);
    mountView(() => h(Button, { ref: button }, () => 'Go'));
    expect(button.value?.element).toBe(screen.getByRole('button'));
  });

  it('exposes the element of an asChild child, also behind a leading comment', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const button = ref<{ element: Element | null } | null>(null);
    mountView(() =>
      h(Button, { ref: button, asChild: true }, () => [h(Comment, 'note'), h('a', { href: '#go' }, 'Go')]),
    );
    expect(button.value?.element).toBe(screen.getByRole('link'));
    expect(error).not.toHaveBeenCalled();
  });

  it('is null when the slot holds no element, even next to a sibling element', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const button = ref<{ element: Element | null } | null>(null);
    mountView(() => [
      h(Button, { ref: button, asChild: true }, () => [h(Comment, 'note')]),
      h('a', { href: '#x' }, 'x'),
    ]);
    expect(button.value?.element).toBeNull();
  });

  it('still logs the kind error for a <button> child behind a leading comment', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mountView(() => h(Button, { asChild: true }, () => [h(Comment, 'note'), h('button', 'x')]));
    expect(error.mock.calls.some((call) => String(call[0]).startsWith('CocoKits:'))).toBe(true);
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dialogMeta } from '@cocokits/machines/dialog';
import { DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../index';
import {
  boxAt,
  button,
  dialog,
  dialogView,
  mountView,
  open,
  pressOn,
  settle,
  stubOverlayBrowser,
  trigger,
} from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** Writes a header, a body and a footer inside the content. */
const withParts = () => [
  h(DialogHeader, null, () => [
    h(DialogTitle, null, () => 'Delete project'),
    h(DialogClose, { 'aria-label': 'Close' }, () => 'x'),
  ]),
  h(DialogBody, null, () => h(DialogDescription, null, () => 'This cannot be undone.')),
  h(DialogFooter, null, () => h('button', { type: 'button' }, 'Delete')),
];

describe('Dialog parts (dialog-01)', () => {
  it('renders header, body and footer as plain divs with the part classes and no role', async () => {
    mountView(dialogView({ inner: withParts }));
    await open();
    for (const [name, tag] of [
      ['header', 'DIV'],
      ['body', 'DIV'],
      ['footer', 'DIV'],
    ] as const) {
      const part = document.querySelector(`.cck-dialog__${name}`);
      expect(part?.tagName, name).toBe(tag);
      expect(part?.hasAttribute('role'), name).toBe(false);
      expect(
        part?.getAttributeNames().filter((attr) => attr.startsWith('data-')),
        name,
      ).toEqual([]);
    }
    expect(dialogMeta.defaultElements).toMatchObject({ header: 'div', body: 'div', footer: 'div' });
    expect(dialogMeta.roles).toMatchObject({ header: null, body: null, footer: null });
  });

  it('keeps the title as the name of the dialog and the Close in the header', async () => {
    mountView(dialogView({ inner: withParts }));
    await open();
    expect(screen.getByRole('dialog', { name: 'Delete project', description: 'This cannot be undone.' })).toBe(
      dialog(),
    );
    expect(document.querySelector('.cck-dialog__header')?.contains(button('Close'))).toBe(true);
  });

  it('renders the element of as on a part', async () => {
    mountView(
      dialogView({ inner: () => [h(DialogTitle, null, () => 'T'), h(DialogFooter, { as: 'footer' }, () => 'x')] }),
    );
    await open();
    expect(document.querySelector('.cck-dialog__footer')?.tagName).toBe('FOOTER');
  });
});

describe('Dialog size members (dialog-03)', () => {
  it.each([
    { member: 'width', value: 480, style: 'width: 480px' },
    { member: 'height', value: '50vh', style: 'height: 50vh' },
    { member: 'minWidth', value: '20rem', style: 'min-width: 20rem' },
    { member: 'minHeight', value: 120, style: 'min-height: 120px' },
    { member: 'maxWidth', value: '90vw', style: 'max-width: 90vw' },
    { member: 'maxHeight', value: 600, style: 'max-height: 600px' },
  ])('$member $value becomes the inline $style on the content', async ({ member, value, style }) => {
    mountView(dialogView({ rootProps: { [member]: value } }));
    await open();
    expect(dialog()?.getAttribute('style')).toContain(style);
  });

  it('writes no style without a size member, and keeps the style of the author', async () => {
    mountView(dialogView({}));
    await open();
    expect(dialog()?.hasAttribute('style')).toBe(false);
    cleanup();
    mountView(dialogView({ rootProps: { width: 300 }, contentProps: { style: 'color: red' } }));
    await open();
    expect(dialog()?.getAttribute('style')).toContain('width: 300px');
    expect(dialog()?.getAttribute('style')).toContain('color: red');
  });
});

describe('Dialog role (dialog-03)', () => {
  it('writes only alertdialog; a plain dialog keeps the native role', async () => {
    mountView(dialogView({ rootProps: { role: 'alertdialog' } }));
    await open();
    expect(document.querySelector('dialog')?.getAttribute('role')).toBe('alertdialog');
    expect(screen.getByRole('alertdialog')).toBe(document.querySelector('dialog'));
    cleanup();
    mountView(dialogView({ rootProps: { role: 'dialog' } }));
    await open();
    expect(dialog()?.hasAttribute('role')).toBe(false);
  });
});

describe('Dialog disableClose and closePredicate (dialog-03)', () => {
  /** A press on the backdrop: the dialog element itself, outside its box. */
  function pressBackdrop(): void {
    const element = dialog();
    if (!element) throw new Error('no dialog');
    boxAt(element);
    pressOn(element, { clientX: 10, clientY: 10 });
  }

  it('leaves the dialog open on Escape and on a press on the backdrop, and closes with Close', async () => {
    mountView(dialogView({ rootProps: { disableClose: true } }));
    await open();
    await userEvent.keyboard('{Escape}');
    pressBackdrop();
    await settle();
    expect(dialog()).not.toBeNull();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(dialog()).toBeNull();
  });

  it.each([
    {
      name: 'Escape',
      reason: 'escape',
      act: async () => {
        await userEvent.keyboard('{Escape}');
      },
    },
    {
      name: 'the Close part',
      reason: 'close',
      act: async () => {
        await userEvent.click(button('Cancel'));
      },
    },
  ])('asks the predicate with the reason for $name and keeps the dialog open on false', async ({ reason, act }) => {
    const closePredicate = vi.fn(() => false);
    mountView(dialogView({ rootProps: { closePredicate } }));
    await open();
    await act();
    await settle();
    expect(closePredicate).toHaveBeenCalledOnce();
    expect((closePredicate.mock.calls[0] as unknown as [{ reason: string; event: Event }])[0].reason).toBe(reason);
    expect(dialog()).not.toBeNull();
  });

  it('closes when the predicate says true, and never runs it for a change of v-model:open', async () => {
    const closePredicate = vi.fn(() => true);
    mountView(dialogView({ rootProps: { closePredicate } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    expect(closePredicate).toHaveBeenCalledOnce();
  });

  it('runs disableClose before the predicate', async () => {
    const closePredicate = vi.fn(() => true);
    mountView(dialogView({ rootProps: { disableClose: true, closePredicate } }));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(closePredicate).not.toHaveBeenCalled();
    expect(dialog()).not.toBeNull();
  });
});

describe('Dialog restoreFocus and autoFocus (dialog-03)', () => {
  it('restores the focus to the trigger by default and to nothing with false', async () => {
    mountView(dialogView({}));
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(document.activeElement).toBe(trigger());
    cleanup();
    mountView(dialogView({ rootProps: { restoreFocus: false } }));
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(document.activeElement).not.toBe(trigger());
  });

  it('restores the focus to the element a selector or an element names', async () => {
    mountView(() => [
      h('button', { id: 'elsewhere' }, 'elsewhere'),
      ...dialogView({ rootProps: { restoreFocus: '#elsewhere' } })(),
    ]);
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(document.activeElement?.id).toBe('elsewhere');
    cleanup();
    const target = document.body.appendChild(document.createElement('button'));
    mountView(dialogView({ rootProps: { restoreFocus: target } }));
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(document.activeElement).toBe(target);
  });

  it('focuses the dialog itself with autoFocus "dialog" and a heading with "first-heading"', async () => {
    mountView(dialogView({ rootProps: { autoFocus: 'dialog' } }));
    await open();
    expect(dialog()?.hasAttribute('autofocus')).toBe(true);
    cleanup();
    mountView(dialogView({ rootProps: { autoFocus: 'first-heading' } }));
    await open();
    expect(document.activeElement?.tagName).toBe('H2');
    cleanup();
    mountView(
      dialogView({
        rootProps: { autoFocus: '#first-link' },
        inner: () => [
          h(DialogTitle, null, () => 'T'),
          h('a', { href: '#a', id: 'first-link' }, 'a'),
          h('input', { 'aria-label': 'x' }),
        ],
      }),
    );
    await open();
    expect(document.activeElement?.id).toBe('first-link');
  });

  it('leaves the browser focusing steps with the default and with "first-tabbable"', async () => {
    mountView(dialogView({ rootProps: { autoFocus: 'first-tabbable' } }));
    await open();
    expect(dialog()?.hasAttribute('autofocus')).toBe(false);
    expect(document.activeElement?.textContent).toBe('First');
  });
});

describe('Dialog closeOnNavigation (dialog-03)', () => {
  it.each([
    { name: 'the default', props: {}, closes: true },
    { name: 'true', props: { closeOnNavigation: true }, closes: true },
    { name: 'pop-state', props: { closeOnNavigation: 'pop-state' }, closes: true },
    { name: 'false', props: { closeOnNavigation: false }, closes: false },
  ])('$name: a popstate closes the dialog: $closes', async ({ props, closes }) => {
    mountView(dialogView({ rootProps: props }));
    await open();
    window.dispatchEvent(new PopStateEvent('popstate'));
    await nextTick();
    await settle();
    expect(dialog() === null).toBe(closes);
  });

  it('skips disableClose and the predicate on navigation, and a hash change closes it too', async () => {
    const closePredicate = vi.fn(() => false);
    mountView(dialogView({ rootProps: { disableClose: true, closePredicate } }));
    await open();
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await settle();
    expect(dialog()).toBeNull();
    expect(closePredicate).not.toHaveBeenCalled();
  });

  it('stops listening once the dialog is closed', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    mountView(dialogView({}));
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    const added = add.mock.calls.filter(([name]) => name === 'popstate').length;
    const removed = remove.mock.calls.filter(([name]) => name === 'popstate').length;
    expect(added).toBeGreaterThan(0);
    expect(removed).toBe(added);
  });
});

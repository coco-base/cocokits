// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp, h, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogClose, DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../index';
import { dialogView, mountView, settle, stubOverlayBrowser } from './fixtures';

let mounted: App | undefined;
beforeEach(stubOverlayBrowser);
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Delete' });
const dialogs = (): HTMLDialogElement[] => Array.from(document.querySelectorAll('dialog'));
const dialog = (): HTMLDialogElement => {
  const found = document.querySelector('dialog');
  if (!found) throw new Error('No dialog in the document.');
  return found;
};

async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

describe('Dialog modal', () => {
  it('is modal by default: the native modal dialog, the page locked', async () => {
    mountView(dialogView({}));
    await open();
    expect(dialog().hasAttribute('open')).toBe(true);
    expect(dialog().hasAttribute('data-modal')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('hidden');
  });

  describe('with modal off', () => {
    const view = (contentProps: Record<string, unknown> = {}, rootProps: Record<string, unknown> = {}) =>
      dialogView({ rootProps: { modal: false, ...rootProps }, contentProps });

    it('opens the dialog non-modal and leaves the page unlocked', async () => {
      mountView(view());
      await open();
      expect(dialog().hasAttribute('open')).toBe(true);
      expect(dialog().hasAttribute('data-modal')).toBe(false);
      expect(dialog().hasAttribute('aria-modal')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('overflow')).not.toBe('hidden');
      expect(document.querySelector('[inert]')).toBeNull();
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      mountView(view());
      await open();
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(document.activeElement).toBe(trigger());
    });

    it('closes on a press outside and leaves focus where the press put it', async () => {
      const onUpdate = vi.fn();
      mountView(view({}, { 'onUpdate:open': onUpdate }));
      await open();
      await userEvent.click(screen.getByRole('button', { name: 'after' }));
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
      expect(onUpdate.mock.calls).toEqual([[true], [false]]);
    });

    it('does not move focus to the trigger after a press on empty space', async () => {
      mountView(view());
      await open();
      await userEvent.click(document.body);
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(document.activeElement).not.toBe(trigger());
    });

    it('closes when focus moves outside', async () => {
      mountView(view());
      await open();
      screen.getByRole('button', { name: 'after' }).focus();
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    });

    it('keeps the dialog open when a listener refuses the press or the focus', async () => {
      mountView(
        view({
          onPointerDownOutside: (event: Event) => {
            event.preventDefault();
          },
          onFocusOutside: (event: Event) => {
            event.preventDefault();
          },
        }),
      );
      await open();
      await userEvent.click(screen.getByRole('button', { name: 'after' }));
      await settle();
      expect(dialogs()).toHaveLength(1);
    });

    it('treats a press on the trigger as a toggle, not an outside press', async () => {
      const onUpdate = vi.fn();
      mountView(view({}, { 'onUpdate:open': onUpdate }));
      await open();
      await userEvent.click(trigger());
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(onUpdate.mock.calls).toEqual([[true], [false]]);
      expect(document.activeElement).toBe(trigger());
    });

    it('returns focus to the trigger after the Close part', async () => {
      mountView(view());
      await open();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await settle();
      expect(dialogs()).toHaveLength(0);
      expect(document.activeElement).toBe(trigger());
    });

    it('opens the next time modal again when `modal` turns on while it is closed', async () => {
      const modal = ref(false);
      mountView(() => dialogView({ rootProps: { modal: modal.value } })());
      await open();
      await userEvent.keyboard('{Escape}');
      await settle();
      modal.value = true;
      await settle();
      await open();
      expect(dialog().hasAttribute('data-modal')).toBe(true);
    });
  });
});

describe('Dialog forceMount', () => {
  const makeApp = (rootProps: Record<string, unknown>, contentProps: Record<string, unknown>): App =>
    createSSRApp({
      render: () =>
        h(DialogRoot, rootProps, () => [
          h(DialogTrigger, null, () => 'Delete'),
          h(DialogContent, contentProps, () => [
            h(DialogTitle, null, () => 'Delete project'),
            h('input', { 'aria-label': 'Reason' }),
            h(DialogClose, null, () => 'Cancel'),
          ]),
        ]),
    });

  it.each([
    ['forceMount', {}, { forceMount: true }],
    ['unmountOnHide off', { unmountOnHide: false }, {}],
  ])(
    'with %s, renders nothing on the server and hydrates without a mismatch',
    async (_name, rootProps, contentProps) => {
      const html = await renderToString(makeApp(rootProps, contentProps));
      expect(html).not.toContain('<dialog');
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const container = document.body.appendChild(document.createElement('div'));
      container.innerHTML = html;
      mounted = makeApp(rootProps, contentProps);
      mounted.mount(container);
      expect(container.innerHTML).toBe(html);
      await settle();
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(dialogs()).toHaveLength(1);
      expect(dialog().hasAttribute('open')).toBe(false);
      expect(dialog().getAttribute('data-state')).toBe('closed');
      expect(container.querySelector('button')?.getAttribute('aria-controls')).toBe(dialog().id);
    },
  );

  it.each([
    ['forceMount', {}, { forceMount: true }],
    ['unmountOnHide off', { unmountOnHide: false }, {}],
  ])(
    'with %s, keeps the same closed dialog across open and close, with its state',
    async (_name, rootProps, contentProps) => {
      mountView(
        dialogView({
          rootProps,
          contentProps,
          inner: () => [
            h(DialogTitle, null, () => 'Delete project'),
            h('input', { 'aria-label': 'Reason' }),
            h(DialogClose, null, () => 'Cancel'),
          ],
        }),
      );
      await settle();
      const element = dialog();
      expect(element.hasAttribute('open')).toBe(false);
      expect(document.documentElement.style.getPropertyValue('overflow')).not.toBe('hidden');
      await open();
      expect(dialog()).toBe(element);
      expect(element.hasAttribute('open')).toBe(true);
      expect(element.hasAttribute('data-modal')).toBe(true);
      const input = element.querySelector('input');
      if (!input) throw new Error('No input.');
      input.value = 'kept';
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(dialog()).toBe(element);
      expect(element.hasAttribute('open')).toBe(false);
      expect(element.getAttribute('data-state')).toBe('closed');
      expect(element.querySelector('input')).toBe(input);
      expect(input.value).toBe('kept');
      expect(document.documentElement.style.getPropertyValue('overflow')).not.toBe('hidden');
      expect(document.activeElement).toBe(trigger());
      await open();
      expect(dialog()).toBe(element);
      expect(element.hasAttribute('open')).toBe(true);
    },
  );

  it('removes the dialog on close by default', async () => {
    mountView(dialogView({}));
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialogs()).toHaveLength(0);
  });

  it('opens a force-mounted dialog non-modal with `modal` off', async () => {
    mountView(dialogView({ rootProps: { modal: false }, contentProps: { forceMount: true } }));
    await settle();
    await open();
    expect(dialog().hasAttribute('open')).toBe(true);
    expect(dialog().hasAttribute('data-modal')).toBe(false);
  });
});

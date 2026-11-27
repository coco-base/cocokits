// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
import { menu, mountView, settle, stubOverlayBrowser } from './fixtures';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const menuParts = (): ReturnType<typeof h>[] => [
  h(MenuRoot, null, () => [
    h(MenuTrigger, null, () => 'Actions'),
    h(MenuContent, null, () => [h(MenuItem, null, () => 'Edit'), h(MenuItem, null, () => 'Delete')]),
  ]),
];

describe('Menu inside a Popover', () => {
  beforeEach(stubOverlayBrowser);

  it('closes only the menu on Escape, then the popover on the next', async () => {
    const popoverOpen = ref(true);
    mountView(() => [
      h(
        PopoverRoot,
        { open: popoverOpen.value, 'onUpdate:open': (value: boolean) => (popoverOpen.value = value) },
        () => [h(PopoverTrigger, null, () => 'Share'), h(PopoverContent, { 'aria-label': 'Share' }, () => menuParts())],
      ),
    ]);
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await settle();
    expect(menu()).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(menu()).toBeNull();
    expect(popoverOpen.value).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(popoverOpen.value).toBe(false);
  });

  it('keeps the popover open on a press inside it that closes the menu', async () => {
    mountView(() => [
      h(PopoverRoot, { defaultOpen: true }, () => [
        h(PopoverTrigger, null, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share' }, () => [...menuParts(), h('p', 'text')]),
      ]),
    ]);
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await settle();
    await userEvent.click(screen.getByText('text'));
    await settle();
    expect(menu()).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });
});

describe('Menu inside a modal Dialog', () => {
  beforeEach(stubOverlayBrowser);

  it('renders inside the dialog, is not inert, and an item keeps the dialog open', async () => {
    mountView(() =>
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Edit profile'),
        h(DialogContent, { 'aria-label': 'Profile' }, () => menuParts()),
      ]),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    const dialog = await waitFor(() => {
      const found = document.querySelector('dialog[open]');
      if (!found) throw new Error('The dialog is not open yet.');
      return found;
    });
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await settle();
    const content = menu();
    expect(content).not.toBeNull();
    expect(dialog.contains(content)).toBe(true);
    expect(content?.closest('[inert]')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(menu()).toBeNull();
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await settle();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    await settle();
    expect(menu()).toBeNull();
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));
  });
});

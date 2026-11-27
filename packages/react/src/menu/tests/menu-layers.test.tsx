// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../../dialog';
import { Popover } from '../../popover';
import { Menu } from '../index';
import { expectFocus, item, menu, stubModalTopLayer } from './fixtures';

beforeEach(stubModalTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

describe('Menu inside a Popover', () => {
  it('closes only the menu on Escape, then the Popover on the next one', async () => {
    const onMenu = vi.fn();
    const onPopover = vi.fn();
    render(
      <StrictMode>
        <Popover.Root onOpenChange={onPopover}>
          <Popover.Trigger>Settings</Popover.Trigger>
          <Popover.Content aria-label="Settings panel">
            <Menu.Root onOpenChange={onMenu}>
              <Menu.Trigger>Actions</Menu.Trigger>
              <Menu.Content>
                <Menu.Item>Edit</Menu.Item>
                <Menu.Item>Duplicate</Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </Popover.Content>
        </Popover.Root>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Actions' }));
    await expectFocus(item('Edit'));
    onPopover.mockClear();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
    expect(onPopover).not.toHaveBeenCalled();
    expect(onMenu).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'escape' }));
    await expectFocus(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('keeps the Popover open when a press lands inside the menu', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Content aria-label="Settings panel">
          <Menu.Root>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item disabled>Move</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Actions' }));
    await userEvent.click(item('Move'));
    expect(menu()).not.toBeNull();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });
});

describe('Menu inside a modal Dialog', () => {
  it('opens in the dialog, is not inert and runs its items', async () => {
    const onSelect = vi.fn();
    render(
      <Dialog.Root>
        <Dialog.Trigger>Edit profile</Dialog.Trigger>
        <Dialog.Content aria-label="Profile">
          <Menu.Root>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item onSelect={onSelect}>Rename</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Actions' }));
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    const dialog = screen.getByRole('dialog', { name: 'Profile' });
    expect(dialog.contains(menu())).toBe(true);
    expect(menu()?.closest('[inert]')).toBeNull();
    await userEvent.click(item('Rename'));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeTruthy();
  });
});

// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { DialogClose, DialogContent, DialogRoot, DialogTrigger } from '../index';
import { button, mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

describe('Dialog nesting', () => {
  it('opens a dialog from a dialog inside the outer one; Escape closes the inner only, focus goes back to its trigger and the lock stays', async () => {
    mountView(() => [
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Outer'),
        h(DialogContent, { 'aria-label': 'Outer dialog' }, () => [
          h(DialogRoot, null, () => [
            h(DialogTrigger, null, () => 'Inner'),
            h(DialogContent, { 'aria-label': 'Inner dialog' }, () => h(DialogClose, null, () => 'Done')),
          ]),
        ]),
      ]),
    ]);
    await userEvent.click(button('Outer'));
    await settle();
    const outer = screen.getByRole('dialog', { name: 'Outer dialog' });
    await userEvent.click(button('Inner'));
    await settle();
    const inner = screen.getByRole('dialog', { name: 'Inner dialog' });
    expect(outer.contains(inner)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Outer dialog' }).isConnected).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(button('Inner'));
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('returns focus to the Trigger that opened a dialog, whatever had focus (Safari does not focus a pressed button)', async () => {
    mountView(() => [
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Outer'),
        h(DialogContent, { 'aria-label': 'Outer dialog' }, () => [
          h('input', { 'aria-label': 'Name' }),
          h(DialogRoot, null, () => [
            h(DialogTrigger, null, () => 'Inner'),
            h(DialogContent, { 'aria-label': 'Inner dialog' }, () => h(DialogClose, null, () => 'Done')),
          ]),
        ]),
      ]),
    ]);
    await userEvent.click(button('Outer'));
    await settle();
    screen.getByRole('textbox', { name: 'Name' }).focus();
    button('Inner').click(); // a click without the focus a mouse press gives a button in Safari
    await settle();
    expect(screen.getByRole('dialog', { name: 'Inner dialog' }).isConnected).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(document.activeElement).toBe(button('Inner'));
  });

  it('nests a Popover opened inside the Dialog: its host is in the dialog, a press in it is inside, Escape closes it first', async () => {
    mountView(() => [
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'Delete project' }, () => [
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'More'),
            h(PopoverContent, { 'aria-label': 'More options' }, () => h('button', 'Inside popover')),
          ]),
        ]),
      ]),
    ]);
    await userEvent.click(button('Delete'));
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Delete project' });
    await userEvent.click(button('More'));
    await settle();
    const popover = screen.getByRole('dialog', { name: 'More options' });
    expect(dialog.contains(popover)).toBe(true);
    await userEvent.click(button('Inside popover'));
    await settle();
    expect(screen.getByRole('dialog', { name: 'More options' }).isConnected).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog', { name: 'More options' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

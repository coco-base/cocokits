// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusReturnOptions } from '@cocokits/cdk/focus';
import { Menu } from '../../menu';
import { Popover } from '../../popover';
import { Dialog } from '../index';
import { closed, nextFrame, stubTopLayer } from './fixtures';

// Each captured focus return, and whether it was restored or destroyed: until then the cdk keeps it.
const { returns } = vi.hoisted(() => ({ returns: [] as { released: boolean }[] }));

vi.mock('@cocokits/cdk/focus', async (importOriginal) => {
  const original = await importOriginal<typeof import('@cocokits/cdk/focus')>();
  return {
    ...original,
    captureFocusReturn: (options: FocusReturnOptions) => {
      const focusReturn = original.captureFocusReturn(options);
      const entry = { released: false };
      returns.push(entry);
      return {
        restore: () => {
          entry.released = true;
          focusReturn.restore();
        },
        destroy: () => {
          entry.released = true;
          focusReturn.destroy();
        },
      };
    },
  };
});

beforeEach(() => {
  stubTopLayer();
  returns.length = 0;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** Resolves once every captured focus return is restored or destroyed. */
async function allReleased(): Promise<void> {
  await nextFrame();
  await nextFrame();
  expect(returns.length).toBeGreaterThan(0);
  expect(returns.filter((entry) => !entry.released)).toHaveLength(0);
}

describe('A focus return that is not used is released', () => {
  it('by a Dialog with restoreFocus false', async () => {
    render(
      <StrictMode>
        <Dialog.Root restoreFocus={false}>
          <Dialog.Trigger>Rename</Dialog.Trigger>
          <Dialog.Content aria-label="Rename project">
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await closed();
    await allReleased();
  });

  it('by a Popover whose onCloseAutoFocus prevents the return', async () => {
    render(
      <StrictMode>
        <Popover.Root>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content
            aria-label="Share link"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            <button>copy</button>
          </Popover.Content>
        </Popover.Root>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await nextFrame();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await allReleased();
  });

  it('by a Menu whose effect StrictMode ran twice', async () => {
    render(
      <StrictMode>
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Edit</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    await allReleased();
  });
});

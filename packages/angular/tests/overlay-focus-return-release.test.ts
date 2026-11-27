import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusReturnOptions } from '@cocokits/cdk/focus';
import { CckDialogImports } from '../dialog';
import { stubOverlayApis } from '../dialog/tests/overlay-stubs';
import { CckMenuImports } from '../menu';
import { CckPopoverImports } from '../popover';

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

const imports = [...CckMenuImports, ...CckPopoverImports, ...CckDialogImports];

const OVERLAYS = [
  {
    name: 'Menu',
    trigger: 'cckMenuTriggerFor',
    content: '<cck-menu-content aria-label="Removed"><cck-menu-item>Edit</cck-menu-item></cck-menu-content>',
    role: 'menu',
  },
  {
    name: 'Popover',
    trigger: 'cckPopoverTriggerFor',
    content: '<cck-popover-content aria-label="Removed">Text</cck-popover-content>',
    role: 'dialog',
  },
  {
    name: 'Dialog',
    trigger: 'cckDialogTriggerFor',
    content:
      '<dialog cckDialogContent aria-label="Removed"><button cckDialogClose type="button">Close</button></dialog>',
    role: 'dialog',
  },
] as const;

const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** Resolves once every captured focus return is restored or destroyed. */
async function allReleased(): Promise<void> {
  await nextFrame();
  await nextFrame();
  expect(returns.length).toBeGreaterThan(0);
  expect(returns.filter((entry) => !entry.released)).toHaveLength(0);
}

beforeEach(() => {
  stubOverlayApis();
  returns.length = 0;
});
afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, 'fullscreenElement');
});

describe.each(OVERLAYS)('the focus return of a $name', (overlay) => {
  it('is released when the trigger is removed with @if while the overlay is open', async () => {
    const shown = signal(true);
    const open = signal(false);
    const { fixture } = await render(
      `@if (shown()) {
        <button type="button" [${overlay.trigger}]="removed" [(open)]="open">Removed</button>
      }
      <ng-template #removed>${overlay.content}</ng-template>`,
      { imports, componentProperties: { shown, open } },
    );
    open.set(true);
    fixture.detectChanges();
    await screen.findByRole(overlay.role, { name: 'Removed' });
    shown.set(false);
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryByRole(overlay.role, { name: 'Removed' })).toBeNull();
    });
    await allReleased();
  });
});

describe('the focus return of a Popover with restoreFocus false', () => {
  it('is released when the popover closes', async () => {
    const user = userEvent.setup();
    await render(
      `<button type="button" [cckPopoverTriggerFor]="share" [restoreFocus]="false">Share</button>
      <ng-template #share><cck-popover-content aria-label="Share link">Text</cck-popover-content></ng-template>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByRole('dialog', { name: 'Share link' });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Share link' })).toBeNull();
    });
    await allReleased();
  });
});

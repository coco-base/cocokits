import { Component, input } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { menuAnatomy } from '@cocokits/machines/menu';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { trigger } from './queries';

const { classes } = menuAnatomy;

@Component({
  imports: [...CckMenuImports, CckDir],
  template: `
    <div cckDir [dir]="dir()">
      <ng-container cckMenu (closed)="log.push('closed:' + $event.reason)">
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal>
          <cck-menu-content>
            <cck-menu-item (triggered)="log.push('Edit')">Edit</cck-menu-item>
            <ng-container cckMenuSub>
              <cck-menu-sub-trigger>Share</cck-menu-sub-trigger>
              <ng-template cckMenuPortal>
                <cck-menu-sub-content>
                  <cck-menu-item (triggered)="log.push('Email')">Email</cck-menu-item>
                  <cck-menu-item>Link</cck-menu-item>
                </cck-menu-sub-content>
              </ng-template>
            </ng-container>
            <cck-menu-item>Delete</cck-menu-item>
          </cck-menu-content>
        </ng-template>
      </ng-container>
    </div>
  `,
})
class Host {
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly log: string[] = [];
}

type User = ReturnType<typeof userEvent.setup>;
const subTrigger = (): HTMLElement => screen.getByRole('menuitem', { name: 'Share' });
const subMenu = (): HTMLElement | null => screen.queryByRole('menu', { name: 'Share' });
const openRoot = async (): Promise<User> => {
  const user = userEvent.setup();
  await user.click(trigger());
  await screen.findByRole('menu');
  // The menu moves the focus to its first item a frame after it opens.
  await waitFor(() => {
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
  });
  return user;
};

describe('Menu submenu', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the sub-trigger with its role, popup and state, and no sub-content while closed', async () => {
    await render(Host);
    await openRoot();
    const share = subTrigger();
    expect(share.classList.contains(classes.subTrigger)).toBe(true);
    expect(share.getAttribute('aria-haspopup')).toBe('menu');
    expect(share.getAttribute('aria-expanded')).toBe('false');
    expect(share.getAttribute('data-state')).toBe('closed');
    expect(share.hasAttribute('aria-controls')).toBe(false);
    expect(subMenu()).toBeNull();
  });

  const openers = [
    { name: 'a click', dir: 'ltr', act: (user: User) => user.click(subTrigger()) },
    { name: 'Enter', dir: 'ltr', act: (user: User) => user.keyboard('{Enter}') },
    { name: 'Space', dir: 'ltr', act: (user: User) => user.keyboard(' ') },
    { name: 'Right Arrow', dir: 'ltr', act: (user: User) => user.keyboard('{ArrowRight}') },
    { name: 'Left Arrow in right-to-left text', dir: 'rtl', act: (user: User) => user.keyboard('{ArrowLeft}') },
  ] as const;
  it.each(openers)('opens the submenu with $name and focuses its first item', async ({ dir, act }) => {
    await render(Host, { componentInputs: { dir } });
    const user = await openRoot();
    subTrigger().focus();
    await act(user);
    const menu = await screen.findByRole('menu', { name: 'Share' });
    expect(menu.classList.contains(classes.subContent)).toBe(true);
    expect(subTrigger().getAttribute('aria-expanded')).toBe('true');
    expect(subTrigger().getAttribute('aria-controls')).toBe(menu.id);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Email' }));
    });
  });

  it('closes only the submenu with Escape and returns the focus to the sub-trigger', async () => {
    await render(Host);
    const user = await openRoot();
    subTrigger().focus();
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Email' }));
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(subMenu()).toBeNull();
    });
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    await waitFor(() => {
      expect(document.activeElement).toBe(subTrigger());
    });
  });

  const closers = [
    { name: 'Left Arrow', dir: 'ltr', key: '{ArrowLeft}' },
    { name: 'Right Arrow in right-to-left text', dir: 'rtl', key: '{ArrowRight}' },
  ] as const;
  it.each(closers)('closes the submenu with $name and focuses the sub-trigger', async ({ dir, key }) => {
    await render(Host, { componentInputs: { dir } });
    const user = await openRoot();
    subTrigger().focus();
    await user.keyboard(dir === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Email' }));
    });
    await user.keyboard(key);
    await waitFor(() => {
      expect(subMenu()).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(subTrigger());
    });
  });

  it('opens when the pointer rests on the sub-trigger and closes when it moves to another item', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      await render(Host);
      const user = await openRoot();
      await user.hover(subTrigger());
      await vi.advanceTimersByTimeAsync(300);
      await screen.findByRole('menu', { name: 'Share' });
      await user.hover(screen.getByRole('menuitem', { name: 'Delete' }));
      await waitFor(() => {
        expect(subMenu()).toBeNull();
      });
      expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes the whole menu when an item of the submenu runs', async () => {
    const { fixture } = await render(Host);
    const user = await openRoot();
    subTrigger().focus();
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    await user.click(screen.getByRole('menuitem', { name: 'Email' }));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['Email', 'closed:item']);
  });

  it('closes the submenu when the parent menu closes', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    await screen.findByRole('menu');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    });
    subTrigger().focus();
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    await user.click(trigger());
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });
});

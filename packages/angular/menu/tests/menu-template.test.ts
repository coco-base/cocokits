import { Component, input, signal, viewChild, type TemplateRef } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { CckTooltip, CckTooltipImports } from '@cocokits/angular/tooltip';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { item, trigger } from './queries';

@Component({
  selector: 'app-menu-button',
  imports: [...CckMenuImports],
  template: `<button [cckMenuTriggerFor]="menu()">Actions</button>`,
})
class MenuButton {
  readonly menu = input.required<TemplateRef<unknown>>();
}

/** The template is declared here and opened by the trigger of a child component. */
@Component({
  imports: [...CckMenuImports, MenuButton],
  template: `
    <app-menu-button [menu]="menu" />
    <ng-template #menu>
      <cck-menu-content><cck-menu-item (triggered)="log.push('Edit')">Edit</cck-menu-item></cck-menu-content>
    </ng-template>
  `,
})
class PassedDown {
  readonly log: string[] = [];
}

@Component({
  imports: [...CckMenuImports, ...CckTooltipImports],
  template: `
    <button cckTooltip="More actions" [cckMenuTriggerFor]="menu">Actions</button>
    <ng-template #menu>
      <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
    </ng-template>
  `,
})
class WithTooltip {
  readonly tooltip = viewChild.required(CckTooltip);
}

@Component({
  imports: [...CckMenuImports],
  template: `
    <button [cckMenuTriggerFor]="menu" (closed)="log.push('closed:' + $event.reason)">Actions</button>
    <ng-template #menu>
      <cck-menu-content>
        <cck-menu-item>Edit</cck-menu-item>
        <cck-menu-sub-trigger [cckMenuTriggerFor]="share" [(open)]="shareOpen">Share</cck-menu-sub-trigger>
        <ng-template #share>
          <cck-menu-sub-content>
            <cck-menu-item>Email</cck-menu-item>
            <cck-menu-sub-trigger [cckMenuTriggerFor]="more">More</cck-menu-sub-trigger>
            <ng-template #more>
              <cck-menu-sub-content>
                <cck-menu-item (triggered)="log.push('Print')">Print</cck-menu-item>
              </cck-menu-sub-content>
            </ng-template>
          </cck-menu-sub-content>
        </ng-template>
      </cck-menu-content>
    </ng-template>
  `,
})
class TwoLevels {
  readonly shareOpen = signal(false);
  readonly log: string[] = [];
}

const openRoot = async (): Promise<ReturnType<typeof userEvent.setup>> => {
  const user = userEvent.setup();
  await user.click(trigger());
  await screen.findByRole('menu');
  await waitFor(() => {
    expect(document.activeElement).toBe(item('Edit'));
  });
  return user;
};

describe('Menu template given to the trigger', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens a template declared in a parent component; its items run in the context of that parent', async () => {
    const { fixture } = await render(PassedDown);
    const user = await openRoot();
    await user.click(item('Edit'));
    expect(fixture.componentInstance.log).toEqual(['Edit']);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('keeps the menu and a tooltip on one button apart: each renders in its own overlay host', async () => {
    const { fixture } = await render(WithTooltip);
    await openRoot();
    const bubble = (): Element | null => document.querySelector(`.${tooltipAnatomy.classes.content}`);
    fixture.componentInstance.tooltip().show(0);
    await waitFor(() => {
      expect(bubble()).not.toBeNull();
    });
    const menu = screen.getByRole('menu');
    expect(bubble()?.closest('[popover]')).not.toBe(menu.closest('[popover]'));
    fixture.componentInstance.tooltip().hide(0);
    await waitFor(() => {
      expect(bubble()).toBeNull();
    });
    expect(screen.getByRole('menu')).toBe(menu);
  });

  it('opens a submenu inside a submenu, each by its own template; an item at the second level closes all', async () => {
    const { fixture } = await render(TwoLevels);
    const user = await openRoot();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    expect(fixture.componentInstance.shareOpen()).toBe(true);
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Email'));
    });
    await user.keyboard('{ArrowDown}{ArrowRight}');
    await screen.findByRole('menu', { name: 'More' });
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Print'));
    });
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.queryAllByRole('menu')).toHaveLength(0);
    });
    expect(fixture.componentInstance.log).toEqual(['Print', 'closed:item']);
  });

  it('opens the submenu from the open model written on the sub-trigger', async () => {
    const { fixture } = await render(TwoLevels);
    await openRoot();
    fixture.componentInstance.shareOpen.set(true);
    expect(await screen.findByRole('menu', { name: 'Share' })).toBeTruthy();
  });

  it('refuses a content that is not inside the template of a trigger', async () => {
    await expect(render(`<cck-menu-content></cck-menu-content>`, { imports: [...CckMenuImports] })).rejects.toThrow(
      'must be placed inside the template of a cckMenuTriggerFor',
    );
  });
});

describe('Menu with an overlay in its content', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a press in a Popover inside the menu content keeps the menu open; Escape there closes only the Popover', async () => {
    await render(
      `<button [cckMenuTriggerFor]="menu">Actions</button>
      <ng-template #menu>
        <cck-menu-content>
          <cck-menu-item>Edit</cck-menu-item>
          <ng-container cckPopover>
            <button cckPopoverTrigger>Details</button>
            <ng-template cckPopoverPortal><cck-popover-content aria-label="Details">Text</cck-popover-content></ng-template>
          </ng-container>
        </cck-menu-content>
      </ng-template>`,
      { imports: [...CckMenuImports, ...CckPopoverImports] },
    );
    const user = await openRoot();
    await user.click(screen.getByRole('button', { name: 'Details' }));
    await user.click(await screen.findByText('Text'));
    expect(screen.queryByRole('menu')).not.toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Details' })).not.toBeNull();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Details' })).toBeNull();
    });
    expect(screen.queryByRole('menu')).not.toBeNull();
  });
});

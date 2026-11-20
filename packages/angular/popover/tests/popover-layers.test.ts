import { Component, afterNextRender, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '@cocokits/angular/tooltip';
import { CckPopoverImports, type PopoverChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckPopoverImports, ...CckTooltipImports, CckDir];

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
});

/** An open Tooltip on a button inside an open Popover, both written by the page. */
@Component({
  imports,
  template: `
    <button>after</button>
    <ng-container
      cckPopover
      [(open)]="popoverOpen"
      (opened)="log.push('popover:' + $event.reason)"
      (closed)="log.push('popover:' + $event.reason)"
    >
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content aria-label="Share link">
          <p>Anyone with the link can view.</p>
          <ng-container cckTooltip>
            <button cckTooltipTrigger>Copy</button>
            <ng-template cckTooltipPortal><cck-tooltip-content>Copy the link</cck-tooltip-content></ng-template>
          </ng-container>
        </cck-popover-content>
      </ng-template>
    </ng-container>
  `,
})
class Stack {
  readonly popoverOpen = signal(true);
  readonly tooltip = viewChild.required(CckTooltip);
  readonly log: string[] = [];

  constructor() {
    afterNextRender(() => {
      this.tooltip().show(0);
    });
  }
}

describe('Tooltip over a Popover', () => {
  it('closes both on a press outside, the tooltip first', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Stack);
    await screen.findByRole('tooltip');
    await user.click(screen.getByRole('button', { name: 'after' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(fixture.componentInstance.log).toEqual(['popover:outside-press']);
  });

  it('closes only the tooltip on a press inside the popover', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Stack);
    await screen.findByRole('tooltip');
    await user.click(screen.getByText('Anyone with the link can view.'));
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Share link' }).isConnected).toBe(true);
    expect(fixture.componentInstance.popoverOpen()).toBe(true);
    expect(fixture.componentInstance.log).toEqual([]);
  });
});

@Component({
  imports,
  template: `
    <div cckDir [dir]="dir()">
      <ng-container cckPopover [open]="true">
        <button cckPopoverTrigger>Share</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Share link" side="start">
            <button (click)="dir.set('rtl')">flip</button>
          </cck-popover-content>
        </ng-template>
      </ng-container>
    </div>
  `,
})
class Flip {
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
  readonly details: (PopoverChangeDetails & { value: boolean })[] = [];
}

describe('Popover direction', () => {
  it('follows a dir change on the page while open', async () => {
    const user = userEvent.setup();
    await render(Flip);
    const content = await screen.findByRole('dialog', { name: 'Share link' });
    const host = content.closest('[popover="manual"]');
    expect(host?.getAttribute('dir')).toBe('ltr');
    await user.click(screen.getByRole('button', { name: 'flip' }));
    await waitFor(() => {
      expect(host?.getAttribute('dir')).toBe('rtl');
    });
    expect(content.getAttribute('data-side')).toBe('start');
  });
});

describe('Popover initial focus', () => {
  it('prefers a later [autofocus] element over the first tabbable', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover>
        <button cckPopoverTrigger>Share</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Share link"><button>first</button><button autofocus>second</button></cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'second' }));
    });
  });
});

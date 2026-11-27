import { Component, input, signal, viewChild, type TemplateRef } from '@angular/core';
import { CckTooltip, CckTooltipImports } from '@cocokits/angular/tooltip';
import { popoverAnatomy } from '@cocokits/machines/popover';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame } from './queries';

@Component({
  selector: 'app-share-button',
  imports: [...CckPopoverImports],
  template: `<button [cckPopoverTriggerFor]="panel()">Share</button>`,
})
class ShareButton {
  readonly panel = input.required<TemplateRef<unknown>>();
}

/** The template is declared here and given to a trigger inside a child component. */
@Component({
  imports: [...CckPopoverImports, ShareButton],
  template: `
    <app-share-button [panel]="share" />
    <ng-template #share>
      <cck-popover-content aria-label="Share this page">
        <button (click)="log.push('copy')">Copy link</button>
        <button cckPopoverClose>Close</button>
      </cck-popover-content>
    </ng-template>
  `,
})
class PassedDown {
  readonly log: string[] = [];
}

/** Root inputs written as static attributes on the trigger. */
@Component({
  imports: [...CckPopoverImports],
  template: `
    <button [cckPopoverTriggerFor]="share" disableClose restoreFocus="false" [(open)]="open">Share</button>
    <ng-template #share>
      <cck-popover-content aria-label="Share this page"><button cckPopoverClose>Close</button></cck-popover-content>
    </ng-template>
  `,
})
class StaticMembers {
  readonly open = signal(false);
}

/** A short-form tooltip and a popover on one button. */
@Component({
  imports: [...CckPopoverImports, ...CckTooltipImports],
  template: `
    <button [cckPopoverTriggerFor]="share" cckTooltip="Share this page">Share</button>
    <ng-template #share>
      <cck-popover-content aria-label="Share panel">Anyone with the link can view it.</cck-popover-content>
    </ng-template>
  `,
})
class WithTooltip {
  readonly tooltip = viewChild.required(CckTooltip);
}

describe('Popover template given to the trigger', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens a template declared in a parent component; its content runs in the context of that parent', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(PassedDown);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.click(await screen.findByRole('button', { name: 'Copy link' }));
    expect(fixture.componentInstance.log).toEqual(['copy']);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('takes the root inputs from the trigger and leaves no static root input on the button', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(StaticMembers);
    const trigger = screen.getByRole('button', { name: 'Share' });
    expect(trigger.hasAttribute('disableclose')).toBe(false);
    expect(trigger.hasAttribute('restorefocus')).toBe(false);
    await user.click(trigger);
    await screen.findByRole('dialog', { name: 'Share this page' });
    // disableClose keeps it open on Escape.
    await user.keyboard('{Escape}');
    await frame();
    expect(fixture.componentInstance.open()).toBe(true);
    // restoreFocus="false" keeps the focus away from the trigger after the close button.
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).not.toBe(trigger);
  });

  it('keeps the popover and a short-form tooltip on one button apart, each in its own overlay host', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(WithTooltip);
    const trigger = screen.getByRole('button', { name: 'Share' });
    await user.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Share panel' });
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.classList.contains(popoverAnatomy.classes.trigger)).toBe(true);

    const bubble = (): Element | null => document.querySelector(`.${tooltipAnatomy.classes.content}`);
    fixture.componentInstance.tooltip().show(0);
    await waitFor(() => {
      expect(bubble()).not.toBeNull();
    });
    expect(bubble()?.closest('[popover]')).not.toBe(panel.closest('[popover]'));
    const description = document.getElementById(trigger.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toBe('Share this page');
    fixture.componentInstance.tooltip().hide(0);
    await waitFor(() => {
      expect(bubble()).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Share panel' })).toBe(panel);
  });
});

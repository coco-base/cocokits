import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckMenuImports } from '@cocokits/angular/menu';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

/** The shown content; it is aria-hidden while the hidden copy of its text describes the trigger. */
const shownContent = (): Promise<HTMLElement> =>
  waitFor(() => {
    const content = document.querySelector<HTMLElement>(`.${tooltipAnatomy.classes.content}[data-state="open"]`);
    if (!content) throw new Error('no shown tooltip');
    return content;
  });
const described = (trigger: HTMLElement): string | undefined =>
  document.getElementById(trigger.getAttribute('aria-describedby') ?? '')?.textContent.trim();

/** The rich root reached through `#tip="cckTooltip"` on the trigger. */
const callReference = {
  template: `
    <button [cckTooltipTriggerFor]="save" cckTooltipShowDelay="5000" #tip="cckTooltip">Save</button>
    <ng-template #save>
      <cck-tooltip-content><cck-tooltip-title>Save the draft</cck-tooltip-title></cck-tooltip-content>
    </ng-template>
    <button type="button" (click)="tip.show(0)">Show</button>
  `,
  imports: [...CckTooltipImports],
};

/** A rich tooltip and a popover on one button. */
const richWithPopover = {
  template: `
    <button [cckPopoverTriggerFor]="share" [cckTooltipTriggerFor]="tip">Share</button>
    <ng-template #share>
      <cck-popover-content aria-label="Share panel">Anyone with the link can view it.</cck-popover-content>
    </ng-template>
    <ng-template #tip>
      <cck-tooltip-content><cck-tooltip-title>Share this page</cck-tooltip-title></cck-tooltip-content>
    </ng-template>
  `,
  imports: [...CckPopoverImports, ...CckTooltipImports],
};

/** A short-form tooltip and a menu on one button; the menu refuses Escape. */
const shortWithMenu = {
  template: `
    <button cckTooltip="More actions" [cckMenuTriggerFor]="menu" disableClose>Actions</button>
    <ng-template #menu>
      <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
    </ng-template>
  `,
  imports: [...CckMenuImports, ...CckTooltipImports],
};

/** A short-form tooltip on a menu sub-trigger. */
const onSubTrigger = {
  template: `
    <button [cckMenuTriggerFor]="menu">Actions</button>
    <ng-template #menu>
      <cck-menu-content>
        <cck-menu-sub-trigger [cckMenuTriggerFor]="share" cckTooltip="Share with others">Share</cck-menu-sub-trigger>
        <ng-template #share>
          <cck-menu-sub-content><cck-menu-item>Email</cck-menu-item></cck-menu-sub-content>
        </ng-template>
      </cck-menu-content>
    </ng-template>
  `,
  imports: [...CckMenuImports, ...CckTooltipImports],
};

describe('Tooltip trigger with a template', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gives the root to a reference on the trigger, so show(0) opens it at once', async () => {
    const user = userEvent.setup();
    await render(callReference.template, { imports: callReference.imports });
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(trigger.hasAttribute('cckTooltip')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect((await shownContent()).textContent.trim()).toBe('Save the draft');
    expect(described(trigger)).toBe('Save the draft');
  });

  it('leaves the id and data-state of a popover trigger on the same button to the popover', async () => {
    const user = userEvent.setup();
    await render(richWithPopover.template, { imports: richWithPopover.imports });
    const trigger = screen.getByRole('button', { name: 'Share' });
    const id = trigger.id;
    expect(id).toMatch(/^cck-popover-/);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    await user.tab();
    await shownContent();
    expect(described(trigger)).toBe('Share this page');
    expect(trigger.id).toBe(id);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    await user.click(trigger);
    const panel = await screen.findByRole('dialog', { name: 'Share panel' });
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(trigger.getAttribute('data-state')).toBe('open');
    expect(trigger.id).toBe(id);
  });

  it('closes on Escape although the menu on the same button has disableClose, and keeps the menu ids', async () => {
    const user = userEvent.setup();
    await render(shortWithMenu.template, { imports: shortWithMenu.imports });
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.id).toMatch(/^cck-menu-/);
    expect(trigger.hasAttribute('cckTooltipDisableClose')).toBe(false);
    await user.tab();
    await shownContent();
    expect(described(trigger)).toBe('More actions');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector(`.${tooltipAnatomy.classes.content}`)).toBeNull();
    });
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.getAttribute('data-state')).toBe('open');
  });

  it('keeps the id of a menu sub-trigger, so the submenu stays labelled by it', async () => {
    const user = userEvent.setup();
    await render(onSubTrigger.template, { imports: onSubTrigger.imports });
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const subTrigger = await screen.findByRole('menuitem', { name: 'Share' });
    expect(subTrigger.id).toMatch(/^cck-menu-/);
    await waitFor(() => {
      expect(document.activeElement).toBe(subTrigger);
    });
    await user.keyboard('{ArrowRight}');
    const sub = await screen.findByRole('menu', { name: 'Share' });
    expect(sub.getAttribute('aria-labelledby')).toBe(subTrigger.id);
    expect(subTrigger.getAttribute('data-state')).toBe('open');
  });
});

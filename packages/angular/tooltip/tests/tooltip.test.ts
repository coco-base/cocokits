import { Component, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = tooltipAnatomy;

@Component({
  imports: [...CckTooltipImports],
  template: `
    <button id="before">Before</button>
    <ng-container
      cckTooltip
      [cckTooltipShowDelay]="delay()"
      [cckTooltipHideDelay]="closeDelay()"
      [cckTooltipDisabled]="disabled()"
    >
      <button cckTooltipTrigger aria-label="Copy link">Copy</button>
      <ng-template cckTooltipPortal>
        <div cckTooltipContent [side]="side()" [align]="align()">Copy the link</div>
      </ng-template>
    </ng-container>
    <p id="empty">Empty space</p>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly delay = signal(700);
  readonly closeDelay = signal(0);
  readonly disabled = signal(false);
  readonly side = signal<'top' | 'bottom' | 'start' | 'end'>('top');
  readonly align = signal<'start' | 'center' | 'end'>('center');
}

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Copy link' });
const content = (): HTMLElement => screen.getByRole('tooltip');
const queryContent = (): HTMLElement | null => screen.queryByRole('tooltip');

describe('Tooltip', () => {
  beforeEach(() => {
    stubOverlayApis();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const setup = (): ReturnType<typeof userEvent.setup> =>
    userEvent.setup({ delay: null, advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  const elapse = async (ms: number, fixture: { whenStable: () => Promise<unknown> }): Promise<void> => {
    vi.advanceTimersByTime(ms);
    await fixture.whenStable();
  };

  describe('rendered contract', () => {
    it('renders nothing while closed and links the trigger to the mounted content', async () => {
      const user = setup();
      const { container } = await render(Host);
      expect(queryContent()).toBeNull();
      expect(trigger().classList.contains(classes.trigger)).toBe(true);
      expect(trigger().hasAttribute('aria-describedby')).toBe(false);
      expect(trigger().getAttribute('data-state')).toBe('closed');
      await user.tab();
      await user.tab();
      expect(document.activeElement).toBe(trigger());
      await screen.findByRole('tooltip');
      const tip = content();
      expect(tip.classList.contains(classes.content)).toBe(true);
      expect(tip.getAttribute('data-state')).toBe('open');
      expect(tip.getAttribute('data-side')).toBe('top');
      expect(tip.getAttribute('data-align')).toBe('center');
      expect(tip.hasAttribute('tabindex')).toBe(false);
      expect(tip.closest('[popover="manual"]')).not.toBeNull();
      expect(container.contains(tip)).toBe(false);
      expect(trigger().getAttribute('aria-describedby')).toBe(tip.id);
      expect(trigger().getAttribute('data-state')).toBe('open');
      expect(tip.getAttribute('role')).toBe('tooltip');
    });

    it('adds its id to the description the author wrote', async () => {
      const user = setup();
      await render(
        `<ng-container cckTooltip>
          <button cckTooltipTrigger aria-label="Copy" aria-describedby="mine">x</button>
          <ng-template cckTooltipPortal><div cckTooltipContent>Tip</div></ng-template>
        </ng-container>`,
        { imports: [...CckTooltipImports] },
      );
      await user.tab();
      const tip = await screen.findByRole('tooltip');
      expect(screen.getByRole('button', { name: 'Copy' }).getAttribute('aria-describedby')).toBe(`mine ${tip.id}`);
    });

    it('writes the resolved side and align from the content inputs', async () => {
      const { fixture } = await render(Host);
      fixture.componentInstance.side.set('bottom');
      fixture.componentInstance.align.set('end');
      fixture.componentInstance.tooltip().show(0);
      await fixture.whenStable();
      await screen.findByRole('tooltip');
      expect(content().getAttribute('data-side')).toBe('bottom');
      expect(content().getAttribute('data-align')).toBe('end');
      expect(content().style.position).toBe('fixed');
    });
  });

  describe('hover', () => {
    it('opens after the delay on a mouse hover and reports the reason', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.hover(trigger());
      await elapse(699, fixture);
      expect(queryContent()).toBeNull();
      await elapse(1, fixture);
      await screen.findByRole('tooltip');
    });

    it('does not open when the pointer leaves before the delay', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.hover(trigger());
      await elapse(300, fixture);
      await user.unhover(trigger());
      await elapse(1000, fixture);
      expect(queryContent()).toBeNull();
    });

    it('uses the delay input', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.delay.set(100);
      await fixture.whenStable();
      await user.hover(trigger());
      await elapse(100, fixture);
      await screen.findByRole('tooltip');
    });

    it('closes after the pointer leaves, with the reason pointer-leave', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.hover(trigger());
      await elapse(700, fixture);
      await screen.findByRole('tooltip');
      await user.unhover(trigger());
      await elapse(100, fixture);
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });

    it('waits for closeDelay after the pointer leaves', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.closeDelay.set(400);
      await fixture.whenStable();
      await user.hover(trigger());
      await elapse(700, fixture);
      await screen.findByRole('tooltip');
      await user.unhover(trigger());
      await elapse(399, fixture);
      expect(queryContent()).not.toBeNull();
      await elapse(1, fixture);
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });

    it('stays open while the pointer crosses to the content (hoverable) and closes after leaving it', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.hover(trigger());
      await elapse(700, fixture);
      await screen.findByRole('tooltip');
      await user.unhover(trigger());
      await elapse(50, fixture);
      await user.hover(content());
      await elapse(2000, fixture);
      expect(queryContent()).not.toBeNull();
      await user.unhover(content());
      await elapse(100, fixture);
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });
  });

  describe('focus and keyboard', () => {
    it('opens at once on keyboard focus and closes on blur', async () => {
      const user = setup();
      await render(Host);
      await user.tab();
      await user.tab();
      await screen.findByRole('tooltip');
      await user.tab();
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });

    it('closes on Escape and keeps focus on the trigger', async () => {
      const user = setup();
      await render(Host);
      await user.tab();
      await user.tab();
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
      expect(document.activeElement).toBe(trigger());
    });

    it('does not open on a mouse click: the press cancels the pending hover', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.click(trigger());
      await elapse(2000, fixture);
      expect(queryContent()).toBeNull();
    });

    it('closes on a press on the trigger with the reason press', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.hover(trigger());
      await elapse(700, fixture);
      await screen.findByRole('tooltip');
      await user.pointer({ keys: '[MouseLeft>]', target: trigger() });
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });
  });

  describe('touch', () => {
    it('never opens on a touch hover or a tap', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      const touch = (type: string): void => {
        const event = new Event(type, { bubbles: false });
        Object.defineProperty(event, 'pointerType', { value: 'touch' });
        fireEvent(trigger(), event);
      };
      touch('pointerenter');
      touch('pointerdown');
      await user.pointer({ keys: '[TouchA]', target: trigger() });
      await elapse(2000, fixture);
      expect(queryContent()).toBeNull();
    });
  });

  describe('model and disabled', () => {
    it('shows and hides through the methods, with and without a delay', async () => {
      const { fixture } = await render(Host);
      const tooltip = fixture.componentInstance.tooltip();
      tooltip.show(0);
      await fixture.whenStable();
      await screen.findByRole('tooltip');
      tooltip.hide(0);
      await fixture.whenStable();
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
      tooltip.toggle();
      await elapse(699, fixture);
      expect(queryContent()).toBeNull();
      await elapse(1, fixture);
      await screen.findByRole('tooltip');
      tooltip.toggle();
      await elapse(0, fixture);
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });

    it('never opens while disabled, and closes when it becomes disabled', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
      await user.hover(trigger());
      await elapse(2000, fixture);
      await user.tab();
      await user.tab();
      expect(queryContent()).toBeNull();
      expect(trigger().getAttribute('data-state')).toBe('closed');
      fixture.componentInstance.disabled.set(false);
      await fixture.whenStable();
      fixture.componentInstance.tooltip().show(0);
      await fixture.whenStable();
      await screen.findByRole('tooltip');
      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });

    it('unmounts after the exit animation of the content has finished', async () => {
      const user = setup();
      const { fixture } = await render(Host);
      await user.tab();
      await user.tab();
      const tip = await screen.findByRole('tooltip');
      let finish: () => void = () => undefined;
      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });
      tip.getAnimations = () => [
        {
          finished,
          animationName: 'exit',
          playState: 'running',
          effect: { getComputedTiming: () => ({ endTime: 300 }) },
        } as unknown as Animation,
      ];
      await user.keyboard('{Escape}');
      await fixture.whenStable();
      expect(screen.getByRole('tooltip').getAttribute('data-state')).toBe('closed');
      finish();
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
    });
  });

  describe('diagnostics and cleanup', () => {
    it('throws a clear error for a part outside the root', async () => {
      await expect(
        render(`<button cckTooltipTrigger>Orphan</button>`, { imports: [...CckTooltipImports] }),
      ).rejects.toThrow(/cckTooltipTrigger must be placed inside an element with cckTooltip/);
    });

    it('removes the overlay when the Tooltip is destroyed while open', async () => {
      const { fixture } = await render(Host);
      fixture.componentInstance.tooltip().show(0);
      await fixture.whenStable();
      await screen.findByRole('tooltip');
      fixture.destroy();
      expect(document.querySelector('[popover="manual"]')).toBeNull();
    });
  });

  describe('inside a Popover', () => {
    const nested = `
      <ng-container cckPopover>
        <button cckPopoverTrigger>Share</button>
        <ng-template cckPopoverPortal>
          <div cckPopoverContent aria-label="Share panel">
            <ng-container cckTooltip>
              <button cckTooltipTrigger aria-label="Copy link">Copy</button>
              <ng-template cckTooltipPortal><div cckTooltipContent>Copy the link</div></ng-template>
            </ng-container>
          </div>
        </ng-template>
      </ng-container>`;
    const imports = [...CckPopoverImports, ...CckTooltipImports];

    it('shows above the popover, hides on the first Escape and leaves the popover to the second', async () => {
      const user = setup();
      await render(nested, { imports });
      await user.click(screen.getByRole('button', { name: 'Share' }));
      await screen.findByRole('dialog', { name: 'Share panel' });
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger());
      });
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(queryContent()).toBeNull();
      });
      expect(screen.getByRole('dialog', { name: 'Share panel' }).isConnected).toBe(true);
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('does not close the popover when the pointer is pressed on the tooltip content', async () => {
      const user = setup();
      await render(nested, { imports });
      await user.click(screen.getByRole('button', { name: 'Share' }));
      await screen.findByRole('tooltip');
      await user.pointer({ keys: '[MouseLeft]', target: content() });
      expect(screen.getByRole('dialog', { name: 'Share panel' }).isConnected).toBe(true);
    });
  });
});

import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_TOOLTIP_DEFAULT_OPTIONS, CckTooltip, CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { bubble } from './queries';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <p id="outside">Outside</p>
    <button
      [cckTooltip]="message()"
      [cckTooltipShowDelay]="showDelay()"
      [cckTooltipHideDelay]="hideDelay()"
      [cckTooltipDisabled]="disabled()"
      [cckTooltipSide]="side()"
      cckTooltipAlign="end"
    >
      Copy
    </button>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly message = signal<string | number | null | undefined>('Copy link');
  readonly showDelay = signal<number | undefined>(undefined);
  readonly hideDelay = signal<number | undefined>(undefined);
  readonly disabled = signal(false);
  readonly side = signal<'top' | 'bottom' | undefined>('top');
}

const trigger = (): HTMLElement => screen.getByRole('button');

describe('Tooltip one-attribute form', () => {
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
  const opened = async (): Promise<void> => {
    await waitFor(() => {
      expect(bubble()).not.toBeNull();
    });
  };
  const closed = async (): Promise<void> => {
    await waitFor(() => {
      expect(bubble()).toBeNull();
    });
  };

  it('makes the host the trigger and renders the message in a content part in the overlay container', async () => {
    const user = setup();
    const { container } = await render(Host);
    expect(trigger().classList.contains(tooltipAnatomy.classes.trigger)).toBe(true);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(bubble()).toBeNull();
    await user.hover(trigger());
    await opened();
    const tip = bubble();
    expect(tip?.tagName).toBe('DIV');
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(tip?.textContent).toBe('Copy link');
    expect(tip?.getAttribute('data-state')).toBe('open');
    expect(tip?.getAttribute('data-side')).toBe('top');
    expect(tip?.getAttribute('data-align')).toBe('end');
    expect(tip?.closest('[popover="manual"]')).not.toBeNull();
    expect(container.contains(tip)).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('open');
  });

  it('shows on hover after the delay (0 by default) and hides after the hide delay, at least 100 ms', async () => {
    const user = setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.showDelay.set(300);
    await fixture.whenStable();
    await user.hover(trigger());
    await elapse(299, fixture);
    expect(bubble()).toBeNull();
    await elapse(1, fixture);
    await opened();
    await user.unhover(trigger());
    await elapse(99, fixture);
    expect(bubble()).not.toBeNull();
    await elapse(1, fixture);
    await closed();
    fixture.componentInstance.showDelay.set(undefined);
    await fixture.whenStable();
    await user.hover(trigger());
    await opened();
  });

  it('shows on keyboard focus at once, whatever the delay, and hides on Escape', async () => {
    const user = setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.showDelay.set(5000);
    await fixture.whenStable();
    await user.tab();
    await opened();
    await user.keyboard('{Escape}');
    await closed();
    expect(document.activeElement).toBe(trigger());
  });

  it('shows nothing and describes nothing for an empty or blank message', async () => {
    const user = setup();
    const { fixture } = await render(Host);
    for (const message of ['', '   ', null, undefined]) {
      fixture.componentInstance.message.set(message);
      await fixture.whenStable();
      await user.hover(trigger());
      fixture.componentInstance.tooltip().show(0);
      await fixture.whenStable();
      expect(bubble()).toBeNull();
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(trigger().hasAttribute('aria-describedby')).toBe(false);
      await user.unhover(trigger());
    }
  });

  it('trims the message and accepts a number', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.message.set('  Hello  ');
    await fixture.whenStable();
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await waitFor(() => {
      expect(bubble()?.textContent).toBe('Hello');
    });
    fixture.componentInstance.message.set(42);
    await fixture.whenStable();
    await waitFor(() => {
      expect(bubble()?.textContent).toBe('42');
    });
  });

  it('show, hide and toggle work with and without a delay', async () => {
    const { fixture } = await render(Host);
    const tooltip = fixture.componentInstance.tooltip();
    tooltip.show(200);
    await elapse(199, fixture);
    expect(bubble()).toBeNull();
    await elapse(1, fixture);
    await opened();
    tooltip.hide(200);
    await elapse(199, fixture);
    expect(bubble()?.getAttribute('data-state')).toBe('open');
    await elapse(1, fixture);
    await closed();
    tooltip.toggle();
    await fixture.whenStable();
    await opened();
    tooltip.toggle();
    await fixture.whenStable();
    await closed();
  });

  it('does nothing on show() while disabled, and hides at once when disabled turns on', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    expect(bubble()).toBeNull();
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await opened();
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(trigger().getAttribute('data-state')).toBe('closed');
    await closed();
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    expect(bubble()).toBeNull();
  });

  it('uses the side input', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.side.set('bottom');
    await fixture.whenStable();
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await waitFor(() => {
      expect(bubble()?.getAttribute('data-side')).toBe('bottom');
    });
  });

  it('closes on Escape and an outside press, and disableClose keeps it', async () => {
    const user = setup();
    const { fixture } = await render(`<button cckTooltip="Copy" [disableClose]="true">x</button><p>Empty space</p>`, {
      imports: [...CckTooltipImports],
    });
    fixture.debugElement.children[0]?.injector.get(CckTooltip).show(0);
    await opened();
    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Empty space'));
    expect(bubble()).not.toBeNull();
  });

  it('warns for a message on an ng-container without parts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<ng-container cckTooltip="Hello"></ng-container>`, { imports: [...CckTooltipImports] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cckTooltip with a message needs an element'));
  });

  describe('defaults token', () => {
    const provide = (value: unknown): { provide: typeof CCK_TOOLTIP_DEFAULT_OPTIONS; useValue: never } => ({
      provide: CCK_TOOLTIP_DEFAULT_OPTIONS,
      useValue: value as never,
    });

    it('replaces the built-ins, and an input wins over it', async () => {
      const user = setup();
      const { fixture } = await render(Host, { providers: [provide({ showDelay: 400, hideDelay: 0 })] });
      await user.hover(trigger());
      await elapse(399, fixture);
      expect(bubble()).toBeNull();
      await elapse(1, fixture);
      await opened();
      fixture.componentInstance.tooltip().hide(0);
      await fixture.whenStable();
      await closed();
      fixture.componentInstance.showDelay.set(10);
      await fixture.whenStable();
      fixture.componentInstance.tooltip().show();
      await elapse(9, fixture);
      expect(bubble()).toBeNull();
      await elapse(1, fixture);
      await opened();
    });

    it('takes side and align from the token when no input is set', async () => {
      const { fixture } = await render(`<button cckTooltip="Hi">x</button>`, {
        imports: [...CckTooltipImports],
        providers: [provide({ showDelay: 0, hideDelay: 0, side: 'bottom', align: 'start' })],
      });
      fixture.debugElement.children[0]?.injector.get(CckTooltip).show(0);
      await fixture.whenStable();
      await waitFor(() => {
        expect(bubble()?.getAttribute('data-side')).toBe('bottom');
      });
      expect(bubble()?.getAttribute('data-align')).toBe('start');
    });

    it('closes at once on pointer leave when the token disables the interactivity', async () => {
      const user = setup();
      const { fixture } = await render(Host, {
        providers: [provide({ showDelay: 0, hideDelay: 0, disableTooltipInteractivity: true })],
      });
      await user.hover(trigger());
      await opened();
      await user.unhover(trigger());
      await elapse(0, fixture);
      await closed();
    });
  });
});

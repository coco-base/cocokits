import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const start = vi.hoisted(() => vi.fn());
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...actual,
    startOverlayPosition: (options: Parameters<typeof actual.startOverlayPosition>[0]) => {
      start(options);
      return actual.startOverlayPosition(options);
    },
  };
});

@Component({
  imports: [...CckPopoverImports],
  template: `
    <ng-container cckPopover [(open)]="open">
      @if (anchored()) {
        <div cckPopoverAnchor data-testid="anchor"><span>row</span></div>
      }
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content aria-label="Share"><button cckPopoverClose>Close</button></cck-popover-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly anchored = signal(true);
  readonly open = signal(true);
}

describe('Popover anchor', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The element the latest positioning run was told to place the content against. */
  function lastAnchor(): unknown {
    return (start.mock.lastCall?.[0] as { getAnchor: () => unknown }).getAnchor();
  }

  it('renders a plain element with the anchor class and no role', async () => {
    await render(Host);
    const anchor = screen.getByTestId('anchor');
    expect(anchor.className).toBe('cck-popover__anchor');
    expect(anchor.hasAttribute('role')).toBe(false);
  });

  it('places the content against the anchor, and against the trigger without one', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(lastAnchor()).toBe(screen.getByTestId('anchor'));

    fixture.componentInstance.anchored.set(false);
    await fixture.whenStable();
    expect(lastAnchor()).toBe(screen.getByRole('button', { name: 'Share' }));
  });

  it('keeps aria-expanded on the trigger and puts no ARIA on the anchor', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(screen.getByRole('button', { name: 'Share' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('anchor').getAttributeNames().sort()).toEqual([
      'cckpopoveranchor',
      'class',
      'data-testid',
    ]);
  });

  it('closes on a press on the anchor outside the trigger, and Escape returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await fixture.whenStable();
    await screen.findByRole('dialog');
    await user.click(screen.getByText('row'));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);

    const trigger = screen.getByRole('button', { name: 'Share' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });
});

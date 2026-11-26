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
    @if (anchored()) {
      <div cckPopoverAnchor data-testid="anchor">
        <span>row</span>
        <button [cckPopoverTriggerFor]="popover" [(open)]="open">Share</button>
      </div>
    } @else {
      <button [cckPopoverTriggerFor]="popover" [(open)]="open">Share</button>
    }
    <ng-template #popover>
      <cck-popover-content aria-label="Share"><button cckPopoverClose>Close</button></cck-popover-content>
    </ng-template>
  `,
})
class Host {
  readonly anchored = signal(true);
  readonly open = signal(true);
}

/** An outer anchored popover whose content holds an inner trigger in its own anchor, and one without. */
@Component({
  imports: [...CckPopoverImports],
  template: `
    <div cckPopoverAnchor data-testid="outer-anchor">
      <div cckPopoverAnchor data-testid="near-anchor">
        <button [cckPopoverTriggerFor]="outer" [open]="true">Outer</button>
      </div>
    </div>
    <ng-template #outer>
      <cck-popover-content aria-label="Outer panel">
        <div cckPopoverAnchor data-testid="inner-anchor">
          <button [cckPopoverTriggerFor]="inner" [(open)]="innerOpen">Inner</button>
        </div>
        <button [cckPopoverTriggerFor]="bare" [(open)]="bareOpen">Bare</button>
        <ng-template #inner><cck-popover-content aria-label="Inner panel">Inner</cck-popover-content></ng-template>
        <ng-template #bare><cck-popover-content aria-label="Bare panel">Bare</cck-popover-content></ng-template>
      </cck-popover-content>
    </ng-template>
  `,
})
class Nested {
  readonly innerOpen = signal(false);
  readonly bareOpen = signal(false);
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

  it('lines up with the nearest anchor around the trigger', async () => {
    const { fixture } = await render(Nested);
    await fixture.whenStable();
    await screen.findByRole('dialog', { name: 'Outer panel' });
    expect(lastAnchor()).toBe(screen.getByTestId('near-anchor'));
    expect(screen.getByTestId('outer-anchor').hasAttribute('class')).toBe(false);
  });

  it('keeps both anchors for a popover in the content of an anchored popover, and gives a bare inner trigger none', async () => {
    const { fixture } = await render(Nested);
    await fixture.whenStable();
    fixture.componentInstance.innerOpen.set(true);
    await screen.findByRole('dialog', { name: 'Inner panel' });
    expect(lastAnchor()).toBe(screen.getByTestId('inner-anchor'));
    expect(screen.getByTestId('near-anchor').className).toBe('cck-popover__anchor');
    expect(screen.getByTestId('inner-anchor').className).toBe('cck-popover__anchor');

    fixture.componentInstance.innerOpen.set(false);
    fixture.componentInstance.bareOpen.set(true);
    await screen.findByRole('dialog', { name: 'Bare panel' });
    expect(lastAnchor()).toBe(screen.getByRole('button', { name: 'Bare' }));
  });

  it('warns in development when the anchor holds no trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<div cckPopoverAnchor>Row</div>`, { imports: [...CckPopoverImports] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cckPopoverAnchor holds no cckPopoverTriggerFor'));
  });
});

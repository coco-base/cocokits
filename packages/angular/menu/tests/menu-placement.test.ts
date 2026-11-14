import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { CckDir } from '@cocokits/angular-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const start = vi.hoisted(() => vi.fn());
const placement = vi.hoisted(() => ({
  flip: undefined as undefined | { side: 'top' | 'bottom' | 'start' | 'end'; align: 'start' | 'center' | 'end' },
}));
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...actual,
    startOverlayPosition: (options: Parameters<typeof actual.startOverlayPosition>[0]) => {
      start(options);
      if (placement.flip) {
        options.onPlacementChange(placement.flip);
        return () => undefined;
      }
      return actual.startOverlayPosition(options);
    },
  };
});

@Component({
  imports: [...CckMenuImports, CckDir],
  template: `
    <div cckDir [dir]="dir()">
      <ng-container cckMenu [open]="true">
        <button cckMenuTrigger>Actions</button>
        <ng-template cckMenuPortal>
          <cck-menu-content [side]="side()" [align]="align()"><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
        </ng-template>
      </ng-container>
    </div>
  `,
})
class Host {
  readonly side = signal<'top' | 'bottom' | 'start' | 'end'>('bottom');
  readonly align = signal<'start' | 'center' | 'end'>('start');
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
}

describe('Menu placement', () => {
  beforeEach(() => {
    start.mockClear();
    placement.flip = undefined;
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to side bottom and align start and reports them in data-side and data-align', async () => {
    await render(Host);
    const menu = await screen.findByRole('menu');
    expect(start.mock.lastCall?.[0]).toMatchObject({ side: 'bottom', align: 'start' });
    expect(menu.getAttribute('data-side')).toBe('bottom');
    expect(menu.getAttribute('data-align')).toBe('start');
  });

  it('positions again with the new side and align while it is open', async () => {
    const { fixture } = await render(Host);
    await screen.findByRole('menu');
    fixture.componentInstance.side.set('top');
    fixture.componentInstance.align.set('end');
    await fixture.whenStable();
    expect(start.mock.lastCall?.[0]).toMatchObject({ side: 'top', align: 'end' });
  });

  it('shows the placement the positioning module resolved after a flip', async () => {
    placement.flip = { side: 'top', align: 'end' };
    await render(Host);
    const menu = await screen.findByRole('menu');
    await waitFor(() => {
      expect(menu.getAttribute('data-side')).toBe('top');
    });
    expect(menu.getAttribute('data-align')).toBe('end');
  });

  it('gives the positioning module the direction of the trigger ancestors, so start and end follow dir', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.side.set('start');
    fixture.componentInstance.dir.set('rtl');
    await fixture.whenStable();
    await screen.findByRole('menu');
    const options = start.mock.lastCall?.[0] as { getDirection: () => string; side: string };
    expect(options.side).toBe('start');
    expect(options.getDirection()).toBe('rtl');
    expect(screen.getByRole('menu').closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });
});

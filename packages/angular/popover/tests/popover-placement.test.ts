import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
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
    <ng-container cckPopover [open]="true">
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Share" [side]="side()" [align]="align()">Text</div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly side = signal<'top' | 'bottom'>('bottom');
  readonly align = signal<'start' | 'end'>('start');
}

describe('Popover placement', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('positions again with the new side and align while it is open', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(start.mock.lastCall?.[0]).toMatchObject({ side: 'bottom', align: 'start' });
    fixture.componentInstance.side.set('top');
    fixture.componentInstance.align.set('end');
    await fixture.whenStable();
    expect(start.mock.lastCall?.[0]).toMatchObject({ side: 'top', align: 'end' });
  });
});

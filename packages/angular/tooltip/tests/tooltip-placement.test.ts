import { Component, afterNextRender, signal, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
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
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger>Copy</button>
      <ng-template cckTooltipPortal>
        <div cckTooltipContent [side]="side()" [align]="align()">Text</div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly side = signal<'top' | 'bottom'>('bottom');
  readonly align = signal<'start' | 'end'>('start');

  constructor() {
    afterNextRender(() => {
      this.tooltip().show(0);
    });
  }
}

describe('Tooltip placement', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tracks focus-visible on the document of the trigger', async () => {
    const other = document.implementation.createHTMLDocument('other');
    const spy = vi.spyOn(other, 'addEventListener');
    const own = vi.spyOn(document, 'addEventListener');
    vi.spyOn(Node.prototype, 'ownerDocument', 'get').mockImplementation(function (this: Node) {
      return this instanceof HTMLButtonElement ? other : document;
    });
    await render(Host);
    expect(spy.mock.calls.some(([type]) => type === 'keydown')).toBe(true);
    expect(own.mock.calls.some(([type]) => type === 'keydown')).toBe(false);
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

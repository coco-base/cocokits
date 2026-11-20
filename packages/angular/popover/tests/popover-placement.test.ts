import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { popoverAnatomy } from '@cocokits/machines/popover';
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
        <cck-popover-content aria-label="Share" [side]="side()" [align]="align()">Text</cck-popover-content>
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

describe('Popover content sideOffset and alignOffset', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const rows = [
    { name: 'none set', attributes: '', expected: {}, absent: ['sideOffset', 'alignOffset'] },
    { name: 'sideOffset', attributes: '[sideOffset]="12"', expected: { sideOffset: 12 }, absent: ['alignOffset'] },
    { name: 'alignOffset', attributes: '[alignOffset]="-4"', expected: { alignOffset: -4 }, absent: ['sideOffset'] },
    {
      name: 'both',
      attributes: '[sideOffset]="0" [alignOffset]="8"',
      expected: { sideOffset: 0, alignOffset: 8 },
      absent: [],
    },
  ];
  it.each(rows)(
    'passes $name to the positioning module and leaves no attribute',
    async ({ attributes, expected, absent }) => {
      const { container } = await render(
        `<ng-container cckPopover [open]="true"><button cckPopoverTrigger>Share</button><ng-template cckPopoverPortal><cck-popover-content aria-label="Share" ${attributes}>Text</cck-popover-content></ng-template></ng-container>`,
        { imports: [...CckPopoverImports] },
      );
      await vi.waitFor(() => {
        expect(start).toHaveBeenCalled();
      });
      const options = start.mock.lastCall?.[0] as Record<string, unknown>;
      expect(options).toMatchObject(expected);
      for (const name of absent) expect(name in options, name).toBe(false);
      const content = document.querySelector('cck-popover-content');
      for (const name of ['sideoffset', 'alignoffset']) expect(content?.hasAttribute(name), name).toBe(false);
      expect(container).toBeTruthy();
    },
  );

  it('starts the positioning module after the content has its class', async () => {
    await render(Host);
    await vi.waitFor(() => {
      expect(start).toHaveBeenCalled();
    });
    for (const [options] of start.mock.calls as [{ getContent: () => HTMLElement }][]) {
      expect(options.getContent().classList.contains(popoverAnatomy.classes.content)).toBe(true);
    }
  });
});

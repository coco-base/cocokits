import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { CckDir } from '@cocokits/angular-core';
import { menuAnatomy } from '@cocokits/machines/menu';
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
      <button [cckMenuTriggerFor]="menu" [open]="true">Actions</button>
      <ng-template #menu>
        <cck-menu-content [side]="side()" [align]="align()"><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
      </ng-template>
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

  it('has the class and the theme attributes of the content when the positioning module starts', async () => {
    await render(Host);
    await screen.findByRole('menu');
    expect(start).toHaveBeenCalled();
    for (const [options] of start.mock.calls as [{ getContent: () => HTMLElement }][]) {
      expect(options.getContent().classList.contains(menuAnatomy.classes.content)).toBe(true);
    }
  });
});

const offsets = [
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

describe('Menu content sideOffset and alignOffset', () => {
  beforeEach(() => {
    start.mockClear();
    placement.flip = undefined;
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(offsets)(
    'passes $name to the positioning module and leaves no attribute',
    async ({ attributes, expected, absent }) => {
      await render(
        `<button [cckMenuTriggerFor]="menu" [open]="true">Actions</button><ng-template #menu><cck-menu-content ${attributes}><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template>`,
        { imports: [...CckMenuImports] },
      );
      const menu = await screen.findByRole('menu');
      const options = start.mock.lastCall?.[0] as Record<string, unknown>;
      expect(options).toMatchObject(expected);
      for (const name of absent) expect(name in options, name).toBe(false);
      for (const name of ['sideoffset', 'alignoffset']) expect(menu.hasAttribute(name), name).toBe(false);
    },
  );
});

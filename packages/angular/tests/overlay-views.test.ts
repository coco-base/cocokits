import { ApplicationRef, Component, NgZone, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../dialog';
import { stubOverlayApis } from '../dialog/tests/overlay-stubs';
import { must } from '../dialog/tests/service-fixtures';
import { CckPopoverImports } from '../popover';
import { CckSelect, CckSelectImports } from '../select';
import { CckTooltip, CckTooltipImports } from '../tooltip';

/** The four overlays, each closed until the matching flag opens it. */
@Component({
  selector: 'overlays-host',
  imports: [CckDialogImports, CckPopoverImports, CckTooltipImports, CckSelectImports],
  template: `
    <ng-container cckDialog [(open)]="dialog" (closed)="events.push('dialog')">
      <button cckDialogTrigger>Dialog</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Dialog">Text {{ label() }}</dialog>
      </ng-template>
    </ng-container>
    <ng-container cckPopover [(open)]="popover" (closed)="events.push('popover')">
      <button cckPopoverTrigger>Popover</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content aria-label="Popover">Text {{ label() }}</cck-popover-content>
      </ng-template>
    </ng-container>
    <ng-container cckTooltip [cckTooltipShowDelay]="delay()">
      <button cckTooltipTrigger aria-label="Tooltip trigger">Tooltip</button>
      <ng-template cckTooltipPortal>
        <cck-tooltip-content>Text {{ label() }}</cck-tooltip-content>
      </ng-template>
    </ng-container>
    <cck-select aria-label="Select">
      <cck-select-option value="a">A {{ label() }}</cck-select-option>
    </cck-select>
  `,
})
class OverlaysHost {
  readonly dialog = signal(false);
  readonly popover = signal(false);
  readonly tooltip = viewChild.required(CckTooltip);
  private readonly selectRef = viewChild.required(CckSelect);
  /** The Select has no open model: its methods stand in for the flag. */
  readonly select = {
    set: (open: boolean): void => {
      if (open) this.selectRef().open();
      else this.selectRef().close();
    },
  };
  readonly delay = signal(0);
  readonly label = signal('one');
  readonly events: string[] = [];
}

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('overlay views join the declaring change-detection tree', () => {
  for (const name of ['dialog', 'popover', 'tooltip', 'select'] as const) {
    it(`opening the ${name} leaves ApplicationRef.viewCount unchanged and keeps the content up to date`, async () => {
      const { fixture } = await render(OverlaysHost);
      const appRef = TestBed.inject(ApplicationRef);
      const before = appRef.viewCount;
      if (name === 'tooltip') fixture.componentInstance.tooltip().show(0);
      else fixture.componentInstance[name].set(true);
      await fixture.whenStable();
      const host = document.querySelector<HTMLElement>('[popover]');
      expect(host).not.toBeNull();
      expect(host?.textContent).toContain('one');
      expect(appRef.viewCount).toBe(before);
      fixture.componentInstance.label.set('two');
      await fixture.whenStable();
      expect(host?.textContent).toContain('two');
    });
  }
});

/** Counts the zone entries around the work an overlay starts. */
function recordingZone(real: NgZone): { zone: NgZone; log: string[]; depth: () => number } {
  const log: string[] = [];
  let outside = 0;
  let inside = 0;
  const zone = new Proxy(real, {
    get(target, property, receiver) {
      if (property === 'runOutsideAngular') {
        return <T>(fn: () => T): T => {
          outside++;
          log.push('outside');
          try {
            return fn();
          } finally {
            outside--;
          }
        };
      }
      if (property === 'run') {
        return <T>(fn: () => T): T => {
          inside++;
          try {
            return fn();
          } finally {
            inside--;
          }
        };
      }
      return Reflect.get(target, property, receiver) as unknown;
    },
  });
  return { zone, log, depth: () => inside * 10 + outside };
}

describe('the zone boundary of the overlay roots', () => {
  async function renderInRecordedZone(): Promise<{
    fixture: Awaited<ReturnType<typeof render<OverlaysHost>>>['fixture'];
    log: string[];
    depth: () => number;
    documentListeners: { type: string; outside: boolean }[];
  }> {
    const { zone, log, depth } = recordingZone(TestBed.inject(NgZone));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: NgZone, useValue: zone }] });
    const documentListeners: { type: string; outside: boolean }[] = [];
    const add = Reflect.get(EventTarget.prototype, 'addEventListener') as (...args: unknown[]) => void;
    vi.spyOn(document, 'addEventListener').mockImplementation(function (
      this: Document,
      type: string,
      ...rest: unknown[]
    ) {
      documentListeners.push({ type, outside: depth() % 10 > 0 });
      Reflect.apply(add, this, [type, ...rest]);
    });
    const { fixture } = await render(OverlaysHost);
    return { fixture, log, depth, documentListeners };
  }

  it('starts the dismiss layer listeners of a Dialog and a Popover outside the zone, and emits closed inside it', async () => {
    const user = userEvent.setup();
    const { fixture, documentListeners, log } = await renderInRecordedZone();
    const host = fixture.componentInstance;
    host.popover.set(true);
    await fixture.whenStable();
    const dismissListeners = documentListeners.filter(
      (entry) => entry.type === 'keydown' || entry.type === 'pointerdown',
    );
    expect(dismissListeners.length).toBeGreaterThan(0);
    expect(dismissListeners.every((entry) => entry.outside)).toBe(true);
    expect(log.length).toBeGreaterThan(0);
    await user.keyboard('{Escape}');
    await fixture.whenStable();
    expect(host.events).toEqual(['popover']);
    expect(host.popover()).toBe(false);
  });

  it('runs the Tooltip delay timer outside the zone and applies the change back inside', async () => {
    const { fixture, depth } = await renderInRecordedZone();
    const host = fixture.componentInstance;
    host.delay.set(30);
    await fixture.whenStable();
    const timers: boolean[] = [];
    const set = globalThis.setTimeout.bind(globalThis);
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      if (ms === 30) timers.push(depth() % 10 > 0);
      return set(fn, ms);
    }) as typeof setTimeout);
    const trigger = must(document.querySelector<HTMLElement>('button[aria-label="Tooltip trigger"]'));
    trigger.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse', bubbles: false }));
    trigger.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', bubbles: true }));
    await vi.waitFor(() => {
      expect(timers).toEqual([true]);
    });
    await vi.waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
    });
  });
});

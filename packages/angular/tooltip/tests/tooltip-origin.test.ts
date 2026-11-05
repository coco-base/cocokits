import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports, CCK_TOOLTIP_DEFAULT_OPTIONS } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { bubble } from './queries';

type Options = Parameters<typeof import('@cocokits/cdk/positioning').startOverlayPosition>[0];

const start = vi.hoisted(() => vi.fn());
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...actual,
    startOverlayPosition: (options: Options) => {
      start(options);
      return actual.startOverlayPosition(options);
    },
  };
});

@Component({
  imports: [...CckTooltipImports],
  template: ` <button cckTooltip="Copy link" [cckTooltipPositionAtOrigin]="atOrigin()" id="host">Copy</button> `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly atOrigin = signal<boolean | undefined>(true);
}

const anchor = (): ReturnType<Options['getAnchor']> => (start.mock.lastCall?.[0] as Options).getAnchor();

const lastBox = (): { x: number; y: number; width: number; height: number } | undefined =>
  anchor()?.getBoundingClientRect();

function enter(element: Element, x: number, y: number): void {
  const event = new MouseEvent('pointerenter', { clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  fireEvent(element, event);
}

const opened = (): Promise<void> =>
  waitFor(() => {
    expect(bubble()).not.toBeNull();
  });
const closed = (): Promise<void> =>
  waitFor(() => {
    expect(bubble()).toBeNull();
  });

const host = (): HTMLElement => {
  const element = document.getElementById('host');
  if (!element) throw new Error('the host is not rendered');
  return element;
};

describe('Tooltip positionAtOrigin', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('places a pointer-opened tooltip against the point where the pointer entered', async () => {
    await render(Host);
    enter(host(), 40, 60);
    await opened();
    expect(lastBox()).toMatchObject({ x: 40, y: 60, width: 0, height: 0 });
    expect((anchor() as { contextElement?: Element }).contextElement).toBe(host());
  });

  it('places a focus-opened tooltip against the trigger', async () => {
    await render(Host);
    fireEvent.focus(host());
    await opened();
    expect(anchor()).toBe(host());
  });

  it('places show() without an origin against the trigger and show(0, point) against the point', async () => {
    const { fixture } = await render(Host);
    const tooltip = fixture.componentInstance.tooltip();
    tooltip.show(0);
    await opened();
    expect(anchor()).toBe(host());
    tooltip.hide(0);
    await fixture.whenStable();
    await closed();
    tooltip.show(0, { x: 7, y: 9 });
    await opened();
    expect(lastBox()).toMatchObject({ x: 7, y: 9, width: 0, height: 0 });
  });

  it('toggle takes the point', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().toggle({ x: 3, y: 4 });
    await opened();
    expect(lastBox()).toMatchObject({ x: 3, y: 4 });
  });

  it('ignores the pointer when the input is off', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.atOrigin.set(false);
    await fixture.whenStable();
    enter(host(), 40, 60);
    await opened();
    expect(anchor()).toBe(host());
  });
});

describe('Tooltip positionAtOrigin default option', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies when the input is not set', async () => {
    const { fixture } = await render(Host, {
      providers: [
        provideZonelessChangeDetection(),
        { provide: CCK_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 0, hideDelay: 0, positionAtOrigin: true } },
      ],
    });
    fixture.componentInstance.atOrigin.set(undefined);
    await fixture.whenStable();
    enter(host(), 11, 12);
    await opened();
    expect(lastBox()).toMatchObject({ x: 11, y: 12 });
  });

  it('is overridden by the input', async () => {
    const { fixture } = await render(Host, {
      providers: [
        provideZonelessChangeDetection(),
        { provide: CCK_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 0, hideDelay: 0, positionAtOrigin: true } },
      ],
    });
    fixture.componentInstance.atOrigin.set(false);
    await fixture.whenStable();
    enter(host(), 11, 12);
    await opened();
    expect(anchor()).toBe(host());
  });
});

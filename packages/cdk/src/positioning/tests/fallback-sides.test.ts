// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const floating = vi.hoisted(() => ({
  computePosition: vi.fn(),
  autoUpdate: vi.fn(),
  flipCalls: [] as Record<string, unknown>[],
  flipFn: vi.fn(),
  offsetArg: undefined as object | undefined,
}));

vi.mock('@floating-ui/dom', () => {
  const plain = (name: string) => () => ({ name });
  return {
    computePosition: floating.computePosition,
    autoUpdate: floating.autoUpdate,
    offset: (value: object) => {
      floating.offsetArg = value;
      return { name: 'offset' };
    },
    shift: plain('shift'),
    limitShift: plain('limitShift'),
    hide: plain('hide'),
    size: plain('size'),
    flip: (value: Record<string, unknown>) => {
      floating.flipCalls.push(value);
      return { name: 'flip', fn: floating.flipFn };
    },
  };
});

import type { Direction } from '@cocokits/shared';
import { startOverlayPosition } from '../index';
import type { OverlayPositionOptions, OverlaySide } from '../index';

let anchor: HTMLElement;
let content: HTMLElement;

beforeEach(() => {
  anchor = document.createElement('button');
  content = document.createElement('div');
  document.body.append(anchor, content);
  floating.computePosition.mockResolvedValue({ x: 0, y: 0, placement: 'bottom-start', middlewareData: {} });
  floating.autoUpdate.mockReturnValue(() => undefined);
  floating.flipFn.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
  floating.flipCalls.length = 0;
  document.body.innerHTML = '';
});

function start(overrides: Partial<OverlayPositionOptions> = {}): void {
  startOverlayPosition({
    getAnchor: () => anchor,
    getContent: () => content,
    side: 'bottom',
    align: 'start',
    getDirection: () => 'ltr',
    onPlacementChange: () => undefined,
    ...overrides,
  });
}

const flipMiddleware = (): { name: string; fn: (state: unknown) => Promise<unknown> } | undefined =>
  (
    floating.computePosition.mock.calls[0]?.[2] as { middleware: { name: string; fn?: never }[] } | undefined
  )?.middleware.find((entry) => entry.name === 'flip') as never;

function startFlip(overrides: Partial<OverlayPositionOptions> = {}): void {
  floating.autoUpdate.mockImplementation((_a: unknown, _c: unknown, update: () => void) => {
    update();
    return () => undefined;
  });
  start(overrides);
}

describe('fallbackSides', () => {
  it('keeps the default flip when no list is given', () => {
    startFlip();
    expect(floating.flipCalls).toHaveLength(1);
    expect(floating.flipCalls[0]).not.toHaveProperty('fallbackPlacements');
  });

  it.each<{ dir: Direction; sides: readonly OverlaySide[]; align: 'start' | 'end'; expected: string[] }>([
    { dir: 'ltr', sides: ['start', 'top'], align: 'start', expected: ['left-start', 'top-start'] },
    { dir: 'rtl', sides: ['start', 'top'], align: 'start', expected: ['right-start', 'top-start'] },
    { dir: 'ltr', sides: ['end', 'top', 'bottom'], align: 'end', expected: ['right-end', 'top-end', 'bottom-end'] },
  ])('passes the sides in order as placements ($dir, $align)', async ({ dir, sides, align, expected }) => {
    startFlip({ fallbackSides: sides, align, getDirection: () => dir });
    await flipMiddleware()?.fn({});
    expect(floating.flipCalls[0]?.['fallbackPlacements']).toEqual(expected);
    expect(floating.flipFn).toHaveBeenCalledTimes(1);
  });

  it('reads the direction on every update and builds each flip once', async () => {
    let dir: Direction = 'ltr';
    startFlip({ fallbackSides: ['start'], getDirection: () => dir });
    const flip = flipMiddleware();
    await flip?.fn({});
    await flip?.fn({});
    dir = 'rtl';
    await flip?.fn({});
    expect(floating.flipCalls.map((call) => call['fallbackPlacements'])).toEqual([['left-start'], ['right-start']]);
  });

  it('keeps the collision options and the axis switches', async () => {
    startFlip({ fallbackSides: ['top'], sideFlip: false, collisionPadding: 8 });
    await flipMiddleware()?.fn({});
    expect(floating.flipCalls[0]).toMatchObject({ mainAxis: false, padding: 8, fallbackPlacements: ['top-start'] });
  });

  it('ignores an empty list', () => {
    startFlip({ fallbackSides: [] });
    expect(floating.flipCalls[0]).not.toHaveProperty('fallbackPlacements');
  });

  it('adds no flip with avoidCollisions false', () => {
    startFlip({ fallbackSides: ['top'], avoidCollisions: false });
    expect(floating.flipCalls).toHaveLength(0);
  });

  it.each([
    { placement: 'bottom-start', alignmentAxis: 90 },
    { placement: 'left-start', alignmentAxis: 0 },
    { placement: 'top-start', alignmentAxis: 0 },
  ])('keeps alignOffset on the preferred side only ($placement)', ({ placement, alignmentAxis }) => {
    start({ fallbackSides: ['start', 'top'], alignOffset: 90, sideOffset: 4 });
    const offset = floating.offsetArg as unknown as (state: { placement: string }) => unknown;
    expect(offset({ placement })).toEqual({ mainAxis: 4, alignmentAxis });
  });

  it('keeps the plain offset without a list', () => {
    start({ alignOffset: 90, sideOffset: 4 });
    expect(floating.offsetArg).toEqual({ mainAxis: 4, alignmentAxis: 90 });
  });
});

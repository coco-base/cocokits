// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const floating = vi.hoisted(() => ({
  computePosition: vi.fn(),
  autoUpdate: vi.fn(),
  args: new Map<string, unknown>(),
  cleanup: vi.fn(),
}));

vi.mock('@floating-ui/dom', () => {
  const named = (name: string) => (value: unknown) => {
    floating.args.set(name, value);
    return { name };
  };
  return {
    computePosition: floating.computePosition,
    autoUpdate: floating.autoUpdate,
    offset: named('offset'),
    flip: named('flip'),
    shift: named('shift'),
    limitShift: () => ({ name: 'limitShift' }),
    hide: named('hide'),
    size: named('size'),
  };
});

import { startOverlayPosition } from '../index';
import type { OverlayPositionOptions } from '../index';

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

let anchor: HTMLElement;
let content: HTMLElement;
let arrow: HTMLElement;
let arrowReads: number;

beforeEach(() => {
  anchor = document.createElement('button');
  content = document.createElement('div');
  arrow = document.createElement('span');
  content.append(arrow);
  document.body.append(anchor, content);
  arrowReads = 0;
  Object.defineProperty(arrow, 'offsetHeight', {
    get: () => {
      arrowReads += 1;
      return 5;
    },
  });
  Object.defineProperty(arrow, 'offsetWidth', { value: 10 });
  floating.computePosition.mockResolvedValue({ x: 10, y: 20, placement: 'bottom-start', middlewareData: {} });
  floating.autoUpdate.mockImplementation((_a: unknown, _c: unknown, update: () => void) => {
    update();
    return floating.cleanup;
  });
});

afterEach(() => {
  vi.clearAllMocks();
  floating.args.clear();
  document.body.innerHTML = '';
});

function start(overrides: Partial<OverlayPositionOptions> = {}): () => void {
  return startOverlayPosition({
    getAnchor: () => anchor,
    getContent: () => content,
    side: 'bottom',
    align: 'start',
    getDirection: () => 'ltr',
    onPlacementChange: () => undefined,
    ...overrides,
  });
}

const middlewareNames = (): string[] =>
  (floating.computePosition.mock.calls[0]?.[2] as { middleware: { name: string }[] }).middleware.map(
    (entry) => entry.name,
  );

async function updateWith(
  data: Record<string, unknown>,
  placement = 'bottom-start',
  overrides: Partial<OverlayPositionOptions> = {},
): Promise<() => void> {
  floating.computePosition.mockResolvedValue({ x: 10, y: 20, placement, middlewareData: data });
  floating.autoUpdate.mockImplementation((_a: unknown, _c: unknown, update: () => void) => {
    update();
    return floating.cleanup;
  });
  const stop = start(overrides);
  await flush();
  return stop;
}

describe('arrow', () => {
  it('adds the gap and the arrow height, measured once at the start', async () => {
    start({ getArrow: () => arrow, sideOffset: 6 });
    expect(floating.args.get('offset')).toEqual({ mainAxis: 11, alignmentAxis: 0 });
    const update = floating.autoUpdate.mock.calls[0]?.[2] as () => void;
    update();
    update();
    await flush();
    expect(arrowReads).toBe(1);
  });

  it('adds the arrow middleware after size and before hide, only with an arrow part', () => {
    start({ getArrow: () => arrow, hideWhenDetached: true });
    expect(middlewareNames()).toEqual(['offset', 'shift', 'flip', 'size', 'cckArrow', 'cckTransformOrigin', 'hide']);
  });

  it('changes nothing without an arrow part', () => {
    start({ getArrow: () => null });
    expect(floating.args.get('offset')).toEqual({ mainAxis: 0, alignmentAxis: 0 });
    expect(middlewareNames()).toEqual(['offset', 'shift', 'flip', 'size', 'cckTransformOrigin']);
  });

  it('writes the arrow place and no display or visibility', async () => {
    await updateWith({ cckArrow: { x: 40, centerOffset: 0, hidden: false } }, 'bottom-start', {
      getArrow: () => arrow,
    });
    expect(arrow.style.left).toBe('40px');
    expect(arrow.style.top).toBe('0px');
    expect(arrow.style.display).toBe('');
    expect(arrow.style.visibility).toBe('');
  });

  it('reports the arrow hidden, shown again, and shown when the position stops while hidden', async () => {
    const reports: boolean[] = [];
    const stop = await updateWith({ cckArrow: { x: 0, centerOffset: 3, hidden: true } }, 'bottom-start', {
      getArrow: () => arrow,
      onArrowHiddenChange: (hidden) => reports.push(hidden),
    });
    expect(reports).toEqual([true]);
    floating.computePosition.mockResolvedValue({
      x: 10,
      y: 20,
      placement: 'bottom-start',
      middlewareData: { cckArrow: { x: 30, centerOffset: 0, hidden: false } },
    });
    (floating.autoUpdate.mock.calls[0]?.[2] as () => void)();
    await flush();
    expect(reports).toEqual([true, false]);
    floating.computePosition.mockResolvedValue({
      x: 10,
      y: 20,
      placement: 'bottom-start',
      middlewareData: { cckArrow: { x: 0, centerOffset: 3, hidden: true } },
    });
    (floating.autoUpdate.mock.calls[0]?.[2] as () => void)();
    await flush();
    stop();
    expect(reports).toEqual([true, false, true, false]);
  });
});

describe('transform origin', () => {
  it('writes --transform-origin after each placement', async () => {
    await updateWith({ cckTransformOrigin: { x: '0%', y: '0px' } });
    expect(content.style.getPropertyValue('--transform-origin')).toBe('0% 0px');
  });
});

describe('collision boundary', () => {
  it('reaches flip, shift, size and hide, with altBoundary', () => {
    const boundary = document.createElement('section');
    start({ collisionBoundary: [boundary, null], hideWhenDetached: true });
    const expected = { padding: 5, boundary: [boundary], altBoundary: true };
    expect(floating.args.get('flip')).toEqual(expected);
    expect(floating.args.get('shift')).toEqual(expect.objectContaining(expected));
    expect(floating.args.get('size')).toEqual(expect.objectContaining(expected));
    expect(floating.args.get('hide')).toEqual({ strategy: 'referenceHidden', ...expected });
  });

  it('takes a single element', () => {
    const boundary = document.createElement('section');
    start({ collisionBoundary: boundary });
    expect(floating.args.get('flip')).toEqual({ padding: 5, boundary: [boundary], altBoundary: true });
  });

  it('adds nothing for null, an empty list or unset', () => {
    for (const collisionBoundary of [null, [], [null], undefined]) {
      floating.args.clear();
      start(collisionBoundary === undefined ? {} : { collisionBoundary });
      expect(floating.args.get('flip')).toEqual({ padding: 5 });
    }
  });
});

describe('auto update', () => {
  it('uses the defaults when nothing is set', () => {
    start();
    expect(floating.autoUpdate.mock.calls[0]?.[3]).toBeUndefined();
  });

  it('updates on every animation frame with updatePositionStrategy always', () => {
    start({ updatePositionStrategy: 'always' });
    expect(floating.autoUpdate.mock.calls[0]?.[3]).toEqual({ animationFrame: true });
  });

  it('keeps optimized as the default', () => {
    start({ updatePositionStrategy: 'optimized' });
    expect(floating.autoUpdate.mock.calls[0]?.[3]).toBeUndefined();
  });

  it('turns the layout shift check off with disableUpdateOnLayoutShift', () => {
    start({ disableUpdateOnLayoutShift: true, updatePositionStrategy: 'always' });
    expect(floating.autoUpdate.mock.calls[0]?.[3]).toEqual({ animationFrame: true, layoutShift: false });
  });
});

describe('flips and priority', () => {
  it('passes sideFlip and alignFlip as the flip axes, only when given', () => {
    start({ sideFlip: false, alignFlip: false });
    expect(floating.args.get('flip')).toEqual({ padding: 5, mainAxis: false, crossAxis: false });
    floating.args.clear();
    start({ sideFlip: true });
    expect(floating.args.get('flip')).toEqual({ padding: 5, mainAxis: true });
  });

  it('shifts on both axes with prioritizePosition, and flips before it', () => {
    start({ prioritizePosition: true });
    expect(floating.args.get('shift')).toEqual({ padding: 5, limiter: { name: 'limitShift' }, crossAxis: true });
    expect(middlewareNames().slice(0, 3)).toEqual(['offset', 'flip', 'shift']);
  });

  it('shifts before it flips by default, as Radix and Reka do', () => {
    start({});
    expect(middlewareNames().slice(0, 3)).toEqual(['offset', 'shift', 'flip']);
  });

  it('leaves flip and shift unchanged with every option unset', () => {
    start({ prioritizePosition: false });
    expect(floating.args.get('flip')).toEqual({ padding: 5 });
    expect(floating.args.get('shift')).toEqual({ padding: 5, limiter: { name: 'limitShift' } });
  });

  it('adds no flip or shift with avoidCollisions false, whatever the flip options say', () => {
    start({ avoidCollisions: false, sideFlip: true, prioritizePosition: true });
    expect(floating.args.get('flip')).toBeUndefined();
    expect(floating.args.get('shift')).toBeUndefined();
  });
});

describe('arrow measure', () => {
  it('takes the arrow out of flow before it is measured', () => {
    start({ getArrow: () => arrow });
    expect(arrow.style.position).toBe('absolute');
  });
});

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const floating = vi.hoisted(() => ({
  computePosition: vi.fn(),
  autoUpdate: vi.fn(),
  offsetFn: undefined as (() => number) | undefined,
  args: new Map<string, unknown>(),
  apply: undefined as ((state: unknown) => void) | undefined,
  cleanup: vi.fn(),
}));

vi.mock('@floating-ui/dom', () => ({
  computePosition: floating.computePosition,
  autoUpdate: floating.autoUpdate,
  offset: (value: { mainAxis: number }) => {
    floating.args.set('offset', value);
    floating.offsetFn = () => value.mainAxis;
    return { name: 'offset' };
  },
  flip: (value: unknown) => {
    floating.args.set('flip', value);
    return { name: 'flip' };
  },
  shift: (value: unknown) => {
    floating.args.set('shift', value);
    return { name: 'shift' };
  },
  limitShift: () => ({ name: 'limitShift' }),
  hide: (value: unknown) => {
    floating.args.set('hide', value);
    return { name: 'hide' };
  },
  size: (options: { apply: (state: unknown) => void }) => {
    floating.args.set('size', options);
    floating.apply = options.apply;
    return { name: 'size' };
  },
}));

import { startOverlayPosition } from '../index';
import type { OverlayAlign, OverlayPositionOptions, OverlaySide } from '../index';
import { flush } from './helpers';

let anchor: HTMLElement;
let content: HTMLElement;

beforeEach(() => {
  anchor = document.createElement('button');
  content = document.createElement('div');
  document.body.append(anchor, content);
  floating.computePosition.mockResolvedValue({ x: 10.4, y: 20.6, placement: 'bottom-start', middlewareData: {} });
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

function start(
  overrides: { dir?: 'ltr' | 'rtl'; side?: OverlaySide; align?: OverlayAlign } & Partial<OverlayPositionOptions> = {},
) {
  const placements: { side: OverlaySide; align: OverlayAlign }[] = [];
  const { dir, ...rest } = overrides;
  const stop = startOverlayPosition({
    getAnchor: () => anchor,
    getContent: () => content,
    ...rest,
    side: overrides.side ?? 'bottom',
    align: overrides.align ?? 'start',
    getDirection: () => dir ?? 'ltr',
    onPlacementChange: (placement) => placements.push(placement),
  });
  return { stop, placements };
}

describe('startOverlayPosition', () => {
  it('puts the content out of flow before the first measure', () => {
    floating.autoUpdate.mockImplementation(() => floating.cleanup);
    start();
    expect(content.style.position).toBe('fixed');
    expect(content.style.top).toBe('0px');
    expect(content.style.left).toBe('0px');
  });

  it('writes the coordinates and reports the logical placement', async () => {
    const { placements } = start();
    await flush();
    expect(content.style.left).toBe('10px');
    expect(content.style.top).toBe('21px');
    expect(placements).toEqual([{ side: 'bottom', align: 'start' }]);
  });

  it('asks Floating UI for the fixed strategy and the mapped placement', async () => {
    start({ side: 'start', align: 'center', dir: 'rtl' });
    await flush();
    expect(floating.computePosition).toHaveBeenCalledWith(
      anchor,
      content,
      expect.objectContaining({ strategy: 'fixed', placement: 'right' }),
    );
  });

  it('reports a flipped side, and only when the placement changes', async () => {
    const { placements } = start({ side: 'bottom' });
    await flush();
    floating.computePosition.mockResolvedValue({ x: 0, y: 0, placement: 'top-start', middlewareData: {} });
    (floating.autoUpdate.mock.calls[0]?.[2] as () => void)();
    await flush();
    (floating.autoUpdate.mock.calls[0]?.[2] as () => void)();
    await flush();
    expect(placements).toEqual([
      { side: 'bottom', align: 'start' },
      { side: 'top', align: 'start' },
    ]);
  });

  it.each([
    { name: 'px', value: '8px', gap: 8 },
    { name: 'rem', value: '0.5rem', gap: 8 },
    { name: 'em', value: '2em', gap: 32 },
    { name: 'an already computed px value', value: '10px', gap: 10 },
    { name: 'a plain number', value: '4', gap: 4 },
    { name: 'an unregistered calc()', value: 'calc(1px + 2px)', gap: 0 },
    { name: 'nothing', value: '', gap: 0 },
  ])('uses the gap from --side-offset: $name', ({ value, gap }) => {
    if (value) content.style.setProperty('--side-offset', value);
    content.style.fontSize = '16px';
    start();
    expect(floating.offsetFn?.()).toBe(gap);
  });

  it('reads --side-offset once per start, not on every update', () => {
    content.style.setProperty('--side-offset', '8px');
    const read = vi.spyOn(window, 'getComputedStyle');
    start();
    const reads = read.mock.calls.length;
    content.style.setProperty('--side-offset', '20px');
    (floating.autoUpdate.mock.calls[0]?.[2] as () => void)();
    expect(floating.offsetFn?.()).toBe(8);
    expect(read.mock.calls.length).toBe(reads);
    read.mockRestore();
  });

  it('writes the measured geometry as unprefixed variables', () => {
    start();
    floating.apply?.({ availableHeight: 300.4, rects: { reference: { width: 120.2 } } });
    expect(content.style.getPropertyValue('--anchor-width')).toBe('120px');
    expect(content.style.getPropertyValue('--available-height')).toBe('300px');
  });

  it('stops the auto update once and ignores a late measure', async () => {
    const { stop } = start();
    stop();
    stop();
    expect(floating.cleanup).toHaveBeenCalledTimes(1);
    await flush();
    expect(content.style.left).toBe('0px');
  });

  it('does nothing while the anchor or the content is missing', () => {
    const stop = startOverlayPosition({
      getAnchor: () => null,
      getContent: () => content,
      side: 'top',
      align: 'center',
      getDirection: () => 'ltr',
      onPlacementChange: () => undefined,
    });
    stop();
    expect(floating.autoUpdate).not.toHaveBeenCalled();
    expect(content.style.position).toBe('');
  });

  it('measures again by itself when dir changes while open, and reports the new placement', async () => {
    document.documentElement.removeAttribute('dir');
    let dir: 'ltr' | 'rtl' = 'ltr';
    const placements: { side: OverlaySide; align: OverlayAlign }[] = [];
    const stop = startOverlayPosition({
      getAnchor: () => anchor,
      getContent: () => content,
      side: 'start',
      align: 'start',
      getDirection: () => dir,
      onPlacementChange: (placement) => placements.push(placement),
    });
    await flush();
    expect(floating.computePosition).toHaveBeenLastCalledWith(
      anchor,
      content,
      expect.objectContaining({ placement: 'left-start' }),
    );
    floating.computePosition.mockResolvedValue({ x: 0, y: 0, placement: 'right-start', middlewareData: {} });
    dir = 'rtl';
    document.documentElement.setAttribute('dir', 'rtl');
    await flush();
    expect(floating.computePosition).toHaveBeenLastCalledWith(
      anchor,
      content,
      expect.objectContaining({ placement: 'right-start' }),
    );
    expect(placements.at(-1)).toEqual({ side: 'start', align: 'start' });
    stop();
    // Earlier tests leave their observers on the shared document, so count this anchor's measures only.
    const measures = (): number => floating.computePosition.mock.calls.filter((call) => call[0] === anchor).length;
    const calls = measures();
    document.documentElement.setAttribute('dir', 'ltr');
    await flush();
    expect(measures()).toBe(calls);
    document.documentElement.removeAttribute('dir');
  });
});

describe('positioning options', () => {
  it('uses the defaults: gap 0, no align offset, padding 5, partial sticky, collisions avoided, no hide', () => {
    start();
    expect(floating.args.get('offset')).toEqual({ mainAxis: 0, alignmentAxis: 0 });
    expect(floating.args.get('flip')).toEqual({ padding: 5 });
    expect(floating.args.get('shift')).toEqual({ padding: 5, limiter: { name: 'limitShift' } });
    expect(floating.args.get('size')).toEqual(expect.objectContaining({ padding: 5 }));
    expect(floating.args.get('hide')).toBeUndefined();
  });

  it('takes sideOffset over --side-offset and does not read the variable', () => {
    content.style.setProperty('--side-offset', '8px');
    const read = vi.spyOn(window, 'getComputedStyle');
    start({ sideOffset: 3 });
    expect(floating.args.get('offset')).toEqual({ mainAxis: 3, alignmentAxis: 0 });
    expect(read).not.toHaveBeenCalled();
    read.mockRestore();
  });

  it('passes alignOffset as the alignment axis offset', () => {
    start({ alignOffset: 12 });
    expect(floating.args.get('offset')).toEqual({ mainAxis: 0, alignmentAxis: 12 });
  });

  it('removes flip and shift with avoidCollisions false, and keeps size', () => {
    start({ avoidCollisions: false });
    expect(floating.args.get('flip')).toBeUndefined();
    expect(floating.args.get('shift')).toBeUndefined();
    expect(floating.args.get('size')).toBeDefined();
  });

  it('passes a number padding to flip, shift, size and hide', () => {
    start({ collisionPadding: 12, hideWhenDetached: true });
    expect(floating.args.get('flip')).toEqual({ padding: 12 });
    expect(floating.args.get('shift')).toEqual(expect.objectContaining({ padding: 12 }));
    expect(floating.args.get('size')).toEqual(expect.objectContaining({ padding: 12 }));
    expect(floating.args.get('hide')).toEqual({ strategy: 'referenceHidden', padding: 12 });
  });

  it('fills the sides a per-side padding leaves out with 0', () => {
    start({ collisionPadding: { top: 20 } });
    expect(floating.args.get('flip')).toEqual({ padding: { top: 20, right: 0, bottom: 0, left: 0 } });
  });

  it('sticky always adds no limiter', () => {
    start({ sticky: 'always' });
    expect(floating.args.get('shift')).toEqual({ padding: 5, limiter: undefined });
  });

  it('writes --available-width with --available-height', () => {
    start();
    floating.apply?.({ availableWidth: 410.6, availableHeight: 300.4, rects: { reference: { width: 120.2 } } });
    expect(content.style.getPropertyValue('--available-width')).toBe('411px');
    expect(content.style.getPropertyValue('--available-height')).toBe('300px');
  });
});

describe('hideWhenDetached', () => {
  it('reports a hidden anchor, a visible one again, and false when it stops while hidden', async () => {
    const hidden: boolean[] = [];
    const { stop } = start({ hideWhenDetached: true, onAnchorHiddenChange: (value) => hidden.push(value) });
    await flush();
    expect(hidden).toEqual([]);
    const update = floating.autoUpdate.mock.calls[0]?.[2] as () => void;
    floating.computePosition.mockResolvedValue({
      x: 0,
      y: 0,
      placement: 'bottom-start',
      middlewareData: { hide: { referenceHidden: true } },
    });
    update();
    await flush();
    update();
    await flush();
    floating.computePosition.mockResolvedValue({
      x: 0,
      y: 0,
      placement: 'bottom-start',
      middlewareData: { hide: { referenceHidden: false } },
    });
    update();
    await flush();
    floating.computePosition.mockResolvedValue({
      x: 0,
      y: 0,
      placement: 'bottom-start',
      middlewareData: { hide: { referenceHidden: true } },
    });
    update();
    await flush();
    stop();
    expect(hidden).toEqual([true, false, true, false]);
  });

  it('adds no hide middleware and never reports by default', async () => {
    const onAnchorHiddenChange = vi.fn();
    floating.computePosition.mockResolvedValue({
      x: 0,
      y: 0,
      placement: 'bottom-start',
      middlewareData: { hide: { referenceHidden: true } },
    });
    const { stop } = start({ onAnchorHiddenChange });
    await flush();
    stop();
    expect(floating.args.get('hide')).toBeUndefined();
    expect(onAnchorHiddenChange).not.toHaveBeenCalled();
  });

  it('writes no visibility, pointer-events or display', async () => {
    floating.computePosition.mockResolvedValue({
      x: 0,
      y: 0,
      placement: 'bottom-start',
      middlewareData: { hide: { referenceHidden: true } },
    });
    start({ hideWhenDetached: true });
    await flush();
    expect(content.style.visibility).toBe('');
    expect(content.style.pointerEvents).toBe('');
    expect(content.style.display).toBe('');
  });
});

describe('virtual anchor', () => {
  it('positions and auto updates against a virtual anchor', async () => {
    const virtual = { getBoundingClientRect: () => new DOMRect(5, 6, 7, 8), contextElement: anchor };
    startOverlayPosition({
      getAnchor: () => virtual,
      getContent: () => content,
      side: 'bottom',
      align: 'start',
      getDirection: () => 'ltr',
      onPlacementChange: () => undefined,
    });
    await flush();
    expect(floating.autoUpdate).toHaveBeenCalledWith(virtual, content, expect.any(Function), undefined);
    expect(floating.computePosition).toHaveBeenCalledWith(virtual, content, expect.anything());
    expect(content.style.left).toBe('10px');
  });

  it('works without a contextElement', () => {
    const virtual = { getBoundingClientRect: () => new DOMRect(0, 0, 1, 1) };
    const stop = startOverlayPosition({
      getAnchor: () => virtual,
      getContent: () => content,
      side: 'top',
      align: 'center',
      getDirection: () => 'ltr',
      onPlacementChange: () => undefined,
    });
    stop();
    expect(floating.cleanup).toHaveBeenCalledTimes(1);
  });
});

describe('startOverlayPosition defaults', () => {
  const startBare = (): void => {
    startOverlayPosition({ getAnchor: () => anchor, getContent: () => content, onPlacementChange: () => undefined });
  };

  it('with no side and align, places the content at the bottom, centred', async () => {
    startBare();
    await flush();
    expect(floating.computePosition).toHaveBeenCalledWith(
      anchor,
      content,
      expect.objectContaining({ placement: 'bottom' }),
    );
  });

  it('with no getDirection and an rtl anchor, the start side is the right edge', async () => {
    anchor.setAttribute('dir', 'rtl');
    startOverlayPosition({
      getAnchor: () => anchor,
      getContent: () => content,
      side: 'start',
      onPlacementChange: () => undefined,
    });
    await flush();
    expect(floating.computePosition).toHaveBeenCalledWith(
      anchor,
      content,
      expect.objectContaining({ placement: 'right' }),
    );
  });
});

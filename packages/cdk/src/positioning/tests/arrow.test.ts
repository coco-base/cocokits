// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import type { MiddlewareState } from '@floating-ui/dom';
import { arrowMiddleware, transformOriginMiddleware, writeArrow } from '../arrow';
import type { ArrowData } from '../arrow';

const SIZE = { width: 10, height: 5 };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function state(
  placement: string,
  reference: Rect,
  floating: Rect,
  middlewareData: Record<string, unknown> = {},
): MiddlewareState {
  return {
    x: floating.x,
    y: floating.y,
    placement,
    rects: { reference, floating },
    elements: { floating: document.createElement('div') },
    middlewareData,
  } as unknown as MiddlewareState;
}

async function arrowOf(
  placement: string,
  reference: Rect,
  floating: Rect,
  options: { padding?: number; hideShifted?: boolean } = {},
): Promise<ArrowData & { moved: { x?: number | undefined; y?: number | undefined } }> {
  const result = await arrowMiddleware(SIZE, options.padding ?? 0, options.hideShifted ?? true).fn(
    state(placement, reference, floating),
  );
  return { ...(result.data as ArrowData), moved: { x: result.x, y: result.y } };
}

const anchor = { x: 100, y: 200, width: 100, height: 40 };

describe('arrow placement', () => {
  it('centres the arrow on the anchor along a top or bottom edge', async () => {
    const data = await arrowOf('bottom', anchor, { x: 80, y: 250, width: 200, height: 100 });
    expect(data.x).toBe(65);
    expect(data.y).toBeUndefined();
    expect(data.centerOffset).toBe(0);
    expect(data.hidden).toBe(false);
  });

  it('centres the arrow on the anchor along a left or right edge', async () => {
    const data = await arrowOf('right', anchor, { x: 210, y: 150, width: 100, height: 200 });
    expect(data.y).toBe(67.5);
    expect(data.x).toBeUndefined();
    expect(data.centerOffset).toBe(0);
  });

  it('keeps the arrow arrowPadding from the corners and reports the shift', async () => {
    const data = await arrowOf(
      'bottom',
      { x: -100, y: 200, width: 20, height: 40 },
      { x: 0, y: 250, width: 200, height: 100 },
      { padding: 12 },
    );
    expect(data.x).toBe(12);
    expect(data.centerOffset).not.toBe(0);
    expect(data.hidden).toBe(true);
  });

  it('never reports it hidden with hideShifted false', async () => {
    const data = await arrowOf(
      'bottom',
      { x: -100, y: 200, width: 20, height: 40 },
      { x: 0, y: 250, width: 200, height: 100 },
      { hideShifted: false },
    );
    expect(data.centerOffset).not.toBe(0);
    expect(data.hidden).toBe(false);
  });

  it('uses the size measured at the start, whatever the element measures now', async () => {
    const floating = document.createElement('div');
    Object.defineProperty(floating, 'clientWidth', { value: 200 });
    const result = await arrowMiddleware(SIZE, 0, true).fn({
      ...state('bottom', anchor, { x: 80, y: 250, width: 200, height: 100 }),
      elements: { floating },
    } as unknown as MiddlewareState);
    expect((result.data as ArrowData).x).toBe(65);
  });
});

describe('writeArrow', () => {
  const data: ArrowData = { x: 30, centerOffset: 0, hidden: false };

  it('sits below the content on a top placement, pointing down', () => {
    const arrow = document.createElement('span');
    writeArrow(arrow, 'top-start', data);
    expect(arrow.style.position).toBe('absolute');
    expect(arrow.style.left).toBe('30px');
    expect(arrow.style.bottom).toBe('0px');
    expect(arrow.style.top).toBe('');
    expect(arrow.style.transform).toBe('translateY(100%)');
  });

  it('sits on top of the content on a bottom placement, turned around', () => {
    const arrow = document.createElement('span');
    writeArrow(arrow, 'bottom', data);
    expect(arrow.style.top).toBe('0px');
    expect(arrow.style.bottom).toBe('');
    expect(arrow.style.transform).toBe('rotate(180deg)');
    expect(arrow.style.transformOrigin).toBe('center 0');
  });

  it('uses the top offset and the opposite edge on the sides, and clears what a flip leaves', () => {
    const arrow = document.createElement('span');
    writeArrow(arrow, 'bottom', data);
    writeArrow(arrow, 'right', { y: 12, centerOffset: 0, hidden: false });
    expect(arrow.style.top).toBe('12px');
    expect(arrow.style.left).toBe('0px');
    expect(arrow.style.bottom).toBe('');
    expect(arrow.style.transform).toContain('rotate(90deg)');
    writeArrow(arrow, 'left', { y: 12, centerOffset: 0, hidden: false });
    expect(arrow.style.right).toBe('0px');
    expect(arrow.style.left).toBe('');
    expect(arrow.style.transform).toContain('rotate(-90deg)');
  });

  it('writes no display, visibility or hidden attribute', () => {
    const arrow = document.createElement('span');
    writeArrow(arrow, 'bottom', { x: 5, centerOffset: 3, hidden: true });
    expect(arrow.style.display).toBe('');
    expect(arrow.style.visibility).toBe('');
    expect(arrow.hasAttribute('hidden')).toBe(false);
  });
});

function originOf(placement: string, arrow: ArrowData | undefined, dir: 'ltr' | 'rtl' = 'ltr', size = SIZE): string {
  const middlewareData = arrow ? { cckArrow: arrow } : {};
  const result = transformOriginMiddleware(arrow ? size : null, () => dir).fn(
    state(placement, anchor, { x: 0, y: 0, width: 200, height: 100 }, middlewareData),
  ) as { data: { x: string; y: string } };
  return `${result.data.x} ${result.data.y}`;
}

describe('transform origin', () => {
  it('is the anchor-facing edge by alignment without an arrow', () => {
    expect(originOf('bottom-start', undefined)).toBe('0% 0px');
    expect(originOf('bottom', undefined)).toBe('50% 0px');
    expect(originOf('bottom-end', undefined)).toBe('100% 0px');
    expect(originOf('top-start', undefined)).toBe('0% 100px');
    expect(originOf('right-start', undefined)).toBe('0px 0%');
    expect(originOf('right-end', undefined)).toBe('0px 100%');
    expect(originOf('left', undefined)).toBe('200px 50%');
  });

  it('follows the inline start in RTL on a top or bottom side', () => {
    expect(originOf('bottom-start', undefined, 'rtl')).toBe('100% 0px');
    expect(originOf('top-end', undefined, 'rtl')).toBe('0% 100px');
    expect(originOf('right-start', undefined, 'rtl')).toBe('0px 0%');
  });

  it('is the arrow tip with an arrow, on all four sides', () => {
    expect(originOf('bottom', { x: 65, centerOffset: 0, hidden: false })).toBe('70px -5px');
    expect(originOf('top', { x: 65, centerOffset: 0, hidden: false })).toBe('70px 105px');
    expect(originOf('right', { y: 95, centerOffset: 0, hidden: false })).toBe('-5px 97.5px');
    expect(originOf('left', { y: 95, centerOffset: 0, hidden: false })).toBe('205px 97.5px');
  });

  it('is the edge by alignment while the arrow is hidden', () => {
    expect(originOf('bottom-start', { x: 0, centerOffset: 4, hidden: true })).toBe('0% 0px');
  });

  it('keeps the arrow tip when a shifted arrow is not hidden', () => {
    expect(originOf('bottom', { x: 0, centerOffset: 4, hidden: false })).toBe('5px -5px');
  });
});

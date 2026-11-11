import { autoUpdate, computePosition, flip, hide, limitShift, offset, shift, size } from '@floating-ui/dom';
import type { AutoUpdateOptions, DetectOverflowOptions, Middleware } from '@floating-ui/dom';
import type { Direction } from '@cocokits/shared';
import { isShadowRoot } from '@cocokits/utils';
import { computedDirection } from '../direction';
import { arrowMiddleware, transformOriginMiddleware, writeArrow } from './arrow';
import type { ArrowData, ArrowSize } from './arrow';
import { fromFloatingPlacement, toFloatingPlacement } from './placement';
import type {
  OverlayAlign,
  OverlayCollisionPadding,
  OverlaySide,
  OverlaySticky,
  OverlayVirtualAnchor,
} from './placement';

/** Options of {@link startOverlayPosition}. */
export interface OverlayPositionOptions {
  /** Returns the element or virtual anchor that the content is placed against, or `null` while it is not rendered. */
  readonly getAnchor: () => Element | OverlayVirtualAnchor | null;
  /** Returns the overlay content, or `null` while it is not rendered. */
  readonly getContent: () => HTMLElement | null;
  /**
   * The side of the anchor that you want the content on. It can flip to the opposite side when there is no room.
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How you want the content to line up along the edge of the anchor.
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Returns the text direction of the overlay. The function is read on every position update.
   * @defaultValue The computed `direction` of the anchor, read on every call. For a virtual anchor without a `contextElement`, it is the direction of the content.
   */
  readonly getDirection?: (() => Direction) | undefined;
  /** Called with the side and alignment that were used, after flip and shift. It runs after the first measure and again when they change. */
  readonly onPlacementChange: (placement: { side: OverlaySide; align: OverlayAlign }) => void;
  /**
   * The gap between the anchor and the content, in px. When you set it, the `--side-offset` custom property of the content is not read.
   * When not set, the gap is the computed `--side-offset` of the content, or `0` when that is not set either.
   */
  readonly sideOffset?: number;
  /**
   * Moves the content along the edge of the anchor, away from the aligned edge, in px. It has no effect with `align: 'center'`.
   * @defaultValue 0
   */
  readonly alignOffset?: number;
  /**
   * Whether the content flips and shifts to stay in view. With `false`, the content keeps the side and alignment you asked for.
   * @defaultValue true
   */
  readonly avoidCollisions?: boolean;
  /**
   * The distance in px that the content keeps from the viewport edges. A number applies to all four edges, and an object sets single edges.
   * The distance applies to flip, shift, the size check and the hidden check.
   * @defaultValue 5
   */
  readonly collisionPadding?: OverlayCollisionPadding;
  /**
   * How the content stays in view along the edge of the anchor.
   * `'partial'` keeps it in view only while the anchor is partly in view, and `'always'` keeps it in view in every case.
   * @defaultValue 'partial'
   */
  readonly sticky?: OverlaySticky;
  /**
   * Whether to report, through `onAnchorHiddenChange`, when the anchor is fully hidden by its clipping ancestors.
   * @defaultValue false
   */
  readonly hideWhenDetached?: boolean;
  /**
   * Called with `true` when the anchor becomes fully hidden, and with `false` when it is visible again.
   * It also runs with `false` when the position stops while the anchor is hidden.
   * It runs only with `hideWhenDetached`.
   */
  readonly onAnchorHiddenChange?: (hidden: boolean) => void;
  /** Returns the arrow element inside the content. It is measured once, when the position starts. When not set, or when it returns `null`, there is no arrow. */
  readonly getArrow?: () => Element | null;
  /**
   * The distance in px between the arrow and the corners of the content.
   * @defaultValue 0
   */
  readonly arrowPadding?: number;
  /**
   * Whether to report the arrow as hidden while it cannot point at the centre of the anchor. With `false`, it is never reported.
   * @defaultValue true
   */
  readonly hideShiftedArrow?: boolean;
  /**
   * Called with `true` when the arrow cannot point at the anchor and should be hidden, and with `false` when it can again.
   * It also runs with `false` when the position stops while the arrow is hidden.
   */
  readonly onArrowHiddenChange?: (hidden: boolean) => void;
  /**
   * Elements that the content must also stay inside, besides the viewport. `null` entries are ignored.
   * @defaultValue [] (no extra boundary)
   */
  readonly collisionBoundary?: Element | null | readonly (Element | null)[];
  /**
   * When the content is placed again.
   *
   * @cckValue optimized - Places the content only when something moved.
   * @cckValue always - Places the content on every animation frame.
   * @defaultValue 'optimized'
   */
  readonly updatePositionStrategy?: 'optimized' | 'always';
  /**
   * Whether the content may flip to the opposite side.
   * @defaultValue true
   */
  readonly sideFlip?: boolean;
  /**
   * Whether the alignment may flip to the opposite one.
   * @defaultValue true
   */
  readonly alignFlip?: boolean;
  /**
   * Whether the content also shifts along the side axis, so it stays in view even when it covers the anchor.
   * @defaultValue false
   */
  readonly prioritizePosition?: boolean;
  /**
   * Whether to skip placing the content again when the layout shifts, which is when an element resizes or moves without scrolling.
   * @defaultValue false
   */
  readonly disableUpdateOnLayoutShift?: boolean;
}

const DEFAULT_COLLISION_PADDING = 5;

const LENGTH = /^(-?\d*\.?\d+)(px|rem|em)?$/;

/** The gap from the content's `--side-offset` in px; `0` when it is unset or neither a computed px nor a px, rem or em number. */
function readSideOffset(content: HTMLElement): number {
  const view = content.ownerDocument.defaultView;
  if (!view) return 0;
  const match = LENGTH.exec(view.getComputedStyle(content).getPropertyValue('--side-offset').trim());
  if (!match) return 0;
  const value = Number.parseFloat(match[1] ?? '0');
  if (match[2] === 'rem')
    return value * (Number.parseFloat(view.getComputedStyle(content.ownerDocument.documentElement).fontSize) || 16);
  if (match[2] === 'em') return value * (Number.parseFloat(view.getComputedStyle(content).fontSize) || 16);
  return value;
}

function resolvePadding(
  padding: OverlayCollisionPadding,
): number | Record<'top' | 'right' | 'bottom' | 'left', number> {
  return typeof padding === 'number' ? padding : { top: 0, right: 0, bottom: 0, left: 0, ...padding };
}

/** The boundaries as a list: one element, a list or `null`, without the empty entries. */
function boundariesOf(boundary: OverlayPositionOptions['collisionBoundary']): Element[] {
  const list = boundary === undefined || boundary === null ? [] : 'nodeType' in boundary ? [boundary] : boundary;
  return list.filter((element): element is Element => element !== null);
}

/** The options every collision check shares: the padding and, with boundaries given, those boundaries. */
function detectOptions(options: OverlayPositionOptions): DetectOverflowOptions {
  const padding = resolvePadding(options.collisionPadding ?? DEFAULT_COLLISION_PADDING);
  const boundary = boundariesOf(options.collisionBoundary);
  return boundary.length > 0 ? { padding, boundary, altBoundary: true } : { padding };
}

/** The auto update options; `undefined` (Floating UI's defaults) unless an option asks for more. */
function autoUpdateOptions(options: OverlayPositionOptions): AutoUpdateOptions | undefined {
  const always = options.updatePositionStrategy === 'always';
  if (!always && !options.disableUpdateOnLayoutShift) return undefined;
  return {
    ...(always ? { animationFrame: true } : {}),
    ...(options.disableUpdateOnLayoutShift ? { layoutShift: false } : {}),
  };
}

/** The given `getDirection`, or one that reads the anchor's computed direction on every call (the code polls the getter). */
function directionGetter(
  options: OverlayPositionOptions,
  anchor: Element | OverlayVirtualAnchor,
  content: HTMLElement,
): () => Direction {
  if (options.getDirection) return options.getDirection;
  const context = 'nodeType' in anchor ? anchor : (anchor.contextElement ?? content);
  return () => computedDirection(context);
}

/** The arrow's size, measured once; `null` when there is no arrow part. */
function measureArrow(arrow: HTMLElement | null): ArrowSize | null {
  return arrow ? { width: arrow.offsetWidth, height: arrow.offsetHeight } : null;
}

/** The Floating UI middlewares for the options, built once per start. The `size` one writes the measured geometry. */
function buildMiddleware(
  options: OverlayPositionOptions,
  content: HTMLElement,
  arrowSize: ArrowSize | null,
  getDirection: () => Direction,
): Middleware[] {
  const detect = detectOptions(options);
  const limiter = (options.sticky ?? 'partial') === 'partial' ? limitShift() : undefined;
  const flipAxes = {
    ...(options.sideFlip === undefined ? {} : { mainAxis: options.sideFlip }),
    ...(options.alignFlip === undefined ? {} : { crossAxis: options.alignFlip }),
  };
  const flipping = (): Middleware => flip({ ...detect, ...flipAxes });
  const shifting = (): Middleware =>
    shift({ ...detect, limiter, ...(options.prioritizePosition ? { crossAxis: true } : {}) });
  return [
    offset({
      mainAxis: (options.sideOffset ?? readSideOffset(content)) + (arrowSize?.height ?? 0),
      alignmentAxis: options.alignOffset ?? 0,
    }),
    ...(options.avoidCollisions === false
      ? []
      : // Shift first, then flip; `prioritizePosition` flips first, so the content
        // stays in view even where it covers the anchor.
        options.prioritizePosition
        ? [flipping(), shifting()]
        : [shifting(), flipping()]),
    size({
      ...detect,
      apply({ availableWidth, availableHeight, rects }) {
        content.style.setProperty('--anchor-width', `${String(Math.round(rects.reference.width))}px`);
        content.style.setProperty('--available-width', `${String(Math.max(0, Math.round(availableWidth)))}px`);
        content.style.setProperty('--available-height', `${String(Math.max(0, Math.round(availableHeight)))}px`);
      },
    }),
    ...(arrowSize ? [arrowMiddleware(arrowSize, options.arrowPadding ?? 0, options.hideShiftedArrow ?? true)] : []),
    transformOriginMiddleware(arrowSize, getDirection),
    ...(options.hideWhenDetached ? [hide({ strategy: 'referenceHidden', ...detect })] : []),
  ];
}

/**
 * Places the content of an overlay next to its anchor, and keeps it there while the page scrolls, resizes or changes.
 * It uses the `fixed` position strategy. It stops when you call the function it returns.
 *
 * @remarks
 * It writes inline styles on the content and nothing else. At the start it sets `position: fixed` with
 * `top: 0` and `left: 0`, so the content never takes space or flashes before the first measure. Each update then
 * sets `top` and `left`.
 *
 * It also writes the custom properties `--anchor-width`, `--available-width` and `--available-height`, which hold the
 * measured geometry. Your CSS can use them to size the content. It writes `--transform-origin` too, which is the
 * point where the content meets its anchor, or the tip of the arrow when there is an arrow.
 *
 * The gap between anchor and content is `sideOffset` when you set it. Otherwise it is the computed
 * `--side-offset` of the content, read once when the position starts. Your theme can set `--side-offset` as a length
 * in px, rem or em. When it is not set, the gap is `0`.
 *
 * The anchor can be a virtual anchor. Updates then follow the scrolling ancestors of its `contextElement`.
 *
 * With an arrow element, the gap grows by the height of the arrow, measured once at the start. The arrow gets
 * `position: absolute`, its edge, its offset and a turn as inline styles. When it cannot point at the anchor,
 * `onArrowHiddenChange` reports it. The function never writes `display` or `visibility`, so you hide the arrow yourself.
 *
 * The side and alignment that were used are reported as logical values through `onPlacementChange`. You can write
 * them as `data-side` and `data-align`. A change of `dir` on an ancestor places the content again.
 *
 * @param options - The anchor, the content, the placement, the optional settings and the callbacks.
 * @returns The stop function. Call it when the overlay closes. Calling it again does nothing.
 * @example
 * const anchor = document.querySelector<HTMLElement>('#anchor')!;
 * const content = document.querySelector<HTMLElement>('#content')!;
 * const stop = startOverlayPosition({
 *   getAnchor: () => anchor,
 *   getContent: () => content,
 *   side: 'bottom',
 *   align: 'start',
 *   sideOffset: 8,
 *   onPlacementChange: ({ side, align }) => {
 *     content.dataset['side'] = side;
 *     content.dataset['align'] = align;
 *   },
 * });
 * // When the overlay closes:
 * stop();
 */
export function startOverlayPosition(options: OverlayPositionOptions): () => void {
  const anchor = options.getAnchor();
  const content = options.getContent();
  if (!anchor || !content) return () => undefined;

  content.style.position = 'fixed';
  content.style.top = '0';
  content.style.left = '0';

  const arrow = (options.getArrow?.() ?? null) as HTMLElement | null;
  // Out of flow before the measure, so a bare inline part shrinks to its content instead of the content's width.
  if (arrow) arrow.style.position = 'absolute';
  const getDirection = directionGetter(options, anchor, content);
  const side = options.side ?? 'bottom';
  const align = options.align ?? 'center';
  const middleware = buildMiddleware(options, content, measureArrow(arrow), getDirection);
  const hideWhenDetached = options.hideWhenDetached ?? false;
  let stopped = false;
  let anchorHidden = false;
  let arrowHidden = false;
  let reported: { side: OverlaySide; align: OverlayAlign } | null = null;

  const update = (): void => {
    const dir = getDirection();
    void computePosition(anchor, content, {
      strategy: 'fixed',
      placement: toFloatingPlacement(side, align, dir),
      middleware,
    }).then(({ x, y, placement, middlewareData }) => {
      if (stopped) return;
      if (hideWhenDetached) {
        const hidden = middlewareData.hide?.referenceHidden === true;
        if (hidden !== anchorHidden) {
          anchorHidden = hidden;
          options.onAnchorHiddenChange?.(hidden);
        }
      }
      content.style.left = `${String(Math.round(x))}px`;
      content.style.top = `${String(Math.round(y))}px`;
      const origin = middlewareData['cckTransformOrigin'] as { x: string; y: string } | undefined;
      if (origin) content.style.setProperty('--transform-origin', `${origin.x} ${origin.y}`);
      const arrowData = middlewareData['cckArrow'] as ArrowData | undefined;
      if (arrow && arrowData) {
        writeArrow(arrow, placement, arrowData);
        if (arrowData.hidden !== arrowHidden) {
          arrowHidden = arrowData.hidden;
          options.onArrowHiddenChange?.(arrowHidden);
        }
      }
      const next = fromFloatingPlacement(placement, dir);
      if (reported?.side === next.side && reported.align === next.align) return;
      reported = next;
      options.onPlacementChange(next);
    });
  };

  const cleanup = autoUpdate(anchor, content, update, autoUpdateOptions(options));
  // Floating UI has no direction trigger: a `dir` change on the anchor's ancestors re-measures here.
  const context = 'nodeType' in anchor ? anchor : (anchor.contextElement ?? content);
  const doc = context.ownerDocument;
  const observer = new (doc.defaultView?.MutationObserver ?? MutationObserver)(update);
  const root = context.getRootNode();
  for (const target of isShadowRoot(root) ? [doc, root] : [doc]) {
    observer.observe(target, { attributes: true, subtree: true, attributeFilter: ['dir'] });
  }
  return () => {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    cleanup();
    if (anchorHidden) options.onAnchorHiddenChange?.(false);
    if (arrowHidden) options.onArrowHiddenChange?.(false);
  };
}

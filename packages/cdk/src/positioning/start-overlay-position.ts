import { autoUpdate, computePosition, flip, hide, limitShift, offset, shift, size } from '@floating-ui/dom';
import type { AutoUpdateOptions, DetectOverflowOptions, Middleware } from '@floating-ui/dom';
import type { Direction } from '@cocokits/shared';
import { isShadowRoot } from '@cocokits/utils';
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
  /** The element or virtual anchor the content is placed against; `null` while it is not rendered. */
  readonly getAnchor: () => Element | OverlayVirtualAnchor | null;
  /** The overlay content; `null` while it is not rendered. */
  readonly getContent: () => HTMLElement | null;
  /** The wanted side. */
  readonly side: OverlaySide;
  /** The wanted alignment. */
  readonly align: OverlayAlign;
  /** The direction of the overlay. */
  readonly getDirection: () => Direction;
  /** Called with the side and alignment after flip and shift, when they change (and after the first measure). */
  readonly onPlacementChange: (placement: { side: OverlaySide; align: OverlayAlign }) => void;
  /** The gap between anchor and content in px. When given, the content's `--side-offset` is not read. */
  readonly sideOffset?: number;
  /** Moves the content along the anchor's edge, away from the aligned edge, in px. No effect with `align: 'center'`. Default `0`. */
  readonly alignOffset?: number;
  /** `false` turns flip and shift off: the content keeps the wanted side and alignment. Default `true`. */
  readonly avoidCollisions?: boolean;
  /** The distance from the viewport edges that flip, shift, size and the hidden check keep. Default `5`. */
  readonly collisionPadding?: OverlayCollisionPadding;
  /** `partial` keeps the content in view along the edge only while the anchor is partly in view; `always` keeps it in view regardless. Default `partial`. */
  readonly sticky?: OverlaySticky;
  /** Reports through `onAnchorHiddenChange` when the anchor is fully hidden by its clipping ancestors. Default `false`. */
  readonly hideWhenDetached?: boolean;
  /**
   * Called with `true` when the anchor becomes fully hidden, with `false` when it is visible again and
   * when the position stops while hidden. Only with `hideWhenDetached`.
   */
  readonly onAnchorHiddenChange?: (hidden: boolean) => void;
  /** The arrow part inside the content; `null` or unset: no arrow. Measured once when the position starts. */
  readonly getArrow?: () => Element | null;
  /** The distance in px between the arrow and the content's corners. Default `0`. */
  readonly arrowPadding?: number;
  /** Reports the arrow as hidden while it cannot point at the anchor's centre. `false` never reports it. Default `true`. */
  readonly hideShiftedArrow?: boolean;
  /** Called with `true` when the arrow cannot point at the anchor and should be hidden, with `false` when it can again and when the position stops while hidden. */
  readonly onArrowHiddenChange?: (hidden: boolean) => void;
  /** Elements the content must also stay inside, besides the viewport; `null` entries are ignored. Default none. */
  readonly collisionBoundary?: Element | null | readonly (Element | null)[];
  /** `always` re-places the content on every animation frame; `optimized` only when something moved. Default `optimized`. */
  readonly updatePositionStrategy?: 'optimized' | 'always';
  /** Whether the content may flip to the opposite side. Default `true`. */
  readonly sideFlip?: boolean;
  /** Whether the alignment may flip to the opposite one. Default `true`. */
  readonly alignFlip?: boolean;
  /** `true` also shifts the content along the side axis, so it stays in view even when it covers the anchor. Default `false`. */
  readonly prioritizePosition?: boolean;
  /** `true` does not re-place the content when the layout shifts (the element resizes or moves without scrolling). Default `false`. */
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

/** The arrow's size, measured once; `null` when there is no arrow part. */
function measureArrow(arrow: HTMLElement | null): ArrowSize | null {
  return arrow ? { width: arrow.offsetWidth, height: arrow.offsetHeight } : null;
}

/** The Floating UI middlewares for the options, built once per start. The `size` one writes the measured geometry. */
function buildMiddleware(
  options: OverlayPositionOptions,
  content: HTMLElement,
  arrowSize: ArrowSize | null,
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
      : // As Radix and Reka order them: shift first, then flip; `prioritizePosition` flips first, so the content
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
    transformOriginMiddleware(arrowSize, options.getDirection),
    ...(options.hideWhenDetached ? [hide({ strategy: 'referenceHidden', ...detect })] : []),
  ];
}

/**
 * Places an overlay's content next to its anchor with Floating UI (this module is the only importer of
 * `@floating-ui/dom`). The strategy is `fixed`; the middlewares are offset, shift, flip (flip, shift with `prioritizePosition`), size and, with
 * `hideWhenDetached`, hide, plus the arrow and the transform origin; the position follows scroll, resize and layout changes until the returned
 * stop is called.
 *
 * It writes inline styles on the content and nothing else: `position: fixed` with `top: 0; left: 0`
 * at the start (so the content never takes space in flow or flashes before the first measure), then
 * `top` and `left` from each update, and the measured geometry `--anchor-width`,
 * `--available-width` and `--available-height`. The gap is `sideOffset` when given; otherwise the
 * content's computed `--side-offset` (a px, rem or em length the theme sets; `0` when unset), read once
 * when the position starts. With the theme's `<length>` registration the browser computes `calc()`,
 * `rem` and `em` to px; without it a plain px, rem or em number is still parsed. The anchor may be a
 * virtual anchor; auto update then follows the ancestors of its `contextElement`. `hideWhenDetached`
 * writes no style: the fact goes out through `onAnchorHiddenChange`. The content also gets `--transform-origin`,
 * the point where it meets its anchor (the arrow tip with an arrow). With an arrow part (`getArrow`), the
 * gap grows by the arrow's height, measured once at the start, and the arrow gets `position: absolute`, its
 * edge, offset and a turn inline; whether it cannot point at the anchor goes out through `onArrowHiddenChange`
 * (the adapter renders the native `hidden`; the module never writes `display` or `visibility`). The resolved side and alignment
 * are reported as logical values through `onPlacementChange`; the machine renders them as `data-side`
 * and `data-align`. Nothing is created, moved or read back from the DOM.
 *
 * @param options - The anchor, the content, the wanted placement, the optional positioning options and the callbacks.
 * @returns The stop; call it when the overlay closes. Idempotent.
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
  const middleware = buildMiddleware(options, content, measureArrow(arrow));
  const hideWhenDetached = options.hideWhenDetached ?? false;
  let stopped = false;
  let anchorHidden = false;
  let arrowHidden = false;
  let reported: { side: OverlaySide; align: OverlayAlign } | null = null;

  const update = (): void => {
    const dir = options.getDirection();
    void computePosition(anchor, content, {
      strategy: 'fixed',
      placement: toFloatingPlacement(options.side, options.align, dir),
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

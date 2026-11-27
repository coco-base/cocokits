import { isInside, isModal } from './layer';
import type { Layer } from './layer';
import type { DismissReason } from './dismiss-reason';

/** A press on the page's scrollbar targets the root element beyond its client area. */
function isRootScrollbarPress(doc: Document, event: MouseEvent): boolean {
  const root = doc.documentElement;
  const view = doc.defaultView;
  const gutter = view ? Math.max(0, view.innerWidth - root.clientWidth) : 0;
  const rtl = view?.getComputedStyle(root).direction === 'rtl';
  const horizontal = rtl ? gutter > 0 && event.clientX < gutter : event.clientX > root.clientWidth;
  return horizontal || event.clientY > root.clientHeight;
}

/** The width of a border pair, in px. */
function borders(first: string, second: string): number {
  return (Number.parseFloat(first) || 0) + (Number.parseFloat(second) || 0);
}

/** A press on a scroller's scrollbar targets the scroller itself, outside its client area. */
function isElementScrollbarPress(element: HTMLElement, view: Window, event: MouseEvent): boolean {
  const style = view.getComputedStyle(element);
  const verticalBar =
    element.offsetWidth - element.clientWidth - borders(style.borderLeftWidth, style.borderRightWidth) > 0;
  const horizontalBar =
    element.offsetHeight - element.clientHeight - borders(style.borderTopWidth, style.borderBottomWidth) > 0;
  if (!verticalBar && !horizontalBar) return false;
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const outsideX = x < element.clientLeft || x >= element.clientLeft + element.clientWidth;
  const outsideY = y < element.clientTop || y >= element.clientTop + element.clientHeight;
  return (verticalBar && outsideX) || (horizontalBar && outsideY);
}

/** Whether the press hit a scrollbar of the page or of any scroller: that is scrolling, not an outside press. */
export function isScrollbarPress(doc: Document, event: MouseEvent, target: Node | null): boolean {
  if (target === doc.documentElement) return isRootScrollbarPress(doc, event);
  const view = doc.defaultView;
  if (target?.nodeType !== 1 || !view) return false;
  return isElementScrollbarPress(target as HTMLElement, view, event);
}

/**
 * A press on a modal dialog's `::backdrop` targets the dialog itself, so it lies inside the layer by
 * containment; the pointer position tells it from a press on the dialog's own padding.
 */
function isBackdropPress(layer: Layer, event: MouseEvent | undefined, target: Node | null): boolean {
  const dialog = layer.getDialog?.();
  if (!event || !dialog || target !== dialog) return false;
  const rect = dialog.getBoundingClientRect();
  return (
    event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  );
}

/** A modal ignores a secondary-button press and a ctrl+primary press. */
function modalIgnores(event: MouseEvent | undefined): boolean {
  return !!event && (event.button !== 0 || event.ctrlKey);
}

/**
 * The layers that get an intent for an outside press or a focus-out, from the top down. A layer that
 * contains the target ends the walk (a modal's backdrop does not count as containing); a layer that
 * does not listen is skipped; a modal always ends the walk, because nothing below it gets the event,
 * and is collected only when it listens and the press counts for it; an exiting modal ends it with no
 * intent. The result is decided when the press starts, so a touch press can dispatch it on `click`.
 */
export function collectLayers(
  layers: readonly Layer[],
  reason: DismissReason,
  target: Node | null,
  press?: MouseEvent,
): Layer[] {
  const found: Layer[] = [];
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (!layer) continue;
    const modal = isModal(layer);
    if (isInside(layer, target, layers) && !isBackdropPress(layer, press, target)) break;
    if (layer.exited) {
      if (modal) break;
      continue;
    }
    const listens = layer.dismissOn.has(reason);
    if (modal) {
      if (listens && !modalIgnores(press)) found.push(layer);
      break;
    }
    if (listens) found.push(layer);
  }
  return found;
}

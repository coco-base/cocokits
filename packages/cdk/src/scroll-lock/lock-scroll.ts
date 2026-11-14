interface ScrollLock {
  count: number;
  restore: () => void;
}

const locks = new WeakMap<Document, ScrollLock>();

/** The name of the measured variable on `<html>`. */
const SCROLLBAR_WIDTH = '--scrollbar-width';

const NOTHING_TO_RESTORE = (): void => undefined;

const scrolls = (element: Element): boolean =>
  element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;

/** Writes `value` as inline style `name` and returns what puts the previous inline value back. */
function setInline(element: HTMLElement, name: string, value: string): () => void {
  const previous = element.style.getPropertyValue(name);
  const previousPriority = element.style.getPropertyPriority(name);
  element.style.setProperty(name, value);
  return () => {
    if (previous) element.style.setProperty(name, previous, previousPriority);
    else element.style.removeProperty(name);
  };
}

/** The right padding `element` gets to make up for a scrollbar of `width` px that the lock hides. */
function padRight(element: HTMLElement, view: Window, width: number): () => void {
  const padding = Number.parseFloat(view.getComputedStyle(element).paddingRight) || 0;
  return setInline(element, 'padding-right', `${String(padding + width)}px`);
}

/**
 * The body is a scroll container of its own when the root does not take its overflow (the root's
 * overflow is not `visible`) and its own overflow scrolls.
 */
function bodyScrolls(root: HTMLElement, body: HTMLElement, view: Window): boolean {
  if (view.getComputedStyle(root).overflowY === 'visible') return false;
  const overflow = view.getComputedStyle(body).overflowY;
  return overflow === 'auto' || overflow === 'scroll';
}

function applyLock(doc: Document): ScrollLock {
  const root = doc.documentElement;
  const body = doc.body as HTMLElement | null;
  const view = doc.defaultView;
  // A page that does not scroll has nothing to lock.
  if (!view || !(scrolls(root) || (body && scrolls(body)))) return { count: 0, restore: NOTHING_TO_RESTORE };
  const restores: (() => void)[] = [];
  const scroller = body && bodyScrolls(root, body, view) ? body : null;
  const rootScrollbar = Math.max(0, view.innerWidth - root.clientWidth);
  // `scrollbar-gutter: stable` keeps the layout width when the overflow is hidden: padding would add to it.
  const gutter = view.getComputedStyle(root).getPropertyValue('scrollbar-gutter').startsWith('stable');
  let added = 0;
  if (rootScrollbar > 0 && !gutter) {
    restores.push(padRight(root, view, rootScrollbar));
    added = rootScrollbar;
  }
  if (scroller) {
    const bodyScrollbar = Math.max(0, scroller.offsetWidth - scroller.clientWidth - bodyBorders(scroller, view));
    restores.push(setInline(scroller, 'overflow', 'hidden'));
    if (bodyScrollbar > 0) {
      restores.push(padRight(scroller, view, bodyScrollbar));
      added ||= bodyScrollbar;
    }
  }
  restores.push(setInline(root, 'overflow', 'hidden'));
  if (added > 0) restores.push(setInline(root, SCROLLBAR_WIDTH, `${String(added)}px`));
  return {
    count: 0,
    restore: () => {
      restores.reverse().forEach((restore) => {
        restore();
      });
    },
  };
}

/** The width of the left and right borders of the body, which `offsetWidth` counts and a scrollbar does not. */
function bodyBorders(body: HTMLElement, view: Window): number {
  const style = view.getComputedStyle(body);
  return (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.borderRightWidth) || 0);
}

/**
 * Stops a document from scrolling while a modal overlay is open, and keeps the page from shifting.
 * It sets `overflow: hidden` on the root element and adds right padding for the width of the scrollbar.
 *
 * @remarks
 * It does nothing when the page does not scroll, which is when the root and the body fit. It adds no padding when the
 * root has `scrollbar-gutter: stable`, because that keeps the layout. It also hides and pads `<body>` when the body is
 * a scroll container of its own.
 *
 * While the lock holds, the custom property `--scrollbar-width` on `<html>` is the width in px that the lock padded. It is
 * written only above `0`. Use it to offset fixed elements, for example `right: var(--scrollbar-width, 0px)`.
 *
 * Locks are counted for each document. The last unlock restores the previous inline values and removes the custom property.
 * Call it when a modal overlay opens.
 *
 * @param doc - The document to lock.
 * @returns The unlock function. Call it when the overlay closes. Calling it again does nothing.
 * @example
 * const unlock = lockScroll(document);
 * // When the overlay closes:
 * unlock();
 */
export function lockScroll(doc: Document): () => void {
  let lock = locks.get(doc);
  if (!lock) {
    lock = applyLock(doc);
    locks.set(doc, lock);
  }
  const held = lock;
  held.count += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    held.count -= 1;
    if (held.count > 0) return;
    held.restore();
    locks.delete(doc);
  };
}

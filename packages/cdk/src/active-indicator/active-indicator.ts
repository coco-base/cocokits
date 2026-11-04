/** The box of an item inside its list, in CSS pixels. */
export interface ActiveBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const VARIABLES = ['--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height'] as const;

/**
 * Measures an item's box relative to the padding box of its list, including the list's scroll offset,
 * so an absolutely positioned indicator inside the list lines up with it. The offsets are physical
 * (`left`, not `inline-start`), which is what `left` on the indicator needs in both directions.
 * Reads the layout of the two elements it is given and writes nothing.
 *
 * @param list - The list that holds the item and the indicator.
 * @param item - The active item.
 * @returns The box.
 */
export function measureActiveBox(list: Element, item: Element): ActiveBox {
  const listRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return {
    left: itemRect.left - listRect.left - list.clientLeft + list.scrollLeft,
    top: itemRect.top - listRect.top - list.clientTop + list.scrollTop,
    width: itemRect.width,
    height: itemRect.height,
  };
}

/** Options of {@link trackActiveIndicator}. */
export interface ActiveIndicatorOptions {
  /** The list element; `null` while it is not rendered. */
  readonly getList: () => HTMLElement | null;
  /** The selected (active) item; `null` when none is. */
  readonly getActiveItem: () => HTMLElement | null;
  /** The indicator element that receives the variables. */
  readonly getIndicator: () => HTMLElement | null;
  /**
   * Every item of the list, in any order. Each one is observed, so the indicator follows an item that
   * resizes (an inactive tab before the active one included). `update()` re-reads it, so items that
   * were added, removed or reordered are picked up. Omit it to observe the list only.
   */
  readonly getItems?: () => readonly HTMLElement[];
}

/** Keeps the `--active-tab-*` variables of one indicator current. */
export interface ActiveIndicator {
  /** Measures now and writes the variables; removes them when there is no active item. Call it after the selection or the items change. */
  update(): void;
  /** Stops the observer. Idempotent. */
  destroy(): void;
}

/**
 * Writes `--active-tab-left`, `--active-tab-top`, `--active-tab-width` and `--active-tab-height`
 * (unprefixed measured geometry) on the indicator, for Tabs and TabNav. One `ResizeObserver` watches the
 * list and every item, so the indicator follows a resize of the list or of any item; the adapter calls
 * `update()` when the active item or the set of items changes, which re-targets the observer. It also
 * re-measures once `document.fonts.ready` settles (a late web font changes item widths). The variables
 * are removed while there is no active item. Browser only: call it after mount.
 *
 * @param options - Getters for the list, the items, the active item and the indicator.
 * @returns The tracker; call `destroy()` on cleanup.
 */
export function trackActiveIndicator(options: ActiveIndicatorOptions): ActiveIndicator {
  let observer: ResizeObserver | undefined;
  const observed = new Set<Element>();
  let observedDocument: Document | undefined;
  let destroyed = false;

  const write = (): void => {
    const indicator = options.getIndicator();
    if (!indicator) return;
    const list = options.getList();
    const item = options.getActiveItem();
    if (!list || !item) {
      VARIABLES.forEach((name) => {
        indicator.style.removeProperty(name);
      });
      return;
    }
    const box = measureActiveBox(list, item);
    indicator.style.setProperty('--active-tab-left', `${String(box.left)}px`);
    indicator.style.setProperty('--active-tab-top', `${String(box.top)}px`);
    indicator.style.setProperty('--active-tab-width', `${String(box.width)}px`);
    indicator.style.setProperty('--active-tab-height', `${String(box.height)}px`);
  };

  const observe = (list: HTMLElement | null): void => {
    const targets = new Set<Element>(list ? [list, ...(options.getItems?.() ?? [])] : []);
    if (list && !observer) {
      const Observer = list.ownerDocument.defaultView?.ResizeObserver;
      if (Observer) observer = new Observer(write);
    }
    if (!observer) return;
    observed.forEach((element) => {
      if (!targets.has(element)) {
        observer?.unobserve(element);
        observed.delete(element);
      }
    });
    targets.forEach((element) => {
      if (!observed.has(element)) {
        observer?.observe(element);
        observed.add(element);
      }
    });
  };

  const measureAfterFonts = (list: HTMLElement | null): void => {
    const doc = list?.ownerDocument;
    if (!doc || doc === observedDocument) return;
    observedDocument = doc;
    void (doc.fonts as FontFaceSet | undefined)?.ready.then(() => {
      if (!destroyed) write();
    });
  };

  return {
    update() {
      if (destroyed) return;
      const list = options.getList();
      observe(list);
      measureAfterFonts(list);
      write();
    },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      observer = undefined;
      observed.clear();
    },
  };
}

/**
 * Scrolls a list so that one of its items lies fully inside the list's visible box. Only the list's own
 * scroll position changes: no ancestor and not the page scrolls (unlike `scrollIntoView`). It reads the
 * rendered boxes and scrolls by the difference, so it works with the negative scroll offsets of a
 * right-to-left list.
 * Does nothing when the item already fits.
 *
 * @param list - The scrollable list.
 * @param item - The item inside it.
 */
export function scrollItemIntoList(list: HTMLElement, item: Element): void {
  const listRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  /** How far to scroll along one axis; positive moves toward larger coordinates. */
  const delta = (viewStart: number, viewSize: number, itemStart: number, itemSize: number): number => {
    if (itemStart < viewStart) return itemStart - viewStart;
    const overflow = itemStart + itemSize - (viewStart + viewSize);
    return overflow > 0 ? overflow : 0;
  };
  const dx = delta(listRect.left + list.clientLeft, list.clientWidth, itemRect.left, itemRect.width);
  const dy = delta(listRect.top + list.clientTop, list.clientHeight, itemRect.top, itemRect.height);
  if (dx !== 0) list.scrollLeft += dx;
  if (dy !== 0) list.scrollTop += dy;
}

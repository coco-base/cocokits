/** The box of an item inside its list, in CSS pixels. */
export interface ActiveBox {
  /** The distance from the left edge of the list's padding box, with the list's scroll offset added. */
  readonly left: number;
  /** The distance from the top edge of the list's padding box, with the list's scroll offset added. */
  readonly top: number;
  /** The width of the item. */
  readonly width: number;
  /** The height of the item. */
  readonly height: number;
}

const VARIABLES = ['--active-tab-left', '--active-tab-top', '--active-tab-width', '--active-tab-height'] as const;

/**
 * Measures the box of an item inside its list. An absolutely positioned indicator in the list can use
 * the result to line up with the item.
 *
 * It reads the layout of the two elements and writes nothing. The offsets are physical (`left`, not
 * `inline-start`), so they work in both text directions.
 *
 * @param list - The list that holds the item and the indicator.
 * @param item - The item to measure.
 * @returns The box of the item, relative to the padding box of the list.
 * @example
 * const list = document.querySelector<HTMLElement>('[role="tablist"]')!;
 * const item = list.querySelector<HTMLElement>('[aria-selected="true"]')!;
 * const box = measureActiveBox(list, item);
 * console.log(box.left, box.width);
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
  /** Returns the list element, or `null` while it is not in the document. */
  readonly getList: () => HTMLElement | null;
  /** Returns the active item, or `null` when no item is active. */
  readonly getActiveItem: () => HTMLElement | null;
  /** Returns the indicator element that receives the custom properties, or `null` while it is not rendered. */
  readonly getIndicator: () => HTMLElement | null;
  /**
   * Returns every item of the list, in any order. Every item is observed, and `update()` reads the items again to pick up changes.
   * When not set, only the list is observed.
   */
  readonly getItems?: () => readonly HTMLElement[];
}

/** Keeps the `--active-tab-*` variables of one indicator current. */
export interface ActiveIndicator {
  /**
   * Measures now and writes the custom properties. It removes them when there is no active item.
   * Call it after the active item or the set of items changes.
   */
  update(): void;
  /** Stops observing. Calling it again does nothing. */
  destroy(): void;
}

/**
 * Keeps an indicator in line with the active item of a list, such as a tab list. It writes the box of the
 * active item to four custom properties on the indicator: `--active-tab-left`, `--active-tab-top`,
 * `--active-tab-width` and `--active-tab-height`. Your CSS moves and sizes the indicator with them.
 *
 * @remarks
 * One `ResizeObserver` watches the list and every item, so the indicator follows a resize of any of them.
 * Call `update()` when the active item or the set of items changes. The box is also measured again after
 * `document.fonts.ready`, because a late web font changes item widths.
 *
 * The custom properties are removed while there is no active item. Call it in the browser, after the
 * elements are in the document.
 *
 * @param options - Functions that return the list, the items, the active item and the indicator.
 * @returns The tracker. Call `destroy()` when you are done.
 * @example
 * const list = document.querySelector<HTMLElement>('[role="tablist"]')!;
 * const indicator = list.querySelector<HTMLElement>('.indicator')!;
 * const tracker = trackActiveIndicator({
 *   getList: () => list,
 *   getActiveItem: () => list.querySelector('[aria-selected="true"]'),
 *   getIndicator: () => indicator,
 *   getItems: () => [...list.querySelectorAll<HTMLElement>('[role="tab"]')],
 * });
 * tracker.update();
 * // Later, when you are done:
 * tracker.destroy();
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
 * Scrolls a list until one of its items is fully inside the visible box of the list.
 * Only the list scrolls. No ancestor and not the page scrolls, unlike `scrollIntoView`.
 *
 * @remarks
 * It scrolls by the difference between the rendered boxes, so it also works with the negative scroll
 * offsets of a right-to-left list. It does nothing when the item already fits.
 *
 * @param list - The scrollable list.
 * @param item - The item inside the list.
 * @example
 * const list = document.querySelector<HTMLElement>('[role="tablist"]')!;
 * const item = list.querySelector<HTMLElement>('[aria-selected="true"]')!;
 * scrollItemIntoList(list, item);
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

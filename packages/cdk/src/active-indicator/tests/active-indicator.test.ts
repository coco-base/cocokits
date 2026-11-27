// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { measureActiveBox, scrollItemIntoList, trackActiveIndicator } from '../index';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function withRect(element: HTMLElement, rect: Rect): HTMLElement {
  element.getBoundingClientRect = () => ({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  });
  return element;
}

const observers: {
  callback: () => void;
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: () => void) {
        observers.push({ callback, observe: this.observe, unobserve: this.unobserve, disconnect: this.disconnect });
      }
    },
  );
  window.ResizeObserver = globalThis.ResizeObserver;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup() {
  const list = withRect(document.createElement('div'), { left: 100, top: 50, width: 300, height: 40 });
  const item = withRect(document.createElement('button'), { left: 160, top: 52, width: 80, height: 36 });
  const indicator = document.createElement('span');
  list.append(item, indicator);
  document.body.append(list);
  let active: HTMLElement | null = item;
  const tracker = trackActiveIndicator({
    getList: () => list,
    getActiveItem: () => active,
    getIndicator: () => indicator,
  });
  return { list, item, indicator, tracker, setActive: (next: HTMLElement | null) => (active = next) };
}

const read = (element: HTMLElement, name: string): string => element.style.getPropertyValue(name);

describe('measureActiveBox', () => {
  it('is the item box relative to the list, with its border and scroll', () => {
    const list = withRect(document.createElement('div'), { left: 100, top: 50, width: 300, height: 40 });
    Object.defineProperty(list, 'clientLeft', { value: 2 });
    Object.defineProperty(list, 'clientTop', { value: 1 });
    list.scrollLeft = 10;
    const item = withRect(document.createElement('div'), { left: 160, top: 52, width: 80, height: 36 });
    expect(measureActiveBox(list, item)).toEqual({ left: 68, top: 1, width: 80, height: 36 });
  });

  it('measures physical left, so a right-to-left list keeps its item at the right place', () => {
    const list = withRect(document.createElement('div'), { left: 0, top: 0, width: 300, height: 40 });
    list.dir = 'rtl';
    const item = withRect(document.createElement('div'), { left: 220, top: 0, width: 80, height: 40 });
    expect(measureActiveBox(list, item).left).toBe(220);
  });
});

describe('trackActiveIndicator', () => {
  it('writes the four variables on update', () => {
    const { indicator, tracker } = setup();
    tracker.update();
    expect(read(indicator, '--active-tab-left')).toBe('60px');
    expect(read(indicator, '--active-tab-top')).toBe('2px');
    expect(read(indicator, '--active-tab-width')).toBe('80px');
    expect(read(indicator, '--active-tab-height')).toBe('36px');
  });

  it('follows a new active item', () => {
    const { list, indicator, tracker, setActive } = setup();
    tracker.update();
    const next = withRect(document.createElement('button'), { left: 250, top: 52, width: 90, height: 36 });
    list.append(next);
    setActive(next);
    tracker.update();
    expect(read(indicator, '--active-tab-left')).toBe('150px');
    expect(read(indicator, '--active-tab-width')).toBe('90px');
  });

  it('re-measures when the list resizes', () => {
    const { item, indicator, tracker } = setup();
    tracker.update();
    withRect(item, { left: 170, top: 52, width: 100, height: 36 });
    observers[0]?.callback();
    expect(read(indicator, '--active-tab-left')).toBe('70px');
    expect(read(indicator, '--active-tab-width')).toBe('100px');
  });

  it('removes the variables when there is no active item', () => {
    const { indicator, tracker, setActive } = setup();
    tracker.update();
    setActive(null);
    tracker.update();
    expect(read(indicator, '--active-tab-left')).toBe('');
    expect(read(indicator, '--active-tab-height')).toBe('');
  });

  it('observes the list once and stops on destroy, which is idempotent', () => {
    const { tracker } = setup();
    tracker.update();
    tracker.update();
    expect(observers).toHaveLength(1);
    expect(observers[0]?.observe).toHaveBeenCalledTimes(1);
    tracker.destroy();
    tracker.destroy();
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it('does nothing after destroy', () => {
    const { indicator, tracker } = setup();
    tracker.destroy();
    tracker.update();
    expect(read(indicator, '--active-tab-left')).toBe('');
  });
});

describe('trackActiveIndicator with items', () => {
  function setupItems() {
    const list = withRect(document.createElement('div'), { left: 0, top: 0, width: 300, height: 40 });
    const before = withRect(document.createElement('button'), { left: 0, top: 0, width: 80, height: 40 });
    const active = withRect(document.createElement('button'), { left: 80, top: 0, width: 80, height: 40 });
    const indicator = document.createElement('span');
    list.append(before, active, indicator);
    document.body.append(list);
    let items = [before, active];
    const tracker = trackActiveIndicator({
      getList: () => list,
      getItems: () => items,
      getActiveItem: () => active,
      getIndicator: () => indicator,
    });
    return {
      list,
      before,
      active,
      indicator,
      tracker,
      setItems: (next: HTMLElement[]) => {
        items = next;
      },
    };
  }

  it('observes the list and every item with one observer', () => {
    const { list, before, active, tracker } = setupItems();
    tracker.update();
    expect(observers).toHaveLength(1);
    const targets = (observers[0]?.observe.mock.calls as unknown[][]).map(([element]) => element);
    expect(targets).toEqual([list, before, active]);
  });

  it('re-measures when only the active item resizes', () => {
    const { active, indicator, tracker } = setupItems();
    tracker.update();
    withRect(active, { left: 80, top: 0, width: 120, height: 40 });
    observers[0]?.callback();
    expect(read(indicator, '--active-tab-width')).toBe('120px');
  });

  it('re-measures when an inactive item before the active one resizes', () => {
    const { before, active, indicator, tracker } = setupItems();
    tracker.update();
    withRect(before, { left: 0, top: 0, width: 130, height: 40 });
    withRect(active, { left: 130, top: 0, width: 80, height: 40 });
    observers[0]?.callback();
    expect(read(indicator, '--active-tab-left')).toBe('130px');
  });

  it('observes an inserted item and drops a removed one', () => {
    const { list, before, active, tracker, setItems } = setupItems();
    tracker.update();
    const inserted = withRect(document.createElement('button'), { left: 0, top: 0, width: 50, height: 40 });
    list.prepend(inserted);
    setItems([inserted, before, active]);
    tracker.update();
    const spy = observers[0];
    expect(spy?.observe).toHaveBeenLastCalledWith(inserted);
    expect(spy?.observe).toHaveBeenCalledTimes(4);
    setItems([inserted, active]);
    tracker.update();
    expect(observers).toHaveLength(1);
    expect(spy?.unobserve).toHaveBeenCalledWith(before);
  });

  it('does not observe an item twice when the items are reordered', () => {
    const { before, active, tracker, setItems } = setupItems();
    tracker.update();
    setItems([active, before]);
    tracker.update();
    expect(observers[0]?.observe).toHaveBeenCalledTimes(3);
  });

  it('re-measures once document.fonts.ready settles', async () => {
    let settle: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      settle = resolve;
    });
    Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
    try {
      const { active, indicator, tracker } = setupItems();
      tracker.update();
      withRect(active, { left: 80, top: 0, width: 140, height: 40 });
      expect(read(indicator, '--active-tab-width')).toBe('80px');
      settle();
      await ready;
      await Promise.resolve();
      expect(read(indicator, '--active-tab-width')).toBe('140px');
    } finally {
      delete (document as { fonts?: unknown }).fonts;
    }
  });
});

describe('scrollItemIntoList', () => {
  function listWith(rect: Rect, client: { width: number; height: number }, scroll = { left: 0, top: 0 }) {
    const list = withRect(document.createElement('div'), rect);
    Object.defineProperty(list, 'clientWidth', { value: client.width });
    Object.defineProperty(list, 'clientHeight', { value: client.height });
    let { left, top } = scroll;
    Object.defineProperty(list, 'scrollLeft', {
      get: () => left,
      set: (value: number) => {
        left = value;
      },
    });
    Object.defineProperty(list, 'scrollTop', {
      get: () => top,
      set: (value: number) => {
        top = value;
      },
    });
    return list;
  }
  const box = (left: number, width: number): Rect => ({ left, top: 0, width, height: 40 });
  const itemAt = (rect: Rect) => withRect(document.createElement('div'), rect);

  it('scrolls forward until an item past the end is fully visible', () => {
    const list = listWith(box(100, 200), { width: 200, height: 40 });
    scrollItemIntoList(list, itemAt(box(320, 80)));
    expect(list.scrollLeft).toBe(100);
  });

  it('scrolls back for an item before the start', () => {
    const list = listWith(box(100, 200), { width: 200, height: 40 }, { left: 300, top: 0 });
    scrollItemIntoList(list, itemAt(box(60, 80)));
    expect(list.scrollLeft).toBe(260);
  });

  it('moves a right-to-left list through negative offsets', () => {
    const list = listWith(box(100, 200), { width: 200, height: 40 }, { left: -100, top: 0 });
    list.dir = 'rtl';
    scrollItemIntoList(list, itemAt(box(40, 80)));
    expect(list.scrollLeft).toBe(-160);
    scrollItemIntoList(list, itemAt(box(300, 120)));
    expect(list.scrollLeft).toBe(-40);
  });

  it('leaves a visible item alone and scrolls only the list', () => {
    const outer = document.createElement('div');
    const list = listWith(box(100, 200), { width: 200, height: 40 });
    outer.append(list);
    scrollItemIntoList(list, itemAt(box(150, 80)));
    expect(list.scrollLeft).toBe(0);
    scrollItemIntoList(list, itemAt(box(400, 80)));
    expect(outer.scrollLeft).toBe(0);
    expect(outer.scrollTop).toBe(0);
  });

  it('scrolls the vertical axis too', () => {
    const list = listWith({ left: 0, top: 0, width: 100, height: 100 }, { width: 100, height: 100 });
    scrollItemIntoList(list, itemAt({ left: 0, top: 150, width: 100, height: 40 }));
    expect(list.scrollTop).toBe(90);
  });
});

import { IntersectionObserverChanges, mutationObserver$, reduceMerge } from '@cocokits/common-utils';
import { DocTocItem, IndicatorState, PreparedTocItem } from './doc-page-toc';
import { debounceTime, filter, map, take, firstValueFrom, Subject, takeUntil } from 'rxjs';

// Duplicate code with `doc-page-toc.tsx/StyledItem`. Make sure both of them are in sync.
const ITEM_HEIGHT = 40;

export function getPreparedItems(items: DocTocItem[]): {
  unsubscribe: () => void;
  items: Promise<PreparedTocItem[]>;
} {
  const getItems = () => {
    return items.map((item) => ({
      ...item,
      element: document.querySelector(`#${item.id}`),
    }));
  };

  const hasAllElementsFounded = (_preparedItem: (PreparedTocItem | { element: Element | null })[]) => {
    return _preparedItem.every((item) => item.element);
  };

  const preparedItem = getItems();

  if (hasAllElementsFounded(preparedItem)) {
    return {
      unsubscribe: () => {},
      items: Promise.resolve(preparedItem as PreparedTocItem[]),
    };
  }

  const main = document.querySelector('main');
  if (!main) {
    throw new Error('Not all toc items has been founded and no Main element not found to listen to changes');
  }

  const destroySignal = new Subject<void>();
  const items$ = mutationObserver$(main, { childList: true, subtree: true }).pipe(
    debounceTime(50),
    map((_) => getItems()),
    filter((result) => hasAllElementsFounded(result)),
    takeUntil(destroySignal),
    take(1)
  );

  return {
    unsubscribe: () => {
      destroySignal.next();
      destroySignal.complete();
    },
    items: firstValueFrom(items$) as Promise<PreparedTocItem[]>,
  };
}

export function getSelectedStateValue(
  currentState: IndicatorState,
  preparedItems: PreparedTocItem[],
  event: IntersectionObserverChanges
) {
  const selectedIdsMapChanges = reduceMerge(
    event.entries,
    (entry) => ({
      [entry.target.id]: entry.intersectionRatio > 0,
    }),
    {}
  );

  const selectedIdsMap = { ...currentState.selectedIdsMap, ...selectedIdsMapChanges };
  const height = Object.values(selectedIdsMap).filter(Boolean).length * ITEM_HEIGHT;
  const top = preparedItems.findIndex((item) => selectedIdsMap[item.id]) * ITEM_HEIGHT;

  return {
    top,
    height,
    selectedIdsMap,
  };
}

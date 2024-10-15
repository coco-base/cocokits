import { useEffect, useState } from 'react';

import { intersectionObserver$ } from '@cocokits/common-utils';

import { DocTocProps, TopItem } from './DocToc';

export const useExistingItems = (rawItems: DocTocProps['items']) => {
  const [items, setItems] = useState<TopItem[]>([]);

  useEffect(() => {
    const existItems: TopItem[] = [];

    rawItems.forEach((item) => {
      const element = document.querySelector(`#${item.id}`);

      if (element) {
        existItems.push({ ...item, element });
      }
    });

    setItems(existItems);
  }, []);

  return items;
};

export const useSelectedTocItem = (items: TopItem[]) => {
  const { intersectionRatios } = useIntersectionObserver(items);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const sortedItems = items
      .map((item) => ({ ...item, ratio: intersectionRatios[item.id] }))
      .sort((a, b) => b.ratio - a.ratio || items.indexOf(a) - items.indexOf(b));

    if (sortedItems.length > 0) {
      setSelectedId(sortedItems[0].id);
    }
  }, [intersectionRatios, items]);

  return selectedId;
};

// #region ----------------- UTILS ---------------------
const useIntersectionObserver = (items: TopItem[]) => {
  const initializeValue: Record<string, number> = items.reduce((result, item) => ({ ...result, [item.id]: 0 }), {});
  const threshold = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const [intersectionRatios, setIntersectionRatio] = useState(initializeValue);

  useEffect(() => {
    const itemsElement = items.map((item) => item.element);
    const subscriber = intersectionObserver$(itemsElement, { threshold }).subscribe((event) => {
      setIntersectionRatio((prevState) => updateIntersectionRatios(prevState, event.entries));
    });

    return () => subscriber.unsubscribe();
  }, [items, setIntersectionRatio]);

  return { intersectionRatios };
};

const updateIntersectionRatios = (prevState: Record<string, number>, entries: IntersectionObserverEntry[]) => {
  const updatedRatios = { ...prevState };
  for (const { intersectionRatio, target } of entries) {
    updatedRatios[target.id] = intersectionRatio;
  }
  return updatedRatios;
};
// #endregion

import { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import styled from 'styled-components';

import { intersectionObserver$ } from '@cocokits/common-utils';

import { getPreparedItems, getSelectedStateValue } from './doc-page-toc.utils';

export interface DocTocItem {
  id: string;
  name: string;
}

interface DocPageTocProps {
  items: DocTocItem[];
  className?: string;
}

export interface PreparedTocItem extends DocTocItem {
  element: Element;
}

export interface IndicatorState {
  top: number;
  height: number;
  selectedIdsMap: Record<string, boolean>;
}

const INITIALIZE_SELECTED_STATE: IndicatorState = {
  top: 0,
  height: 0,
  selectedIdsMap: {},
};

export const DocPageToc = ({ items, className }: DocPageTocProps) => {
  const [selectedState, setSelectedState] = useState<IndicatorState>(INITIALIZE_SELECTED_STATE);
  const [preparedItems, setPreparedItems] = useState<PreparedTocItem[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let subscriber: Subscription | undefined = undefined;
    const { unsubscribe: preparedItemsDestroy, items: preparedItemsPromise } = getPreparedItems(items);
    setSelectedState(INITIALIZE_SELECTED_STATE);

    const listenToVisibilityChange = (_preparedItems: PreparedTocItem[]) => {
      const itemsElement = _preparedItems.map((item) => item.element);
      subscriber = intersectionObserver$(itemsElement, { threshold: [0, 0.1, 0.9, 1] }).subscribe((event) => {
        setSelectedState((currentState) => getSelectedStateValue(currentState, _preparedItems, event));
      });
    };

    preparedItemsPromise.then((_preparedItems) => {
      setPreparedItems(_preparedItems);
      listenToVisibilityChange(_preparedItems);
    });

    return () => {
      preparedItemsDestroy();
      subscriber?.unsubscribe();
    };
  }, [items]);

  const scrollToElement = (element: Element | null) => {
    if (!element) {
      return;
    }

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const navHeight = 80;

    window.scrollTo({
      top: elementPosition - navHeight,
      behavior: 'smooth',
    });
  };

  if (!items.length) {
    return null;
  }

  return (
    <StyledHost className={className}>
      <StyledHeader>On this page</StyledHeader>

      <StyledIndicatorWrapper>
        <StyledIndicator
          style={{ top: `${selectedState.top}px`, height: `${selectedState.height}px` }}
          ref={indicatorRef}
        />
      </StyledIndicatorWrapper>

      <StyledItemsWrapper>
        {preparedItems.map((item) => (
          <StyledItem
            $selected={selectedState.selectedIdsMap[item.id]}
            key={item.id}
            onClick={() => scrollToElement(item.element)}>
            {item.name}
          </StyledItem>
        ))}
      </StyledItemsWrapper>
    </StyledHost>
  );
};

// region ---------------- STYLES ----------------
const StyledHost = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  position: sticky;
  flex-shrink: 0;
  top: 80px;
  margin-top: 96px;
`;

const StyledHeader = styled.h5`
  grid-row: 1;
  grid-column: 1 / -1;
`;

const StyledIndicatorWrapper = styled.div`
  grid-row: 2;
  grid-column: 1;
  width: 4px;
  min-height: 0;
  position: relative;
  background-color: var(--cck-doc-color-bg-4);
  border-radius: var(--cck-doc-radius-sm);
  overflow: hidden;
`;

const StyledIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--cck-doc-color-brand-default);
  border-radius: var(--cck-doc-radius-sm);
  transition:
    top 100ms,
    height 100ms;
`;

const StyledItemsWrapper = styled.div`
  grid-row: 2;
  grid-column: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledItem = styled.div<{ $selected: boolean }>`
  font: var(--cck-doc-text-sm-regular);
  color: ${({ $selected }) => ($selected ? 'var(--cck-doc-color-brand-default)' : 'var(--cck-doc-color-font-3)')};
  cursor: pointer;
  height: 40px; // Duplicate code with 'doc-page-toc.utils.ts/ITEM_HEIGHT'. Make sure both of them are in sync.
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    color: ${({ $selected }) => ($selected ? 'var(--cck-doc-color-brand-default)' : 'var(--cck-doc-color-font-1)')};
  }
`;
// endregion

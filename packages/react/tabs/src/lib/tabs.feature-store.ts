import { createContext, ReactNode, RefObject } from 'react';

import { createComponentStore, createFeatureStore } from '@cocokits/react-utils';

import { TabSelectionChangeEvent } from './tabs.model';

export interface TabComponent<TValue> {
  index: number;
  value: TValue;
  id: string;
  disabled: boolean;
  tabTmp: ReactNode;
  contentTmp: ReactNode;
  hostElemRef: RefObject<HTMLButtonElement>;
  indicatorElemRef: RefObject<HTMLDivElement>;
}

export type TabsFeatureStoreOptions<TValue> = Pick<
  TabsFeatureStoreState<TValue>,
  'instantAnimation' | 'onSelectionChange'
>;

export interface TabsFeatureStoreState<TValue> {
  tabs: Record<string, TabComponent<TValue>>;
  selectedId: string;

  instantAnimation: boolean;
  onSelectionChange: ((event: TabSelectionChangeEvent<TValue>) => void) | undefined;
}

const INITIALIZE_STATE: TabsFeatureStoreState<any> = {
  tabs: {},
  selectedId: '',
  instantAnimation: false,
  onSelectionChange: undefined,
};

class TabsFeatureStore<TValue> {
  private store = createComponentStore<TabsFeatureStoreState<TValue>>(INITIALIZE_STATE);
  private get state() {
    return this.store.getState();
  }

  public useSelectedTab = this.store.createSelector<TabComponent<TValue> | undefined>(
    (state) => state.tabs[state.selectedId] ?? Object.values(state.tabs)[0]
  );

  public useTabComponents = this.store.createSelector((state) => {
    const tabs = Object.values(state.tabs) ?? [];
    return tabs.sort((a, b) => a.index - b.index);
  });

  constructor(options: TabsFeatureStoreOptions<TValue>) {
    this.updateState(options);
  }

  public updateState(options: TabsFeatureStoreOptions<TValue>) {
    this.store.updateState({ ...options });
  }

  public registerTab(tab: TabComponent<TValue>) {
    this.store.updateState((state) => ({
      tabs: { ...state.tabs, [tab.id]: tab },
      selectedId: state.selectedId || tab.id, // Select the first tab if no tab is selected
    }));
  }

  public unregisterTab(tabId: string) {
    this.store.updateState((state) => {
      const tabs = { ...state.tabs };
      delete tabs[tabId];
      const selectedId = tabs[state.selectedId]?.id ?? Object.keys(tabs)[0];
      return { tabs, selectedId };
    });
  }

  public selectTabById(newTabId: string, emitEvent = true) {
    const currentSelected = this.state.tabs[this.state.selectedId];
    const newSelected = this.state.tabs[newTabId];

    if (!newSelected || newTabId === this.state.selectedId) {
      return;
    }

    this.store.updateState((currentState) => {
      return { ...currentState, selectedId: newSelected.id };
    });

    if (emitEvent) {
      this.state.onSelectionChange?.({
        previousIndex: currentSelected.index,
        previousValue: currentSelected.value,
        index: newSelected.index,
        value: newSelected.value,
      });
    }

    if (!this.state.instantAnimation && newSelected.hostElemRef.current && currentSelected.hostElemRef.current) {
      const currentTabReact = currentSelected.hostElemRef.current.getBoundingClientRect();
      const newTabReact = newSelected.hostElemRef.current.getBoundingClientRect();

      const translate = {
        x: currentTabReact.left - newTabReact.left,
        y: currentTabReact.top - newTabReact.top,
      };

      newSelected.indicatorElemRef.current?.animate(
        {
          transform: [`translate(${translate.x}px, ${translate.y}px)`, '*'],
          width: [`${currentTabReact.width}px`, `${newTabReact.width}px`],
          height: [`${currentTabReact.height}px`, `${newTabReact.height}px`],
        },
        { duration: 300, easing: 'ease-in-out' }
      );
    }
  }

  public selectTabByIndex(tabIndex: number, emitEvent = true) {
    const selectedTab = Object.values(this.state.tabs).find((tab) => tab.index === tabIndex);
    if (selectedTab) {
      this.selectTabById(selectedTab.id, emitEvent);
    }
  }

  public selectTabByValue(tabValue: TValue, emitEvent = true) {
    const selectedTab = Object.values(this.state.tabs).find((tab) => tab.value === tabValue);
    if (selectedTab) {
      this.selectTabById(selectedTab.id, emitEvent);
    }
  }
}

export const { useCreateFeatureStore, useFeatureStore } = createFeatureStore(TabsFeatureStore<any>);
export const TabIndexContext = createContext<number>(0);

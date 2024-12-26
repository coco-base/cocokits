import { createComponentStore } from '@cocokits/react-utils';
import React, { createContext, RefObject, useContext, useRef } from 'react';
import { TabSelectionChangeEvent, TabValue } from './tab.model';

export interface TabComponent {
  index: number;
  tabTmp: React.ReactNode;
  contentTmp: React.ReactNode;
  hostElemRef: RefObject<HTMLButtonElement>;
  indicatorElemRef: RefObject<HTMLDivElement>;
  value: TabValue;
}

export interface TabsState {
  selectedValue: TabValue;
  tabs: Record<TabValue, TabComponent>;
}

interface TabsStoreConfig {
  disableAnimation: boolean;
  onSelectionChange: (event: TabSelectionChangeEvent) => void;
}

export const TabsContext = createContext<TabsStore | null>(null);
export const TabIndexContext = createContext<number>(0);

export function createTabsStore(config: TabsStoreConfig) {
  const storeRef = useRef<{
    TabsStoreProvider: typeof TabsContext.Provider;
    tabsStore: TabsStore;
  }>();

  if (!storeRef.current) {
    storeRef.current = {
      TabsStoreProvider: TabsContext.Provider,
      tabsStore: new TabsStore(config),
    };
  }

  return storeRef.current;
}

export function useTabsStore() {
  return useContext(TabsContext);
}

class TabsStore {
  private state = createComponentStore<TabsState>({ selectedValue: '', tabs: {} });

  constructor(private config: TabsStoreConfig) {}

  public updateConfig(config: Partial<TabsStoreConfig>) {
    this.config = { ...this.config, ...config };
  }

  public useSelectedTab = this.state.createSelector(
    (state) => state.tabs[state.selectedValue] ?? Object.values(state.tabs)[0]
  );

  public useTabComponents = this.state.createSelector((state) => {
    const tabs = Object.values(state.tabs) ?? [];
    return tabs.sort((a, b) => a.index - b.index);
  });

  public registerTab(tab: TabComponent) {
    this.state.updateState((state) => {
      const tabs = { ...state.tabs, [tab.value]: tab };
      const selectedValue = state.selectedValue ?? tab.value; // Select the first tab if no tab is selected (when no tab is selected, selectedValue is an empty string)
      return { tabs, selectedValue };
    });
  }

  public unregisterTab(tabValue: TabValue) {
    this.state.updateState((state) => {
      const tabs = { ...state.tabs };
      delete tabs[tabValue];
      const selectedValue = tabs[state.selectedValue]?.value ?? Object.keys(tabs)[0];
      return { tabs, selectedValue };
    });
  }

  public selectTabByValue(newTabValue: TabValue, emitEvent = true) {
    const state = this.state.getState();
    const currentSelected = state.tabs[state.selectedValue];
    const newSelected = state.tabs[newTabValue];

    if (!newSelected || newTabValue === state.selectedValue) {
      return;
    }

    this.state.updateState((state) => {
      return { ...state, selectedValue: newTabValue };
    });

    if (emitEvent) {
      const currentIndex = Object.values(state.tabs).findIndex((tab) => tab.value === state.selectedValue);
      const currentValue = state.selectedValue;
      const newIndex = Object.values(state.tabs).findIndex((tab) => tab.value === newTabValue);

      this.config.onSelectionChange({
        previousIndex: currentIndex,
        previousValue: currentValue,
        index: newIndex,
        value: newTabValue,
      });
    }

    if (!this.config.disableAnimation && newSelected.hostElemRef.current && currentSelected.hostElemRef.current) {
      const currentTabReact = currentSelected.hostElemRef.current.getBoundingClientRect();
      const newTabReact = newSelected.hostElemRef.current.getBoundingClientRect();

      const translate = {
        x: currentTabReact.left - newTabReact.left,
        y: currentTabReact.top - newTabReact.top,
      };

      newSelected.indicatorElemRef.current?.animate(
        {
          transform: [`translate(${translate.x}px, ${translate.y}px)`, '*'],
          width: [`${newTabReact.width}px`, `*`],
          height: [`${newTabReact.height}px`, `*`],
        },
        { duration: 150, easing: 'ease-in-out' }
      );
    }
  }

  public selectTabByIndex(tabIndex: number, emitEvent = true) {
    const state = this.state.getState();
    const newValue = Object.values(state.tabs).find((tab) => tab.index === tabIndex)?.value;
    if (newValue) {
      this.selectTabByValue(newValue, emitEvent);
    }
  }
}

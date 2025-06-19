import React, { createContext, RefObject, useContext, useRef } from 'react';

import { createComponentStore } from '@cocokits/react-utils';

import { TabSelectionChangeEventOld, TabValueOld } from './tab.model';

export interface TabComponentOld {
  index: number;
  tabTmp: React.ReactNode;
  contentTmp: React.ReactNode;
  hostElemRef: RefObject<HTMLButtonElement>;
  indicatorElemRef: RefObject<HTMLDivElement>;
  value: TabValueOld;
}

export interface TabsStateOld {
  selectedValue: TabValueOld;
  tabs: Record<TabValueOld, TabComponentOld>;
}

interface TabsStoreConfigOld {
  disableAnimation: boolean;
  onSelectionChange: (event: TabSelectionChangeEventOld) => void;
}

export const TabsContextOld = createContext<TabsStoreOld | null>(null);
export const TabIndexContextOld = createContext<number>(0);

export function useCreateTabsStoreOld(config: TabsStoreConfigOld) {
  const storeRef = useRef<{
    TabsStoreProvider: typeof TabsContextOld.Provider;
    tabsStore: TabsStoreOld;
  }>();

  if (!storeRef.current) {
    storeRef.current = {
      TabsStoreProvider: TabsContextOld.Provider,
      tabsStore: new TabsStoreOld(config),
    };
  }

  return storeRef.current;
}

export function useTabsStoreOld() {
  return useContext(TabsContextOld);
}

class TabsStoreOld {
  private state = createComponentStore<TabsStateOld>({ selectedValue: '', tabs: {} });

  public useSelectedTab = this.state.createSelector(
    (state) => state.tabs[state.selectedValue] ?? Object.values(state.tabs)[0]
  );

  public useTabComponents = this.state.createSelector((state) => {
    const tabs = Object.values(state.tabs) ?? [];
    return tabs.sort((a, b) => a.index - b.index);
  });

  constructor(private config: TabsStoreConfigOld) {}

  public updateConfig(config: Partial<TabsStoreConfigOld>) {
    this.config = { ...this.config, ...config };
  }

  public registerTab(tab: TabComponentOld) {
    this.state.updateState((state) => {
      const tabs = { ...state.tabs, [tab.value]: tab };
      const selectedValue = state.selectedValue ?? tab.value; // Select the first tab if no tab is selected (when no tab is selected, selectedValue is an empty string)
      return { tabs, selectedValue };
    });
  }

  public unregisterTab(tabValue: TabValueOld) {
    this.state.updateState((state) => {
      const tabs = { ...state.tabs };
      delete tabs[tabValue];
      const selectedValue = tabs[state.selectedValue]?.value ?? Object.keys(tabs)[0];
      return { tabs, selectedValue };
    });
  }

  public selectTabByValue(newTabValue: TabValueOld, emitEvent = true) {
    const state = this.state.getState();
    const currentSelected = state.tabs[state.selectedValue];
    const newSelected = state.tabs[newTabValue];

    if (!newSelected || newTabValue === state.selectedValue) {
      return;
    }

    this.state.updateState((currentState) => {
      return { ...currentState, selectedValue: newTabValue };
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

import React, { useEffect } from 'react';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { createTabsStore, TabIndexContext, TabSelectionChangeEvent, TabValue } from './tabs.store';
import { useEffectAfterMount } from '@cocokits/react-utils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const EMPTY_CALLBACK = () => {};

export interface TabsProps extends UIBaseComponentProps {
  selectedIndex?: number;
  selectedValue?: TabValue;

  hideContent?: boolean;
  disableAnimation?: boolean;

  onSelectionChange?: (event: TabSelectionChangeEvent) => void;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
}

export const Tabs = (props: TabsProps) => {
  const hideContent = props.hideContent ?? false;
  const disableAnimation = props.disableAnimation ?? false;

  const { tabsStore, TabsStoreProvider } = createTabsStore({
    disableAnimation,
    onSelectionChange: props.onSelectionChange ?? EMPTY_CALLBACK,
  });

  const { classNames: tabsClassNames, hostClassNames: tabsHostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabs',
    props,
  });

  const tabComponents = tabsStore.useTabComponents();
  const selectedTab = tabsStore.useSelectedTab();

  useEffectAfterMount(() => {
    tabsStore.updateConfig({ disableAnimation });
  }, [props.disableAnimation])

  // Update selected tab by index
  useEffect(() => {
    if (props.selectedIndex !== undefined) {
      tabsStore.selectTabByIndex(props.selectedIndex, false);
    }
  }, [props.selectedIndex]);

  // Update selected tab by value
  useEffect(() => {
    if (props.selectedValue !== undefined) {
      tabsStore.selectTabByValue(props.selectedValue, false);
    }
  }, [props.selectedValue]);

  return (
    <TabsStoreProvider value={tabsStore}>
      {/* Just render the children to register them into the store, The Children has no template */}
      {React.Children.map(props.children, (child, index) => (
        <TabIndexContext.Provider key={index} value={index}>
          {child}
        </TabIndexContext.Provider>
      ))}

      <div className={`${tabsHostClassNames} ${props.className}`}>
        {/* Labels */}
        <div className={tabsClassNames.labelsWrapper}>{tabComponents.map((tab) => tab.tabTmp)}</div>

        {/* Content */}
        {!hideContent && (
          <div className={tabsClassNames.contentWrapper}>
            {/* selectedTab Can be undefined for firs render */}
            {selectedTab?.contentTmp}
          </div>
        )}
      </div>
    </TabsStoreProvider>
  );
};

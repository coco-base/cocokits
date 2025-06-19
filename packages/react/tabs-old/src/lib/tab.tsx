import { ReactNode, useContext, useEffect, useRef } from 'react';

import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { TabLabelOld } from './tab-label';
import { TabIndexContextOld, useTabsStoreOld } from './tabs.store';

export interface TabPropsOld {
  label: string | ((selected: boolean) => ReactNode);
  value: string;
  children?: React.ReactNode | React.ReactNode[];
}

export const TabOld = (props: TabPropsOld) => {
  const tabsStore = useTabsStoreOld();
  const index = useContext(TabIndexContextOld);
  const selectedTab = tabsStore?.useSelectedTab();

  const hostElemRef = useRef<HTMLButtonElement>(null);
  const indicatorElemRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedTab?.value === props.value;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabOld',
    props: {},
    extraHostElementClassConditions: [
      { if: isSelected, classes: (cn) => [cn.selected] },
      { if: !isSelected, classes: (cn) => [cn.unselected] },
    ],
  });

  // Register and update the tab on mount and changes
  useEffect(() => {
    const label = typeof props.label === 'string' ? <TabLabelOld>{props.label}</TabLabelOld> : props.label(isSelected);

    const tabTmp = (
      <button
        ref={hostElemRef}
        key={props.value}
        className={hostClassNames}
        onClick={() => tabsStore?.selectTabByValue(props.value)}>
        <div style={{ display: 'none' }} ref={indicatorElemRef} className={classNames.indicator} />
        {label}
      </button>
    );

    const contentTmp = <div className={classNames.content}>{props.children}</div>;

    tabsStore?.registerTab({
      index,
      tabTmp,
      contentTmp,
      hostElemRef,
      indicatorElemRef,
      value: props.value,
    });
  }, [props.children, props.label, props.value, isSelected]);

  // Unregister tab on unmount
  useEffect(() => {
    return () => {
      tabsStore?.unregisterTab(props.value);
    };
  }, []);

  // Change indicator display on selected tab change
  useEffect(() => {
    if (selectedTab?.value === props.value) {
      indicatorElemRef.current?.style.removeProperty('display');
    } else {
      indicatorElemRef.current?.style.setProperty('display', 'none');
    }
  }, [selectedTab, indicatorElemRef.current]);

  return null;
};

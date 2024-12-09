import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { TabIndexContext, useTabsStore } from './tabs.store';
import { ReactNode, useContext, useEffect, useRef } from 'react';
import { TabLabel } from './tab-label';

export interface TabProps {
  label: string | ((selected: boolean) => ReactNode);
  value: string;
  children: React.ReactNode | React.ReactNode[];
}

export const Tab = (props: TabProps) => {
  const tabsStore = useTabsStore();
  const index = useContext(TabIndexContext);
  const selectedTab = tabsStore?.useSelectedTab();

  const hostElemRef = useRef<HTMLButtonElement>(null);
  const indicatorElemRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedTab?.value === props.value;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tab',
    props: {},
    extraHostElementClassConditions: [
      { if: isSelected, classes: (classNames) => [classNames.selected] },
      { if: !isSelected, classes: (classNames) => [classNames.unselected] },
    ],
  });


  // Register and update the tab on mount and changes
  useEffect(() => {

    const label = typeof props.label === 'string'
      ? <TabLabel>{props.label}</TabLabel>
      : props.label(isSelected);


    const tabTmp = (
      <button
        ref={hostElemRef}
        key={props.value}
        className={hostClassNames}
        onClick={() => tabsStore?.selectTabByValue(props.value)}>
          <div ref={indicatorElemRef} className={classNames.indicator} />
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

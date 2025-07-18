import { Children, CSSProperties, ReactNode, useEffect } from 'react';

import { isNullish } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useEffectAfterMount } from '@cocokits/react-utils';

import { TabIndexContext, useCreateFeatureStore } from '../tabs.feature-store';
import { TabSelectionChangeEvent } from '../tabs.model';

export interface TabsProps<TValue = unknown> extends UIBaseComponentProps {
  /**
   * The index of the currently selected tab.
   * If `selected` is provided, the value of `selectedIndex` will be ignored.
   * @default 0
   */
  selectedIndex?: number;

  /**
   * The value of the currently selected tab.
   * If not provided, the `selectedIndex` will be used, and if `selectedIndex` is not provided, the first tab will be selected by default.
   */
  selected?: TValue;

  /**
   * Whether to hide the content of the tabs when they are not selected.
   * @default false
   */
  hideContent?: boolean;

  /**
   * Whether to disable the animation when switching between tabs.
   * @default false
   */
  instantAnimation?: boolean;

  /**
   * The alignment of the tab headers.
   * @default 'left'
   */
  headerAlign?: 'left' | 'center' | 'right' | 'stretch';

  /**
   * Callback function that is called when the selected tab changes.
   * The callback receives an object with the new and previous selected index and value.
   */
  onSelectionChange?: (event: TabSelectionChangeEvent<TValue>) => void;
  /**
   * the children of the Tabs component. Must only be `Tab` components.
   */
  children: ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const Tabs = <TValue,>({
  type,
  size,
  color,
  additional,
  selectedIndex = 0,
  selected,
  hideContent = false,
  instantAnimation = false,
  headerAlign = 'left',
  onSelectionChange,
  children,
  className,
  style,
}: TabsProps<TValue>) => {

  const { store, StoreProvider } = useCreateFeatureStore({
    instantAnimation,
    onSelectionChange: onSelectionChange,
  });
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabs',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: !!className, classes: () => [className] },
      { if: headerAlign === 'left', classes: (cn) => [cn.alignLeft] },
      { if: headerAlign === 'right', classes: (cn) => [cn.alignRight] },
      { if: headerAlign === 'center', classes: (cn) => [cn.alignCenter] },
      { if: headerAlign === 'stretch', classes: (cn) => [cn.alignStretch] },
      { if: instantAnimation, classes: (cn) => [cn.instantAnimation] },
    ],
  });

  const selectedTab = store.useSelectedTab();
  const tabComponents = store.useTabComponents();

  // Update config
  useEffectAfterMount(() => {
    store.updateState({
      instantAnimation,
      onSelectionChange,
    });
  }, [instantAnimation, onSelectionChange]);

  // Update selected tab by Index
  useEffect(() => {
    if(!isNullish(selected) || isNullish(selectedIndex)) {
      return;
    }
    store.selectTabByIndex(selectedIndex, false);
  }, [selectedIndex]);

  // Update selected tab by Value
  useEffect(() => {
    if(isNullish(selected)) {
      return;
    }
    store.selectTabByValue(selected, false);
  }, [selected]);

  return (
    <StoreProvider value={store}>
      {/* Just render the children to register them into the store, The Children (Tab Component) will not return any template */}
      {Children.map(children, (child, index) => (
        <TabIndexContext.Provider key={index} value={index}>
          {child}
        </TabIndexContext.Provider>
      ))}

      <div className={hostClassNames} style={style}>
        {/* Labels */}
        <div className={classNames.headersWrapper}>{tabComponents.map((tab) => tab.tabTmp)}</div>

        {/* Content */}
        {/* selectedTab Can be undefined for first render */}
        {!hideContent && selectedTab && (
          <div className={classNames.contentWrapper}>
            {selectedTab.contentTmp}
          </div>
        )}
      </div>
    </StoreProvider>
  );
};

Tabs.displayName = 'Tabs';
export default Tabs;

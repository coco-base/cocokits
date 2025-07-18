import { CSSProperties, ReactNode, useContext, useLayoutEffect, useRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useOnDestroy, useStaticText } from '@cocokits/react-utils';

import { TabIndexContext, useFeatureStore } from '../tabs.feature-store';

export interface TabProps<TValue = unknown> extends UIBaseComponentProps {

  /**
   * The label of the tab, which can be a string or a function that receives a boolean indicating if the tab is selected.
   * If a function is provided, it should return a ReactNode to be rendered as the label.
   */
  header: string | ((selected: boolean) => ReactNode);

  /**
   * The value of the tab, which is used to identify the tab when selected.
   * If not provided, a unique ID will be used.
   */
  value?: TValue;

  /**
   * Whether the tab is disabled. If true, the tab will not be selectable by user.
   * @default false
   */
  disabled?: boolean;

  /**
   * The content of tab component.
   */
  children?: ReactNode | ReactNode[];

  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;

  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const Tab = <TValue,>({
  type,
  size,
  color,
  additional,
  header,
  value,
  disabled = false,
  children,
  className,
  style,
}: TabProps<TValue>) => {
  const id = useStaticText();
  const valueOrId = value ?? id;
  const store = useFeatureStore();
  const index = useContext(TabIndexContext);
  const selectedTab = store?.useSelectedTab();
  
  const hostElemRef = useRef<HTMLButtonElement>(null);
  const indicatorElemRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedTab?.id === id;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tab',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: !!className, classes: () => [className] },
      { if: isSelected, classes: (cn) => [cn.selected] },
      { if: !isSelected, classes: (cn) => [cn.unselected] },
      { if: disabled, classes: (cn) => [cn.disabled] },
    ],
  });

  useLayoutEffect(() => {
    const headerTemp = typeof header === 'string' ? header : header(isSelected);
    const onClick = () => {
      if (!disabled) {
        store?.selectTabById(id);
      }
    };

    const tabTmp = (
      <button
        ref={hostElemRef}
        key={id}
        className={hostClassNames}
        onClick={onClick}>
        <div style={{ visibility: isSelected ? 'visible' : 'hidden'}} ref={indicatorElemRef} className={classNames.indicator} />
        <div className={classNames.headerWrapper}>
          {headerTemp}
        </div>
      </button>
    );

    const contentTmp = <div className={classNames.content} style={style}>{children}</div>;

    store?.registerTab({
      id,
      index,
      disabled,
      tabTmp,
      contentTmp,
      hostElemRef,
      indicatorElemRef,
      value: valueOrId,
    });
  }, [children, header, valueOrId, index, isSelected]);

  useOnDestroy(() => store?.unregisterTab(id));

  // This component does not render anything directly, it only registers itself in the store and the tabs component will render the tabTmp and contentTmp.
  return <></>;
};

Tab.displayName = 'Tab';
export default Tab;

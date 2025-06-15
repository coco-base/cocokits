import React, { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useEffectAfterMount } from '@cocokits/react-utils';

import { useCreateAccordionStore } from '../accordion.store';

export interface AccordionProps<TValue extends string | number> extends UIBaseComponentProps {
  /**
   * Whether to show the animation for the accordion expansion and collapse.
   * @default false
   */
  instantAnimation?: boolean;

  /**
   * The duration of the animation in milliseconds when expanding or collapsing the accordion panels.
   * @default 300
   */
  animationDuration?: number;

  /**
   * Whether to allow multiple accordion panels to be expanded at the same time.
   * If set to true, multiple panels can be expanded simultaneously.
   * @default false
   */
  multiMode?: boolean;

  /**
   * The position of the icon in the accordion header.
   * Can be either 'left' or 'right'.
   */
  iconPosition?: 'left' | 'right';

  /**
   * The trigger for toggling the accordion header.
   * Can be either 'header' or 'icon'.
   */
  toggleTrigger?: 'header' | 'icon';

  /**
   * The values of the expanded accordion panels or an array of values in multiple mode.
   */
  expanded?: TValue | TValue[];

  /**
   * Emitted when the expanded state of an accordion panel changes.
   * The emitted value contains the id and index of the expanded panel.
   */
  expandedChange?: (value: TValue | TValue[] | null) => void;

  iconTemplate?:
      | React.ReactNode
      | React.ReactNode[]
      | ((props: { isExpanded: boolean; disabled: boolean }) => React.ReactNode);

  children: React.ReactNode;
}

export const Accordion = ({
  type,
  size,
  color,
  additional,
  instantAnimation = false,
  animationDuration = 300,
  multiMode = false,
  iconPosition = 'right',
  toggleTrigger = 'header',
  expanded,
  expandedChange,
  iconTemplate,
  children,
}: AccordionProps<any>) => {
  const { store, StoreProvider } = useCreateAccordionStore({
    onSelectionChange: expandedChange,
    multiple: multiMode,
    instantAnimation,
    animationDuration,
    iconPosition,
    toggleTrigger,
    expandedPanelIds: [],
    iconTemplate
  });

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'accordion',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: instantAnimation, classes: (cn) => [cn.instantAnimation] },
      { if: multiMode, classes: (cn) => [cn.multiMode] },
      { if: !multiMode, classes: (cn) => [cn.singleMode] },
    ],
  });

  useEffectAfterMount(() => store.setMultiMode(multiMode), [multiMode]);
  useEffectAfterMount(
    () =>
      store.updateState({
        instantAnimation,
        animationDuration,
        iconPosition,
        toggleTrigger,
        iconTemplate
      }),
    [instantAnimation, animationDuration, iconPosition, toggleTrigger, iconTemplate]
  );
  useEffect(() => {
    const ids = expanded?.map((value: string) => store.findPanelByValue(value).id) ?? [];
    store.setExpandedPanelIds(ids);
  }, [expanded]);

  return (
    <StoreProvider value={store}>
      <div className={hostClassNames}>{children}</div>
    </StoreProvider>
  );
};

Accordion.displayName = 'Accordion';
export default Accordion;

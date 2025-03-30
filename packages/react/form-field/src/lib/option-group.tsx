'use client';
import { createContext, CSSProperties, useMemo } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface OptionGroupContextValue {
  disabled?: boolean;
}

interface OptionGroup extends UIBaseComponentProps {
  /**
   * Whether the group is disabled.
   * If true, the group and all options inside this group will be disabled.
   * */
  disabled?: boolean;

  /** Label for the option group. */
  label: string;
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children: React.ReactNode | React.ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const OptionGroupContext = createContext<OptionGroupContextValue | null>(null);

export function OptionGroup(props: OptionGroup) {
  const formStore = useFormStore();

  const formDisabled = formStore?.useState((state) => state.disabled);
  const disabled = props.disabled ?? formDisabled;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'optionGroup',
    props,
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  const contextValue = useMemo<OptionGroupContextValue>(() => ({ disabled: props.disabled }), [props.disabled]);

  return (
    <OptionGroupContext.Provider value={contextValue}>
      <div className={hostClassNames} style={props.style}>
        <div className={classNames.label}>{props.label}</div>
        {props.children}
      </div>
    </OptionGroupContext.Provider>
  );
}

OptionGroup.displayName = 'OptionGroup';
export default OptionGroup;

'use client';
import { useContext } from "react";

import { isNullish } from "@cocokits/common-utils";
import { UIBaseComponentProps } from "@cocokits/core";
import { Checkbox } from "@cocokits/react-checkbox";
import { ThemeConfigContext, useUiBaseComponentConfig } from "@cocokits/react-core";
import { SvgIcon } from "@cocokits/react-icon";
import { useOverlayRef } from "@cocokits/react-overlay";

import { useFormStore } from "./form-store";
import { OptionGroupContext } from "./option-group";
import { useSelectStore } from "./select-store";

export interface OptionProps<T = unknown> extends UIBaseComponentProps {
  disabled?: boolean;
  /**
   * Value of the select control.
   */
  value: T;

  children?: React.ReactNode;
}

export const Option = <T,>(props: OptionProps<T>) => {

  const overlayRef = useOverlayRef();
  const optionGroup = useContext(OptionGroupContext);
  const themeConfig = useContext(ThemeConfigContext);
  const optionSelectedIcon = themeConfig?.components.option?.templates?.optionSelectedIcon;

  const selectStore = useSelectStore<T>();
  const formStore = useFormStore();
  const isSelected = selectStore?.useIsSelected(props.value);
  const isMultiple = selectStore?.useState(state => state.isMultiple);

  const formDisabled = formStore?.useState((state) => state.disabled);
  const disabled = props.disabled ?? optionGroup?.disabled ?? formDisabled;

  const canShowSelectedIcon = isSelected && optionSelectedIcon && !isMultiple;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'option',
    props,
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: isSelected, classes: (cn) => [cn.selected] },
      { if: isMultiple, classes: (cn) => [cn.multiple] },
      { if: !isMultiple, classes: (cn) => [cn.single] },
    ],
  });


  const onHostClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    if(disabled) {
      return;
    }

    if(isMultiple) {
      if(isNullish(props.value)) {
        return;
      }

      selectStore?.toggle(props.value);
      return;
    }

    isNullish(props.value)
      ? selectStore?.clear()
      : selectStore?.select(props.value);

    overlayRef.close();
  };

  return (
    <div className={hostClassNames} onClick={onHostClick}>
      {
        isMultiple &&
        <div className={classNames.multipleWrapper}>
          <Checkbox
            checked={isSelected}
            disabled={disabled}
            onChange={() => selectStore?.toggle(props.value)}
          />
        </div>
      }

      <div className={classNames.contentWrapper}>
        {props.children}
      </div>

      {canShowSelectedIcon && (
        <div className={classNames.selectedCheckmark}>
          <SvgIcon icon={optionSelectedIcon} />
        </div>
      )}
    </div>
  );

};

Option.displayName = 'Option';

export default Option;
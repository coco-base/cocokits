import { UIBaseComponentProps } from "@cocokits/core";
import { ThemeConfigContext, useUiBaseComponentConfig } from "@cocokits/react-core";
import { useSelectStore } from "./select-store";
import { useContext } from "react";
import { SvgIcon } from "@cocokits/react-icon";
import { isNullish } from "@cocokits/common-utils";
import { useOverlayRef } from "@cocokits/react-overlay";

export interface OptionProps<T = unknown> extends UIBaseComponentProps {
  // disabled?: boolean;
  /**
   * Value of the select control.
   */
  value: T;

  children?: React.ReactNode;
}

export const Option = <T,>(props: OptionProps<T>) => {

  const overlayRef = useOverlayRef();
  const themeConfig = useContext(ThemeConfigContext);
  const optionSelectedIcon = themeConfig?.components.option?.templates?.optionSelectedIcon;

  const selectStore = useSelectStore<T>();
  const isSelected = selectStore?.useIsSelected(props.value);

  const canShowSelectedIcon = isSelected && optionSelectedIcon; // And also is not multiple

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'option',
    props,
    extraHostElementClassConditions: [
      // { if: disabled, classes: (classNames) => [classNames.disabled] },
    ],
  });


  const onHostClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    // Handle Disabled
    // Handle Multiple

    isNullish(props.value)
      ? selectStore?.clear()
      : selectStore?.select(props.value);

    // selectStore?.renderedOverlay?.overlayRef.close();
    overlayRef.close();
  }

  return (
    <div className={hostClassNames} onClick={onHostClick}>
      {/* Multiple */}

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

}
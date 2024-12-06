import React, { useState, useEffect, useRef, useContext } from 'react';
import { UIBaseComponentProps } from '@cocokits/core';
import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';
import { createSelectStore } from './select-store';
import { useFormStore } from './form-store';
import { SvgIcon } from '@cocokits/react-icon';
import { OverlayPortal, OverlayPortalManager } from '@cocokits/react-overlay';
import { useStaticText } from '@cocokits/react-utils';
import { ElementAnchorPoint } from '@cocokits/common-utils';

export interface SelectProps<T = unknown> extends UIBaseComponentProps {
  // disabled?: boolean;
  // required?: boolean;
  // multiple?: boolean;
  /**
   * Value of the select control.
   */
  value?: T | T[];

  /**
   * Placeholder to be shown if no value has been selected.
   */
  placeholder?: string;

  /**
   * The max-height of options overlay when it's open. If set to `null` there is no max-height, and it takes the height of content
   */
  maxOptionsHeight?: number;

  /**
   * Displays the select component with a customized view for the selected item,
   * enabling more complex and visually rich representations instead of just plain text.
   * If no present, the default preview will be used, witch it join all selected items with a comma.
   */
  selectPreview?: (selected: T[]) => React.ReactNode;

  /**
   * Event emitted when the selected value has been changed by the user.
   */
  onChange?: (selected: T[]) => void;

  /**
   * Event emitted when the select panel has been toggled.
   */
  onOpenedChange?: (opened: boolean) => void;

  /**
   * 
   */
  children?: React.ReactNode;
}

export const Select = <T,>(props: SelectProps<T>) => {

  const themeConfig = useContext(ThemeConfigContext);
  const dropdownIcon = themeConfig?.components.select?.templates?.dropdownIcon;

  if(!dropdownIcon) {
    throw new Error('`dropdownIcon` has not defined in `ThemeConfigToken` of selected theme');
  }

  const overlayId = useStaticText()

  const formStore = useFormStore();
  const {selectStore, SelectStoreProvider} = createSelectStore({onSelectionChange: props.onChange});
  const [isOpened, setIsOpened] = useState(false);
  const isEmpty = selectStore.useState(state => state.isEmpty);
  const selectedItems = selectStore.useState(state => state.selectedItems ?? []);

  const hostRef = useRef<HTMLDivElement>(null);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'select',
    props,
    extraHostElementClassConditions: [
      // { if: disabled, classes: (classNames) => [classNames.disabled] },
      // { if: multiple, classes: (classNames) => [classNames.multiple] },
      // { if: !multiple, classes: (classNames) => [classNames.single] },
      { if: isOpened, classes: (classNames) => [classNames.opened] },
      { if: !isOpened, classes: (classNames) => [classNames.closed] },
    ],
  });


  useEffect(() => {
    formStore?.registerComponent('select');
    return () => formStore?.unregisterComponent('select');
  }, [formStore])



  const onHostClick = async () => {

    // Don't do anything if there is an open overlay
    if(isOpened) {
      return;
    }

    setIsOpened(true);
    props.onOpenedChange?.(true);

    const connectTo = formStore?.components.formField?.wrapperElem?.current ?? hostRef.current;

    if(!connectTo) {
      throw new Error('No wrapper element found for select component');
    }

    const overlay = OverlayPortalManager.getWithId(overlayId).open({
      panelClass: [classNames.overlay],
      size: {
        minWidth: connectTo.getBoundingClientRect().width + 'px',
        maxHeight: props.maxOptionsHeight ? props.maxOptionsHeight + 'px' : '',
      },
      positionStrategy: {
        type: 'connectToElement',
        connectTo,
        anchorPoint: ElementAnchorPoint.BottomLeft,
      }
    });

    await overlay.afterClosed;
    setIsOpened(false);
    props.onOpenedChange?.(false);

  };

  return (
    <SelectStoreProvider value={selectStore}>
      <div className={hostClassNames} onClick={onHostClick} ref={hostRef}>
        <div className={classNames.triggerWrapper}>
          {/* Trigger Content */}
          <div className={classNames.triggerValue}>
            {
              isEmpty
              ? <div className={classNames.placeholder}>{props.placeholder}</div>
              : props.selectPreview?.(selectedItems) ?? selectedItems?.join(', ')
            }
          </div>
        </div>

        <div className={classNames.dropdownIconWrapper}>
          <SvgIcon icon={dropdownIcon} />
        </div>

        {/* Overlay Wrapper */}
      </div>


      <OverlayPortal portalId={overlayId}>
        <div className={classNames.optionsWrapper}>
          {props.children}
        </div>
      </OverlayPortal>

    </SelectStoreProvider>
  );
};

export default Select;

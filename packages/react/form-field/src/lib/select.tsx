/* eslint-disable max-lines-per-function */
'use client';
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { ElementAnchorPoint, isNotNullish } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';
import { SvgIcon } from '@cocokits/react-icon';
import { OverlayPortal, OverlayPortalManager, RenderedOverlay } from '@cocokits/react-overlay';
import { useEffectAfterMount, useStaticText } from '@cocokits/react-utils';

import { useFormStore } from './form-store';
import { useCreateSelectStore } from './select-store';

export interface SelectProps<T = unknown> extends UIBaseComponentProps {
  /**
   * Whether the form field is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the field is required.
   */
  required?: boolean;
  /**
   * Whether the user should be allowed to select multiple options.
   */
  multiple?: boolean;
  /**
   * Whether the form field is invalid.
   */
  invalid?: boolean;
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
   * TODO: ...
   */
  anchorPoint?: ElementAnchorPoint;

  // TODO: Add this prop to the angular component too.
  /**
   * If true, the `onChange` event will only be emitted when the selected value has been changed.
   * Set it to `false` for scenarios where re-selection of the selected value should trigger a change event.
   * @default true
   */
  onlyEmitOnValueChange?: boolean;

  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: ReactNode | ReactNode[];
}

export const Select = <T,>(props: SelectProps<T>) => {
  const overlayId = useStaticText();
  const themeConfig = useContext(ThemeConfigContext);
  const dropdownIcon = themeConfig?.components.select?.templates?.dropdownIcon;

  if (!dropdownIcon) {
    throw new Error('`dropdownIcon` has not defined in `ThemeConfigToken` of selected theme');
  }

  const formStore = useFormStore();
  const { selectStore, SelectStoreProvider } = useCreateSelectStore({
    multiple: props.multiple,
    onSelectionChange: props.onChange,
    onlyEmitOnValueChange: props.onlyEmitOnValueChange,
  });
  const [isOpened, setIsOpened] = useState(false);
  const isEmpty = selectStore.useState((state) => state.isEmpty);
  const selectedItems = selectStore.useState((state) => state.selectedItems ?? []);
  const isMultiple = selectStore.useState((state) => state.isMultiple);

  const disabled = formStore?.useState((state) => state.disabled);
  const size = formStore?.useState((state) => state.size);

  const hostRef = useRef<HTMLDivElement>(null);

  let renderedOverlay: RenderedOverlay<unknown>;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'select',
    props: { ...props, size },
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: isMultiple, classes: (cn) => [cn.multiple] },
      { if: !isMultiple, classes: (cn) => [cn.single] },
      { if: isOpened, classes: (cn) => [cn.opened] },
      { if: !isOpened, classes: (cn) => [cn.closed] },
    ],
  });

  useEffectAfterMount(() => {
    selectStore.resetWithOption({ multiple: props.multiple });
  }, [props.multiple]);

  useEffect(() => {
    if (isNotNullish(props.value)) {
      selectStore.select(props.value, true);
    }
  }, [props.value]);

  useEffect(() => {
    formStore?.updateComponent('select', {
      disabled: props.disabled,
      required: props.required,
      invalid: props.invalid,
      size: props.size,
    });
    return () => {
      formStore?.unregisterComponent('select');
    };
  }, [formStore, props.disabled, props.required, props.invalid, props.size]);

  const onHostClick = async () => {
    // Don't do anything if there is an open overlay
    if (isOpened) {
      return;
    }

    setIsOpened(true);
    props.onOpenedChange?.(true);

    const connectTo = formStore?.components.formField?.wrapperElem ?? hostRef.current;

    if (!connectTo) {
      throw new Error('No wrapper element found for select component');
    }

    renderedOverlay = OverlayPortalManager.getWithId(overlayId).open({
      panelClass: [classNames.overlay],
      size: {
        minWidth: connectTo.getBoundingClientRect().width + 'px',
        maxHeight: props.maxOptionsHeight ? props.maxOptionsHeight + 'px' : '',
      },
      positionStrategy: {
        type: 'connectToElement',
        connectTo,
        anchorPoint: props.anchorPoint ?? ElementAnchorPoint.BottomLeft,
      },
    });

    await renderedOverlay.afterClosed;
    setIsOpened(false);
    props.onOpenedChange?.(false);
  };

  return (
    <SelectStoreProvider value={selectStore}>
      <div className={hostClassNames} onClick={onHostClick} ref={hostRef}>
        <div className={classNames.triggerWrapper}>
          {/* Trigger Content */}
          <div className={classNames.triggerValue}>
            {isEmpty ? (
              <div className={classNames.placeholder}>{props.placeholder}</div>
            ) : (
              (props.selectPreview?.(selectedItems) ?? selectedItems?.join(', '))
            )}
          </div>
        </div>

        <div className={classNames.dropdownIconWrapper}>
          <SvgIcon icon={dropdownIcon} />
        </div>

        {/* Overlay Wrapper */}
      </div>

      <OverlayPortal portalId={overlayId}>
        <div className={classNames.optionsWrapper}>{props.children}</div>
      </OverlayPortal>
    </SelectStoreProvider>
  );
};

Select.displayName = 'Select';

export default Select;

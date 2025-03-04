'use client';
import { CSSProperties, useContext } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { IconButton } from '@cocokits/react-button';
import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';
import { SvgIcon } from '@cocokits/react-icon';

import { useFormStore } from './form-store';

interface ChipProps extends UIBaseComponentProps {
  /**
   * Whether the chip is disabled.
   */
  disabled?: boolean;

  /**
   * Determines whether or not the chip displays the remove styling and emits (removed) events.
   */
  removable?: boolean;

  /**
   * Will called when the chip remove icon has been clicked.
   */
  onRemove?: () => void;
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: React.ReactNode | React.ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export function Chip(props: ChipProps) {
  const formStore = useFormStore();
  const themeConfig = useContext(ThemeConfigContext);

  const formDisabled = formStore?.useState((state) => state.disabled);
  const disabled = props.disabled ?? formDisabled;

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'chip',
    props,
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: props.removable, classes: (cn) => [cn.removable] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  const removeIcon = themeConfig?.components.chip?.templates?.chipRemoveIcon;

  if (!removeIcon) {
    throw new Error('`chipRemoveIcon` has not defined in `ThemeConfig` of selected theme');
  }

  const onRemoveBtnClick = () => {
    props.onRemove?.();
  };

  return (
    <div className={hostClassNames} style={props.style} onClick={(e) => e.stopPropagation()}>
      <div className={classNames.contentWrapper}>{props.children}</div>

      {props.removable && (
        <div className={classNames.removeIconWrapper}>
          <IconButton type={null} size={null} color={null} onClick={onRemoveBtnClick}>
            <SvgIcon icon={removeIcon} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

Chip.displayName = 'Chip';
export default Chip;

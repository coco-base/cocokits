import React, { useState } from "react";
import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

let NEXT_ID = 0;

export interface CckToggleChange {
  checked: boolean;
}

export interface ToggleProps extends UIBaseComponentProps {
  /**
   * A unique id for the slide-toggle input. If none is supplied, it will be auto-generated.
   */
  id?: string;

  /**
   * Whether the label should appear after or before the slide-toggle. Defaults to 'after'.
   */
  labelPosition?: 'before' | 'after';

  /**
   * Whether the slide-toggle element is checked or not.
   */
  checked?: boolean;

  /**
   * Whether the slide toggle is disabled.
   */
  disabled?: boolean;

  /**
   * An event will be dispatched each time the slide-toggle changes its value.
   */
  onChange?: (event: CckToggleChange) => void;

  /**
   * Additional class names to apply to the slide-toggle component.
   */
  className?: string;

  /**
   * Child elements to render inside the slide-toggle component.
   */
  children?: React.ReactNode;
}

export const Toggle: React.FC<ToggleProps> = (props) => {

  const [checked, setChecked] = useState(props.checked ?? false);
  const [id] = useState(props.id ?? `TOGGLE_${NEXT_ID++}`);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'toggle',
    props: { ...props },
    extraHostElementClassConditions: [
      { if: props.disabled, classes: (classNames) => [classNames.disabled] },
      { if: checked, classes: (classNames) => [classNames.checked] },
      { if: !checked, classes: (classNames) => [classNames.unchecked] },
      { if: props.disabled, classes: (classNames) => [classNames.disabled] },
      { if: props.labelPosition === 'before', classes: (classNames) => [classNames.labelBefore] },
    ]
  });


  const toggle = () => {
    setChecked(!checked);
    props.onChange?.({checked});
  };

  return (
    <div className={hostClassNames}>
      <label className={classNames.label} htmlFor={id}>
        <div className={classNames.sliderWrapper}>
          <input
            type="checkbox"
            className={classNames.input}
            checked={checked}
            disabled={props.disabled}
            onInput={e => e.stopPropagation()}
            onChange={toggle}
            id={id}/>
          <div className={classNames.thumb}></div>
          <div className={classNames.backdrop}></div>
        </div>
        {props.children}
      </label>
    </div>
  );
};

export default Toggle;

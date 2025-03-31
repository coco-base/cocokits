import { CSSProperties, FC, ReactNode, useState } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useEffectAfterMount } from '@cocokits/react-utils';

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
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
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

export const Toggle: FC<ToggleProps> = (props) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  const [id] = useState(props.id ?? `TOGGLE_${NEXT_ID++}`);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'toggle',
    props: { ...props },
    extraHostElementClassConditions: [
      { if: props.disabled, classes: (cn) => [cn.disabled] },
      { if: checked, classes: (cn) => [cn.checked] },
      { if: !checked, classes: (cn) => [cn.unchecked] },
      { if: props.disabled, classes: (cn) => [cn.disabled] },
      { if: props.labelPosition === 'before', classes: (cn) => [cn.labelBefore] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  useEffectAfterMount(() => {
    setChecked(props.checked ?? false);
  }, [props.checked]);

  const toggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    props.onChange?.({ checked: newChecked });
  };

  return (
    <div className={hostClassNames} style={props.style}>
      <label className={classNames.label} htmlFor={id}>
        <div className={classNames.sliderWrapper}>
          <input
            type="checkbox"
            className={classNames.input}
            checked={checked}
            disabled={props.disabled}
            onInput={(e) => e.stopPropagation()}
            onChange={toggle}
            id={id}
          />
          <div className={classNames.thumb}></div>
          <div className={classNames.backdrop}></div>
        </div>
        {props.children}
      </label>
    </div>
  );
};

Toggle.displayName = 'Toggle';
export default Toggle;

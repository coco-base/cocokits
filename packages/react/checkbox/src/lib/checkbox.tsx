import { CSSProperties, ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';
import { useStaticText } from "@cocokits/react-utils";

export interface CheckboxProps extends UIBaseComponentProps {
  /** Whether the checkbox is checked. */
  checked?: boolean;

  /**
   * Whether the checkbox is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
   * set to false.
   */
  indeterminate?: boolean;

  /**
   * A unique id for the checkbox input. If none is supplied, it will be auto-generated.
   */
  id?: string;

  /** The value attribute of the native input element */
  value?: any;

  /** Name value will be applied to the input element if present */
  name?: string;

  /** Event emitted when the checkbox's `checked` value changes. */
  onChange?: (checked: boolean) => void;

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  onIndeterminateChange?: (indeterminate: boolean) => void;

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

export function Checkbox(props: CheckboxProps) {
  const themeConfig = useContext(ThemeConfigContext);
  const id = useStaticText(props.id);
  const [checked, setChecked] = useState(props.checked ?? false);
  const [indeterminate, setIndeterminate] = useState(props.indeterminate ?? false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'checkbox',
    props,
    extraHostElementClassConditions: [
      { if: indeterminate, classes: (cn) => [cn.indeterminate] },
      { if: checked, classes: (cn) => [cn.checked] },
      { if: !checked, classes: (cn) => [cn.unchecked] },
      { if: props.disabled, classes: (cn) => [cn.disabled] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  useLayoutEffect(() => {
    setChecked(props.checked ?? false);
  }, [props.checked]);

  useLayoutEffect(() => {
    const _indeterminate = props.indeterminate ?? false;
    setIndeterminate(_indeterminate);
    if (_indeterminate !== indeterminate) {
      props.onIndeterminateChange?.(_indeterminate);
    }
  }, [props.indeterminate]);

  useLayoutEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.indeterminate = indeterminate;
  }, [inputRef.current, indeterminate]);

  const toggle = () => {
    setChecked(!checked);
    setIndeterminate(false);
    props.onChange?.(!checked);
  };

  return (
    <div className={hostClassNames} style={props.style}>
      <div className={classNames.wrapper}>
        <div className={classNames.inputWrapper}>
          <input
            ref={inputRef}
            type="checkbox"
            className={classNames.input}
            name={props.name}
            value={props.value}
            checked={checked}
            disabled={props.disabled}
            id={id}
            onChange={toggle}
          />

          <div className={classNames.backdrop} />
          <div
            className={classNames.background}
            dangerouslySetInnerHTML={{ __html: themeConfig?.components.checkbox?.templates?.checkboxCheckmark ?? '' }}
          />
        </div>

        <label className={classNames.label} htmlFor={id}>
          {props.children}
        </label>
      </div>
    </div>
  );
}

Checkbox.displayName = 'Checkbox';
export default Checkbox;

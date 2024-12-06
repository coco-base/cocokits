import React, { forwardRef, useState, FocusEvent, useEffect } from 'react';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useFormStore } from './form-store';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'>, UIBaseComponentProps {
}


export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {

  const {
    type,
    size,
    color,
    additional,
    onFocus: propsOnFocus,
    onBlur: propsOnBlurs,
    ...restProps
  } = props;

  const formStore = useFormStore();

  const [focusedLocal, setFocusedLocal] = useState(false);
  
  // const disabled = formStore?.useStore(state => state.disabled);

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'input',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      // { if: disabled, classes: (classNames) => [classNames.disabled] },
    ],
    skipProps: {
      skipType: true,
    }
  });

  useEffect(() => formStore?.updateComponent('input', {focused: focusedLocal}), [focusedLocal, formStore])

  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    setFocusedLocal(true);
    props.onFocus?.(e);
  }

  const onBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    setFocusedLocal(false);
    props.onBlur?.(e);
  }

  return (
    <input
      ref={ref}
      className={hostClassNames}
      // required={required}
      // disabled={disabled}
      type={type?.toString() || 'text'}
      onFocus={onFocus}
      onBlur={onBlur}
      {...restProps}
    />
  );
});


export default Input;

/* eslint-disable max-lines-per-function */
'use client';
import { CSSProperties, FocusEvent, forwardRef, InputHTMLAttributes, useEffect, useState } from 'react';
import { Control, Controller, ControllerProps } from "react-hook-form";

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size' | 'ref'>,
    UIBaseComponentProps {
  /**
   * Whether the form field is invalid.
   */
  invalid?: boolean;
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;

  /**
   * Unique name of your input.
   * Will be set to input element and also used by react-hook-form
   */
  name?: string;

  /**
   * Control object is from invoking useForm, it connect input with react-hook-form
   */
  control?: Control<any, any>

  /**
   * Validation rules in the same format for register options, which includes:
   * required, min, max, minLength, maxLength, pattern, validate.
   * It connect input with react-hook-form
   */
  rules?: ControllerProps<any>["rules"];
}

// forwardRef<HTMLButtonElement, Props>((props, ref) => (
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  if(props.control && !props.name) {
    throw new Error('You should provide name for input when using control');
  }

  const { type, size, color, additional, invalid, onFocus: propsOnFocus, onBlur: propsOnBlurs, ...restProps } = props;

  const formStore = useFormStore();

  const [focusedLocal, setFocusedLocal] = useState(false);

  const disabled = formStore?.useState((state) => state.disabled);
  const required = formStore?.useState((state) => state.required);
  const fieldControl = props.control?.getFieldState(props.name ?? '');


  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'input',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: true, classes: () => [props.className] },
    ],
    skipProps: {
      skipType: true,
    },
  });

  useEffect(() => {
    formStore?.deepUpdateComponent('input', {
      focused: focusedLocal,
      disabled: props.disabled,
      required: props.required,
      invalid: props.invalid ?? fieldControl?.invalid,
    });
  }, [focusedLocal, formStore, props.disabled, props.required, props.invalid]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('input');
  }, []);

  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    setFocusedLocal(true);
    props.onFocus?.(e);
  };

  const onBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    setFocusedLocal(false);
    props.onBlur?.(e);
  };


  if(!!props.control && !!props.name) {
    return (
      <Controller
        name={props.name}
        control={props.control}
        rules={props.rules ?? {}}
        render={({ field: { onBlur: onControlBlue,  ...restFieldControl } }) => {

          return (
            <input
              className={hostClassNames}
              required={required}
              disabled={disabled}
              type={type?.toString() || 'text'}
              onFocus={onFocus}
              onBlur={(e) => {
                onControlBlue();
                onBlur(e);
              }}
              {...restFieldControl}
              {...restProps}
            />
          )
        }}
      />
    );
  }

  return (
    <input
      ref={ref}
      className={hostClassNames}
      required={required}
      disabled={disabled}
      type={type?.toString() || 'text'}
      onFocus={onFocus}
      onBlur={onBlur}
      {...restProps}
    />
  );
});

Input.displayName = 'Input';
export default Input;

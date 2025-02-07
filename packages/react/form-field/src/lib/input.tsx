'use client';
import React, { FocusEvent, useEffect, useState } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'>,
    UIBaseComponentProps {
  invalid?: boolean;
}


export const Input = (props: InputProps) => {
  const { type, size, color, additional, invalid, onFocus: propsOnFocus, onBlur: propsOnBlurs, ...restProps } = props;

  const formStore = useFormStore();

  const [focusedLocal, setFocusedLocal] = useState(false);

  const disabled = formStore?.useState((state) => state.disabled);
  const required = formStore?.useState((state) => state.required);

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
      invalid,
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

  return (
    <input
      className={hostClassNames}
      required={required}
      disabled={disabled}
      type={type?.toString() || 'text'}
      onFocus={onFocus}
      onBlur={onBlur}
      {...restProps}
    />
  );
};

Input.displayName = 'Input';

export default Input;

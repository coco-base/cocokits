'use client';
import React, { CSSProperties, FocusEvent, useEffect, useRef, useState } from 'react';

import { autoResizeTextarea } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'type' | 'color' | 'size'>,
    UIBaseComponentProps {
  /**
   * Whether the form field is invalid.
   */
  invalid?: boolean;

  /**
   * Whether autoResize is enabled or not
   */
  autoResize?: boolean;

  /**
   * Minimum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  minRows?: number;

  /**
   * Maximum amount of rows in the textarea. Will be skipped when the `autoResize` is false
   */
  maxRows?: number;

  /**
   * Whether the textarea is disabled.
   */
  disabled?: boolean;
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const Textarea = (props: TextareaProps) => {
  const {
    type,
    size,
    color,
    additional,
    invalid,
    autoResize,
    minRows,
    maxRows,
    onFocus: propsOnFocus,
    onBlur: propsOnBlurs,
    ...restProps
  } = props;

  const formStore = useFormStore();

  const [focusedLocal, setFocusedLocal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const disabled = formStore?.useState((state) => state.disabled);
  const required = formStore?.useState((state) => state.required);

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'textarea',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: autoResize, classes: (cn) => [cn.autoResize] },
      { if: true, classes: () => [props.className] },
    ],
  });

  useEffect(() => {
    formStore?.deepUpdateComponent('textarea', {
      focused: focusedLocal,
      disabled: props.disabled,
      required: props.required,
      invalid,
    });
  }, [focusedLocal, formStore, props.disabled, props.required, props.invalid]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('input');
  }, []);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const { destroy } = autoResizeTextarea(textareaRef.current, minRows, maxRows);
      return () => destroy();
    }

    return () => {
      // Do nothings
    };
  }, [textareaRef.current, autoResize, minRows, maxRows]);

  const onFocus = (e: FocusEvent<HTMLTextAreaElement, Element>) => {
    setFocusedLocal(true);
    props.onFocus?.(e);
  };

  const onBlur = (e: FocusEvent<HTMLTextAreaElement, Element>) => {
    setFocusedLocal(false);
    props.onBlur?.(e);
  };

  return (
    <textarea
      ref={textareaRef}
      className={hostClassNames}
      style={props.style}
      required={required}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      {...restProps}
    />
  );
};

Textarea.displayName = 'Textarea';

export default Textarea;

'use client';
import { CSSProperties, ReactNode, useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface LabelProps extends UIBaseComponentProps {
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

  /**
   * The for attribute specifies which form element a label is bound to.
   */
  htmlFor?: string;
}

export function Label(props: LabelProps) {
  const formStore = useFormStore();

  const hideRequiredMarker = formStore?.useState((state) => state.hideRequiredMarker);
  const required = formStore?.useState((state) => state.required);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'label',
    props,
    extraHostElementClassConditions: [{ if: !!props.className, classes: () => [props.className] }],
  });

  const template = (
    <div className={hostClassNames} style={props.style}>
      <label className={classNames.labelTag} htmlFor={props.htmlFor}>
        {props.children}

        {!hideRequiredMarker && required && <span className={classNames.requiredMarker}>*</span>}
      </label>
    </div>
  );

  useEffect(() => {
    formStore?.updateComponent('label', { template });
  }, [template]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('label');
  }, []);

  if (!formStore) {
    return template;
  }

  return <></>;
}

Label.displayName = 'Label';
export default Label;

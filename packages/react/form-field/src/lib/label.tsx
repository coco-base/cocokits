'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface LabelProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Label(props: LabelProps) {
  const formStore = useFormStore();

  const hideRequiredMarker = formStore?.useState((state) => state.hideRequiredMarker);
  const required = formStore?.useState((state) => state.required);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'label',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        <label className={classNames.labelTag}>
          {props.children}
    
          {!hideRequiredMarker && required && <span className={classNames.requiredMarker}>*</span>}
        </label>
      </div>
    );

    formStore?.updateComponent('label', {template});
  }, [props.children,hideRequiredMarker, required]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('label');
  }, []);

  return <></>;
}

Label.displayName = 'Label';
export default Label;
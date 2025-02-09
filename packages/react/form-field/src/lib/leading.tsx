'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

export interface LeadingProps extends UIBaseComponentProps {
  /**
   * Whether the component is clickable.
   */
  clickable?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export const Leading = (props: LeadingProps) => {
  const formStore = useFormStore();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'leading',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('leading', {template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('leading');
  }, []);

  return <></>;
};

Leading.displayName = 'Leading';
export default Leading;
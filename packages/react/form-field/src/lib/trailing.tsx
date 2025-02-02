'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface TrailingProps extends UIBaseComponentProps {
  /**
   * Whether the component is clickable.
   */
  clickable?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Trailing(props: TrailingProps) {
  const formStore = useFormStore();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'trailing',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('trailing', {template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('trailing');
  }, []);

  return null;
}

Trailing.displayName = 'Trailing';
export default Trailing;
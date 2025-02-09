'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface PrefixProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Prefix(props: PrefixProps) {
  const formStore = useFormStore();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'prefix',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('prefix', {template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('prefix');
  }, []);

  return <></>;
}

Prefix.displayName = 'Prefix';
export default Prefix;
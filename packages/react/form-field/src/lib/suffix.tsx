'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface SuffixProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Suffix(props: SuffixProps) {
  const formStore = useFormStore();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'suffix',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('suffix', {template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('suffix');
  }, []);

  return <></>;
}

Suffix.displayName = 'Suffix';
export default Suffix;
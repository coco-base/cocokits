'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface HintProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Hint(props: HintProps) {
  const formStore = useFormStore();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'hint',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('hint', {template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('hint');
  }, []);

  return <></>;
}

Hint.displayName = 'Hint';
export default Hint;
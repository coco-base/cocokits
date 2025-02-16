'use client';
import { ReactNode, useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface SuffixProps extends UIBaseComponentProps {
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
}

export function Suffix(props: SuffixProps) {
  const formStore = useFormStore();

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'suffix',
    props,
  });

  useEffect(() => {
    const template = <div className={`${hostClassNames} ${props.className ?? ''}`}>{props.children}</div>;

    formStore?.updateComponent('suffix', { template });
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('suffix');
  }, []);

  return <></>;
}

Suffix.displayName = 'Suffix';
export default Suffix;

'use client';
import { useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useStaticText } from '@cocokits/react-utils';

import { useFormStore } from './form-store';

interface ErrorProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export function Error(props: ErrorProps) {
  const formStore = useFormStore();
  const uuid = useStaticText();
  
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'error',
    props,
  });

  useEffect(() => {
    const template = (
      <div className={`${hostClassNames} ${props.className ?? ''}`}>
        {props.children}
      </div>
    );

    formStore?.updateErrorComponent({id: uuid, template});
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterErrorComponent(uuid);
  }, []);

  return <></>;
}

Error.displayName = 'Error';
export default Error;
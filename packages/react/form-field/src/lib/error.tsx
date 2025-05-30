'use client';
import { CSSProperties, ReactNode, useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useStaticText } from '@cocokits/react-utils';

import { useFormStore } from './form-store';

interface ErrorProps extends UIBaseComponentProps {
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
}

export function Error(props: ErrorProps) {
  const formStore = useFormStore();
  const uuid = useStaticText();

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'error',
    props,
    extraHostElementClassConditions: [{ if: !!props.className, classes: () => [props.className] }],
  });

  useEffect(() => {
    const template = (
      <div className={hostClassNames} style={props.style}>
        {props.children}
      </div>
    );

    formStore?.updateErrorComponent({ id: uuid, template });
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterErrorComponent(uuid);
  }, []);

  return <></>;
}

Error.displayName = 'Error';
export default Error;

'use client';
import { CSSProperties, ReactNode, useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface HintProps extends UIBaseComponentProps {
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

export function Hint(props: HintProps) {
  const formStore = useFormStore();

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'hint',
    props,
    extraHostElementClassConditions: [{ if: !!props.className, classes: () => [props.className] }],
  });

  useEffect(() => {
    const template = (
      <div className={hostClassNames} style={props.style}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('hint', { template });
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('hint');
  }, []);

  return <></>;
}

Hint.displayName = 'Hint';
export default Hint;

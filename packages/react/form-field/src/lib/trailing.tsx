'use client';
import { CSSProperties, ReactNode, useEffect } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useFormStore } from './form-store';

interface TrailingProps extends UIBaseComponentProps {
  /**
   * Whether the component is clickable.
   */
  clickable?: boolean;
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

  /**
   * Callback to invoke on click.
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function Trailing(props: TrailingProps) {
  const formStore = useFormStore();

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'trailing',
    props,
    extraHostElementClassConditions: [
      { if: props.clickable, classes: (cn) => [cn.clickable] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  useEffect(() => {
    const template = (
      <div className={hostClassNames} style={props.style} onClick={(e) => props.onClick?.(e)}>
        {props.children}
      </div>
    );

    formStore?.updateComponent('trailing', { template });
  }, [props.children]);

  useEffect(() => {
    return () => formStore?.unregisterComponent('trailing');
  }, []);

  return <></>;
}

Trailing.displayName = 'Trailing';
export default Trailing;

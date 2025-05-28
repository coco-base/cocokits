'use client';
import { ButtonHTMLAttributes, CSSProperties, forwardRef, ReactNode } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>,
    UIBaseComponentProps {
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

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ type, size, color, additional, children, className, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'iconButton',
      props: { type, size, color, additional },
      extraHostElementClassConditions: [{ if: !!className, classes: () => [className] }],
    });

    return (
      <button ref={ref} className={hostClassNames} {...restProps}>
        {children}
        <div className={classNames.backdrop}></div>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

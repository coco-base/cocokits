import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>, UIBaseComponentProps {
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: ReactNode | ReactNode[];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'button',
      props: { type, size, color, additional }
    });

    return (
      <button ref={ref} className={hostClassNames} {...restProps}>
        {children}
        <div className={classNames.backdrop}></div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

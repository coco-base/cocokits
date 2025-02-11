import React, { CSSProperties, forwardRef, ReactNode } from "react";

import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>, UIBaseComponentProps {
  /**
   * Dummy Description
   */
  children?: ReactNode | ReactNode[];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: "button",
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

Button.displayName = "Button";

export default Button;

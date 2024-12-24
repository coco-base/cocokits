import React, { forwardRef } from "react";

import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>, UIBaseComponentProps {
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: "button",
      props: { type, size, color, additional },
    });

    return (
      <button ref={ref} className={hostClassNames} {...restProps}>
        {children}
        <div className={classNames.backdrop}></div>
      </button>
    );
  }
);

export default Button;

'use client';
import React, { forwardRef } from "react";

import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'type'>, UIBaseComponentProps {
  children?: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ type, size, color, additional, children, className, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: "iconButton",
      props: { type, size, color, additional },
    });

    return (
      <button ref={ref} className={`${hostClassNames} ${className}`} {...restProps}>
        {children}
        <div className={classNames.backdrop}></div>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;

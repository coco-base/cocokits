import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>, UIBaseComponentProps {
  children?: React.ReactNode;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'avatar',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
export default Avatar;

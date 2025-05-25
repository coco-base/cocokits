import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AvatarGroupProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>,
    UIBaseComponentProps {
  children?: React.ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'avatarGroup',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
export default AvatarGroup;

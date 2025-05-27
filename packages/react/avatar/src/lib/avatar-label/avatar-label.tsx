import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AvatarLabelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>,
    UIBaseComponentProps {
  children?: React.ReactNode;
}

export const AvatarLabel = forwardRef<HTMLDivElement, AvatarLabelProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'avatarLabel',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

AvatarLabel.displayName = 'AvatarLabel';
export default AvatarLabel;

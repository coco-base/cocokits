import React from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export type AvatarGroupContextValue = UIBaseComponentProps;
export const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(null);

export interface AvatarGroupProps extends UIBaseComponentProps {
  direction?: 'right' | 'left';
  children?: React.ReactNode;
}

export const AvatarGroup = ({ type, size, color, additional, children, direction = 'right' }: AvatarGroupProps) => {
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'avatarGroup',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: direction === 'left', classes: (cn) => [cn.leftDirection] },
      { if: direction === 'right', classes: (cn) => [cn.rightDirection] },
    ],
  });

  return (
    <AvatarGroupContext.Provider value={{ type, size, color, additional }}>
      <div className={hostClassNames}>{children}</div>
    </AvatarGroupContext.Provider>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
export default AvatarGroup;

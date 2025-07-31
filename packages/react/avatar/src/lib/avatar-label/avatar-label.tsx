import React from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export type AvatarLabelContextValue = UIBaseComponentProps;
export const AvatarLabelContext = React.createContext<AvatarLabelContextValue | null>(null);

export interface AvatarLabelProps extends UIBaseComponentProps {
  /**
   * The position of the avatar relative to the label.
   * @defaultValue 'left'
   */
  avatarPosition?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * The alignment of the label
   * @defaultValue 'vertical'
   */
  labelAlignment?: 'horizontal' | 'vertical';

  /**
   * The title text of avatar.
   */
  title?: string;

  /**
   * The description text of avatar.
   */
  description?: string;

  /**
   * The children should contain the avatar component
   */
  children?: React.ReactNode;
}

export const AvatarLabel = ({ type, size, color, additional, children, avatarPosition = 'left', labelAlignment = 'vertical', ...restProps }: AvatarLabelProps) => {
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'avatarLabel',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: avatarPosition === 'left', classes: (cn) => [cn.avatarPositionLeft] },
      { if: avatarPosition === 'right', classes: (cn) => [cn.avatarPositionRight] },
      { if: avatarPosition === 'top', classes: (cn) => [cn.avatarPositionTop] },
      { if: avatarPosition === 'bottom', classes: (cn) => [cn.avatarPositionBottom] },
      { if: labelAlignment === 'horizontal', classes: (cn) => [cn.labelAlignmentHorizontal] },
      { if: labelAlignment === 'vertical', classes: (cn) => [cn.labelAlignmentVertical] }
    ]
  });

  return (
    <AvatarLabelContext.Provider value={{ type, size, color, additional }}>
      <div className={hostClassNames}>
        {children}
        <div className={classNames.labelWrapper}>
          {restProps.title && <div className={classNames.title}>{restProps.title}</div>}
          {restProps.description && <div className={classNames.description}>{restProps.description}</div>}
        </div>
      </div>
    </AvatarLabelContext.Provider>
  );
};

AvatarLabel.displayName = 'AvatarLabel';
export default AvatarLabel;

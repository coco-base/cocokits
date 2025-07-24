import { CSSProperties, ReactNode } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useSlotChildren } from '@cocokits/react-utils';

export interface BadgeContainerProps extends UIBaseComponentProps {

  /** Position of the badge. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * [horizontal, vertical] pixel adjustment for badge position.
   * Allows control over badge positioning.
   * @example ['10px', '20px']
   */
  offset?: [string, string];

  /**
   * Controls the corner rounding of the component. Accepts any valid CSS border-radius value
   * including pixels (e.g. "12px"), percentages (e.g. "50%").
   * Percentage values are relative to the component's dimensions.
   * Useful for when the content is curved such as avatars.
   */
  radius?: string;

  /**
   * Content to display inside the badge container with the badge component
   * This can be any valid ReactNode, such as text, images, or other components
   */
  children: ReactNode[];

  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const BadgeContainer = ({
  position = 'top-left',
  offset,
  radius = '0px',
  children,
  className,
  style,
  type,
  size,
  color,
  additional
}: BadgeContainerProps) => {
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'badgeContainer',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: !!className, classes: () => [className] },
      { if: position === 'top-left', classes: (cn) => [cn.topLeft] },
      { if: position === 'top-right', classes: (cn) => [cn.topRight] },
      { if: position === 'bottom-left', classes: (cn) => [cn.bottomLeft] },
      { if: position === 'bottom-right', classes: (cn) => [cn.bottomRight] },
      { if: offset && !!offset[0] && !!offset[1], classes: (cn) => [cn.customOffset] },
    ],
  });

  const transformBadgeWrapper = (offset && offset[0] && offset[1]) ? `translate(${offset[0]}, ${offset[1]})` : undefined;
  const [badgeChild, restChildren] = useSlotChildren(children, 'Badge');

  return (
    <div className={hostClassNames} style={{ ...style, '--cck-badge-radius': radius } as CSSProperties}>
      {restChildren}

      <div
        className={classNames.badgeWrapper}
        style={{ transform: transformBadgeWrapper }}
      >
        {badgeChild}
      </div>
    </div>
  );
};

BadgeContainer.displayName = 'BadgeContainer';
export default BadgeContainer;

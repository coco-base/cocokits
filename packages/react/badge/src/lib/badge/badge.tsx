import { CSSProperties, useMemo } from 'react';

import { isNullish } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface BadgeProps extends UIBaseComponentProps {
  /** Max value before truncation. */
  max?: number;

  /** Content to display in the badge. When "", null, or undefined, shows a dot. */
  content?: number | string | undefined | null;

  /** Whether to hide the badge completely. Default is false. */
  hide?: boolean;

  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const Badge = ({ hide = false, max, content, className, style, type, size, color, additional }: BadgeProps) => {
  const withMaxIndicator = useMemo(() => {
    if (isNullish(max) || isNullish(content)) {
      return false;
    }

    const numberContent = typeof content === 'number' ? content : parseInt(content);

    if (isNaN(numberContent) || max <= 0) {
      return false;
    }
    return max < numberContent;
  }, [max, content]);

  const truncationContent = useMemo(() => {
    if (isNullish(content)) {
      return '';
    }

    const contentAsNumber = parseInt(content as string);
    if (withMaxIndicator && !isNaN(contentAsNumber) && !isNullish(max)) {
      return Math.min(contentAsNumber, max);
    }

    return content;
  }, [content, withMaxIndicator, max]);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'badge',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: !!className, classes: () => [className] },
      { if: withMaxIndicator, classes: (cn) => [cn.maxIndicator] },
      { if: !!truncationContent, classes: (cn) => [cn.withContent] },
      { if: !truncationContent, classes: (cn) => [cn.withoutContent] },
      { if: hide, classes: (cn) => [cn.hidden] },
    ],
  });

  return (
    <div className={hostClassNames} style={style}>
      {!hide && (
        <>
          <span className={classNames.content}>{truncationContent}</span>
          {withMaxIndicator && <span className={classNames.maxIndicator}>+</span>}
        </>
      )}
    </div>
  );
};

Badge.displayName = 'Badge';
export default Badge;

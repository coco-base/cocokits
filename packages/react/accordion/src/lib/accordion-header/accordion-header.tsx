import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AccordionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>,
    UIBaseComponentProps {
  children?: React.ReactNode;
}

export const AccordionHeader = forwardRef<HTMLDivElement, AccordionHeaderProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'accordionHeader',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

AccordionHeader.displayName = 'AccordionHeader';
export default AccordionHeader;

import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>,
    UIBaseComponentProps {
  children?: React.ReactNode;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'accordion',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
export default Accordion;

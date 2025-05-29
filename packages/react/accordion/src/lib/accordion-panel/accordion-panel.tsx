import React, { forwardRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface AccordionPanelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'type'>,
    UIBaseComponentProps {
  children?: React.ReactNode;
}

export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  ({ type, size, color, additional, children, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'accordionPanel',
      props: { type, size, color, additional },
    });

    return (
      <div ref={ref} className={hostClassNames} {...restProps}>
        {children}
      </div>
    );
  }
);

AccordionPanel.displayName = 'AccordionPanel';
export default AccordionPanel;

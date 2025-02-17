'use client';
import { CSSProperties, FC, ReactNode } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface SelectPreviewProps extends UIBaseComponentProps {
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: ReactNode | ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const SelectPreview: FC<SelectPreviewProps> = (props) => {
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'selectPreview',
    props,
  });

  return <div className={`${hostClassNames} ${props.className ?? ''}`}>{props.children}</div>;
};

SelectPreview.displayName = 'SelectPreview';

export default SelectPreview;

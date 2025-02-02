'use client';
import React from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface SelectPreviewProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export const SelectPreview: React.FC<SelectPreviewProps> = (props) => {

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'selectPreview',
    props,
  });

  return (
    <div className={`${hostClassNames} ${props.className ?? ''}`}>
      {props.children}
    </div>
  );
};

SelectPreview.displayName = 'SelectPreview';

export default SelectPreview;

import React from 'react';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface SelectPreviewProps extends UIBaseComponentProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const SelectPreview: React.FC<SelectPreviewProps> = (props) => {

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'selectPreview',
    props,
  });

  return (
    <div className={hostClassNames}>
      {props.children}
    </div>
  );
};

export default SelectPreview;

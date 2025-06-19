import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface TabLabelProps extends UIBaseComponentProps {
  children: React.ReactNode | React.ReactNode[];
}

export const TabLabelOld = (props: TabLabelProps) => {
  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabLabelOld',
    props,
  });

  return <div className={hostClassNames}>{props.children}</div>;
};

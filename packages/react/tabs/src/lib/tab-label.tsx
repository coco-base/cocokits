import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";


export interface TabLabelProps extends UIBaseComponentProps {
  children: React.ReactNode | React.ReactNode[];
}

export const TabLabel = (props: TabLabelProps) => {

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabLabel',
    props,
    // extraHostElementClassConditions: [
    //   { if: true, classes: (classNames) => [''] }
    // ]
  });

  return (
    <>
      <div>TabLabel</div>
      {props.children}
    </>
  )
}
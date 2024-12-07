import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";


export interface TabsProps extends UIBaseComponentProps {
  children: React.ReactNode | React.ReactNode[];
}

export const Tabs = (props: TabsProps) => {

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tabs',
    props,
    // extraHostElementClassConditions: [
    //   { if: true, classes: (classNames) => [''] }
    // ]
  });

  return (
    <>
      <div>Tabs</div>
      {props.children}
    </>
  )
}